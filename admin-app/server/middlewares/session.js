const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session)
const dbConnection = require("./database");
const secret_key = process.env.SESSION_SIGN_KEY

const sessionStore = new MySQLStore({tableName: 'mysessions'}, dbConnection)

const sessionConfig = {
    store: sessionStore,
    secret: secret_key,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false},
    maxAge: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
}

module.exports = sessionConfig;