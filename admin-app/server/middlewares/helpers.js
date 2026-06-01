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


    // Check Stock Availability
    static stock_availability(products) {

      let out_of_stock = "";

      let slightly_available = "";

      const result = products.filter(item =>
        
        item.quantity > item.stock_quantity
      
      );

      if (result.length === 0) {
        
        return null; // no problem
      
      }

      result.forEach(item => {
        
        if (item.stock_quantity === 0) {
          
          out_of_stock += `${item.name}, `;
        
        } else {
          
          slightly_available += `${item.name}, `;
        
        }
      
      });

      let message = "";

      if (out_of_stock) {
        
        message += out_of_stock + "are out of stock. ";
      
      }

      if (slightly_available) {
        
        message += slightly_available + "available but not in this quantity.";
      
      }

      return message;

    }


    static async refundPayment(reference) {
      
      const payload = { transaction: reference };
      
    
      try {
       
        const response = await axios.post(
          "https://api.paystack.co/refund",
          payload,
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json"
            }
          }
        );
    
        if (response.data.status === false) {
          
          throw new Error("Refund failed");
        
        }
    
        return response.data;
    
      } catch (error) {
        
        throw new Error("Could not process refund");
      
      }
    
    }


    static getPublicIdFromUrl(url) {
      // Remove the domain + upload/ part
      // Example: https://res.cloudinary.com/dkebpp1vm/image/upload/v1768382594/products/images/1768382594680-FB_IMG_15504165582320214.jpg
      // Returns: products/images/1768382594680-FB_IMG_15504165582320214
    
      // Split after /upload/
      const parts = url.split("/upload/");
      
      if (parts.length < 2) return null; // invalid URL
    
      let publicIdWithVersionAndExt = parts[1];
    
      // Remove version prefix like v1768382594/
      publicIdWithVersionAndExt = publicIdWithVersionAndExt.replace(/^v\d+\//, "");
    
      // Remove file extension
      const publicId = publicIdWithVersionAndExt.replace(/\.[^/.]+$/, "");
    
      return publicId;
      
    }


    static slugify(name) {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // removes / + & etc
        .replace(/\s+/g, '-')     // spaces → hyphen
        .replace(/--+/g, '-');    // avoid double hyphens
    }

    
    // Creates Confirmation Pin for Orders
    static generateConfirmationPin() {
      
      return Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit PIN

    }


    static generatePaymentReference(length = 10) { //for order id

      return crypto.randomBytes(length).toString('hex').slice(0, length);

    }


              
}
    