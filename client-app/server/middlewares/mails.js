const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const fs = require("fs")
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const nodemailer = require("nodemailer");


module.exports = class MIDDLEWARES {

  static async SendConfirmationMail(req, res, useremail, confirmationCode, fullname) {

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
        subject: 'Confirmation Email',
        attachments: [{
            filename: 'logo.png',
            path: './images/logo.png',
            cid: "logo"
        }],
        template: 'confirmation_mail', // the name of the template file i.e email.handlebars
        context: {
            confirmationCode: confirmationCode,
            fullname: fullname
        }
    };

    transporter.sendMail(mailOptions)
    .then(() => {
        console.log('confirmation mail sent');
    })
    .catch(err => {
        console.error('confirmation mail failed:', err);
    });
}



//Contact us Email
static async contact_us_email(req, res, email, fullname, phone, message) {

    var smtpConfig = {
        host: SMTP_HOST,
        port:  465,
        secure: true,
        auth: {
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
      
      const mailOptions = {
        from: `Tech By Cas <${SMTP_USER}>`, // sender address
        to: "techbycas@gmail.com", //Tech By Cas email
        subject: 'User Complaint',
        attachments: [{
            filename: 'logo.png',
            path: './images/logo.png',
            cid: "logo"
        }],
        template: 'contactus_email', // the name of the template file i.e email.handlebars
        context:{
            email: email,
            fullname: fullname,
            phone: phone,
            message: message,
        }
      };      

     // Wrap sendMail in a Promise
     try {

     let result = await new Promise((resolve, reject) => {
      
            transporter.sendMail(mailOptions, (err, info) => {
        
              if (err) {
        
                 reject(err);
         
                } else {
                    
                  resolve("Your request has been recieved. We will get back to you as soon as possible via the email provided below. Thank you for choosing Tech By Cas.");
                
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




 

//Password Reset  Email
static async send_reset_pass_email(req, res, useremail, token, fullname) {

    var smtpConfig = {
        host: SMTP_HOST,
        port:  465,
        secure: true,
        auth: {
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
            token: token,
            fullname: fullname
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


//send order notification email to admin
static send_admin_order_notification(order_id, orderDate, data) {

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
        to: 'techbycas@gmail.com',
        subject: 'Order Notification',
        attachments: [{
            filename: 'logo.png',
            path: './images/logo.png',
            cid: "logo"
        }],
        template: 'admin_order_notification',
        context: {
            order_id,
            customerName: data.customer_name,
            customerEmail: data.email,
            customerPhone: data.phone,
            totalAmount: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(data.total_amount),
            paymentMethod: data.payment_method,
            total_items: data.total_items,
            orderDate
        }
    };

    transporter.sendMail(mailOptions)
        .then(() => {
            console.log('Admin notification email sent');
        })
        .catch(err => {
            console.error('Admin email failed:', err);
        });
}


}