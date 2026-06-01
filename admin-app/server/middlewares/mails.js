const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const fs = require("fs")
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const nodemailer = require("nodemailer");



module.exports = class MIDDLEWARES {
 

//Password Reset  Email
static async send_reset_pass_email(req, res, useremail, token) {

    var smtpConfig = {
        host: SMTP_HOST,
        port:  465,
        secure: true,
        auth:{
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    };

var transporter = nodemailer.createTransport(smtpConfig);
      
      // point to the template folder
      const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./views/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./views/')
      };
      
      // use a template file with nodemailer
      transporter.use('compile', hbs(handlebarOptions));
      
      var mailOptions = {
        from: `Tech By Cas <${SMTP_USER}>`, // sender address
        to: useremail,
        subject: 'Reset Password',
        attachments: [{
             filename: 'logo.png',
             path: './images/logo.png',
             cid: "logo"
       }],
        template: 'password_reset_mail', // the name of the template file i.e email.handlebars
        context:{
            token: token
        }
      };      
        // Wrap sendMail in a Promise
     try {

       let result = await new Promise((resolve, reject) => {
      
            transporter.sendMail(mailOptions, (err, info) => {
        
              if (err) {
        
                 reject(err);
         
                } else {
                 
                 resolve(`We’ve sent a password reset link to your email address.
                  Please check your inbox (and spam folder) and follow the instructions to create a new password.
                  If you don’t receive the email within a few minutes, try again or contact support.`);
        
                }
            });
        });

        return res.status(200).json({ // Success
            success: true,
            message: result,
        }); 
    
      } catch (err) {

        return res.status(500).json({ // Failure
            success: false,
            message: "mail not delivered. please try again.",
        });

    }
}



//send order cancellation email to user
static async send_user_cancellation_email(req, res, useremail, fullname, order_id, reason) {
    
    var smtpConfig = {
        host: SMTP_HOST,
        port:  465,
        secure: true,
        auth:{
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    };

  const transporter = nodemailer.createTransport(smtpConfig);

  // Point to the template folder
  const handlebarOptions = {
      viewEngine: {
          partialsDir: path.resolve('./views/'),
          defaultLayout: false,
      },
      viewPath: path.resolve('./views/')
  };

  // Use a template file with nodemailer
  transporter.use('compile', hbs(handlebarOptions));

  const mailOptions = {
      from: `Tech By Cas <${SMTP_USER}>`, // sender address
      to: useremail,
      subject: 'Order Cancellation',
      attachments: [{
          filename: 'logo.png',
          path: './images/logo.png',
          cid: "logo"
      }],
      template: 'user_order_cancellation_email', // the name of the template file i.e email.handlebars
      context: {
          order_id: order_id,
          fullname: fullname,
          cancellation_reason: reason
      }
  };

  // Wrap sendMail in a Promise
  try {

    let result = await new Promise((resolve, reject) => {
      
        transporter.sendMail(mailOptions, (err, info) => {
    
          if (err) {
    
             reject(err);
     
            } else {
             
             resolve(`success`);
    
            }
        });
    });

    return res.status(200).json({ // Success
        success: true,
        message: result,
    }); 

  } catch (err) {

    return res.status(500).json({ // send 200 regardless. dont want it to break my ui
        success: false,
        message: err.message,
    });

  }

 } 


 
//send order delivery notification email to user
static send_user_order_notification(data) {

    const smtpConfig = {
        host: SMTP_HOST,
        port: 465,
        secure: true,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    };

    const transporter = nodemailer.createTransport(smtpConfig);

    const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./views/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./views/')
    };

    transporter.use('compile', hbs(handlebarOptions));

    const mailOptions = {
        from: `Tech By Cas <${SMTP_USER}>`,
        to: data.customerEmail,
        subject: 'Order Notification',
        attachments: [{
            filename: 'logo.png',
            path: './images/logo.png',
            cid: "logo"
        }],
        template: 'user_order_notification',
        context: {
            order_id: data.order_id,
            customerName: data.customerName,
            total_amount: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(data.total_amount),
            payment_method: data.payment_method,
            total_items: data.total_items,
            delivery_date: data.delivery_date
        }
    };

    transporter.sendMail(mailOptions)
        .then(() => {
            console.log('User order delivery notification email sent');
        })
        .catch(err => {
            console.error('User order delivery email failed:', err);
        });
}


 
}