const db = require("../middlewares/database");


// Nightly cleanup job — hard-deletes expired events with no pending bets, older than 1 days. CHANGE AM TO 7 
// Run on a separate cron, e.g. once per day at midnight.
async function cleanupExpiredEvents() {

    try {
  
      await query(
        `DELETE FROM bet_selections WHERE event_id IN (
          SELECT id FROM events
          WHERE status = 'expired'
          AND updated_at < NOW() - INTERVAL 7 DAY
          AND id NOT IN (SELECT DISTINCT event_id FROM bet_selections WHERE status = 'pending')
        )`
      );
  
      await query(
        `DELETE s FROM selections s
         JOIN event_markets em ON em.id = s.event_market_id
         WHERE em.event_id IN (
          SELECT id FROM events
          WHERE status = 'expired'
          AND updated_at < NOW() - INTERVAL 7 DAY
          AND id NOT IN (SELECT DISTINCT event_id FROM bet_selections WHERE status = 'pending')
        )`
      );
  
      await query(
        `DELETE FROM event_markets WHERE event_id IN (
          SELECT id FROM events
          WHERE status = 'expired'
          AND updated_at < NOW() - INTERVAL 7 DAY
          AND id NOT IN (SELECT DISTINCT event_id FROM bet_selections WHERE status = 'pending')
        )`
      );
  
      await query(
        `DELETE FROM event_score_periods WHERE event_id IN (
          SELECT id FROM events
          WHERE status = 'expired'
          AND updated_at < NOW() - INTERVAL 7 DAY
          AND id NOT IN (SELECT DISTINCT event_id FROM bet_selections WHERE status = 'pending')
        )`
      );
  
      const result = await query(
        `DELETE FROM events
         WHERE status = 'expired'
         AND updated_at < NOW() - INTERVAL 7 DAY
         AND id NOT IN (
          SELECT DISTINCT event_id FROM bet_selections WHERE status = 'pending'
         )`
      );
  
      console.log(`Cleanup: removed ${result.affectedRows} expired events`);
  
    } catch (error) {
  
      console.log("Cleanup Expired Events Error:", error.message);
  
   }
  
}

module.exports = cleanupExpiredEvents;

