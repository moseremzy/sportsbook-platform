const db = require("../middlewares/database");

const { fetchEvents } = require("../services/eventsApi");

function toMySQL(iso) {
  return new Date(iso).toISOString().slice(0, 19).replace('T', ' ');
}

async function query(sql, values = []) {

  return new Promise((resolve, reject) => {

    db.query(sql, values, (err, result) => {

      if (err) {
        reject(err);
      } else {
        resolve(result);
      }

    });

  });

}

async function upsertTeam(team) {

  // check if team already exists
  const existingTeam = await query(
    `SELECT id FROM teams WHERE external_id = ? LIMIT 1`,
    [team.external_id]
  );

  if (existingTeam.length > 0) {

    // update existing team
    await query(
      `UPDATE teams
       SET 
        name = ?,
        sport_id = ?,
        updated_at = NOW()
       WHERE external_id = ?`,
      [
        team.name,
        team.sport_id,
        team.external_id
      ]
    );

    return existingTeam[0].id;

  }

  // insert new team
  const insertTeam = await query(
    `INSERT INTO teams
    (
      external_id,
      sport_id,
      name,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, NOW(), NOW())`,
    [
      team.external_id,
      team.sport_id,
      team.name
    ]
  );

  return insertTeam.insertId;

}


async function upsertEvent(event) {

  const existingEvent = await query(
    `SELECT id FROM events WHERE external_id = ? LIMIT 1`,
    [event.external_id]
  );

  if (existingEvent.length > 0) {

    // update existing event
    await query(
      `UPDATE events
       SET
        status = ?,
        home_score = ?,
        away_score = ?,
        start_time = ?,
        updated_at = NOW()
       WHERE external_id = ?`,
      [
        event.status,
        event.home_score,
        event.away_score,
        toMySQL(event.start_time),
        event.external_id
      ]
    );

    await upsertEventPeriods(existingEvent[0].id, event.periods);

    return existingEvent[0].id;

  }

  // insert new event
  const insertEvent = await query(
    `INSERT INTO events
    (
      sport_id,
      league_id,
      home_team_id,
      away_team_id,
      start_time,
      status,
      home_score,
      away_score,
      external_id,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      event.sport_id,
      event.league_id,
      event.home_team_id,
      event.away_team_id,
      event.start_time,
      event.status,
      event.home_score,
      event.away_score,
      event.external_id
    ]
  );

  await upsertEventPeriods(insertEvent.insertId, event.periods);

  return insertEvent.insertId;

}


async function upsertEventPeriods(eventId, periods) {
  if (!periods || typeof periods !== 'object') return;

  for (const [period, scores] of Object.entries(periods)) {
    await query(
      `INSERT INTO event_score_periods (event_id, period, home_score, away_score, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
        home_score = VALUES(home_score),
        away_score = VALUES(away_score),
        updated_at = NOW()`,
      [eventId, period, scores.home ?? 0, scores.away ?? 0]
    );
  }
}


async function syncEvents() {

  console.log(`[syncEvents] Started at ${new Date().toISOString()}`);


  try {

    const leagues_query = `
    SELECT 
      l.*,
      s.slug AS sport_slug
    FROM leagues l
    JOIN sports s ON l.sport_id = s.id
    WHERE l.status = 'enabled'
    AND l.is_seeded = 1
  `;

    const leagues = await query(leagues_query);

    for (const league of leagues) {

      const events = await fetchEvents({
        sport:     league.sport_slug,
        league:    league.slug,
        status:    "pending,live",
        bookmaker: "Bet365",
        limit:    10
      });

      // get external_ids the API just returned for this league
      const freshExternalIds = events.map(e => String(e.id));

     // mark events not in the fresh list as expired — never delete during sync
      if (freshExternalIds.length) {

        const placeholders = freshExternalIds.map(() => '?').join(', ')

        const staleEvents = await query(
          `SELECT id FROM events
          WHERE league_id = ?
          AND   status IN ('pending', 'live')
          AND   external_id IS NOT NULL
          AND   external_id NOT IN (${placeholders})`,
          [league.id, ...freshExternalIds]
        );

        for (const stale of staleEvents) {
          await query(
            `UPDATE events SET status = 'expired', updated_at = NOW() WHERE id = ?`,
            [stale.id]
          );
          console.log(`Marked event id=${stale.id} as expired`);
        }

      } else {

        // API returned nothing — expire everything in this league
        await query(
          `UPDATE events SET status = 'expired', updated_at = NOW()
          WHERE league_id = ? 
          AND status IN ('pending', 'live')
          AND external_id IS NOT NULL`,
          [league.id]
        );
        console.log(`No fresh events for league ${league.id}, marked all as expired`);

      }

      // upsert fresh events
      for (const event of events) {

        const homeTeamId = await upsertTeam({
          external_id: event.homeId,
          sport_id:    league.sport_id,
          name:        event.home
        });

        const awayTeamId = await upsertTeam({
          external_id: event.awayId,
          sport_id:    league.sport_id,
          name:        event.away
        });

        await upsertEvent({
          sport_id:     league.sport_id,
          league_id:    league.id,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          start_time: toMySQL(event.date),
          status:       event.status || "pending",
          home_score:   event.scores?.home || 0,
          away_score:   event.scores?.away || 0,
          external_id:  event.id,
          periods:      event.scores?.periods || null   
        });

      }

    }

  } catch (error) {

    console.log("Sync Events Error:", error.message);
  
  }

}


module.exports = syncEvents

syncEvents();