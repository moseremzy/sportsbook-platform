require("dotenv").config();

const express = require("express");
const port = process.env.PORT || 9000;
const router = require("./routes/router.js");
const cors = require("cors");
const path = require("path");
const app = express();
const base_url = process.env.BASE_URL


app.use(cors({
  origin: `${base_url}`,   // your Vue frontend
  credentials: true,                 // 🔥 THIS IS REQUIRED FOR COOKIES
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/api', router);


// Production static serving (if needed)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(__dirname + "/dist/"));
    app.get("*", (req, res) => {
        res.sendFile(__dirname + "/dist/index.html");
    });
}

app.listen(port, () => {
  console.log("server started on port", port);
});
