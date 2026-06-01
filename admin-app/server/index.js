require("dotenv").config();

const express = require("express");
const port = process.env.PORT || 7000;
const router = require("./routes/router.js")
const cors = require("cors");
const app = express();
const path = require('path');
const RESOURCES_ROOT = path.resolve(__dirname, '../../resources');
const base_url = process.env.BASE_URL


const fs = require('fs');
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


console.log('Resources path:', RESOURCES_ROOT);
console.log('File exists:', fs.existsSync(RESOURCES_ROOT + '/countries/country_image_1780324020622.png'));


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api', router);
app.use('/resources', express.static(RESOURCES_ROOT));



 
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(__dirname+"/dist/"))
    app.get("*", (req, res) => {
        res.sendFile(__dirname+"/dist/index.html")
    })
}



app.listen(port, () => {

  console.log("server started...")

})
