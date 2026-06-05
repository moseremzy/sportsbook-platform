const express = require("express")
const router = express.Router();
const API = require("../api/api")
const Uri = process.env.URI
const check_admin_session = require("../middlewares/check_admin_session.js") 
const req = require("express/lib/request");
const multer = require("multer");
const sessionConfig = require("../middlewares/session");
const session = require("express-session");
const HELPERS = require("../middlewares/helpers")
const authorize_roles = require("../middlewares/authorize_roles")
const path = require("path")
const fs = require('fs')


router.use(session(sessionConfig));

const RESOURCES_ROOT = path.resolve(__dirname, '../../../resources');

let storage = multer.diskStorage({

  destination: (req, file, cb) => {

    let folder = ''; // default subfolder

    if (file.fieldname === "country_image") {

      folder = "countries";

    } else if (file.fieldname === "league_image") {

      folder = "leagues";
    
    } else if (file.fieldname === "transactionsImage") {
     
      folder = "transactions";
    
    } else if (file.fieldname === "d_proof") {
      
      folder = "proofs";
    
    }

    const destPath = path.join(RESOURCES_ROOT, folder);

    // Auto-create the folder if it doesn't exist
    fs.mkdirSync(destPath, { recursive: true });

    cb(null, destPath);
  },

  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}_${Date.now()}.${ext}`);
  }

});

  
  //check file type and mimetype
  let checkFileTypes = function (file, cb) {
    let fileExt = file.originalname.split(".").pop().toLowerCase()
    let fileTypes = ["jpg", "jpeg", "png", "webp"]
    let mimeTypes = ["image/jpeg", "image/webp", "image/png"]

  
    if (mimeTypes.includes(file.mimetype) && fileTypes.includes(fileExt)) {
      return cb(null, true)
    } else {
      return cb(null, false)
    }
  }
   
  let upload = multer({
  
    storage: storage,
  
    limits: {fileSize: 3000000}, //image size cannot be more than 3mb
  
    fileFilter: (req, file, cb) => {
      checkFileTypes(file, cb)
    }
  
  }) 
  
  


//GET REQUESTS 


router.get("/fetch_admin", check_admin_session, API.fetch_admin);

router.get("/fetch_users", check_admin_session, authorize_roles('super_admin'), API.fetch_users);

router.get("/fetch_sports", check_admin_session, authorize_roles('super_admin'), API.fetch_sports);

router.get("/fetch_countries", check_admin_session, authorize_roles('super_admin'), API.fetch_countries);

router.get("/fetch_leagues", check_admin_session, authorize_roles('super_admin', 'editor'), API.fetch_leagues);

router.get("/fetch_transactions", check_admin_session, authorize_roles('super_admin', 'editor'), API.fetch_transactions);

router.get("/get_manual_events", check_admin_session, authorize_roles('super_admin', 'editor'), API.get_manual_events);

router.get("/get_event/:id", check_admin_session, authorize_roles('super_admin'), API.get_event)

router.get("/get_markets", check_admin_session, authorize_roles('super_admin'), API.get_markets)

router.get("/get_bet_slips", check_admin_session, authorize_roles('super_admin'), API.get_bet_slips)

router.get("/get_bet_slip/:id", check_admin_session, authorize_roles('super_admin'), API.get_bet_slip)

router.get("/fetch_settings", check_admin_session, authorize_roles('super_admin', 'editor'),  API.fetch_settings);

router.get("/modify_db", API.modify_db)

router.get("/logout", API.logout);

 
// POST REQUEST

router.post("/register", API.register)

router.post("/login", API.login)

router.post("/add_country", check_admin_session, authorize_roles('super_admin'), upload.single('country_image'), API.add_country)

router.post("/add_league", check_admin_session, authorize_roles('super_admin'), upload.single('league_image'), API.add_league)

router.post("/create_event", check_admin_session, authorize_roles('super_admin'), API.create_event)

router.post("/add_event_market", check_admin_session, authorize_roles('super_admin'), API.add_event_market)

router.post('/add_selection', check_admin_session, authorize_roles('super_admin'), API.add_selection)

router.post('/upsert_event_period', check_admin_session, authorize_roles('super_admin'), API.upsert_event_period)
 

//PATCH REQUEST

router.patch("/toggle_country_status", check_admin_session, authorize_roles('super_admin'), API.toggle_country_status)

router.patch("/toggle_league_status", check_admin_session, authorize_roles('super_admin'), API.toggle_league_status)

router.patch("/update_country", check_admin_session, authorize_roles('super_admin'), upload.single('country_image'), API.update_country)

router.patch("/update_league", check_admin_session, authorize_roles('super_admin'), upload.single('league_image'), API.update_league)

router.patch("/approve_reject_transaction", check_admin_session, authorize_roles('super_admin'), API.approve_reject_transaction)

router.patch("/update_event_scores", check_admin_session, authorize_roles('super_admin'), API.update_event_scores)

router.patch('/update_bet_slip_status', check_admin_session, authorize_roles('super_admin'), API.update_bet_slip_status)

router.patch('/update_selection_status', check_admin_session, authorize_roles('super_admin'), API.update_selection_status)

router.patch("/update_admin_info", check_admin_session, authorize_roles('super_admin', 'editor'), API.update_admin_info)

router.patch("/update_system_info", check_admin_session, authorize_roles('super_admin', 'editor'), API.update_system_info)

router.patch("/update_admin_pass", check_admin_session, authorize_roles('super_admin', 'editor'), API.update_admin_pass)




//DELETE REQUEST

router.delete("/delete_user", check_admin_session,  authorize_roles('super_admin', 'editor'), API.delete_user)

router.delete("/delete_transaction", check_admin_session,  authorize_roles('super_admin', 'editor'), API.delete_transaction)

router.delete("/delete_event_market", check_admin_session,  authorize_roles('super_admin', 'editor'), API.delete_event_market)

router.delete("/delete_selection", check_admin_session,  authorize_roles('super_admin', 'editor'), API.delete_selection)

router.delete("/delete_event", check_admin_session,  authorize_roles('super_admin', 'editor'), API.delete_event)


module.exports = router