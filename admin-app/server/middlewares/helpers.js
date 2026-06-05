const multer = require("multer");
const crypto = require('crypto');
const path = require("path");
const axios = require("axios");
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_API_KEY;
const upload = require('./upload')


module.exports = class MIDDLEWARES {

    static handleUpload(req, res, next) {
        upload.fields([
          { name: 'image', maxCount: 1 },
          { name: 'video', maxCount: 1 }
        ])(req, res, function (err) {
          if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
              return res.status(400).json({
                success: false,
                message: "File is too large. Max 5MB for images, 50MB for videos"
              });
            }
      
            return res.status(400).json({
              success: false,
              message: err.message
            });
          }
      
          next();
        });
    }

    // ── Helper: promisify db.query ───────────────────────────
    static query(db, sql, params = []) {
      return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
      })
    }


              
}
    