const rateLimit = require("express-rate-limit");

module.exports = class LIMITERS {

  // LOGIN
  // 15 minutes window → max 10 attempts per IP
  static login() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10,
      message: "Too many login attempts. Try again later.",
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  // REGISTER
  // 15 minutes window → max 5 registrations per IP
  static register() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
      message: "Too many registrations from this IP. Try again later.",
    });
  }

  // RESEND CONFIRMATION EMAIL
  // 30 minutes window → max 3 requests per IP
  static resendEmail() {
    return rateLimit({
      windowMs: 30 * 60 * 1000, // 30 minutes
      max: 3,
      message: "Too many email requests. Please wait before trying again.",
    });
  }

  // SEND PASSWORD RESET EMAIL
  // 30 minutes window → max 3 requests per IP
  static resetPasswordEmail() {
    return rateLimit({
      windowMs: 30 * 60 * 1000, // 30 minutes
      max: 5,
      message: "Too many password reset email requests. Try again later.",
    });
  }

  // RESET PASSWORD (PIN / TOKEN)
  // 15 minutes window → max 5 attempts per IP
  static resetPassword() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
      message: "Too many reset attempts. Please try again later.",
    });
  }

  // CONTACT US
  // 1 hour window → max 5 messages per IP
  static contact() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5,
      message: "Too many messages sent. Please try again later.",
    });
  }

  // SUBMIT ORDER
  // 1 hour window → max 20 orders per IP
  static submitOrder() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20,
      message: "Too many orders created. Please slow down.",
    });
  }

};
