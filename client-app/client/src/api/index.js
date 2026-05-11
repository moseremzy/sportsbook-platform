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

  //submit order
  static async submit_order(info) {
    return api.post("/submit_order", info).then(res => res.data);
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

  static async fetch_categories() {
    return api.get("/fetch_categories").then(res => res.data);
  }

  static async fetch_orders() {
    return api.get("/fetch_orders").then(res => res.data);
  }

  static async fetch_settings() {
    return api.get("/fetch_settings").then(res => res.data);
  }

  static async logout() {
    return api.get("/logout").then(res => res.data);
  }

  // PATCH
  static async update_user_info(info) {
    return api.patch("/update_user_info", info).then(res => res.data);
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
