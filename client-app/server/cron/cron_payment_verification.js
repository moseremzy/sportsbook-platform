require("dotenv").config({ path: "../.env" });

const API = require("../api/api");

(async () => {
  try {
    await API.cron_payment_verification();
    console.log("✔ Payment verification cron ran successfully");
    process.exit(0);
  } catch (err) {
    console.error("✖ Cron failed:", err);
    process.exit(1);
  }
})();
