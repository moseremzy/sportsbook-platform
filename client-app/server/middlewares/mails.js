const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const fs = require("fs")
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const nodemailer = require("nodemailer");
const { getSettings } = require('./settings')


module.exports = class MIDDLEWARES {

//Contact us Email
static async contact_us_email(req, res, email, fullname, phone, message) {

    const settings = await getSettings() // returns cached object, no DB call

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
        from: `${settings.website.toUpperCase()} <${SMTP_USER}>`, // sender address
        to: `${settings.email}`, //Tech By Cas email
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
            website: settings.website,
        }
      };      

     // Wrap sendMail in a Promise
     try {

     let result = await new Promise((resolve, reject) => {
      
            transporter.sendMail(mailOptions, (err, info) => {
        
              if (err) {
        
                 reject(err);
         
                } else {
                    
                  resolve("Your request has been recieved. We will get back to you as soon as possible.");
                
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

    const settings = await getSettings() // returns cached object, no DB call

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
        from: `${settings.website.toUpperCase()} <${SMTP_USER}>`, // sender address
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
            fullname: fullname,
            website: settings.website
        }
      };      
        // Wrap sendMail in a Promise
     try {

       let result = await new Promise((resolve, reject) => {
      
            transporter.sendMail(mailOptions, (err, info) => {
        
              if (err) {
        
                 reject(err);
         
                } else {
                 
                 resolve(`We’ve sent a password reset link to your email address.`);
        
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
static async send_admin_deposit_notification(fullname, email, amount, payment_method, currency, locale, date) {

    const settings = await getSettings() // returns cached object, no DB call

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
        from: `${settings.website.toUpperCase()} <${SMTP_USER}>`,
        to: `${settings.email}`,
        subject: 'Deposit Notification',
        attachments: [{
            filename: 'logo.png',
            path: './images/logo.png',
            cid: "logo"
        }],
        template: 'admin_deposit_notification',
        context: {
            fullname: fullname,
            email: email,
            amount: new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount),
            payment_method: payment_method,
            website: settings.website,
            date: date
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


//send bet notification email to admin
static async send_admin_bet_notification(fullname, email, betSlipId, date) {

    const settings = await getSettings() // returns cached object, no DB call

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
        from: `${settings.website.toUpperCase()} <${SMTP_USER}>`,
        to: `${settings.email}`,
        subject: 'Bet Notification',
        attachments: [{
            filename: 'logo.png',
            path: './images/logo.png',
            cid: "logo"
        }],
        template: 'admin_bet_notification',
        context: {
            fullname: fullname,
            email: email,
            bet_slip_id: betSlipId,
            website: settings.website,
            date: date
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