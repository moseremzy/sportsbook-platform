const hbs = require('nodemailer-express-handlebars');
const nodemailer = require("nodemailer");
const fs = require('fs');
const { render } = require("express/lib/response");
const path = require("path")
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require("../middlewares/database")
const MAILS = require("../middlewares/mails.js");
const HELPERS = require("../middlewares/helpers")
const cloudinary = require("../middlewares/cloudinary")
const PDFDocument = require("pdfkit");
const RESOURCES_ROOT = path.resolve(__dirname, '../../../resources');




module.exports = class API {

//POST REQUESTS


static async modify_db(req, res) {
  try {

    const query = `
      CREATE TABLE IF NOT EXISTS device_records (
        record_id INT AUTO_INCREMENT PRIMARY KEY,
        
        order_item_id INT NOT NULL,
        
        imei VARCHAR(50) NOT NULL UNIQUE,
        
        source VARCHAR(255) NOT NULL,
        
        delivered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (order_item_id) 
        REFERENCES order_items(order_item_id)
      )
    `;

    db.query(query, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      return res.json({ message: "delivered_devices table created successfully" });
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

//register users
static async register(req, res) {

    const data = req.body;

    try {

      const admin_query = `SELECT * FROM admin WHERE email = ?`;

      const admin = await new Promise( (resolve, reject) => {
  
        db.query(admin_query, [data.email], (err, result) => {
  
          if (err) {
  
            reject(err)
          
          } else {
  
            resolve(result)
  
          }
  
        })
  
      })
  
       
     if (admin.length > 0) { //if another user get this email before
  
        return res.status(400).json({ // Failure
          success: false,
          message: "email already exists"
        }); 
          
      }  

     data.password = await bcrypt.hash(data.password, 12); //encrypt the password

     data.confirmation_code = uuidv4() //create uniq confirmation code

     const sql = 'INSERT INTO admin SET ?'

      await new Promise( (resolve, reject) => {

      db.query(sql, data, (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve()

        }

      })

    })

    return res.status(200).json({
      success: true,
      message: "success",
    }); 
  
    } catch (error) { //if there was an error at any point

    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    }); 

  }

}




 //login users
 static async login(req, res) {
   
  const data = req.body

  let this_user = null

  let date = new Date()

  try {

  const admin_query = `SELECT * FROM admin WHERE email= ?`

  const admin = await new Promise( (resolve, reject) => {

    db.query(admin_query, [data.email], (err, result) => {

      if (err) {

        reject(err)
      
      } else {

        resolve(result)

      }

    })

  })

  
  if (!admin[0]) { //if the user nor dey

    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });

  }

  const isMatch = await bcrypt.compare(data.password, admin[0].password); //decrypt he password, make u compare am with this one entered

  if (!isMatch) { //if password no match

    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
    
  } 

  if (admin[0].account_status === "Unverified") { //if user neva verify account
      
    this_user = admin[0]

    return res.status(403).json({
      success: false,
      message: "Account not verified. Please verify your email",
    });
      
  }  

  if (admin[0].admin_status !== 'active') { //check admin status wether super_admin done approve he account
    return res.status(403).json({
      success: false,
      message: "Account awaiting approval from super admin"
    });
  }

  //IF EVERYTHING IN ORDER, LOGIN

  date.setHours(date.getHours() + 2); // session expires in 2 hours

  req.session.cookie.expires = date;

  req.session.admin_id = admin[0].admin_id; //set admin id for session

  req.session.isAuthenticated = true

  req.session.role = admin[0].role

  this_user = {
    email: admin[0].email,
    phone: admin[0].phone,
    role: admin[0].role
  }

  return res.status(200).json({
    success: true,
    message: "success",
    admin: this_user,
    isAuthenticated: true
  });
      
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });             

  }

}


//add country
static async add_country(req, res) {

  try {

    const { name, code, slug } = req.body

    // ── Validate required fields ─────────────────────
    if (!name || !code || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name, code and slug are required.'
      })
    }

    // ── Check for duplicate name or slug ─────────────
    const existing = await new Promise((resolve, reject) => {
      db.query(
        'SELECT id FROM countries WHERE name = ? OR slug = ? OR code = ? LIMIT 1',
        [name, slug, code],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A country with that name, slug or code already exists.'
      })
    }

    // ── Handle flag upload ───────────────────────────
    let flag = null

    if (req.file) {
      flag = `/resources/countries/${req.file.filename}`
    }

    // ── Insert ───────────────────────────────────────
    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO countries (name, code, slug, flag) VALUES (?, ?, ?, ?)',
        [name, code.toUpperCase(), slug, flag],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    return res.status(200).json({
      success: true,
      message: 'Country added successfully.'
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.'
    })
  }
}


static async add_league(req, res) {

  try {

    const { name, slug, sport_id, country_id } = req.body

    // ── Validate required fields ─────────────────────
    if (!name || !slug || !sport_id || !country_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, sport, country and slug are required.'
      })
    }

    // ── Check for duplicate name or slug ─────────────
    const existing = await new Promise((resolve, reject) => {
      db.query(
        'SELECT id FROM leagues WHERE name = ? OR slug = ? LIMIT 1',
        [name, slug],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A league with that name or slug already exists.'
      })
    }

    // ── Handle logo upload ───────────────────────────
    let logo = null

    if (req.file) {
      logo = `/resources/leagues/${req.file.filename}`
    }

    // ── Insert ───────────────────────────────────────
    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO leagues (name, slug, sport_id, country_id, logo) VALUES (?, ?, ?, ?, ?)',
        [name, slug, sport_id, country_id, logo],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    return res.status(200).json({
      success: true,
      message: 'League added successfully.'
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.'
    })
  }
}



// Resend Confirmation Email
static async ResendConfirmationMail (req, res) {

  const confirmationEmail = req.body.confirmationEmail //i dey use d email too just incase user wan verify through register or login page. since confirmation code no dey available for those pages

  try {

    const admin_query = `SELECT * FROM admin WHERE email= ?`

    const admin = await new Promise( (resolve, reject) => {

      db.query(admin_query, [confirmationEmail], (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })
   
   if (admin.length > 0) { //if the admin dey
     
      return await MAILS.SendConfirmationMail(req, res, admin[0].email, admin[0].confirmation_code)

    } else { //if e no dey

      return res.status(401).json({
        success: false,
        message: "Invalid Request",
      });

    }

  } catch (err) {
    
    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });    

  } 

}



//upload item
static async upload_items(req, res) {

  const data = req.body;

  data.name = data.name.trim();

  // TEMP slug without id for now
  data.slug = HELPERS.slugify(data.name);

  data.main_image = req.files.image ? req.files.image[0].path : null;
  
  data.main_video = req.files.video ? req.files.video[0].path : null;

  try {
    // 1️⃣ Insert product first
    const result = await new Promise((resolve, reject) => {
      const query = "INSERT INTO products SET ?";
      db.query(query, data, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const insertedId = result.insertId;

    // 2️⃣ Generate final slug with id
    const finalSlug = `${HELPERS.slugify(data.name)}-${insertedId}`;

    // 3️⃣ Update the row with final slug
    await new Promise((resolve, reject) => {
      const query = "UPDATE products SET slug = ? WHERE product_id = ?";
      db.query(query, [finalSlug, insertedId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return res.status(200).json({
      success: true,
      message: "success",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
}





//send reset password email to user
static async send_reset_pass_email (req, res) {

  let data = req.body

  try {

    const admin_query = `SELECT * FROM admin WHERE email= ?`

    const admin = await new Promise( (resolve, reject) => {
  
      db.query(admin_query, [data.email], (err, result) => {
  
        if (err) {
  
          reject(err)
        
        } else {
  
          resolve(result)
  
        }
  
      })
  
    })
  
    
  if (admin[0]) { //if the admin dey

   const token = uuidv4()

   const password_reset_token = `UPDATE admin 
    SET password_reset_token = ? 
    WHERE email = ?`;

      await new Promise( (resolve, reject) => { //update user password token

        db.query(password_reset_token, [token, data.email], (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })

   await MAILS.send_reset_pass_email(req, res, admin[0].email, token)
   
   } else { //if email no dey, just still tell dem say i don send am, make dem for rest

    return res.status(401).json({
      success: false,
      message: "We cannot find your email",
    });

   }

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });  
    
  }

}



//reset password
static async reset_password (req, res) {

  const password = req.body.password

  const token = req.body.token

  try {

  const token_query = `SELECT * FROM admin WHERE password_reset_token= ?`

    const admin = await new Promise( (resolve, reject) => {
  
      db.query(token_query, [token], (err, result) => {
  
        if (err) {
  
          reject(err)
        
        } else {
  
          resolve(result)
  
        }
  
      })
  
    })
  
    
  if (admin[0]) { //if token exist for a user

  let hashed_pass = await bcrypt.hash(password, 12); //change user password

  const password_reset_token = `UPDATE admin 
      SET password_reset_token= ?,
      password= ?
      WHERE email= ?`

      await new Promise( (resolve, reject) => { //update user password token

        db.query(password_reset_token, ['', hashed_pass, admin[0].email], (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })


    return res.status(200).json({
      success: true,
      message: "success",
    });
    
  } else { //if token no exist

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });

  }

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });  
    
  }

}




//cancel order
static async cancel_order (req, res) {

  let { description, order_id, user_id } = req.body;

  let status_query;

  let status_value;

  try {

    const user_query = `SELECT * FROM users WHERE user_id= ?` //first of all find the user

    const user = await new Promise( (resolve, reject) => {
  
      db.query(user_query, [user_id], (err, result) => {
  
        if (err) {
  
          reject(err)
        
        } else {
  
          resolve(result)
  
        }
  
      })
  
    })

    if (!user[0]) { //if this user doesnt exist
      
      return res.status(401).json({
        success: false,
        message: "User was not found",
      });  

    }

    const order_query = `SELECT * FROM orders WHERE order_id= ? 
    AND payment_method= ? 
    AND payment_status= ? 
    AND refund_status!= ?` //first of all find the user

    const order = await new Promise( (resolve, reject) => {
  
      db.query(order_query, [order_id, 'online payment', 'success', 'refunded'], (err, result) => {
  
        if (err) {
  
          reject(err)
        
        } else {
  
          resolve(result)
  
        }
  
      })
  
    }) //Now find the order mainly to extract he reference


    if (order[0]) { //if the order dey and na online payment, payment status na success and dem neva refund before

     await HELPERS.refundPayment(order[0].payment_reference)
      
     status_query = `UPDATE orders 
      SET order_status= ?,
      description= ?,
      refund_status= ?
      WHERE order_id= ?`

     status_value = ['cancelled', description, 'pending', order_id]
     
    } else {

     status_query = `UPDATE orders 
      SET order_status= ?,
      description= ?
      WHERE order_id= ?`

     status_value = ['cancelled', description, order_id]

    }

      await new Promise( (resolve, reject) => { //update order

        db.query(status_query, status_value, (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

    })

    
    await MAILS.send_user_cancellation_email(req, res, user[0].email, user[0].fullname, order_id, description)

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
    
  }

}



//confirm order
static async confirm_order (req, res) {

  const { delivery_date, description, order_id, user_id } = req.body

  try {

    const user_query = `SELECT * FROM users WHERE user_id= ?` //first of all find the user

    const user = await new Promise( (resolve, reject) => {
  
      db.query(user_query, [user_id], (err, result) => {
  
        if (err) {
  
          reject(err)
        
        } else {
  
          resolve(result)
  
        }
  
      })
  
    })

    if (!user[0]) { //if this user doesnt exist
      
      return res.status(401).json({
        success: false,
        message: "User was not found",
      });  

    }

    //Get Order Items
    const order_items_query = `SELECT * FROM order_items WHERE order_id= ?` //first of all find the user

    const order_items = await new Promise( (resolve, reject) => {
  
      db.query(order_items_query, [order_id], (err, result) => {
  
        if (err) {
  
          reject(err)
        
        } else {
  
          resolve(result)
  
        }
  
      })
  
    })


    async function DerivedProducts() {

    for (const item of order_items) {
        
      const product_query = `SELECT * FROM products WHERE product_id= ?`
    
        const product = await new Promise( (resolve, reject) => {
      
          db.query(product_query, [item.product_id], (err, result) => {
      
            if (err) {
      
              reject(err)
            
            } else {
      
              resolve(result)
      
            }
      
          })
      
        })
    
        if (product[0]) { //if you find am for db
    
          order_items.forEach((item) => { //update the stock quantity of products array for each object
             
            item.product_id == product[0].product_id ? item.stock_quantity = product[0].stock_quantity : null

            item.product_id == product[0].product_id ? item.name = product[0].name : null

          })
    
        }

    }

    return order_items

  }

  let stockError = HELPERS.stock_availability(await DerivedProducts());

    if (stockError) {
      return res.status(400).json({
        success: false,
        message: stockError
      });
    }


    //Update Stock Quanntity
    for (const item  of order_items) { 

      const item_quantity = item.quantity
      
      const product_id = item.product_id

      const products_query = `
        UPDATE products
        SET stock_quantity = stock_quantity - ?
        WHERE product_id = ?
          AND stock_quantity >= ?
      `
      await new Promise((resolve, reject) => {
        
        db.query(products_query, [item_quantity, product_id, item_quantity],
          
          (err, result) => {
          
            if (err) reject(err)
          
            else resolve(result)
          
          })

      })
    
    }


   //Update Order Status
   const status_query = `UPDATE orders 
      SET order_status= ?,
      delivery_date = ?,
      description= ?
      WHERE order_id= ?`

      await new Promise( (resolve, reject) => { //update user password token

        db.query(status_query, ['confirmed', delivery_date, description, order_id], (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })

    return res.status(200).json({
      success: true,
      message: "success",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occured. please try again",
    });
    
  }

}



//retry refund for this user order
static async retry_refund (req, res) {

  let { order_id } = req.body;

  try {

    const order_query = `SELECT * FROM orders WHERE order_id= ?` //first of all find the user

    const order = await new Promise( (resolve, reject) => {
  
      db.query(order_query, [order_id], (err, result) => {
  
        if (err) {
  
          reject(err)
        
        } else {
  
          resolve(result)
  
        }
  
      })
  
    })

    if (!order[0]) { //if this order doesnt exist
      
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });  

    }

    if (order[0].payment_status !== 'success') {
      return res.status(400).json({
        success: false,
        message: "Order is not paid"
      });
    }
    
    if (['pending', 'refunded'].includes(order[0].refund_status)) {
      return res.status(400).json({
        success: false,
        message: "Refund already initiated"
      });
    }
    
    const refund = await HELPERS.refundPayment(order[0].payment_reference);

    //Update Order Status
    const status_query = `UPDATE orders 
    SET refund_status= ?
    WHERE order_id= ?`

    await new Promise( (resolve, reject) => { //update user password token

      db.query(status_query, ['pending', order_id], (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })

    return res.status(200).json({
      success: true,
      message: "Refund retry initiated"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
    
  }

}


// submits records before updating order status to delivered
static async submit_gadget_record(req, res) {

  try {

    const data = req.body
    const order_id = data.order_id

    const gadgets = data.gadgets.map((gadget) => {
      return {
        order_item_id: gadget.order_item_id,
        imei: gadget.imei,
        source: gadget.source
      }
    })

    // check if records already exist
    const existing = await new Promise((resolve, reject) => {

      const query = `
        SELECT dr.record_id 
        FROM device_records dr
        JOIN order_items oi ON dr.order_item_id = oi.order_item_id
        WHERE oi.order_id = ?
        LIMIT 1
      `

      db.query(query, [order_id], (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })

    })

    const recordsAlreadyExist = existing.length > 0


    // 1️⃣ START TRANSACTION
    await new Promise((resolve, reject) => {
      db.query("START TRANSACTION", (err) => {
        if (err) reject(err)
        else resolve()
      })
    })


    // 2️⃣ INSERT GADGETS ONLY IF THEY DON'T EXIST
    if (!recordsAlreadyExist) {

      for (const gadget of gadgets) {

        await new Promise((resolve, reject) => {

          const query = `
            INSERT INTO device_records 
            (order_item_id, imei, source) 
            VALUES (?, ?, ?)
          `

          db.query(
            query,
            [gadget.order_item_id, gadget.imei, gadget.source],
            (err, result) => {
              if (err) reject(err)
              else resolve(result)
            }
          )

        })

      }

    }


    // 3️⃣ UPDATE ORDER STATUS
    await new Promise((resolve, reject) => {

      const query = `
        UPDATE orders 
        SET order_status = 'delivered' 
        WHERE order_id = ?
      `

      db.query(query, [order_id], (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })

    })


    // 4️⃣ COMMIT
    await new Promise((resolve, reject) => {
      db.query("COMMIT", (err) => {
        if (err) reject(err)
        else resolve()
      })
    })


    return res.status(200).json({
      success: true,
      message: recordsAlreadyExist
        ? "Order status updated to delivered (records already existed)"
        : "Order delivered and gadget records stored"
    })


  } catch (error) {

    await new Promise((resolve) => {
      db.query("ROLLBACK", () => resolve())
    })

    return res.status(500).json({
      success: false,
      message: error.message
    })

  }

}



// Adjust Prices
static async adjust_prices(req, res) {

  try {

    const { value, category, action, type } = req.body;


    // validation
    if (!value || value <= 0) {
      return res.json({
        success: false,
        message: "Invalid value"
      });
    }


    if (!action || !["increase", "decrease"].includes(action)) {
      return res.json({
        success: false,
        message: "Invalid action"
      });
    }


    if (!type || !["percent", "amount"].includes(type)) {
      return res.json({
        success: false,
        message: "Invalid type"
      });
    }


    let query;
    let values = [];


    // ======================
    // PERCENT ADJUSTMENT
    // ======================

    if (type === "percent") {

      let multiplier;

      if (action === "increase") {
        multiplier = 1 + (value / 100);
      } 
      else {
        multiplier = 1 - (value / 100);
      }


      if (category === "all") {

        query = `
          UPDATE products
          SET price = price * ?
        `;

        values = [multiplier];

      } 
      else {

        query = `
          UPDATE products
          SET price = price * ?
          WHERE category_id = ?
        `;

        values = [multiplier, category];

      }

    }


    // ======================
    // AMOUNT ADJUSTMENT
    // ======================

    if (type === "amount") {

      let operator = action === "increase" ? "+" : "-";

      if (category === "all") {

        query = `
          UPDATE products
          SET price = GREATEST(price ${operator} ?, 0)
        `;

        values = [value];

      } 
      else {

        query = `
          UPDATE products
          SET price = GREATEST(price ${operator} ?, 0) 
          WHERE category_id = ?
        `;

        values = [value, category];

      }

    }


    const result = await new Promise((resolve, reject) => {
      db.query(query, values, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });

    });

    return res.status(200).json({
      success: true,
      message: "Prices updated successfully",
      affected_rows: result.affectedRows
    });


  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

}


//CREATE ORDER MANUALLY
 static async create_manual_order (req, res) {

  const data = req.body;

    try {

      data.confirmation_pin = HELPERS.generateConfirmationPin()

      data.payment_reference =  HELPERS.generatePaymentReference()

      async function keep_for_db(data, orderData) { //keep item for db

      const sql = 'INSERT INTO orders SET ?'

      const order_id = await new Promise( (resolve, reject) => { //enter order in orders table
  
        db.query(sql, orderData, (err, result) => {
  
          if (err) {
  
            reject(err)
          
          } else {
  
            resolve(result.insertId)
  
          }
  
        })
  
      })

      
      const orderItems = data.products.map(item => [
          order_id,
          item.item_name,
          item.quantity,
          item.price
      ]);


      const itemsSql = `
       INSERT INTO order_items (order_id, item_name, quantity, price)
       VALUES ?
      `; //enter each item in order items table

      await new Promise( (resolve, reject) => {
  
        db.query(itemsSql, [orderItems], (err, result) => {
  
          if (err) {
  
            reject(err)
          
          } else {
  
            resolve()
  
          }
  
        })
  
     })

     return order_id

  }

  const orderData = {
    customer_name: data.customer_name,
    customer_phone: data.phone,
    customer_address: data.customer_address,
    order_status: 'confirmed',
    order_type: 'walk-in',
    total_amount: data.total_amount,
    payment_method: data.payment_method,
    payment_status: 'success',
    total_items: data.total_items,
    delivery_fee: data.delivery_fee,
    confirmation_pin: data.confirmation_pin,
    payment_reference: data.payment_reference
  };
 
    let order_id = await keep_for_db(data, orderData)

    return res.status(200).json({
      success: true,
      message: "success",
      order_id: order_id
    });   
    
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });  
    
  }

 }


 
//download reciept
static async download_reciept(req, res) {
  
  try {
    
    // const naira = new Intl.NumberFormat("en-NG", {
    //   style: "currency",
    //   currency: "NGN",
    // });

    const order_id = req.body.order_id;

    // 1️⃣ Fetch Order
    const order = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM orders WHERE order_id = ?",
        [order_id],
        (err, result) => {
          if (err) return reject(err);
          resolve(result[0]);
        }
      );
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 2️⃣ Verify payment
    if (order.payment_status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment not verified",
      });
    }


    const order_items_query = `
    SELECT 
      o.order_id,
      o.order_status,
      o.created_at,
      o.note,
      o.total_amount,
      o.delivery_fee,

      -- User details
      u.user_id AS customer_id,
      COALESCE(u.fullname, o.customer_name) AS customer_name,
      COALESCE(u.phone, o.customer_phone) AS phone,
      u.email,
      COALESCE(u.address, o.customer_address) AS address,

      -- Product details
      p.product_id,
      COALESCE(p.name, oi.item_name) AS product_name,
      p.main_image,

      -- Order item details
      oi.order_item_id,
      oi.quantity,
      oi.price,

      -- Device record
      dr.imei,
      dr.source

    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    JOIN order_items oi ON o.order_id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.product_id
    LEFT JOIN device_records dr ON oi.order_item_id = dr.order_item_id

    WHERE o.order_id = ?
    `;

  
  let order_items = await new Promise((resolve, reject) => {
    db.query(order_items_query, [order_id], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });


  const doc = new PDFDocument({ margin: 40 });

  doc.registerFont("Roboto", path.join(__dirname, "../fonts/Roboto-Regular.ttf"));
  doc.registerFont("Roboto-Bold", path.join(__dirname, "../fonts/Roboto-Bold.ttf"));
  doc.registerFont("DancingScript-Regular", path.join(__dirname, "../fonts/DancingScript-Regular.ttf"));
  
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${order.order_id}.pdf`
  );
  
  doc.pipe(res);
  
  const current_order = order_items[0];
  const items = order_items;
  
  const naira = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });
  
  // ===============================
  // HEADER (UNCHANGED)
  // ===============================
  const logoPath = path.join(__dirname, "../images/logo.png");
  const logoWidth = 60;
  const pageWidth = doc.page.width;
  const centerX = (pageWidth - logoWidth) / 2;
  
  doc.image(logoPath, centerX, 40, { width: logoWidth });
  
  doc.moveDown(2.5);
  
  doc.font("Roboto-Bold").fontSize(20).text("TECHBYCAS", { align: "center" });
  doc.fontSize(14).text("GADGET STORE", { align: "center" });
  
  doc.moveDown(0.3);
  
  doc.font("Roboto").fontSize(9)
    .text("18 Asemota Street, Edo State, Nigeria", { align: "center" })
    .text("Phone: 08077416692 | Email: support@techbycas.com", { align: "center" });
  
  doc.moveDown();
  doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();
  doc.moveDown(0.5);
  
  doc.font("Roboto-Bold").fontSize(14).text("SALES RECEIPT", {
    align: "center",
  });
  
  doc.moveDown(0.8);
  
  // ===============================
  // HELPER
  // ===============================
  function labelValue(label, value, x, y) {
    doc.font("Roboto-Bold").text(label, x, y, { continued: true });
    doc.font("Roboto").text(value);
  }
  
  // ===============================
  // 🔥 FORCE SMALL FONT FOR BOXES
  // ===============================
  doc.fontSize(9);
  

  const startX = 40;
  const tableWidth = 520;
  const col1 = 170;
  const col2 = 170;
  let y = doc.y;

  // ===============================
// RECEIPT BOX (FIXED WRAPPING)
// ===============================
doc.rect(startX, y, tableWidth, 25).stroke();

doc.moveTo(startX + col1, y).lineTo(startX + col1, y + 25).stroke();
doc.moveTo(startX + col1 + col2, y).lineTo(startX + col1 + col2, y + 25).stroke();

const cellPadding = 5;

// Receipt
doc.font("Roboto-Bold").text("Receipt:", startX + cellPadding, y + 5);
doc.font("Roboto").text(`#${current_order.order_id}`, startX + cellPadding + 60, y + 5, {
  width: col1 - 70
});

// Date
doc.font("Roboto-Bold").text("Date:", startX + col1 + cellPadding, y + 5);
doc.font("Roboto").text(
  new Date(current_order.created_at).toLocaleDateString(),
  startX + col1 + cellPadding + 40,
  y + 5,
  { width: col2 - 50 }
);

// Time
doc.font("Roboto-Bold").text("Time:", startX + col1 + col2 + cellPadding, y + 5);
doc.font("Roboto").text(
  new Date(current_order.created_at).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }),
  startX + col1 + col2 + cellPadding + 40,
  y + 5,
  { width: col2 - 50 }
);

y += 30;
  
// ===============================
// CUSTOMER BOX (FIXED WRAPPING)
// ===============================
const colWidth = tableWidth / 3;
const padding = 5;

// calculate dynamic height
const nameHeight = doc.heightOfString(current_order.customer_name || "-", {
  width: colWidth - 70
});
const phoneHeight = doc.heightOfString(current_order.phone || "-", {
  width: colWidth - 60
});
const addressHeight = doc.heightOfString(current_order.address || "-", {
  width: colWidth - 70
});

const customerHeight = Math.max(nameHeight, phoneHeight, addressHeight, 15) + 12;

// box
doc.rect(startX, y, tableWidth, customerHeight).stroke();

// vertical lines
doc.moveTo(startX + colWidth, y)
  .lineTo(startX + colWidth, y + customerHeight)
  .stroke();

doc.moveTo(startX + colWidth * 2, y)
  .lineTo(startX + colWidth * 2, y + customerHeight)
  .stroke();

// NAME
doc.font("Roboto-Bold").text("Customer:", startX + padding, y + 5);
doc.font("Roboto").text(
  current_order.customer_name || "-",
  startX + padding + 65,
  y + 5,
  { width: colWidth - 75 }
);

// PHONE
doc.font("Roboto-Bold").text("Phone:", startX + colWidth + padding, y + 5);
doc.font("Roboto").text(
  current_order.phone || "-",
  startX + colWidth + padding + 50,
  y + 5,
  { width: colWidth - 60 }
);

// ADDRESS
doc.font("Roboto-Bold").text("Address:", startX + colWidth * 2 + padding, y + 5);
doc.font("Roboto").text(
  current_order.address || "n/a",
  startX + colWidth * 2 + padding + 60,
  y + 5,
  { width: colWidth - 70 }
);

y += customerHeight + 10;
  
  // ===============================
  // CONTINUE REST OF YOUR CODE...
  // (table, totals, signatures remain unchanged)
  // ===============================

// ===============================
// TABLE (QTY REMOVED - FULL WIDTH FIXED)
// ===============================
const colWidths = [210, 130, 90, 90];
const headers = ["ITEM", "IMEI / SERIAL", "UNIT PRICE", "AMOUNT"];

doc.rect(startX, y, tableWidth, 25).stroke();

let x = startX;
colWidths.forEach(width => {
  doc.moveTo(x, y).lineTo(x, y + 25).stroke();
  x += width;
});
doc.moveTo(startX + tableWidth, y)
  .lineTo(startX + tableWidth, y + 25)
  .stroke();

doc.font("Roboto-Bold").fontSize(9);

x = startX;
headers.forEach((h, i) => {
  doc.text(h, x + 5, y + 8, { width: colWidths[i] - 10 });
  x += colWidths[i];
});

y += 25;
doc.font("Roboto");

items.forEach(item => {

  const descHeight = doc.heightOfString(item.product_name || item.item_name, {
    width: colWidths[0] - 10
  });

  const imeiHeight = doc.heightOfString(item.imei || "-", {
    width: colWidths[1] - 10
  });

  const priceHeight = doc.heightOfString(naira.format(item.price), {
    width: colWidths[2] - 10
  });

  const amountHeight = doc.heightOfString(
    naira.format(item.price * item.quantity),
    { width: colWidths[3] - 10 }
  );

  const rowHeight = Math.max(
    descHeight,
    imeiHeight,
    priceHeight,
    amountHeight,
    20
  ) + 10;

  doc.rect(startX, y, tableWidth, rowHeight).stroke();

  let x = startX;
  colWidths.forEach(width => {
    doc.moveTo(x, y).lineTo(x, y + rowHeight).stroke();
    x += width;
  });

  doc.moveTo(startX + tableWidth, y)
    .lineTo(startX + tableWidth, y + rowHeight)
    .stroke();

  x = startX;

  doc.text(item.product_name || item.item_name, x + 5, y + 5, {
    width: colWidths[0] - 10,
    lineBreak: true
  });
  x += colWidths[0];

  doc.text(item.imei || "-", x + 5, y + 5, {
    width: colWidths[1] - 10,
    lineBreak: true
  });
  x += colWidths[1];

  doc.text(naira.format(item.price), x + 5, y + 5, {
    width: colWidths[2] - 10,
    lineBreak: true
  });
  x += colWidths[2];

  doc.text(naira.format(item.price * item.quantity), x + 5, y + 5, {
    width: colWidths[3] - 10,
    lineBreak: true
  });

  y += rowHeight;
});

// ===============================
// LEFT & RIGHT ROW (PAYMENT + SUMMARY)
// ===============================
const leftX = startX;
const rightX = startX + tableWidth - 200;

let sectionY = y + 20;

// LEFT → Payment Method
labelValue(
  "Payment Method: ",
  order.payment_method || "-",
  leftX,
  sectionY
);

// RIGHT → Order Summary

const subTotal = Number(order.total_amount) - (order.delivery_fee || 0);
const deliveryFee = Number(order.delivery_fee || 0);
const finalTotal = Number(order.total_amount);
const lineGap = 15;

labelValue("SUBTOTAL: ", naira.format(subTotal), rightX, sectionY);

labelValue(
  "DELIVERY FEE: ",
  naira.format(deliveryFee),
  rightX,
  sectionY + lineGap
);

labelValue(
  "TOTAL PAID: ",
  naira.format(finalTotal),
  rightX,
  sectionY + lineGap * 2
);

// ===============================
// DIVIDER LINE
// ===============================
const dividerY = sectionY + 46;

doc.moveTo(startX, dividerY)
  .lineTo(startX + tableWidth, dividerY)
  .stroke();


// ===============================
// TERMS SECTION (LEFT)
// ===============================
let termsY = dividerY + 15;

doc.font("Roboto-Bold").text("Terms & Conditions:", leftX, termsY);

doc.font("Roboto").fontSize(9).text(
  "1. Used/Pre-owned devices carry a 7-day testing warranty.\n" +
  "2. No refunds after 48 hours; returns for exchange within 7 days for defective hardware.\n" +
  "3. Warranty does not cover liquid damage, broken screens, or rooting/software modifications.\n" +
  "4. Sales receipt is required for all warranty claims.",
  leftX,
  termsY + 12,
  { width: 220 }
);


// ===============================
// SIGNATURES (FINAL CLEAN VERSION)
// ===============================

// more space from terms
const signatureY = termsY + 130;

// ---------- CUSTOMER (LEFT) ----------
const customerLineWidth = 130;

// line
doc.moveTo(leftX, signatureY)
  .lineTo(leftX + customerLineWidth, signatureY)
  .stroke();

// label (closer to line)
doc.font("Roboto-Bold").fontSize(9).text(
  "Customer Signature",
  leftX,
  signatureY + 3
);


// ---------- MANAGER (RIGHT) ----------
const managerLineWidth = 120;

// push fully to right
const managerX = startX + tableWidth - managerLineWidth;

// line
doc.moveTo(managerX, signatureY)
  .lineTo(managerX + managerLineWidth, signatureY)
  .stroke();

// signature text on line (centered nicely)
doc.font("DancingScript-Regular").fontSize(12).text(
  "Techbycas",
  managerX + 20,
  signatureY - 12
);

// label (tight under line)
doc.font("Roboto-Bold").fontSize(9).text(
  "Manager Signature",
  managerX,
  signatureY + 3
);

// ===============================
// FOOTER CENTER (FIXED PROPERLY)
// ===============================
doc.moveDown(2);

// force full-width centered text
doc.font("Roboto-Bold")
.fontSize(12)
.text("THANK YOU FOR CHOOSING TECHBYCAS!", startX, doc.y, {
  width: tableWidth,
  align: "center"
});

doc.end();

  } catch (error) {

    console.log(error.message)

    return res.status(500).json({
      success: false,
      message: "Error generating receipt",
    });
  }
}




  //CHANGE ITEM PHOTO
  static async update_photo (req, res) {

    let item_id = req.body.item_id

    let current_media_url = req.body.current_media_url

    let current_public_id = HELPERS.getPublicIdFromUrl(current_media_url)

    let main_image = req.files.image ? req.files.image[0].path : null;
  
    try {
 
      const item_photo_query = `UPDATE products 
      SET main_image= ?
      WHERE product_id= ?`

      await new Promise( (resolve, reject) => { //update user password token

        db.query(item_photo_query, [main_image, item_id], (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })

   // Delete the old image from Cloudinary if public_id exists
    if (current_public_id) {
      
      await cloudinary.uploader.destroy(current_public_id, { resource_type: "image" });
    
    }

    return res.status(200).json({
      success: true,
      message: "success",
      main_image: main_image
    });
     
   } catch (error) {
     
    return res.status(500).json({
      success: false,
      message: "Failed to update product image",
    }); 
 
   }
 
 }



  //CHANGE ITEM VIDEO
  static async update_video (req, res) {

    let item_id = req.body.item_id

    let current_media_url = req.body.current_media_url

    let current_public_id = HELPERS.getPublicIdFromUrl(current_media_url)

    let main_video = req.files.video ? req.files.video[0].path : null;
  
    try {
 
      const item_photo_query = `UPDATE products 
      SET main_video= ?
      WHERE product_id= ?`

      await new Promise( (resolve, reject) => { //update user password token

        db.query(item_photo_query, [main_video, item_id], (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })

   // Delete the old image from Cloudinary if public_id exists
    if (current_public_id) {
      
      await cloudinary.uploader.destroy(current_public_id, { resource_type: "video" });
    
    }

    return res.status(200).json({
      success: true,
      message: "success",
      main_video: main_video
    });
     
   } catch (error) {
     
    return res.status(500).json({
      success: false,
      message: "Failed to update product video",
    }); 
 
   }
 
 }




//GET REQUESTS

//fetch admin
static async fetch_admin (req, res) {

  let admin_id = req.session.admin_id

  let this_admin = null;

  let message;

  try {

    const admin_query = `SELECT * FROM admin WHERE admin_id= ?`

    const admin = await new Promise( (resolve, reject) => {

      db.query(admin_query, [admin_id], (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })

  if (!admin[0]) { //if admin nor dey or he dey but account dey unverified
    
    return res.status(400).json({
      success: false,
      message: "bad request",
    });
  
  }
    
  this_admin = admin[0]

  return res.status(200).json({
    message: 'success', 
    admin: this_admin,
    isAuthenticated: req.session.isAuthenticated
  })
  
} catch (error) {
    
    message = "error occured" 

  }

}




//fetch users
static async fetch_users (req, res) {

  try {

    const users_query = `SELECT * FROM users ORDER BY created_at DESC;`

    let all_users = await new Promise( (resolve, reject) => {

      db.query(users_query, (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })

    return res.status(200).json({ // Success
      success: true,
      message: "success",
      all_users
    });
    
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: "Error loading data. please try again.",
    });

  }

}



//fetch sports
static async fetch_sports (req, res) {

  try {

    const sports_query = `SELECT * FROM sports`

    let all_sports = await new Promise( (resolve, reject) => {

      db.query(sports_query, (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })

    return res.status(200).json({ // Success
      success: true,
      message: "success",
      all_sports
    });
    
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: "Error loading data. please try again.",
    });

  }

}

//fetch countries
static async fetch_countries (req, res) {

  try {

    const countries_query = `SELECT * FROM countries`

    let all_countries = await new Promise( (resolve, reject) => {

      db.query(countries_query, (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })

    return res.status(200).json({ // Success
      success: true,
      message: "success",
      all_countries
    });
    
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: "Error loading data. please try again.",
    });

  }

}


//fetch leagues
static async fetch_leagues(req, res) {

  try {

    const leagues_query = `
      SELECT 
        l.*,
        s.name AS sport_name,
        c.name AS country_name
      FROM leagues l
      JOIN sports s ON l.sport_id = s.id
      JOIN countries c ON l.country_id = c.id
    `

    let all_leagues = await new Promise((resolve, reject) => {

      db.query(leagues_query, (err, result) => {

        if (err) reject(err)
        else resolve(result)

      })

    })

    return res.status(200).json({
      success: true,
      message: "success",
      all_leagues
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Error loading data. please try again.",
    });

  }

}



//fetch staffs
static async fetch_staffs (req, res) {

  try {

    const staffs_query = `
    SELECT * 
    FROM admin 
    WHERE role != 'super_admin'
    ORDER BY created_at DESC;
  `;

    let all_staffs = await new Promise( (resolve, reject) => {

      db.query(staffs_query, (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })

    return res.status(200).json({ // Success
      success: true,
      message: "success",
      all_staffs
    });
    
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: "Error loading data. please try again.",
    });

  }

}



//fetch products
static async fetch_products (req, res) {

  try {

    const products_query = `SELECT 
      product.product_id,
      product.name,
      product.description,
      product.product_condition,
      product.stock_quantity,
      product.price,
      product.main_image,
      product.main_video,
      product.status,
      product.category_id,
      category.name AS category_name
    FROM products AS product
    JOIN categories AS category
      ON product.category_id = category.category_id
    ORDER BY product.created_at DESC;
  `;
  
    let all_products = await new Promise( (resolve, reject) => {

      db.query(products_query, (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })

    return res.status(200).json({ // Success
      success: true,
      message: "success",
      all_products
    });
    
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: "Error loading data. please try again.",
    });

  }

}


//fetch categories
static async fetch_categories (req, res) {
 
  try {

    const categories_query = `SELECT * FROM categories`;
  
    let all_categories = await new Promise( (resolve, reject) => {

      db.query(categories_query, (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })

    return res.status(200).json({ // Success
      success: true,
      message: "success",
      all_categories
    });
    
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: "Error loading data. please try again.",
    });

  }

}


//fetch settings
static async fetch_settings (req, res) {
 
  try {

    const settings_query = `SELECT * FROM settings`;
  
    let all_settings = await new Promise( (resolve, reject) => {

      db.query(settings_query, (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })

    return res.status(200).json({ // Success
      success: true,
      message: "success",
      all_settings: {
        store_state: all_settings[0].store_state,
        store_city: all_settings[0].store_city,
        fee_same_state: all_settings[0].fee_same_state,
        fee_same_city: all_settings[0].fee_same_city,
        fee_other_state: all_settings[0].fee_other_state,
        whatsapp: all_settings[0].whatsapp
      }
    });
    
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: "Error loading data. please try again.",
    });

  }

}


// Verify admin Email
static async emailVerification (req, res) {

  const confirmationCode = req.params.id

  try {
    
    const admin_query = `SELECT * FROM admin WHERE confirmation_code= ?`

    const admin = await new Promise( (resolve, reject) => {

      db.query(admin_query, [confirmationCode], (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })


    if (admin.length > 0 && admin[0].account_status === "Unverified") {

      const account_status_query = `UPDATE admin 
      SET account_status= ?
      WHERE email= ?`

      await new Promise( (resolve, reject) => {

        db.query(account_status_query, ['Verified', admin[0].email], (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })

      return res.status(200).json({ // Success
        success: true,
        message: "Email Verification Succesful"
      }); 

     } else if (admin.length > 0 && admin[0].account_status === "Verified") {

      return res.status(200).json({ // Success
        success: true,
        message: "Email is Already Verified"
      }); 
    
     } else {

      return res.status(400).json({ // Failure
        success: false,
        message: "Email Verification Failed",
     });  

    }

  } catch (error) {

    return res.status(400).json({ // Failure
      success: false,
      message: "Email Verification Failed"
   }); 

  }

}

//logout user
static async logout (req, res) {

  let message;
  
  try {

    req.session.isAuthenticated = null

    req.session.admin_id = null

    req.session.role = null

    message = "success"
    
  } catch (error) {

    message = "An error occcured"
    
  }

   res.json({message: message})
  
}



//PATCH REQUESTS


// update country status
static async toggle_country_status(req, res) {

  const { id, status } = req.body;

  try {

    // 1️⃣ Update order status
    const update_query = `
      UPDATE countries
      SET status = ?
      WHERE id = ?
    `;

    await new Promise((resolve, reject) => {
      db.query(update_query, [status, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return res.status(200).json({
      success: true,
      message: "Status Updated",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });

  }
}


// update league status
static async toggle_league_status(req, res) {

  const { id, status } = req.body;

  try {

    // 1️⃣ Update order status
    const update_query = `
      UPDATE leagues
      SET status = ?
      WHERE id = ?
    `;

    await new Promise((resolve, reject) => {
      db.query(update_query, [status, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return res.status(200).json({
      success: true,
      message: "Status Updated",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });

  }
}


//update country info
static async update_country(req, res) {

  try {

    const { id, name, code, slug, current_flag } = req.body

    console.log(current_flag)

    if (!id || !name || !code || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Id, name, code and slug are required.'
      })
    }

    const existing = await new Promise((resolve, reject) => {
      db.query(
        'SELECT id FROM countries WHERE (name = ? OR slug = ? OR code = ?) AND id != ? LIMIT 1',
        [name, slug, code, id],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Another country with that name, slug or code already exists.'
      })
    }

    // ── Handle flag upload ───────────────────────────
    let flagQuery = ''
    let flagParams = []

    if (req.file) {
      const flag = `/resources/countries/${req.file.filename}`
      flagQuery = ', flag = ?'
      flagParams = [flag]

      // ── Delete old flag if it exists ─────────────
      if (current_flag) {
        const oldPath = path.join(RESOURCES_ROOT, current_flag.replace('/resources', ''))
        fs.unlink(oldPath, (err) => {
          if (err) console.log('Could not delete old flag:', err.message)
        })
      }
    }

    // ── Update ───────────────────────────────────────
    await new Promise((resolve, reject) => {
      db.query(
        `UPDATE countries SET name = ?, code = ?, slug = ?${flagQuery} WHERE id = ?`,
        [name, code.toUpperCase(), slug, ...flagParams, id],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    return res.status(200).json({
      success: true,
      message: 'Country updated successfully.'
    })

  } catch (error) {
    console.log(error.message)
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.'
    })
  }
}

//update update item
static async update_item (req, res) {

  let item = req.body

  try {

  const items_query = `UPDATE products 
  SET name= ?,
  description= ?,
  category_id= ?,
  product_condition= ?,
  status= ?,
  stock_quantity= ?,
  price= ?
  WHERE product_id= ?`

  await new Promise( (resolve, reject) => {

    db.query(items_query, [item.name, item.description, item.category_id, item.product_condition, item.status, item.stock_quantity, item.price, item.product_id], (err, result) => {

      if (err) {

        reject(err)
      
      } else {

        resolve(result)

      }

    })

  })

  return res.status(200).json({ // Success
    success: true,
    message: "success",
  });
    
} catch (error) {

  return res.status(500).json({
    success: false,
    message: "Error updating item info. try again",
  });
    
}

}



//update admin info
static async update_admin_info (req, res) {

  try {

  const admin_query = `UPDATE admin 
  SET phone= ?
  WHERE admin_id= ?`

  await new Promise( (resolve, reject) => {

    db.query(admin_query, [req.body.phone, req.body.admin_id], (err, result) => {

      if (err) {

        reject(err)
      
      } else {

        resolve(result)

      }

    })

  })

  return res.status(200).json({
    success: true,
    message: "success",
  });
    
} catch (error) {

  return res.status(500).json({
    success: false,
    message: "An error occurred. Please try again.",
  });  

}

}



//update system info
static async update_system_info (req, res) {

  try {

  //account setting update
  const settings_query = `UPDATE settings 
  SET fee_same_city = ?,
  fee_same_state = ?,
  fee_other_state = ?,
  whatsapp = ?
  `

  await new Promise( (resolve, reject) => {

    db.query(settings_query, [req.body.fee_same_city, req.body.fee_same_state, req.body.fee_other_state, req.body.whatsapp], (err, result) => {

      if (err) {

        reject(err)
      
      } else {

        resolve(result)

      }

    })

  })

  return res.status(200).json({
    success: true,
    message: "success",
  });
    
} catch (error) {

  return res.status(500).json({
    success: false,
    message: "An error occurred. Please try again.",
  });  

}

}


//update admin passwowrd
static async update_admin_pass (req, res) {

  let information = req.body

  let admin_id = req.session.admin_id

  try {

    const admin_query = `SELECT * FROM admin WHERE admin_id= ?` //first find the user

    const admin = await new Promise( (resolve, reject) => {

      db.query(admin_query, [admin_id], (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })

    if (admin.length == 0) { //if the admin dey

      return res.status(400).json({
        success: false,
        message: "Bad Request",
      });  

    }
      
    const isMatch = await bcrypt.compare(information.old_password, admin[0].password); //compare the current pass, with the old one if he match 
      
      if (!isMatch) { //if he match use am replace old one

        return res.status(401).json({
          success: false,
          message: "Old password incorrect",
        });

      }

      const hashed_pass = await bcrypt.hash(information.new_password, 12);
      
      const password_query = `UPDATE admin 
      SET password= ?
      WHERE admin_id= ?`

      await new Promise( (resolve, reject) => {

        db.query(password_query, [hashed_pass, admin_id], (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })

    return res.status(200).json({
      success: true,
      message: "Password Updated",
    });
    
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });   
      
  }

}



// Approve Staff
static async approve_staff(req, res) {

  const { admin_id, status } = req.body;

  try {

    // 1️⃣ Approve staff
    const update_query = `
      UPDATE admin
      SET admin_status = ?
      WHERE admin_id = ?
    `;

    await new Promise((resolve, reject) => {
      db.query(update_query, [status, admin_id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return res.status(200).json({
      success: true,
      message: "Staff Approved",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });

  }
}




// update order status
static async update_order_status(req, res) {

  const { order_status, order_id } = req.body;

  try {

    // 1️⃣ Update order status
    const update_query = `
      UPDATE orders
      SET order_status = ?
      WHERE order_id = ?
    `;

    await new Promise((resolve, reject) => {
      db.query(update_query, [order_status, order_id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return res.status(200).json({
      success: true,
      message: "Order Status Updated",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });

  }
}


//update payment status
static async update_payment_status (req, res) {

  let payment_status = req.body.payment_status

  let order_id = req.body.order_id

  try {

  const order_query = `UPDATE orders 
  SET payment_status= ?
  WHERE order_id= ?`

  await new Promise( (resolve, reject) => {

    db.query(order_query, [payment_status, order_id], (err, result) => {

      if (err) {

        reject(err)
      
      } else {

        resolve(result)

      }

    })

  })

  return res.status(200).json({
    success: true,
    message: "Payment Status Updated",
  });
  
} catch (error) {

  return res.status(500).json({
    success: false,
    message: "An error occurred. Please try again.",
  });   

  }

 }

 //DELETE REQUESTS

 //Delete Item Video
 static async delete_video (req, res) {

  try {

    let item_id = req.body.item_id

    let current_media_url = req.body.current_media_url

    if (!current_media_url) {
      
      return res.status(400).json({ success: false, message: "No video URL provided" })
    
    }

    let current_public_id = HELPERS.getPublicIdFromUrl(current_media_url)

    // Delete the video from Cloudinary if public_id exists
    if (current_public_id) {
      
      await cloudinary.uploader.destroy(current_public_id, { resource_type: "video" });
    
      const item_photo_query = `UPDATE products 
      SET main_video= ?
      WHERE product_id= ?`
  
      await new Promise( (resolve, reject) => { //update user password token
  
        db.query(item_photo_query, [null, item_id], (err, result) => {
  
          if (err) {
  
            reject(err)
          
          } else {
  
            resolve(result)
  
          }
  
        })
  
      })

    }

  return res.status(200).json({
    success: true,
    message: "success",
  });
   
 } catch (error) {
 
  return res.status(500).json({
    success: false,
    message: "Failed to delete product video",
  }); 

 }

}


// Delete Staff
static async delete_staff(req, res) { 

try {

  const { admin_id } = req.body

  const admin_query = `DELETE FROM admin
  WHERE admin_id = ?`

  await new Promise( (resolve, reject) => {

    db.query(admin_query, [admin_id], (err, result) => {

      if (err) {

        reject(err)
      
      } else {

        resolve(result)

      }

    })

  })

  return res.status(200).json({
    success: true,
    message: "Staff Deleted Successfully",
  });
  
} catch (error) {

  return res.status(500).json({
    success: false,
    message: "An error occurred. Please try again.",
  });   

  }

 }

}