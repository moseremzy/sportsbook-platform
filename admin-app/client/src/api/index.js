import api from "./axios";

export default class API {
    
  // POST

  //register
  static async register(formdata) {
    return api.post("/register", formdata).then(res => res.data);
  }

  //login
  static async login(formdata) {
    return api.post("/login", formdata).then(res => res.data);
  }

  //add country
  static async add_country(info) {
    return api.post("/add_country", info).then(res => res.data);
  }

   //add league
   static async add_league(info) {
    return api.post("/add_league", info).then(res => res.data);
  }

  //contact us email
  static async contact_us(info) {
    return api.post("/contact_us", info).then(res => res.data);  
  }
   
  //upload items
  static async upload_items(info) {
    return await api.post("/upload_items", info)
  }

  //update item photo
  static async update_photo(info) {
    return await api.post("/update_photo", info)
  }
  
  //cancel order
  static async cancel_order(info) {
    return await api.post("/cancel_order", info)
  }

  //confirm order
  static async confirm_order(info) {
    return await api.post("/confirm_order", info)
  }

  //retry initiating refund for user order
  static async retry_refund(info) {
    return await api.post("/retry_refund", info)
  }

  //submits records before updating order status to delivered
  static async submit_gadget_record(info) {
    return await api.post("/submit_gadget_record", info)
  }

  //adjust prices
  static async adjust_prices(info) {
    return await api.post("/adjust_prices", info)
  }

  //create manual order
  static async create_manual_order(info) {
    return await api.post("/create_manual_order", info)
  }

  static async download_reciept(order_id) {
    return api.post(`/download_reciept`, order_id, { responseType: 'blob' }).then(res => res.data);
  }

  // GET

  //Verify Email
   static async emailVerification(id) {
    return api.get(`/confirm-email/${id}`).then(res => res.data);
  }

  static async fetch_admin() {
    return api.get("/fetch_admin").then(res => res.data);
  }

  static async fetch_users() {
    return api.get("/fetch_users").then(res => res.data);
  }

  static async fetch_sports() {
    return api.get("/fetch_sports").then(res => res.data);
  }

  static async fetch_countries() {
    return api.get("/fetch_countries").then(res => res.data);
  }

  static async fetch_leagues() {
    return api.get("/fetch_leagues").then(res => res.data);
  }

  static async fetch_staffs() {
    return api.get("/fetch_staffs").then(res => res.data);
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

  static async fetch_records() {
    return api.get("/fetch_records").then(res => res.data);
  }

  static async fetch_settings() {
    return api.get("/fetch_settings").then(res => res.data);
  }

  static async logout() {
    return api.get("/logout").then(res => res.data);
  }

  // PATCH
  static async toggle_country_status(info) {
    return api.patch("/toggle_country_status", info).then(res => res.data)
  }

  static async toggle_league_status(info) {
    return api.patch("/toggle_league_status", info).then(res => res.data)
  }

  static async update_country(info) {
    return api.patch("/update_country", info).then(res => res.data)
  }

  static async update_admin_info(info) {
    return api.patch("/update_admin_info", info).then(res => res.data);
  }

  static async update_system_info(info) {
    return api.patch("/update_system_info", info).then(res => res.data);
  }

  static async update_order_status(info) {
    return api.patch("/update_order_status", info).then(res => res.data);
  }

  static async update_payment_status(info) {
    return api.patch("/update_payment_status", info).then(res => res.data);
  }

  static async update_address(info) {
    return api.patch("/update_address", info).then(res => res.data);
  }

  static async update_admin_pass(info) {
    return api.patch("/update_admin_pass", info).then(res => res.data);
  }

  static async approve_staff(info) {
    return api.patch("/approve_staff", info).then(res => res.data);
  }

  //DELETE
  static async delete_video(info) {
    return api.delete("/delete_video", info).then(res => res.data)
  }

  static async delete_staff(info) {
    return api.delete("/delete_staff", info).then(res => res.data)
  }

}
