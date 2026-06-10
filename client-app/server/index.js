require("dotenv").config();

const express = require("express");
const port = process.env.PORT || 9000;
const router = require("./routes/router.js");
const cors = require("cors");
const path = require("path");
const fs = require("fs")
const session = require("express-session");
const passport = require("passport");
const sessionConfig = require("./middlewares/session");
const { getSettings } = require('./middlewares/settings')
const RESOURCES_ROOT = path.resolve(__dirname, '../../resources');
const base_url = process.env.BASE_URL
const app = express();


app.set("trust proxy", 1);


require("./cron/cron_job"); // THIS triggers the cron file



const util = require('util');
const log_file = fs.createWriteStream(__dirname + '/debug.log', {flags: 'w'});
const log_stdout = process.stdout;

console.log = (d, e, f, g) => {
  log_file.write(util.format('LOG: ', d?d:'', e?e:'', f?f:'', g?g:'') + '\n');
  log_stdout.write(util.format('LOG: ', d?d:'', e?e:'', f?f:'', g?g:'') + '\n');
}

console.error = (d, e, f, g) => {
  log_file.write(util.format('ERROR: ', d?d:'', e?e:'', f?f:'', g?g:'') + '\n');
  log_stdout.write(util.format('ERROR: ', d?d:'', e?e:'', f?f:'', g?g:'') + '\n');
}



app.use(cors({
  origin: `${base_url}`,   // your Vue frontend
  credentials: true,                 // 🔥 THIS IS REQUIRED FOR COOKIES
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use(session(sessionConfig));

require("./middlewares/passport");

app.use(passport.initialize());
app.use(passport.session());
app.use('/api', router);
app.use('/resources', express.static(RESOURCES_ROOT));



// Production static serving (if needed)


if (process.env.NODE_ENV === 'production') {
    
  app.use(express.static(__dirname + "/dist/"));
    
    app.get("*", async (req, res) => {
        
      const settings = await getSettings() // already cached, no DB hit

        let html = fs.readFileSync(path.join(__dirname, '/dist/index.html'), 'utf-8')

        // Replace every hardcoded occurrence
        html = html.replaceAll('admin.techbycas.com', 'admin.' + settings.website + '.win')

        res.send(html)

    });
}

app.listen(port, async () => {

  await getSettings()

  console.log("server started on port", port);

});
