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
const db2 = require("../middlewares/database2")
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

    let selected_phone_code = data.phone.split(' ')[0]//get user's selected country's country code

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

    const location_query = `SELECT * FROM locations WHERE phone_code = ?`;

    const country = await new Promise( (resolve, reject) => {

      db.query(location_query, [selected_phone_code], (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })

    if (!country[0]) { //if country nor dey

      return res.status(422).json({ // Failure
        success: false,
        message: "Registration not available for selected country yet."
      });
      
    }

     data.currency = country[0].currency

     data.account_country = country[0].country_code

     data.locale = country[0].locale

     data.password = await bcrypt.hash(data.password, 12); //encrypt the password

     delete data.confirm_password

     const sql = "INSERT INTO users SET ?";

     const insertId = await new Promise((resolve, reject) => {
      
      db.query(sql, data, (err, result) => {
       
        if (err) {
          
          return reject(err);
        
        }

        resolve(result.insertId); // 👈 THIS is what you need
      
      });
     
    });

    const newUser = {
      id: insertId,
      email: data.email,
      fullname: data.fullname,
      phone: data.phone,
      account_country: data.account_country,
      currency: data.currency,
      locale: data.locale,
      balance: data.balance
    };
    
    req.login(newUser, (err) => { //log user in directly

      if (err) {
    
        return res.status(500).json({
          success: false,
          message: "Login failed"
        });
    
      }
  
      req.session.cookie.maxAge = 1000 * 60 * 60 * 2;
  
      return res.status(200).json({
        success: true,
        message: "success",
        user: newUser,
        isAuthenticated: req.isAuthenticated()
      })
  
    })

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

  console.log('he reacch here oo')

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

  
  if (!user[0]) { //if the user dey

    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const isMatch = await bcrypt.compare(data.password, user[0].password); //decrypt he password, make u compare am with this one entered

  if (!isMatch) { //if password no match

    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
    
  } 

  const newUser = {
    id: user[0].id,
    email: user[0].email,
    fullname: user[0].fullname,
    phone: user[0].phone,
    account_country: user[0].account_country,
    currency: user[0].currency,
    locale: user[0].locale,
    balance: user[0].balance
  };
  
  req.login(newUser, (err) => { //log user in directly

    if (err) {
  
      return res.status(500).json({
        success: false,
        message: "Login failed"
      });
  
    }

    req.session.cookie.maxAge = 1000 * 60 * 60 * 2;

    return res.status(200).json({
      success: true,
      message: "success",
      user: newUser,
      isAuthenticated: req.isAuthenticated()
    })

  })

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });         

  }

}




 //send contact us email
static async contact_us (req, res) {

  const {email, name, phone, message} = req.body;

  await MAILS.contact_us_email(req, res, email, name, phone, message)    
  
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
  
    
  if (!user[0]) { //if nor dey

    return res.status(401).json({
      success: false,
      message: "We cannot find your email",
    });

  }

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
    
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });  
    
  }

}


//submit deposit
static async submit_deposit(req, res) {

  try {

    const data = req.body;

    data.user_id = req.user.id

    data.currency = req.user.currency

    data.proof_url = `/resources/proofs/${req.file.filename}`

    data.type = 'deposit'

    const transactions_query = 'INSERT INTO transactions SET ?'

        await new Promise( (resolve, reject) => {

        db.query(transactions_query, data, (err, result) => {

          if (err) {

            reject(err)
          
          } else {

            resolve(result)

          }

        })

      })

      MAILS.send_admin_deposit_notification(req.user.fullname, req.user.email, data.amount, data.payment_method, data.currency, data.locale, HELPERS.date_created() )

      return res.status(200).json({
        success: true,
        message: "success",
      }); 
  
  } catch (error) {

    console.log(error.message)

    return res.status(500).json({
      success: false,
      message: "an error occured. try again.",
    });  
    
  }

}


//submit withdrawal
static async submit_withdrawal(req, res) {

  try {

    const data = req.body;

    const amount = Number(data.amount);

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal amount"
      });
    }

    // Get fresh user data from DB
    const users = await new Promise((resolve, reject) => {

      db.query(
        "SELECT * FROM users WHERE id = ?",
        [req.user.id],
        (err, result) => {

          if (err) reject(err);
          else resolve(result);

        }
      );

    });

    const user = users[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check balance
    if (Number(user.balance) < amount) {

      return res.status(400).json({
        success: false,
        message: "Insufficient balance"
      });

    }

    // Transaction data
    data.user_id = user.id;
    data.currency = user.currency;
    data.type = "withdrawal";
  
    // Insert withdrawal transaction
    await new Promise((resolve, reject) => {

      db.query(
        "INSERT INTO transactions SET ?",
        data,
        (err, result) => {

          if (err) reject(err);
          else resolve(result);

        }
      );

    });

    // Deduct balance
    await new Promise((resolve, reject) => {

      db.query(
        "UPDATE users SET balance = balance - ? WHERE id = ?",
        [amount, user.id],
        (err, result) => {

          if (err) reject(err);
          else resolve(result);

        }
      );

    });

    return res.status(200).json({
      success: true,
      message: "Withdrawal submitted successfully"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred. Try again."
    });

  }

}


//place bet
static async place_bet(req, res) {

  const data = req.body

  const connection = await db2;

  try {

    const stake = Number(data.stake)
    const selections = data.selections || []

    // ── Basic validation ─────────────────────────────
    if (!stake || stake <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid stake amount"
      })
    }

    if (!selections.length) {
      return res.status(400).json({
        success: false,
        message: "Bet slip is empty"
      })
    }

    // ── Start transaction ────────────────────────────
    await connection.beginTransaction()

    // ── Lock user row ────────────────────────────────
    const [users] = await connection.query(
      `
      SELECT *
      FROM users
      WHERE id = ?
      FOR UPDATE
      `,
      [req.user.id]
    )

    const user = users[0]

    if (!user) {

      await connection.rollback()

      return res.status(404).json({
        success: false,
        message: "User not found"
      })

    }

    // ── Validate selections + calculate odds ─────────
    let total_odd = 1

    const validatedSelections = []

    for (const item of selections) {

      const [rows] = await connection.query(
        `
        SELECT
          s.id,
          s.name,
          s.odd,
          s.status AS selection_status,
          s.line_value,

          em.id AS event_market_id,
          em.status AS market_status,

          e.id AS event_id,
          e.status AS event_status,

          ht.name AS home_team,
          at.name AS away_team,

          m.name AS market_name,
          m.slug AS market_slug

        FROM selections s

        JOIN event_markets em
          ON em.id = s.event_market_id

        JOIN events e
          ON e.id = em.event_id

        JOIN markets m
          ON m.id = em.market_id

        JOIN teams ht
          ON ht.id = e.home_team_id

        JOIN teams at
          ON at.id = e.away_team_id

        WHERE s.id = ?
        LIMIT 1
        `,
        [item.selection_id]
      )

      const selection = rows[0]

      if (!selection) {

        await connection.rollback()

        return res.status(400).json({
          success: false,
          message: "One or more selections no longer exist"
        })

      }

      // ── Event status validation ────────────────────
      if (
        !["pending", "live"].includes(selection.event_status)
      ) {

        await connection.rollback()

        return res.status(400).json({
          success: false,
          message: "One or more events are closed"
        })

      }

      // ── Market validation ──────────────────────────
      if (selection.market_status !== "open") {

        await connection.rollback()

        return res.status(400).json({
          success: false,
          message: "One or more markets are closed"
        })

      }

      // ── Selection validation ───────────────────────
      if (selection.selection_status !== "open") {

        await connection.rollback()

        return res.status(400).json({
          success: false,
          message: "One or more selections are suspended"
        })

      }

      // ── Prevent duplicate event picks ──────────────
      const alreadyExists = validatedSelections.find(
        s => s.event_id === selection.event_id
      )

      if (alreadyExists) {

        await connection.rollback()

        return res.status(400).json({
          success: false,
          message: "Multiple selections from same event are not allowed"
        })

      }

      total_odd *= Number(selection.odd)

      validatedSelections.push(selection)

    }

    // ── Calculate possible win ───────────────────────
    const possible_win = Number(
      (stake * total_odd).toFixed(2)
    )

    // ── Balance check ────────────────────────────────
    if (stake > Number(user.balance)) {

      await connection.rollback()

      return res.status(400).json({
        success: false,
        message: "Insufficient balance"
      })

    }

    // ── Insert bet slip ──────────────────────────────
    const [betSlipInsert] = await connection.query(
      `
      INSERT INTO bet_slips
      (
        user_id,
        total_odd,
        stake,
        possible_win,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        req.user.id,
        total_odd,
        stake,
        possible_win,
        "pending"
      ]
    )

    const betSlipId = betSlipInsert.insertId

    // ── Insert bet selections ────────────────────────
    for (const selection of validatedSelections) {

      await connection.query(
        `
        INSERT INTO bet_selections
        (
          bet_slip_id,
          selection_id,
          event_id,
          market_name,
          market_slug,
          selection_name,
          odd_at_bet_time,
          line_value,
          home_team,
          away_team,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          betSlipId,
          selection.id,
          selection.event_id,
          selection.market_name,
          selection.market_slug,
          selection.name,
          selection.odd,
          selection.line_value,
          selection.home_team,
          selection.away_team,
          "pending"
        ]
      )

    }

    // ── Deduct user balance ──────────────────────────
    await connection.query(
      `
      UPDATE users
      SET balance = balance - ?
      WHERE id = ?
      `,
      [stake, req.user.id]
    )

    // ── Commit transaction ───────────────────────────
    await connection.commit()

    MAILS.send_admin_bet_notification(user.fullname, user.email, betSlipId, HELPERS.date_created())

    return res.status(200).json({
      success: true,
      message: "Bet placed successfully",
      data: {
        bet_slip_id: betSlipId,
        total_odd,
        possible_win
      }
    })

  } catch (error) {

    console.log(error)

    await connection.rollback()

    return res.status(500).json({
      success: false,
      message: "An error occurred. Please try again."
    })

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

    const id = req.user.id;

    const user_query = `SELECT * FROM users WHERE id=?`;

    const user = await new Promise((resolve, reject) => {
      db.query(user_query, [id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });


    // Success
    return res.status(200).json({
      success: true,
      message: "success",
      user: {
        id: user[0].id,
        email: user[0].email,
        fullname: user[0].fullname,
        phone: user[0].phone,
        account_country: user[0].account_country,
        currency: user[0].currency,
        locale: user[0].locale,
        balance: user[0].balance
      },
      isAuthenticated: req.isAuthenticated(),
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching user.",
    });
  }
}


//fetch transactions
static async fetch_transactions (req, res) {

  try {

    const id = req.user.id;

    const transactions_query = `SELECT * FROM transactions WHERE user_id=?`;

    const transactions = await new Promise((resolve, reject) => {
      db.query(transactions_query, [id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });


    // Success
    return res.status(200).json({
      success: true,
      message: "success",
      transactions: transactions
    });

  } catch (error) {

    console.log(error.message)

    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching user.",
    });
  }
}


static async fetch_bet_history(req, res) {

  try {
    
    const id = req.user.id;

    // Fetch all bet slips for the user
    const slips_query = `
      SELECT
        bs.id,
        bs.total_odd,
        bs.stake,
        bs.possible_win,
        bs.status,
        bs.bet_type,
        bs.created_at,
        bs.settled_at
      FROM bet_slips bs
      WHERE bs.user_id = ?
      ORDER BY bs.created_at DESC
    `;

    const slips = await new Promise((resolve, reject) => {
      db.query(slips_query, [id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (!slips.length) {
      return res.status(200).json({ success: true, message: "success", bet_history: [] });
    }

    // Fetch all selections for those bet slips
    const slip_ids = slips.map(s => s.id);

    const selections_query = `
      SELECT
        bsel.bet_slip_id,
        bsel.id,
        bsel.selection_name,
        bsel.market_name,
        bsel.market_slug,
        bsel.odd_at_bet_time,
        bsel.line_value,
        bsel.home_team,
        bsel.away_team,
        bsel.status
      FROM bet_selections bsel
      WHERE bsel.bet_slip_id IN (?)
    `;

    const selections = await new Promise((resolve, reject) => {
      db.query(selections_query, [slip_ids], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // Group selections under their parent slip
    const selections_map = {};
    for (const sel of selections) {
      if (!selections_map[sel.bet_slip_id]) selections_map[sel.bet_slip_id] = [];
      selections_map[sel.bet_slip_id].push(sel);
    }

    const bet_history = slips.map(slip => ({
      ...slip,
      selections: selections_map[slip.id] || []
    }));

    return res.status(200).json({
      success: true,
      message: "success",
      bet_history
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching bet history."
    });
  }
}



//fetch countries
static async fetch_countries (req, res) {
 
  try {

    const countries_query = `SELECT * FROM countries WHERE status = 'enabled'`;
  
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


//fetch sports
static async fetch_sports (req, res) {
 
  try {

    const sports_query = `SELECT * FROM sports`;
  
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


//fetch leagues
static async fetch_leagues (req, res) {
 
  try {

    const leagues_query = `SELECT * FROM leagues WHERE status = 'enabled'`;
  
    let all_leagues = await new Promise( (resolve, reject) => {

      db.query(leagues_query, (err, result) => {

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
      all_leagues: all_leagues
    });
    
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: "Error loading data. please try again.",
    });

  }

}


static async fetch_events(req, res) {
  try {

    const { sport, league, match_mode, q } = req.query

    let query = `
    SELECT
      e.id              AS event_id,
      e.start_time,
      e.status,
      e.home_score,
      e.away_score,
  
      sp.slug           AS sport_slug,
  
      l.id              AS league_id,
      l.slug            AS league_slug,
      l.name            AS league_name,
  
      c.name            AS country_name,
      c.flag            AS country_flag,
  
      ht.id             AS home_team_id,
      ht.name           AS home_team,
      ht.logo           AS home_logo,
  
      at.id             AS away_team_id,
      at.name           AS away_team,
      at.logo           AS away_logo,
  
      ml_em.id          AS event_market_id,
      m.name            AS market_name,
      m.slug            AS market_slug,
  
      s.id              AS selection_id,
      s.name            AS selection_name,
      s.odd,
      s.status          AS selection_status,

      esp.period        AS period_name,
      esp.home_score    AS period_home,
      esp.away_score    AS period_away
  
    FROM events e

      JOIN sports  sp ON sp.id = e.sport_id
      JOIN leagues l  ON l.id  = e.league_id AND l.status = 'enabled'
      LEFT JOIN countries c ON c.id = l.country_id AND c.status = 'enabled'
      
      JOIN teams ht ON ht.id = e.home_team_id
      JOIN teams at ON at.id = e.away_team_id
  
    LEFT JOIN markets m ON m.slug = 'Winner'
    LEFT JOIN event_markets ml_em
      ON  ml_em.event_id  = e.id
      AND ml_em.market_id = m.id
      AND ml_em.status    = 'open'
  
    LEFT JOIN selections s
      ON  s.event_market_id = ml_em.id
      AND s.status          = 'open'

    LEFT JOIN event_score_periods esp ON esp.event_id = e.id
  
    WHERE 1=1
  `

    const params = []

    if (sport) {
      query += ` AND sp.slug = ?`
      params.push(sport)
    }

    if (league) {
      query += ` AND l.slug = ?`
      params.push(league)
    }

    if (match_mode === 'live') {
      query += ` AND e.status = 'live'`
    } else {
      query += ` AND e.status = 'pending'`
    }

    query += ` ORDER BY e.start_time ASC`

    const rows = await new Promise((resolve, reject) => {
      db.query(query, params, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })

    const leagueMap = new Map()

    for (const row of rows) {

      if (!leagueMap.has(row.league_id)) {
        leagueMap.set(row.league_id, {
          leagueId:   row.league_slug,
          leagueName: `${row.country_name}. ${row.league_name}`,
          flag:       row.country_flag,
          sportSlug:  row.sport_slug,
          events:     new Map(),
        })
      }

      const leagueGroup = leagueMap.get(row.league_id)

      if (!leagueGroup.events.has(row.event_id)) {
        leagueGroup.events.set(row.event_id, {
          id:         row.event_id,
          time:       new Date(row.start_time).toTimeString().slice(0, 5),
          date:       new Date(row.start_time).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace('/', '.'),
          home:       row.home_team,
          away:       row.away_team,
          home_logo:  row.home_logo,
          away_logo:  row.away_logo,
          status:     row.status,
          home_score: row.home_score,
          away_score: row.away_score,
          market:     row.market_name,
          selections: [],
          periods:    {},
        })
      }

      const event = leagueGroup.events.get(row.event_id)

      if (row.period_name) {
        event.periods[row.period_name] = {
          home: row.period_home,
          away: row.period_away,
        }
      }

      if (row.selection_id) {
        const alreadyAdded = event.selections.some(s => s.id === row.selection_id)
        if (!alreadyAdded) {
          event.selections.push({
            id:   row.selection_id,
            name: row.selection_name,
            odd:  parseFloat(row.odd),
            status:      row.selection_status   // ← already useful to have
          })
        }
      }

    }

    const data = Array.from(leagueMap.values()).map(league => ({
      ...league,
      events: Array.from(league.events.values()),
    }))

    return res.status(200).json({
      success: true,
      data,
    })

  } catch (error) {

    console.log(error.message)
    return res.status(500).json({
      success: false,
      message: 'Error loading events. Please try again.',
    })
  }
}



static async fetch_event(req, res) {

  try {

    const { id } = req.params

    const query = `
      SELECT
        e.id              AS event_id,
        e.start_time,
        e.status,
        e.home_score,
        e.away_score,

        sp.id             AS sport_id,
        sp.slug           AS sport_slug,
        sp.name           AS sport_name,

        l.id              AS league_id,
        l.slug            AS league_slug,
        l.name            AS league_name,
        l.logo            AS league_logo,

        ht.name           AS home_team,
        ht.logo           AS home_logo,

        at.name           AS away_team,
        at.logo           AS away_logo,

        em.id             AS event_market_id,
        m.id              AS market_id,
        m.name            AS market_name,
        m.slug            AS market_slug,

        s.id              AS selection_id,
        s.name            AS selection_name,
        s.odd,
        s.status          AS selection_status,
        s.line_value,

        esp.period        AS period_name,
        esp.home_score    AS period_home,
        esp.away_score    AS period_away

      FROM events e

      JOIN sports  sp ON sp.id = e.sport_id
      JOIN leagues l  ON l.id  = e.league_id

      JOIN teams ht ON ht.id = e.home_team_id
      JOIN teams at ON at.id = e.away_team_id

      LEFT JOIN event_markets em
        ON  em.event_id = e.id
        AND em.status   = 'open'

      LEFT JOIN markets m ON m.id = em.market_id

      LEFT JOIN selections s
        ON  s.event_market_id = em.id

      LEFT JOIN event_score_periods esp ON esp.event_id = e.id

      WHERE e.id = ?

      ORDER BY m.id ASC, s.id ASC
    `

    const rows = await new Promise((resolve, reject) => {
      db.query(query, [id], (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Event not found.' })
    }

    // ── Build the event object from rows ──────────────────────────
    const first = rows[0]

    const event = {
      id:          first.event_id,
      start_time:  first.start_time,
      status:      first.status,
      home_score:  first.home_score,
      away_score:  first.away_score,

      sport_slug:  first.sport_slug,
      sport_name:  first.sport_name,

      league_slug: first.league_slug,
      league_name: first.league_name,
      league_logo: first.league_logo,

      home_team:   first.home_team,
      home_logo:   first.home_logo,
      away_team:   first.away_team,
      away_logo:   first.away_logo,

      periods:     {},
      markets:     [],
    }

    const marketsMap    = new Map()  // market_id  → market object
    const selectionsSet = new Set()  // selection_id dedupe
    const periodsSet    = new Set()  // period_name dedupe

    for (const row of rows) {
      

      // ── Periods ────────────────────────────────────────────────
      if (row.period_name && !periodsSet.has(row.period_name)) {
        periodsSet.add(row.period_name)
        event.periods[row.period_name] = {
          home: row.period_home,
          away: row.period_away,
        }
      }

      // ── Markets ────────────────────────────────────────────────
      if (!row.market_id) continue

      if (!marketsMap.has(row.market_id)) {
        const market = { id: row.event_market_id, name: row.market_name, market_slug: row.market_slug,  selections: [] }
        marketsMap.set(row.market_id, market)
        event.markets.push(market)
      }

      // ── Selections ─────────────────────────────────────────────
      if (row.selection_id && !selectionsSet.has(row.selection_id)) {
        selectionsSet.add(row.selection_id)
        marketsMap.get(row.market_id).selections.push({
          id:     row.selection_id,
          name:   row.selection_name,
          odd:    parseFloat(row.odd),
          status: row.selection_status,
          line_value: row.line_value,        // ← add this
        })
      }

    }

    return res.status(200).json({ success: true, data: event })

  } catch (error) {
    console.log(error.message)
    return res.status(500).json({
      success: false,
      message: 'Error loading event. Please try again.',
    })
  }
}




//fetch settings
static async fetch_settings (req, res) {

  try {

    const settings = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM settings LIMIT 1', (err, result) => {
        if (err) reject(err)
        else resolve(result[0])
      })
    })


    // Success
    return res.status(200).json({
      success: true,
      message: "success",
      all_settings: settings
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching user.",
    });
  }
}




//logout user
static async logout (req, res) {
  
  try {

    req.logout(function (err) {

      if (err) {
        return res.status(500).json({
          success: false,
          message: "Logout failed"
        });
      }
    
      req.session.destroy(() => {
    
        res.clearCookie("connect.sid"); // important
    
        return res.status(200).json({
          success: true,
          message: "success"
        });
    
      });
    
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
static async save_settings (req, res) {

  let { id, phone, email, old_pass, new_pass, confirm_pass} = req.body

  try {

    let selected_phone_code = phone.split(' ')[0]//get user's selected country's country code

    const get_user_query = `SELECT * FROM users WHERE id = ?`;
    const users = await new Promise((resolve, reject) => {
      db.query(get_user_query, [req.user.id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const user = users[0];

    const location_query = `SELECT * FROM locations WHERE phone_code = ?`;

    const country = await new Promise( (resolve, reject) => {

      db.query(location_query, [selected_phone_code], (err, result) => {

        if (err) {

          reject(err)
        
        } else {

          resolve(result)

        }

      })

    })

    if (!country[0]) { //if country nor dey

      return res.status(422).json({ // Failure
        success: false,
        message: "Registration not available for selected country yet."
      });
      
    }

    const user_update_query = `
    UPDATE users
    SET email = ?,
        currency = ?,
        account_country = ?,
        locale = ?,
        phone = ?
    WHERE id = ?
  `;

  await new Promise( (resolve, reject) => {

    db.query(user_update_query, [email, country[0].currency, country[0].country_code, country[0].locale, phone, req.user.id], (err, result) => {

      if (err) {

        reject(err)
      
      } else {

        resolve(result)

      }

    })

  })

  if (old_pass.length > 0 && new_pass.length > 0 && confirm_pass.length > 0) {
    
    const isMatch = await bcrypt.compare(old_pass, user.password); //compare the current pass, with the old one if he match 
      
    if (!isMatch) { //if pass nor match
     
      return res.status(401).json({
        success: false,
        message: "Old password incorrect"
      });        

    }

    const hashed_pass = await bcrypt.hash(new_pass, 12);

    const password_query = `UPDATE users 
      SET password= ?
      WHERE id= ?`

      await new Promise( (resolve, reject) => {

        db.query(password_query, [hashed_pass, req.user.id], (err, result) => {

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
    message: "update successfull",
  });
    
} catch (error) {

  return res.status(500).json({
    success: false,
    message: "An error occurred. Please try again.",
  });    
    
 }

}

}