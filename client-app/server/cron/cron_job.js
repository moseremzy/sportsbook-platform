const cron = require("node-cron");

const syncEvents  = require('../jobs/syncEvents');

const syncOdds = require("../jobs/syncOdds");

const cleanupExpiredEvents = require("../jobs/cleanupExpiredEvents");

//  (async () => { 
//    await syncEvents();
//  })()



/* EVENTS SYNC - RUNS EVERY 5 MINS. FETCHES MAX OF 10 EVENTS PER LEAGUE. I HAVE 6 LEAGUES SO EVERY 5 MINS THE API IS CALLED ON 6 TIMES. LEADING TO 72 CALLs PER HOUR */
 cron.schedule("*/5 * * * *", async () => {

     await syncEvents();

 });


// // ODDS SYNC - RUNS EVERY 20 MINUTES. BATCHES EVENTS AND FETCHES 10 BY BATCH. WITH A MAX TOTAL OF 60 EVENTS, LEADING TO 18 CALLS PER HOUR
 cron.schedule("*/20 * * * *", async () => {

   await syncOdds();

 });


 cron.schedule('0 0 * * 0', async () => {

    await cleanupExpiredEvents()
     
 }) // every Sunday at midnight

// TOTAL CALLS 90/100