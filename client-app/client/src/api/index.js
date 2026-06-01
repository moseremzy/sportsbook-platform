import api from "./axios";

export default class API {
    
  // POST

  //register
  static async register(formdata) {
    return api.post("/register", formdata).then(res => res.data);
  }

  //resend confirmation email
  static async ResendConfirmationMail(info) {
    return api.post('/resend-email-confirmation', info)
  }

  //login
  static async login(formdata) {
    return api.post("/login", formdata).then(res => res.data);
  }

  //submit deposit
  static async submit_deposit(info) {
    return api.post("/submit_deposit", info, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }).then(res => res.data);
  }

  //submit withdrawal
  static async submit_withdrawal(info) {
    return api.post("/submit_withdrawal", info).then(res => res.data);  
  }

  //place bet
  static async place_bet(info) {
    return api.post("/place_bet", info).then(res => res.data);  
  }

  //contact us email
  static async contact_us(info) {
    return api.post("/contact_us", info).then(res => res.data);  
  }

  //send reset password email to user
  static async send_reset_pass_email(info) {
    return api.post("/send_reset_pass_email", info).then(res => res.data);
  }

  //Reset password
  static async reset_password(info) {
    return api.post("/reset_password", info).then(res => res.data)
  }

  //Reset password
  static async verify_payment(info) {
    return api.post("/verify_payment", info).then(res => res.data)
  }

  // GET

  //Verify Email
  static async emailVerification(id) {
    return api.get(`/confirm-email/${id}`).then(res => res.data);
  }

  static async fetch_user() {
    return api.get("/fetch_user").then(res => res.data);
  }

  static async fetch_products() {
    return api.get("/fetch_products").then(res => res.data);
  }

  static async fetch_countries() {
    return api.get("/fetch_countries").then(res => res.data);
  }

  static async fetch_sports() {
    return api.get("/fetch_sports").then(res => res.data);
  }

  static async fetch_leagues() {
    return api.get("/fetch_leagues").then(res => res.data);
  }

  static async fetch_events(query) {
    return api.get("/fetch_events", {
      params: query
    }).then(res => res.data);
  }

  static async fetch_event(id) {
    return api.get(`/fetch_event/${id}`).then(res => res.data);
  }

  static async fetch_settings() {
    return api.get("/fetch_settings").then(res => res.data);
  }

  static async fetch_transactions() {
    return api.get("/fetch_transactions").then(res => res.data);
  }

  static async fetch_bet_history() {
    return api.get("/fetch_bet_history").then(res => res.data);
  }

  static async logout() {
    return api.get("/logout").then(res => res.data);
  }

  // PATCH
  static async save_settings(info) {
    return api.patch("/save_settings", info).then(res => res.data);
  }

  static async update_address(info) {
    return api.patch("/update_address", info).then(res => res.data);
  }

  static async update_password(info) {
    return api.patch("/update_password", info).then(res => res.data);
  }

  static async mark_terms_conditions() {
    return api.patch("/mark_terms_conditions").then(res => res.data)
  }

}
