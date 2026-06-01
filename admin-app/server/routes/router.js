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

router.get("/confirm-email/:id", API.emailVerification);

router.get("/fetch_admin", check_admin_session, API.fetch_admin);

router.get("/fetch_users", check_admin_session, authorize_roles('super_admin'), API.fetch_users);

router.get("/fetch_sports", check_admin_session, authorize_roles('super_admin'), API.fetch_sports);

router.get("/fetch_countries", check_admin_session, authorize_roles('super_admin'), API.fetch_countries);

router.get("/fetch_leagues", check_admin_session, authorize_roles('super_admin', 'editor'), API.fetch_leagues);

router.get("/fetch_settings", check_admin_session, authorize_roles('super_admin', 'editor'),  API.fetch_settings);

router.get("/modify_db", API.modify_db)

router.get("/logout", API.logout);

 
// POST REQUEST

router.post("/register", API.register)

router.post("/resend-email-confirmation", API.ResendConfirmationMail)

router.post("/login", API.login)

router.post("/add_country", check_admin_session, authorize_roles('super_admin'), upload.single('country_image'), API.add_country)

router.post("/add_league", check_admin_session, authorize_roles('super_admin'), upload.single('league_image'), API.add_league)

router.post("/cancel_order", check_admin_session, authorize_roles('super_admin'), API.cancel_order)

router.post("/confirm_order", check_admin_session, authorize_roles('super_admin'), API.confirm_order)

router.post("/retry_refund", check_admin_session, authorize_roles('super_admin'), API.retry_refund)

router.post("/upload_items", check_admin_session, authorize_roles('super_admin', 'editor'), HELPERS.handleUpload, API.upload_items);
  
router.post("/update_photo", check_admin_session, authorize_roles('super_admin', 'editor'), HELPERS.handleUpload, API.update_photo);

router.post("/update_video", check_admin_session, authorize_roles('super_admin', 'editor'), HELPERS.handleUpload, API.update_video);

router.post("/submit_gadget_record", check_admin_session, authorize_roles('super_admin'), API.submit_gadget_record);

router.post("/adjust_prices", check_admin_session, authorize_roles('super_admin'), API.adjust_prices);

router.post("/create_manual_order", check_admin_session, authorize_roles('super_admin'), API.create_manual_order);

router.post("/download_reciept", check_admin_session, authorize_roles('super_admin'),  API.download_reciept);

router.post("/send_reset_pass_email", API.send_reset_pass_email);

router.post("/reset_password", API.reset_password);
 

//PATCH REQUEST

router.patch("/toggle_country_status", check_admin_session, authorize_roles('super_admin'), API.toggle_country_status)

router.patch("/toggle_league_status", check_admin_session, authorize_roles('super_admin'), API.toggle_league_status)

router.patch("/update_country", check_admin_session, authorize_roles('super_admin'), upload.single('country_image'), API.update_country)

router.patch("/update_payment_status", check_admin_session, authorize_roles('super_admin'), API.update_payment_status)

router.patch("/update_item", check_admin_session, authorize_roles('super_admin', 'editor'), API.update_item)

router.patch("/update_admin_info", check_admin_session, authorize_roles('super_admin', 'editor'), API.update_admin_info)

router.patch("/update_system_info", check_admin_session, authorize_roles('super_admin'), API.update_system_info)

router.patch("/update_admin_pass", check_admin_session, authorize_roles('super_admin', 'editor'), API.update_admin_pass)

router.patch("/approve_staff", check_admin_session, authorize_roles('super_admin'), API.approve_staff)




//DELETE REQUEST

router.delete("/delete_video", check_admin_session,  authorize_roles('super_admin', 'editor'), API.delete_video)

router.delete("/delete_staff", check_admin_session,  authorize_roles('super_admin'), API.delete_staff)

module.exports = router