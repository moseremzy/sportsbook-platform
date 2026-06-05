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

   //create event
   static async create_event(info) {
    return api.post("/create_event", info).then(res => res.data);
  }

  //add event market
  static async add_event_market(info) {
    return api.post("/add_event_market", info).then(res => res.data);
  }

  //add selection
  static async add_selection(info) {
    return api.post("/add_selection", info).then(res => res.data);
  }

  //add/update event period
  static async upsert_event_period(info) {
    return api.post("/upsert_event_period", info).then(res => res.data);
  }

  //contact us email
  static async contact_us(info) {
    return api.post("/contact_us", info).then(res => res.data);  
  }
   
  //create manual order
  static async create_manual_order(info) {
    return await api.post("/create_manual_order", info)
  }


  // GET

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

  static async fetch_transactions() {
    return api.get("/fetch_transactions").then(res => res.data);
  }

  
  static async get_manual_events() {
    return api.get(`/get_manual_events`).then(res => res.data);
  }

  //get single event 
  static async get_event(id) {
    return api.get(`/get_event/${id}`).then(res => res.data);
  }

  static async get_markets(id) {
    return api.get(`/get_markets?sport_id=${id}`).then(res => res.data);
  }

  static async get_bet_slips() {
    return api.get(`/get_bet_slips`).then(res => res.data);
  }

  //get single Bet  
  static async get_bet_slip(id) {
    return api.get(`/get_bet_slip/${id}`).then(res => res.data);
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
  
  static async update_league(info) {
    return api.patch("/update_league", info).then(res => res.data)
  }

  static async approve_reject_transaction(info) {
    return api.patch("/approve_reject_transaction", info).then(res => res.data);
  }

  static async update_event_scores(info) {
    return api.patch("/update_event_scores", info).then(res => res.data);
  }

   //update bet slip status
  static async update_bet_slip_status(info) {
    return await api.patch("/update_bet_slip_status", info)
  }

  //update selection status
  static async update_selection_status(info) {
    return await api.patch("/update_selection_status", info)
  }

  static async update_admin_info(info) {
    return api.patch("/update_admin_info", info).then(res => res.data);
  }

  static async update_system_info(info) {
    return api.patch("/update_system_info", info).then(res => res.data);
  }

  static async update_admin_pass(info) {
    return api.patch("/update_admin_pass", info).then(res => res.data);
  }


  //DELETE
  static async delete_user(info) {
    return api.delete("/delete_user", info).then(res => res.data)
  }

  static async delete_transaction(info) {
    return api.delete("/delete_transaction", info).then(res => res.data)
  }

  static async delete_event_market(info) {
    return api.delete("/delete_event_market", info).then(res => res.data)
  }

  static async delete_selection(info) {
    return api.delete("/delete_selection", info).then(res => res.data)
  }

  static async delete_event(info) {
    return api.delete("/delete_event", info).then(res => res.data)
  }

}
