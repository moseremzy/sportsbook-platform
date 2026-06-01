const express = require("express")
const router = express.Router();
const API = require("../api/api")
const Uri = process.env.URI
const multer = require("multer");
const check_user_session = require("../middlewares/check_user_session.js") 
const req = require("express/lib/request");
const LIMITERS = require("../middlewares/limiters")
const sessionConfig = require("../middlewares/session");
const session = require("express-session");



router.use(session(sessionConfig));

//initialize multer
const path = require('path');

// This resolves to the root-level resources folder
// from admin-app/server → go up 2 levels → root → resources
// from client-app/server → go up 2 levels → root → resources
const RESOURCES_ROOT = path.resolve(__dirname, '../../resources');

let storage = multer.diskStorage({

  destination: (req, file, cb) => {

    let folder = ''; // default subfolder

    if (file.fieldname === "countryImage") {

      folder = "countries";

    } else if (file.fieldname === "authorsImage") {

      folder = "authors";
    
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
  
    let fileExt = file.originalname.split(".")[file.originalname.split(".").length - 1]
    
    let fileTypes = ["jpg", "jpeg", "png"]
  
    let mimeTypes = ["image/jpeg", "image/jpeg", "image/png"]
  
    if (mimeTypes.includes(file.mimetype) && fileTypes.includes(fileExt)) {
  
      return cb(null, true)
      
    } else {
  
     req.fileValidationError = "You can only upload images"
  
     return cb(null, false, req.fileValidationError)
  
    }
  
  }
   
  let upload = multer({
  
    storage: storage,
  
    limits: {fileSize: 3000000}, //image size cannot be more than 3mb
  
    fileFilter: (req, file, cb) => { //collect only images
      checkFileTypes(file, cb);
    }
  
  }) 
  



//GET REQUESTS 

router.get("/fetch_countries", API.fetch_countries);

router.get("/fetch_sports", API.fetch_sports);

router.get("/fetch_leagues",  API.fetch_leagues);

router.get("/fetch_user", check_user_session,  API.fetch_user);

router.get("/fetch_transactions",  API.fetch_transactions);

router.get("/fetch_bet_history",  API.fetch_bet_history);

router.get("/fetch_events",  API.fetch_events);

router.get("/fetch_event/:id",  API.fetch_event);

router.get("/fetch_settings", API.fetch_settings);

router.get("/logout", API.logout);

 
// POST REQUEST

router.post("/register", LIMITERS.register(), API.register)

router.post("/login", LIMITERS.login(), API.login)

router.post("/submit_deposit", check_user_session, upload.single("d_proof"), API.submit_deposit);

router.post("/submit_withdrawal", check_user_session, API.submit_withdrawal);

router.post("/place_bet", check_user_session, API.place_bet);

router.post("/contact_us", LIMITERS.contact(), API.contact_us);

router.post("/send_reset_pass_email", LIMITERS.resetPasswordEmail(), API.send_reset_pass_email);

router.post("/reset_password", LIMITERS.resetPassword(), API.reset_password);
 

//PATCH REQUEST

router.patch("/save_settings", check_user_session, API.save_settings)
 
module.exports = router