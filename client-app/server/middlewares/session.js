const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session)
const dbConnection = require("./database");
const secret_key = process.env.SESSION_SIGN_KEY

const sessionStore = new MySQLStore({ tableName: 'mysessions' }, dbConnection)

const sessionConfig = {
    store: sessionStore,
    secret: secret_key,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,                  // must be false in localhost
        httpOnly: true,
        sameSite: "lax",
        maxAge: 2 * 60 * 60 * 1000      // MUST be inside cookie
    }
};

module.exports = sessionConfig;
