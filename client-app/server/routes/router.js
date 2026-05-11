const express = require("express")
const router = express.Router();
const API = require("../api/api")
const Uri = process.env.URI
const check_user_session = require("../middlewares/check_user_session.js") 
const req = require("express/lib/request");
const LIMITERS = require("../middlewares/limiters")
const sessionConfig = require("../middlewares/session");
const session = require("express-session");



router.use(session(sessionConfig));



//GET REQUESTS 

router.get("/confirm-email/:id", API.emailVerification);

router.get("/fetch_products", API.fetch_products);

router.get("/fetch_categories", API.fetch_categories);

router.get("/fetch_settings",  API.fetch_settings);

router.get("/fetch_user", check_user_session,  API.fetch_user);

router.get("/fetch_orders", check_user_session,  API.fetch_orders);

router.get("/logout", API.logout);

 
// POST REQUEST

router.post("/register", LIMITERS.register(), API.register)

router.post("/resend-email-confirmation", LIMITERS.resendEmail(), API.ResendConfirmationMail)

router.post("/login", LIMITERS.login(), API.login)

router.post("/submit_order", check_user_session, LIMITERS.submitOrder(), API.submit_order);

router.post("/paystack_webhook", API.paystack_webhook);

router.post("/verify_payment", check_user_session,  API.verify_payment);

router.post("/contact_us", LIMITERS.contact(), API.contact_us);

router.post("/send_reset_pass_email", LIMITERS.resetPasswordEmail(), API.send_reset_pass_email);

router.post("/reset_password", LIMITERS.resetPassword(), API.reset_password);
 

//PATCH REQUEST

router.patch("/update_user_info", check_user_session, API.update_user_info)

router.patch("/update_address", check_user_session, API.update_address)

router.patch("/update_password", check_user_session, API.update_password)

router.patch("/mark_terms_conditions", check_user_session, API.mark_terms_conditions)

module.exports = router