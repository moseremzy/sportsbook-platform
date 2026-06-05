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



//add league
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


// create event
static async create_event(req, res) {
  
  try {

    const { sport_id, league_id, home_team, away_team, start_time, external_id } = req.body

    if (!sport_id)    return res.status(400).json({ success: false, message: 'Sport is required' })
    if (!league_id)   return res.status(400).json({ success: false, message: 'League is required' })
    if (!home_team)   return res.status(400).json({ success: false, message: 'Home team is required' })
    if (!away_team)   return res.status(400).json({ success: false, message: 'Away team is required' })
    if (!start_time)  return res.status(400).json({ success: false, message: 'Start time is required' })

    if (home_team.trim().toLowerCase() === away_team.trim().toLowerCase()) {
      return res.status(400).json({ success: false, message: 'Home and away teams cannot be the same' })
    }


    //  find or create team ──────────────────────────
      async function findOrCreateTeam(db, name, sport_id) {
      
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
      const existing = await HELPERS.query(db,
        'SELECT id FROM teams WHERE name = ? AND sport_id = ?',
        [name.trim(), sport_id]
      )
    
      if (existing.length > 0) return existing[0].id
    
      const result = await HELPERS.query(db,
        'INSERT INTO teams (name, slug, sport_id) VALUES (?, ?, ?)',
        [name.trim(), slug, sport_id]
      )
    
      return result.insertId
    }


    // ── Find or create both teams ────────────────────────
    const home_team_id = await findOrCreateTeam(db, home_team, sport_id)
    const away_team_id = await findOrCreateTeam(db, away_team, sport_id)

    // ── Insert event ─────────────────────────────────────
    const result = await HELPERS.query(db,
      `INSERT INTO events (sport_id, league_id, home_team_id, away_team_id, start_time, external_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sport_id, league_id, home_team_id, away_team_id, start_time, external_id || null]
    )

    return res.status(200).json({
      success: true,
      message: 'Event created successfully',
      event_id: result.insertId
    })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
  }
}


//add event market
static async add_event_market(req, res) {
  
  try {
    
    const { event_id, market_id } = req.body

    if (!event_id)  return res.status(400).json({ success: false, message: 'Event id is required' })
    if (!market_id) return res.status(400).json({ success: false, message: 'Market is required' })

    // ── Check duplicate ──────────────────────────────────
    const existing = await HELPERS.query(db,
      'SELECT id FROM event_markets WHERE event_id = ? AND market_id = ?',
      [event_id, market_id]
    )

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Market already added to this event' })
    }

    const result = await HELPERS.query(db,
      'INSERT INTO event_markets (event_id, market_id) VALUES (?, ?)',
      [event_id, market_id]
    )

    // ── Return the new event_market with market name ─────
    const newMarket = await HELPERS.query(db,
      `SELECT em.id AS event_market_id, em.status AS market_status,
              m.id AS market_id, m.name AS market_name, m.slug AS market_slug
       FROM event_markets em
       JOIN markets m ON m.id = em.market_id
       WHERE em.id = ?`,
      [result.insertId]
    )

    return res.status(200).json({
      success: true,
      message: 'Market added successfully',
      market: { ...newMarket[0], selections: [] }
    })

  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
  }
}


//add selection
static async add_selection(req, res) {

  try {
    
    const { event_market_id, name, odd, line_value } = req.body

    if (!event_market_id) return res.status(400).json({ success: false, message: 'Event market id is required' })
    if (!name)            return res.status(400).json({ success: false, message: 'Selection name is required' })
    if (!odd)             return res.status(400).json({ success: false, message: 'Odd is required' })

    const result = await HELPERS.query(db,
      'INSERT INTO selections (event_market_id, name, odd, line_value) VALUES (?, ?, ?, ?)',
      [event_market_id, name.trim(), parseFloat(odd), line_value ? parseFloat(line_value) : null]
    )

    return res.status(200).json({
      success: true,
      message: 'Selection added successfully',
      selection: {
        id: result.insertId,
        name: name.trim(),
        odd: parseFloat(odd),
        line_value: line_value ? parseFloat(line_value) : null,
        status: 'open'
      }
    })

  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
  }
}


// Update Events Period
static async upsert_event_period(req, res) {

  try {
    
    const { event_id, period, home_score, away_score } = req.body

    if (!event_id) return res.status(400).json({ success: false, message: 'Event id is required' })
    if (!period)   return res.status(400).json({ success: false, message: 'Period is required' })
 
    await HELPERS.query(db,
      `INSERT INTO event_score_periods (event_id, period, home_score, away_score)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE home_score = VALUES(home_score), away_score = VALUES(away_score)`,
      [event_id, period, home_score ?? 0, away_score ?? 0]
    )
 
    // ── Return updated periods for this event ────────────
    const periods = await HELPERS.query(db,
      `SELECT id, period, home_score, away_score FROM event_score_periods WHERE event_id = ? ORDER BY id ASC`,
      [event_id]
    )
 
    return res.status(200).json({ success: true, message: 'Period score saved successfully', periods })
 
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
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



//Fetch all transactions
static async fetch_transactions(req, res) {

  try {

    const transactions_query = `
      SELECT 
        t.*,
        u.fullname AS fullname
      FROM transactions t
      JOIN users u ON t.user_id = u.id
    `

    let all_transactions = await new Promise((resolve, reject) => {

      db.query(transactions_query, (err, result) => {

        if (err) reject(err)
        else resolve(result)

      })

    })
    
    return res.status(200).json({
      success: true,
      message: "success",
      all_transactions
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

// get manual events
static async get_manual_events(req, res) {
  try {
 
    const rows = await HELPERS.query(db,
      `SELECT
        e.id, e.status, e.start_time, e.home_score, e.away_score,
        s.name  AS sport_name,
        l.name  AS league_name,
        ht.name AS home_team,
        at.name AS away_team
       FROM events e
       JOIN sports  s  ON s.id  = e.sport_id
       JOIN leagues l  ON l.id  = e.league_id
       JOIN teams   ht ON ht.id = e.home_team_id
       JOIN teams   at ON at.id = e.away_team_id
       WHERE e.external_id IS NULL
       ORDER BY e.created_at DESC`,
    )
 
    return res.status(200).json({ success: true, events: rows })
 
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
  }
}


// Get event
static async get_event(req, res) {
  
  try {
  
    const { id } = req.params

    const rows = await HELPERS.query(db,
      `SELECT 
        e.id, e.sport_id, e.start_time, e.status, e.home_score, e.away_score, e.external_id,
        e.created_at,
        s.name  AS sport_name,
        l.name  AS league_name,  l.logo AS league_logo,
        ht.name AS home_team,    ht.logo AS home_team_logo,
        at.name AS away_team,    at.logo AS away_team_logo
       FROM events e
       JOIN sports  s  ON s.id  = e.sport_id
       JOIN leagues l  ON l.id  = e.league_id
       JOIN teams   ht ON ht.id = e.home_team_id
       JOIN teams   at ON at.id = e.away_team_id
       WHERE e.id = ?`,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    // ── Fetch markets + selections ───────────────────────
    const markets = await HELPERS.query(db,
      `SELECT 
        em.id AS event_market_id, em.status AS market_status,
        m.id  AS market_id,       m.name    AS market_name, m.slug AS market_slug
       FROM event_markets em
       JOIN markets m ON m.id = em.market_id
       WHERE em.event_id = ?`,
      [id]
    )

    for (const market of markets) {
      market.selections = await HELPERS.query(db,
        `SELECT id, name, odd, line_value, status
         FROM selections
         WHERE event_market_id = ?`,
        [market.event_market_id]
      )
    }

    // ── Fetch periods ────────────────────────────────────
  const periods = await HELPERS.query(db,
    `SELECT id, period, home_score, away_score 
    FROM event_score_periods 
    WHERE event_id = ? 
    ORDER BY id ASC`,
    [id]
  )

return res.status(200).json({
  success: true,
  event: { ...rows[0], markets, periods }
})

  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
  }
}


 // get markets
static async get_markets(req, res) {
    
  try {
      
      const { sport_id } = req.query

      const rows = sport_id
        ? await HELPERS.query(db, 'SELECT id, name, slug FROM markets WHERE sport_id = ?', [sport_id])
        : await HELPERS.query(db, 'SELECT id, name, slug FROM markets')
 
      return res.status(200).json({ success: true, markets: rows })
 
    } catch (error) {
      console.log(error.message)
      return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
    }
  }


// get all bet slips
static async get_bet_slips(req, res) {
  
  try {
  
    const rows = await HELPERS.query(db,
      `SELECT
        bs.id, bs.user_id, bs.total_odd, bs.stake, bs.possible_win,
        bs.status, bs.bet_type, bs.created_at,
        u.fullname
      FROM bet_slips bs
      JOIN users u ON u.id = bs.user_id
      ORDER BY bs.created_at DESC`
    )
  
    return res.status(200).json({ success: true, bet_slips: rows })
  
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
  }
}


static async get_bet_slip(req, res) {
  
  try {
 
    const { id } = req.params
 
    // ── Fetch bet slip ───────────────────────────────────
    const rows = await HELPERS.query(db,
      `SELECT
        bs.id, bs.total_odd, bs.stake, bs.possible_win,
        bs.status, bs.bet_type, bs.created_at, bs.settled_at,
        u.fullname, u.email, u.balance
       FROM bet_slips bs
       JOIN users u ON u.id = bs.user_id
       WHERE bs.id = ?`,
      [id]
    )
 
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Bet slip not found' })
    }
 
    // ── Fetch selections ─────────────────────────────────
    const selections = await HELPERS.query(db,
      `SELECT
        bsel.id, bsel.selection_name, bsel.market_name,
        bsel.odd_at_bet_time, bsel.line_value,
        bsel.home_team, bsel.away_team,
        bsel.status,
        e.start_time, e.status AS event_status,
        e.home_score, e.away_score
       FROM bet_selections bsel
       JOIN events e ON e.id = bsel.event_id
       WHERE bsel.bet_slip_id = ?`,
      [id]
    )
 
    return res.status(200).json({
      success: true,
      bet_slip: { ...rows[0], selections }
    })
 
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
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

    console.log(req.file)

    const { id, name, code, slug, current_flag } = req.body

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
      console.log(req.file)
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
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.'
    })
  }
}


// update league info
static async update_league(req, res) {

  try {

    const { id, name, slug, sport_id, country_id, current_logo } = req.body

    if (!id || !name || !slug || !sport_id || !country_id) {
      return res.status(400).json({
        success: false,
        message: 'Id, name, slug, sport and country are required.'
      })
    }

    const existing = await new Promise((resolve, reject) => {
      db.query(
        'SELECT id FROM leagues WHERE (name = ? OR slug = ?) AND id != ? LIMIT 1',
        [name, slug, id],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Another league with that name or slug already exists.'
      })
    }

    // ── Handle logo upload ───────────────────────────
    let logoQuery = ''
    let logoParams = []

    if (req.file) {
      const logo = `/resources/leagues/${req.file.filename}`
      logoQuery = ', logo = ?'
      logoParams = [logo]

      // ── Delete old logo if it exists ─────────────
      if (current_logo) {
        const oldPath = path.join(RESOURCES_ROOT, current_logo.replace('/resources', ''))
        fs.unlink(oldPath, (err) => {
          if (err) console.log('Could not delete old logo:', err.message)
        })
      }
    }

    // ── Update ───────────────────────────────────────
    await new Promise((resolve, reject) => {
      db.query(
        `UPDATE leagues SET name = ?, slug = ?, sport_id = ?, country_id = ?${logoQuery} WHERE id = ?`,
        [name, slug, sport_id, country_id, ...logoParams, id],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    return res.status(200).json({
      success: true,
      message: 'League updated successfully.'
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.'
    })
  }
}


//approve/reject transactions
static async approve_reject_transaction(req, res) {

  const { id, action } = req.body

  try {

    if (!id || !['completed', 'rejected'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request'
      })
    }

    // Get transaction
    const transactions_query =  `SELECT *
      FROM transactions
      WHERE id = ?`;

    const transactions = await new Promise((resolve, reject) => {
      db.query(transactions_query, [id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    const transaction = transactions[0]

    // Prevent double processing
    if (transaction.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: 'Transaction already processed'
      })
    }

    // Deposit approved
    if (transaction.type === 'deposit' && action === 'completed') {

      const update_user_balance_query = `UPDATE users
        SET balance = balance + ?
        WHERE id = ?`;

      await new Promise((resolve, reject) => {
        db.query(update_user_balance_query, [transaction.amount, transaction.user_id], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

    }

    // Update transaction status
    const transaction_status_query = `UPDATE transactions
      SET status = ?
      WHERE id = ?`;

    await new Promise((resolve, reject) => {
      db.query(transaction_status_query, [action, id], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return res.status(200).json({
      success: true,
      message: `Transaction ${action} successfully`
    })

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })

  }

}


static async update_event_scores(req, res) {

  try {

    const { event_id, status, home_score, away_score, start_time } = req.body

    if (!event_id) return res.status(400).json({ success: false, message: 'Event id is required' })
    if (!status)   return res.status(400).json({ success: false, message: 'Status is required' })
 
    await HELPERS.query(db,
      `UPDATE events SET status = ?, home_score = ?, away_score = ?, start_time = ? WHERE id = ?`,
      [status, home_score ?? 0, away_score ?? 0, start_time, event_id]
    )
 
    return res.status(200).json({ success: true, message: 'Event scores updated successfully' })
 
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
  }

}


static async update_bet_slip_status(req, res) {
  try {
 
    const { id, status } = req.body
 
    if (!id)     return res.status(400).json({ success: false, message: 'Bet slip id is required' })
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' })
 
    // ── Fetch current slip ───────────────────────────────
    const rows = await HELPERS.query(db,
      `SELECT bs.id, bs.status, bs.possible_win, bs.user_id
       FROM bet_slips bs
       WHERE bs.id = ?`,
      [id]
    )
 
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Bet slip not found' })
    }
 
    const slip = rows[0]
 
    // ── Safeguard: already won, do not credit again ──────
    if (slip.status === 'won' && status === 'won') {
      return res.status(400).json({
        success: false,
        message: 'Bet slip is already marked as won. Balance was previously credited.'
      })
    }
 
    // ── If won, credit possible_win to user balance ──────
    let new_balance = null
    let settled_at  = null
 
    if (status === 'won') {
 
      const updated = await HELPERS.query(db,
        `UPDATE users SET balance = balance + ? WHERE id = ?`,
        [slip.possible_win, slip.user_id]
      )
 
      // fetch updated balance to return to frontend
      const user = await HELPERS.query(db,
        `SELECT balance FROM users WHERE id = ?`,
        [slip.user_id]
      )
 
      new_balance = user[0].balance
      settled_at  = new Date().toISOString()
    }
 
    // ── Update bet slip status ───────────────────────────
    await HELPERS.query(db,
      `UPDATE bet_slips 
       SET status = ?, settled_at = ?
       WHERE id = ?`,
      [status, status === 'won' ? settled_at : null, id]
    )
 
    return res.status(200).json({
      success:     true,
      message:     `Bet slip updated to "${status}" successfully.`,
      new_balance: new_balance,
      settled_at:  settled_at
    })
 
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
  }
}
 

static async update_selection_status(req, res) {
  
  try {
 
    const { id, status } = req.body
 
    if (!id)     return res.status(400).json({ success: false, message: 'Selection id is required' })
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' })
 
    await HELPERS.query(db,
      `UPDATE bet_selections SET status = ? WHERE id = ?`,
      [status, id]
    )
 
    return res.status(200).json({
      success: true,
      message: `Selection updated to "${status}" successfully.`
    })
 
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
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
// update system info (crypto addresses)
static async update_system_info(req, res) {

  const { eth, btc, usdt } = req.body

  try {

    const system_query = `UPDATE settings 
    SET eth = ?, btc = ?, usdt = ?`

    await new Promise((resolve, reject) => {

      db.query(system_query, [eth, btc, usdt], (err, result) => {

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


 //DELETE REQUESTS


// Delete user
static async delete_user(req, res) {

  try {

    const { id } = req.body

    if (!id) {
      return res.status(400).json({ success: false, message: "User id is required" })
    }

    // ── 1. Delete bet selections ─────────────────────
    await new Promise((resolve, reject) => {
      db.query(
        `DELETE FROM bet_selections WHERE bet_slip_id IN (
          SELECT id FROM bet_slips WHERE user_id = ?
        )`,
        [id],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    // ── 2. Delete bet slips ──────────────────────────
    await new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM bet_slips WHERE user_id = ?',
        [id],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    // ── 3. Fetch proof files before deleting transactions ──
    const proofRows = await new Promise((resolve, reject) => {
      db.query(
        'SELECT proof_url FROM transactions WHERE user_id = ? AND proof_url IS NOT NULL',
        [id],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    // ── 4. Delete proof files from disk ──────────────
    for (const row of proofRows) {
      if (row.proof_url) {
        const filePath = path.join(RESOURCES_ROOT, row.proof_url.replace('/resources', ''))
        fs.unlink(filePath, (err) => {
          if (err) console.error('Could not delete proof file:', err.message)
        })
      }
    }

    // ── 5. Delete transactions ───────────────────────
    await new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM transactions WHERE user_id = ?',
        [id],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    // ── 6. Delete user ───────────────────────────────
    await new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM users WHERE id = ?',
        [id],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully.'
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.'
    })
  }

}



static async delete_event_market(req, res) {
  
  try {

    const { id } = req.body

    // ── Delete selections first ──────────────────────────
    await HELPERS.query(db, 'DELETE FROM selections WHERE event_market_id = ?', [id])
    await HELPERS.query(db, 'DELETE FROM event_markets WHERE id = ?', [id])

    return res.status(200).json({ success: true, message: 'Market removed successfully' })

  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
  }
}


//delete selection
 static async delete_selection(req, res) {
   
    try {
      
      const { id } = req.body
 
      await HELPERS.query(db, 'DELETE FROM selections WHERE id = ?', [id])
 
      return res.status(200).json({ success: true, message: 'Selection removed successfully' })
 
    } catch (error) {
      console.log(error.message)
      return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
    }
  }

 //Delete transaction
static async delete_transaction(req, res) {

  try {

    const { id } = req.body

    if (!id) {
      return res.status(400).json({ success: false, message: "Transaction id is required" })
    }

    // ── 1. Fetch proof file before deleting ──────────
    const rows = await new Promise((resolve, reject) => {
      db.query(
        'SELECT proof_url FROM transactions WHERE id = ? AND proof_url IS NOT NULL',
        [id],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    // ── 2. Delete proof files from disk ─────────────
    for (const row of rows) {
      if (row.proof_url) {
        const filePath = path.join(RESOURCES_ROOT, row.proof_url.replace('/resources', ''))
        fs.unlink(filePath, (err) => {
          if (err) console.log('Could not delete proof file:', err.message)
        })
      }
    }

    // ── 3. Delete transaction ────────────────────────
    await new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM transactions WHERE id = ?',
        [id],
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
    })

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.'
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.'
    })
  }

}


//delete event
static async delete_event(req, res) {
 
  try {
 
    const { id } = req.body
 
    if (!id) return res.status(400).json({ success: false, message: 'Event id is required' })
 
    // ── 1. Delete bet_selections linked to this event ────
    await HELPERS.query(db,
      `DELETE FROM bet_selections WHERE event_id = ?`,
      [id]
    )
 
    // ── 2. Delete selections via event_markets ───────────
    await HELPERS.query(db,
      `DELETE FROM selections WHERE event_market_id IN (
        SELECT id FROM event_markets WHERE event_id = ?
      )`,
      [id]
    )
 
    // ── 3. Delete event_markets ──────────────────────────
    await HELPERS.query(db,
      `DELETE FROM event_markets WHERE event_id = ?`,
      [id]
    )
 
    // ── 4. Delete event_score_periods ────────────────────
    await HELPERS.query(db,
      `DELETE FROM event_score_periods WHERE event_id = ?`,
      [id]
    )
 
    // ── 5. Delete event ──────────────────────────────────
    await HELPERS.query(db,
      `DELETE FROM events WHERE id = ?`,
      [id]
    )
 
    return res.status(200).json({ success: true, message: 'Event deleted successfully.' })
 
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' })
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