const hbs = require('nodemailer-express-handlebars');
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const fs = require("fs");
const { render } = require("express/lib/response");
const path = require("path")
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const axios = require("axios");
const db = require("../middlewares/database")
const HELPERS = require("../middlewares/helpers.js");
const MAILS = require("../middlewares/mails.js");
const { count } = require('console');
const PAYSTACK_KEY = process.env.PAYSTACK_API_KEY
const base_url = process.env.BASE_URL


module.exports = class API {


//POST REQUESTS

//register users
static async register(req, res) {

    let data = req.body;

    try {

    const user_query = `SELECT * FROM users WHERE email = ?`;

    const user = await new Promise( (resolve, reject) => {

      db.query(user_query, [data.email], (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })

     
   if (user.length > 0) { //if another user get this email before

      return res.status(400).json({ // Failure
        success: false,
        message: "email already exists"
      }); 
        
    }  

     data.password = await bcrypt.hash(data.password, 12); //encrypt the password

     data.confirmation_code = uuidv4() //create uniq confirmation code

     delete data.confirm_password

     const sql = 'INSERT INTO users SET ?'

      await new Promise( (resolve, reject) => {

      db.query(sql, data, (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve()

        }

      })

    })

     MAILS.SendConfirmationMail(req, res, data.email, data.confirmation_code, data.fullname)
   
     return res.status(200).json({ // Failure
      success: true,
      message: "success"
     });

    } catch (error) { //if there was an error at any point

     return res.status(500).json({ // Failure
      success: false,
      message: "error occured"
     }); 

    }

}




 //login users
 static async login(req, res) {
   
  const data = req.body

  let this_user = null

  let date = new Date()

  try {

  const user_query = `SELECT * FROM users WHERE email= ?`

  const user = await new Promise( (resolve, reject) => {

    db.query(user_query, [data.email], (err, result) => {

      if (err) {

        reject(err)
      
      } else {

        resolve(result)

      }

    })

  })

  
  if (user[0]) { //if the user dey

  const isMatch = await bcrypt.compare(data.password, user[0].password); //decrypt he password, make u compare am with this one entered

  if (!isMatch) { //if password no match

    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
    
  } else { //if he match 

    if (user[0].account_status === "Unverified") { //if user neva verify account
      
    this_user = user[0]

    return res.status(403).json({
      success: false,
      message: "Account not verified. Please verify your email",
      isAuthenticated: req.session.isAuthenticated,
      user: this_user
    });
      
    } else { //if account verified, log am in

    const showTermsConditions = !user[0].welcome_terms_conditions;

    date.setHours(date.getHours() + 2); // session expires in 2 hours

    req.session.cookie.expires = date;
  
    req.session.user_id = user[0].user_id; //set user id for session

    req.session.isAuthenticated = true   

    this_user = {
         fullname: user[0].fullname,
         email: user[0].email,
         phone: user[0].phone,
         delivery_address: user[0].address

    }

    return res.status(200).json({
      success: true,
      message: "success",
      user: this_user,
      showTermsConditions,
      isAuthenticated: true
    });

    }

  }
     
  } else { //if user no dey

    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });

  }
      
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });         

  }

}




// Resend Confirmation Email
static async ResendConfirmationMail (req, res) {

  const confirmationEmail = req.body.confirmationEmail //i dey use d email too just incase user wan verify through register or login page. since confirmation code no dey available for those pages

  try {

    const user_query = `SELECT * FROM users WHERE email= ?`

    const user = await new Promise( (resolve, reject) => {

      db.query(user_query, [confirmationEmail], (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })
   
   if (user.length > 0) { //if the user dey
     
      return await MAILS.SendConfirmationMail(req, res, user[0].email, user[0].confirmation_code, user[0].fullname)

    } else { //if e no dey

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

    }

  } catch (err) {
    
    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });    

  } 

}



 //send contact us email
static async contact_us (req, res) {

  const {email, fullname, phone, message} = req.body;

  await MAILS.contact_us_email(req, res, email, fullname, phone, message)    
  
}



//send reset password email to user
static async send_reset_pass_email (req, res) {

  let data = req.body

  try {

    const user_query = `SELECT * FROM users WHERE email= ?`

    const user = await new Promise( (resolve, reject) => {
  
      db.query(user_query, [data.email], (err, result) => {
  
        if (err) {
  
          reject(err)
        
        } else {
  
          resolve(result)
  
        }
  
      })
  
    })
  
    
  if (user[0]) { //if the user dey

   const token = uuidv4()

   const password_reset_token = `UPDATE users 
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

   await MAILS.send_reset_pass_email(req, res, user[0].email, token, user[0].fullname)
   
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


//submit order
static async submit_order(req, res) {

    const data = req.body;

    let stockError;

    let priceError;

    let products = JSON.parse(data.products)

    try {

      data.confirmation_pin = HELPERS.generateConfirmationPin()

      data.payment_reference =  HELPERS.generatePaymentReference()
      
      data.user_id = req.session.user_id

      async function DerivedProducts(products) { //This function helps updates products with latest stock_quantity values

        let counter = 0;

        while (counter < products.length ) {
    
        const product_query = `SELECT * FROM products WHERE product_id= ?`
    
        const product = await new Promise( (resolve, reject) => {
      
          db.query(product_query, [products[counter].product_id], (err, result) => {
      
            if (err) {
      
              reject(err)
            
            } else {
      
              resolve(result)
      
            }
      
          })
      
        })
    
        if (product[0]) { //if you find am for db
    
          products.forEach((item) => { //update the stock quantity of products array for each object
             
            item.product_id == products[counter].product_id ? item.stock_quantity = product[0].stock_quantity : null
    
            item.product_id == products[counter].product_id ? item.latest_price = product[0].price : null

          })
    
        }
    
        counter++;
          
      }

      return products        
    
    }


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

      if (typeof data.products === "string") {
        
        data.products = JSON.parse(data.products);
      
      }
      
      const orderItems = data.products.map(item => [
          order_id,
          item.product_id,
          item.quantity,
          item.price
      ]);


      const itemsSql = `
       INSERT INTO order_items (order_id, product_id, quantity, price)
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
    user_id: req.session.user_id,
    total_amount: data.total_amount,
    payment_method: data.payment_method,
    total_items: data.total_items,
    delivery_fee: data.delivery_fee,
    confirmation_pin: data.confirmation_pin,
    note: data.note,
    payment_reference: data.payment_reference
  };

  switch (data.payment_method) {

    case 'cash on delivery':

    stockError = HELPERS.stock_availability(await DerivedProducts(products));

    if (stockError) {
      return res.status(400).json({
        success: false,
        message: stockError
      });
    }

    priceError = HELPERS.stock_price(await DerivedProducts(products));

    if (priceError) {
      return res.status(400).json({
        success: false,
        message: priceError
      });
    }

    await keep_for_db(data, orderData)
    
    return res.status(200).json({
      success: true,
      message: "success"
    }); 

    break;

  case 'online payment':

    stockError = HELPERS.stock_availability(await DerivedProducts(products));

    if (stockError) {
      return res.status(400).json({
        success: false,
        message: stockError
      });
    }

    priceError = HELPERS.stock_price(await DerivedProducts(products));

    if (priceError) {
      return res.status(400).json({
        success: false,
        message: priceError
      });
    }

    const params = {  // Payload for Paystack
        email: data.email,
        amount: data.total_amount * 100,
        reference: `${data.payment_reference}`, // Use your order ID as the reference
        metadata: {
            name: data.customer_name,
            phone: data.phone,
        },
        callback_url: `${base_url}/account/payment-verification`,
    };

    try {
      // Send POST request to Paystack
      const response = await axios.post(
          'https://api.paystack.co/transaction/initialize',
          params,
          {
              headers: {
                  Authorization: `Bearer ${PAYSTACK_KEY}`, // Your Paystack secret key
                  'Content-Type': 'application/json',
              },
          }
      );
      
      let order_id = await keep_for_db(data, orderData)

      MAILS.send_admin_order_notification(order_id, HELPERS.formatted_date(new Date()), data)

      return res.status(200).json({
        success: true,
        message: "success",
        authorization_info: response.data
      });   
      
    } catch (error) {

      return res.status(500).json({
        success: false,
        message: "Problem connecting to paystack",
      });    

      }

      break;

  } //close switch block
    
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "an error occured. try again.",
    });  
    
  }

}


// verify user paystack payment manually
static async verify_payment(req, res) {

  const { reference } = req.body;
  
  if (!reference) {
    return res.status(400).json({success: false, message: 'Payment reference is required' });
  }

  try {
    // 1. Find order
    const order = await new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM orders WHERE payment_reference = ?`,
        [reference],
        (err, result) => {
          if (err) reject(err);
          else resolve(result[0]);
        }
      );
    });

    if (!order) {
      return res.status(404).json({success: false, message: 'Order not found' });
    }

    // 2. Idempotency check
    if (order.payment_status === 'success') {
      return res.status(200).json({
        success: true,
        message: 'Payment already confirmed',
        confirmation_pin: order.confirmation_pin,
        payment_status: 'success',
        reference
      });
    }

    // 3. Verify with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_KEY}`,
        },
      }
    );

    const data = response.data.data;

    // 4. Handle success
    if (data.status === 'success') {

      // Amount validation (Paystack sends amount in kobo)
      if (data.amount !== order.total_amount * 100) {
        return res.status(400).json({success: false, message: 'Amount mismatch detected' });
      }

      await new Promise((resolve, reject) => {
        db.query(
          `UPDATE orders 
           SET payment_status = 'success'
           WHERE payment_reference = ?`,
          [reference],
          (err) => (err ? reject(err) : resolve())
        );
      });

      return res.status(200).json({
        success: true,
        message: 'Payment successful',
        confirmation_pin: order.confirmation_pin,
        payment_status: 'success',
        reference
      });
    }

    // 5. Handle non-success cases
    const failedStatuses = ['failed', 'abandoned', 'reversed'];

    if (failedStatuses.includes(data.status)) {
      await new Promise((resolve, reject) => {
        db.query(
          `UPDATE orders 
           SET payment_status = 'failed'
           WHERE payment_reference = ?`,
          [reference],
          (err) => (err ? reject(err) : resolve())
        );
      });

      return res.status(200).json({
        success: false,
        message: 'Payment not successful',
        payment_status: 'failed'
      });
      
    }

    // 6. Still pending
    return res.status(200).json({
      message: 'Payment is still pending',
      payment_status: 'pending'
    });

  } catch (error) {

    return res.status(500).json({success: false, message: 'Payment verification error' });
  
  }

}



//verify payment using webhook
static async paystack_webhook(req, res) {

  try {
    
    const hash = crypto.createHmac('sha512', PAYSTACK_KEY)
                       .update(JSON.stringify(req.body))
                       .digest('hex');
    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(400).send("Invalid signature");
    }

    const { amount } = req.body.data;
    
    const reference =
      req.body.data?.reference ||
      req.body.data?.transaction_reference;
  
 
    
    const { event } = req.body;
    
    // 1. confirm reference
    const order = await new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM orders WHERE payment_reference = ?`,
        [reference],
        (err, result) => err ? reject(err) : resolve(result[0])
      );
    });

    if (!order) return res.status(404).send("Order not found");

    // Amount validation
    if (event.startsWith("charge.") && amount !== order.total_amount * 100) {
      return res.status(400).send("Amount mismatch detected");
    }


    async function updateOrderStatus(status) {
      await new Promise((resolve, reject) => {
        db.query(
          `UPDATE orders SET payment_status=? WHERE payment_reference=?`,
          [status, reference],
          (err, result) => (err ? reject(err) : resolve(result))
        );
      });
    }


    async function updateRefundStatus(refund_status) {
      await new Promise((resolve, reject) => {
        db.query(
          `UPDATE orders SET refund_status = ? WHERE payment_reference = ?`,
          [refund_status, reference],
          (err, result) => (err ? reject(err) : resolve(result))
        );
      });
    }
      

    switch (event) {
      
      case "charge.success":
      
      await updateOrderStatus("success");
      
       break;
      
      case "charge.failed":
        
      await updateOrderStatus("failed");
        
       break;

      case "refund.processed":
      
      await updateRefundStatus("refunded");
    
      break;

     case "refund.failed":
    
     await updateRefundStatus("failed");
    
     break;
      
      default:
        
      console.log("Unhandled event type:", event);
    
    }
  
  } catch (err) {
    
    console.log("Webhook error:", err.message);

  }

  res.sendStatus(200);

}


// verify user paystack payment using cron(periodically)
static async cron_payment_verification() {
  
  try {
    
    // 1. Fetch eligible pending orders
    const pendingOrders = await new Promise((resolve, reject) => {
      db.query(
        `
        SELECT *
        FROM orders
        WHERE payment_status = 'pending'
          AND payment_method = 'online payment'
          AND verification_attempts < 3
        `,
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    if (!pendingOrders.length) {
      console.log('No pending payments to verify');
      return;
    }

    // 2. Loop through orders
    for (const order of pendingOrders) {
      
      const reference = order.payment_reference;

      try {
        // 3. Verify with Paystack
        const response = await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_KEY}`,
            },
          }
        );

        const data = response.data.data;

        // 4. SUCCESS
        if (data.status === 'success') {

          // Amount validation
          if (data.amount !== order.total_amount * 100) {
            console.error(`Amount mismatch for ${reference}`);
            continue;
          }

          await new Promise((resolve, reject) => {
            db.query(
              `
              UPDATE orders
              SET payment_status = 'success'
              WHERE payment_reference = ?
              `,
              [reference],
              (err) => (err ? reject(err) : resolve())
            );
          });

          continue;

        }

        // 5. FAILED
        if (['failed', 'abandoned', 'reversed'].includes(data.status)) {
          await new Promise((resolve, reject) => {
            db.query(
              `
              UPDATE orders
              SET payment_status = 'failed'
              WHERE payment_reference = ?
              `,
              [reference],
              (err) => (err ? reject(err) : resolve())
            );
          });

          continue;
        }

        // 6. STILL PENDING → increment attempts
        await new Promise((resolve, reject) => {
          db.query(
            `
            UPDATE orders
            SET verification_attempts = verification_attempts + 1
            WHERE payment_reference = ?
            `,
            [reference],
            (err) => (err ? reject(err) : resolve())
          );
        });

      } catch (err) {
        
        console.error(`Verification error for ${reference}:`, err.message);
        // Increment attempts on error too
        await new Promise((resolve, reject) => {
          db.query(
            `
            UPDATE orders
            SET verification_attempts = verification_attempts + 1
            WHERE payment_reference = ?
            `,
            [reference],
            (err) => (err ? reject(err) : resolve())
          );
        });
      }
    }

  } catch (err) {
    
    console.error('Cron payment verification failed:', err.message);
  
  }

}





//reset password
static async reset_password (req, res) {

  const password = req.body.password

  const token = req.body.token

  try {

  const token_query = `SELECT * FROM users WHERE password_reset_token= ?`

    const user = await new Promise( (resolve, reject) => {
  
      db.query(token_query, [token], (err, result) => {
  
        if (err) {
  
          reject(err)
        
        } else {
  
          resolve(result)
  
        }
  
      })
  
    })
  
    
  if (user[0]) { //if token exist for a user

  let hashed_pass = await bcrypt.hash(password, 12); //change user password

  const password_reset_token = `UPDATE users 
      SET password_reset_token= ?,
      password= ?
      WHERE email= ?`

      await new Promise( (resolve, reject) => { //update user password token

        db.query(password_reset_token, ['', hashed_pass, user[0].email], (err, result) => {

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



//GET REQUESTS

//fetch user
static async fetch_user (req, res) {

  try {

    const user_id = req.session.user_id;

    const user_query = `SELECT * FROM users WHERE user_id=?`;

    const user = await new Promise((resolve, reject) => {
      db.query(user_query, [user_id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // User not found or unverified
    if (user.length < 1 || user[0].account_status === "Unverified") {
      return res.status(401).json({
        success: false,
        message: "User not found or unverified.",
      });
    }


    const showTermsConditions = !user[0].welcome_terms_conditions;

    // Success
    return res.status(200).json({
      success: true,
      message: "success",
      user: {
        fullname: user[0].fullname,
        email: user[0].email,
        phone: user[0].phone,
        state: user[0].state,
        city: user[0].city,
        address: user[0].address,
      },
      isAuthenticated: true,
      showTermsConditions
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching user.",
    });
  }
}




//fetch products
static async fetch_products (req, res) {
 
  try {

    const products_query = `
  SELECT 
    product.product_id,
    product.name,
    product.slug,
    product.description,
    product.product_condition,
    product.stock_quantity,
    product.price,
    product.main_image,
    product.main_video,
    category.name AS category_name
  FROM products AS product
  JOIN categories AS category
    ON product.category_id = category.category_id
  WHERE product.status = 'active'
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



//fetch orders
static async fetch_orders (req, res) {
 
  try {

  const orders_query = `SELECT * FROM orders WHERE user_id = ? ORDER BY order_id DESC`;

  let all_orders = await new Promise( (resolve, reject) => {

    db.query(orders_query, [req.session.user_id], (err, result) => {

      if (err) {

        reject(err)
      
      } else {

        resolve(result)

      }

    })

  })


    const order_items_query = `SELECT 
      o.order_id,
      o.order_status,
      o.created_at,
      o.total_amount,
      o.note,
      p.name,
      p.main_image,
      oi.quantity,
      oi.price
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.product_id
      WHERE o.user_id = ?;
    `;
  
    let all_order_items = await new Promise( (resolve, reject) => {

      db.query(order_items_query, [req.session.user_id], (err, result) => {

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
      all_order_items,
      all_orders
    });
    
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Error loading data. please try again.",
    });

  }

}


 


// Verify User Email
static async emailVerification (req, res) {

  const confirmationCode = req.params.id

  try {
    
    const user_query = `SELECT * FROM users WHERE confirmation_code= ?`

    const user = await new Promise( (resolve, reject) => {

      db.query(user_query, [confirmationCode], (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })


    if (user.length > 0 && user[0].account_status === "Unverified") {

      const account_status_query = `UPDATE users 
      SET account_status= ?
      WHERE email= ?`

      await new Promise( (resolve, reject) => {

        db.query(account_status_query, ['Verified', user[0].email], (err, result) => {

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

     } else if (user.length > 0 && user[0].account_status === "Verified") {

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
  
  try {

    req.session.isAuthenticated = null

    req.session.user_id = null

    req.session.destroy()

    return res.status(200).json({
      success: true,
      message: "success",
    });
    
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Error occured. try again",
    });
    
  }
  
}



//PATCH REQUESTS

//update user profile
static async update_user_info (req, res) {

  let information = req.body

  let user_id = req.session.user_id

  try {

  const user_query = `UPDATE users 
  SET fullname= ?,
  email= ?,
  phone= ?
  WHERE user_id= ?`

  const user = await new Promise( (resolve, reject) => {

    db.query(user_query, [information.fullname, information.email, information.phone, user_id], (err, result) => {

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


//update user profile
static async update_address (req, res) {

  let information = req.body

  let user_id = req.session.user_id

  try {

  const user_query = `UPDATE users 
  SET state= ?,
  city= ?,
  address= ?
  WHERE user_id= ?`

  const user = await new Promise( (resolve, reject) => {

    db.query(user_query, [information.state, information.city, information.address, user_id], (err, result) => {

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


//update user password
static async update_password (req, res) {

  let information = req.body

  let user_id = req.session.user_id

  try {

    const user_query = `SELECT * FROM users WHERE user_id= ?` //first find the user

    const user = await new Promise( (resolve, reject) => {

      db.query(user_query, [user_id], (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })

    if (user.length > 0) { //if the user dey

      const isMatch = await bcrypt.compare(information.old_password, user[0].password); //compare the current pass, with the old one if he match 
      
      if (isMatch) { //if he match use am replace old one

      const hashed_pass = await bcrypt.hash(information.new_password, 12);
      
      const password_query = `UPDATE users 
      SET password= ?
      WHERE user_id= ?`

      await new Promise( (resolve, reject) => {

        db.query(password_query, [hashed_pass, user_id], (err, result) => {

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

      } else { //if pass no match

      return res.status(401).json({
        success: false,
        message: "Old password incorrect"
      });        

      }

    } else { //if user nor dey

      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
      
    }
    
} catch (error) {

  return res.status(500).json({
    success: false,
    message: "An error occurred. Please try again.",
  }); 
    
}

}


///mark_terms_conditions
static async mark_terms_conditions (req, res) {
  
  try {
    
    const user_query = `SELECT * FROM users WHERE user_id= ?` //first find the user

    const user = await new Promise( (resolve, reject) => {

      db.query(user_query, [req.session.user_id], (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })


  if (!user[0]) { //if the user nor dey

    req.session.user_id = null

    req.session.isAuthenticated = false

    req.session.destroy()

    return res.status(401).json({
      success: false,
      message: "Unauthenticated",
    }); 

  }  

  const terms_query = `UPDATE users 
    SET welcome_terms_conditions= ?
    WHERE user_id= ?`

    await new Promise( (resolve, reject) => {

      db.query(terms_query, [1, req.session.user_id], (err, result) => {

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


 } catch (err) {
    
  return res.status(400).json({
    success: false,
    message: "error occured. please try again",
  }); 
  
}

}

}