const passport = require("passport");
const db = require("./database"); // adjust path

// store user id in session
passport.serializeUser((user, done) => {
  console.log(user)
  done(null, user.id);
});

// get full user from session id
passport.deserializeUser((id, done) => {
  db.query(
    "SELECT * FROM users WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return done(err);

      if (!result || result.length === 0) {
        return done(null, false);
      }

      return done(null, result[0]);
    }
  );
});

module.exports = passport;