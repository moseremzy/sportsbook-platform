const db     = require("../middlewares/database");
const { fetchOdds } = require("../services/oddsApi");

const ALLOWED_BOOKMAKER = "Bet365";
const BATCH_SIZE        = 10;

async function query(sql, values = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) reject(err);
      else     resolve(result);
    });
  });
}




function getMarketType(sport, marketName) {

  const map = {

    football: {
      "ML": "binary",
      "ML HT": "binary",

      "Double Chance": "label",
      "Correct Score": "label",
      "Exact Total Goals": "label",

      "Both Teams To Score": "binary_yesno",
      "Both Teams To Score HT": "binary_yesno",
      "Both Teams To Score 2H": "binary_yesno",

      "Goals Over/Under": "line",
      "Totals": "line",
      "Totals HT": "line",
      "Alternative Total Goals": "line",
      "Alternative Goal Line": "line",

      "Team Total Goals Home": "line",
      "Team Total Goals Away": "line",

      "Number of Goals In Match": "label"
    },

    basketball: {
      "ML": "binary",
      "ML HT": "binary",

      "Alternative Totals": "line",
      "Team Total Home": "line",
      "Team Total Away": "line",

      "Player Points Milestones": "label",
      "Player Assists Milestones": "label",

      "Spread": "binary",
      "Spread HT": "binary"
    },

    baseball: {
      "ML": "binary",
      "First 5 Innings ML": "binary",

      "Team Total Home": "line",
      "Team Total Away": "line"
    }
  }

  return map[sport]?.[marketName] || "label"
}







function normalizeOutcome(outcome, type) {

  const rows = []
  const label = outcome.label ?? null
  const line  = outcome.hdp ?? null

  // -------------------------
  // BINARY (home/away only)
  // -------------------------
  if (type === "binary") {

    if (outcome.home !== undefined) {
      rows.push({ name: "Home", odd: +outcome.home, line_value: null })
    }

    if (outcome.away !== undefined) {
      rows.push({ name: "Away", odd: +outcome.away, line_value: null })
    }

    if (outcome.draw !== undefined) {
      rows.push({ name: "Draw", odd: +outcome.draw, line_value: null })
    }

    return rows
  }

  // -------------------------
  // YES / NO MARKETS
  // -------------------------
  if (type === "binary_yesno") {

    if (outcome.yes !== undefined) {
      rows.push({ name: "Yes", odd: +outcome.yes, line_value: null })
    }

    if (outcome.no !== undefined) {
      rows.push({ name: "No", odd: +outcome.no, line_value: null })
    }

    return rows
  }

  // -------------------------
  // LINE MARKETS (totals, spreads, team totals)
  // -------------------------
  if (type === "line") {

    if (outcome.over !== undefined) {
      rows.push({
        name: "Over",
        odd: +outcome.over,
        line_value: line
      })
    }

    if (outcome.under !== undefined) {
      rows.push({
        name: "Under",
        odd: +outcome.under,
        line_value: line
      })
    }

    return rows
  }

  // -------------------------
  // LABEL / SPECIAL MARKETS
  // -------------------------
  if (type === "label") {

    const baseName = label ?? "Selection"

    // correct score uses "odds"
    if (outcome.odds !== undefined) {
      rows.push({
        name: baseName,
        odd: +outcome.odds,
        line_value: line
      })
    }

    // milestones / props use "over"
    if (outcome.over !== undefined) {
      rows.push({
        name: baseName,
        odd: +outcome.over,
        line_value: line
      })
    }

    // fallback
    if (
      outcome.home === undefined &&
      outcome.away === undefined &&
      outcome.over === undefined &&
      outcome.odds === undefined
    ) {
      rows.push({
        name: baseName,
        odd: +outcome.under,
        line_value: line
      })
    }

    return rows
  }

  return []
}

async function upsertEventMarket(data) {

  const existing = await query(
    `SELECT id FROM event_markets
     WHERE event_id  = ?
     AND   market_id = ?
     LIMIT 1`,
    [data.event_id, data.market_id]
  );

  if (existing.length > 0) {
    await query(
      `UPDATE event_markets SET status = ?, updated_at = NOW() WHERE id = ?`,
      [data.status || "open", existing[0].id]
    );
    return existing[0].id;
  }

  const insert = await query(
    `INSERT INTO event_markets (event_id, market_id, status, created_at, updated_at)
     VALUES (?, ?, ?, NOW(), NOW())`,
    [data.event_id, data.market_id, data.status || "open"]
  );

  return insert.insertId;
}

async function upsertSelection(data) {

  const existing = await query(
    `SELECT id FROM selections
     WHERE event_market_id = ?
     AND   name            = ?
     AND   (
             (line_value IS NULL AND ? IS NULL)
             OR line_value = ?
           )
     LIMIT 1`,
    [data.event_market_id, data.name, data.line_value, data.line_value]
  );

  if (existing.length > 0) {
    await query(
      `UPDATE selections
       SET odd = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [data.odd, data.status || "open", existing[0].id]
    );
    return existing[0].id;
  }

  const insert = await query(
    `INSERT INTO selections
       (event_market_id, name, odd, line_value, external_id, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      data.event_market_id,
      data.name,
      data.odd,
      data.line_value,
      data.external_id || null,
      data.status      || "open"
    ]
  );

  return insert.insertId;
}

async function processEventOdds(dbEvent, eventOdds) {

  // console.log(`Processing event id=${dbEvent.id} external_id=${dbEvent.external_id}`);

  for (const bookmakerName in eventOdds.bookmakers) {

    console.log(`  Bookmaker: "${bookmakerName}" — match: ${bookmakerName === ALLOWED_BOOKMAKER}`);

    if (bookmakerName !== ALLOWED_BOOKMAKER) continue;

    const bookmakerMarkets = eventOdds.bookmakers[bookmakerName];

    // console.log(`  Markets count: ${bookmakerMarkets?.length}`);

    for (const market of bookmakerMarkets) {

      const existingMarket = await query(
        `SELECT id FROM markets
         WHERE name     = ?
         AND   sport_id = ?
         LIMIT 1`,
        [market.name, dbEvent.sport_id]
      );

      // console.log(`  Market "${market.name}" → ${existingMarket.length ? 'FOUND id=' + existingMarket[0].id : 'NOT FOUND'}`);

      if (!existingMarket.length) continue;

      const marketId      = existingMarket[0].id;
      const eventMarketId = await upsertEventMarket({
        event_id:  dbEvent.id,
        market_id: marketId,
        status:    "open"
      });

      // console.log(`  event_market inserted/updated id=${eventMarketId}, odds count=${market.odds?.length}`);

      if (!market.odds || !market.odds.length) continue;

      for (const outcomeRaw of market.odds) {

        const marketType = getMarketType(
          dbEvent.sport_id === 1 ? "football"
          : dbEvent.sport_id === 2 ? "basketball"
          : "baseball",
          market.name
        )
        
        const selections = normalizeOutcome(outcomeRaw, marketType)


        // console.log(`    outcome normalized to ${selections.length} selections`);

        for (const sel of selections) {

          if (isNaN(sel.odd)) continue;

          await upsertSelection({
            event_market_id: eventMarketId,
            name:            sel.name,
            odd:             sel.odd,
            line_value:      sel.line_value,
            external_id:     null,
            status:          "open"
          });

        }

      }

    }

  }

}

async function syncOdds() {

  try {

    const events = await query(
      `SELECT id, external_id, sport_id
       FROM   events
       WHERE  status IN ('pending', 'live')
       AND    external_id IS NOT NULL`
    );

    if (!events.length) {
      console.log("No events to sync.");
      return;
    }

    // chunk events into batches of 10
    const chunks = [];
    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      chunks.push(events.slice(i, i + BATCH_SIZE));
    }

    console.log(`Syncing ${events.length} events in ${chunks.length} batches...`);

    for (const chunk of chunks) {

      const eventIds = chunk.map(e => e.external_id).join(",");

      const oddsData = await fetchOdds({
        eventIds:   eventIds,       // batch param — comma separated
        bookmakers: ALLOWED_BOOKMAKER
      });

      if (!oddsData || !oddsData.length) continue;

      // match each returned odds object back to its db event
      for (const eventOdds of oddsData) {

        const dbEvent = chunk.find(
          e => String(e.external_id) === String(eventOdds.id)
        );

        if (!dbEvent) continue;

        await processEventOdds(dbEvent, eventOdds);

      }

    }

    console.log("Odds sync completed successfully.");

  } catch (error) {
    console.error("Sync Odds Error:", error.message);
  }

}

module.exports = syncOdds;