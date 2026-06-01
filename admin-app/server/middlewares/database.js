const mysql = require("mysql");
const host = process.env.HOST
const user = process.env.USER
const password = process.env.PASSWORD
const database = process.env.DATABASE


//create connection
const db = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
  })
  
  
  //connect database
  db.connect((err) => {
    if(err) {
        throw err
    }
    console.log("connected successfully")
  })

  // const createItemsTable = `CREATE TABLE IF NOT EXISTS items (
  //   items_id INT AUTO_INCREMENT PRIMARY KEY, 
  //   name VARCHAR(250),
  //   category VARCHAR(50),
  //   image VARCHAR(250),
  //   price INT(11),
  //   description VARCHAR(250)
  //   )`;
  
  // db.query(createItemsTable)
  
  
  // let items = [
  
  //   {
  //     name: "sardine bread",
  //     category: "bread",
  //     image: "sardine_bread.jpg",
  //     price: 1000,
  //     description: "tasty sardine bread"
  //   },
  //   {
  //     name: "cup cake",
  //     category: "snacks",
  //     image: "cup_cake.jpeg",
  //     price: 700,
  //     description: "tasty cup cake"
  //   },
  //   {
  //     name: "beef burger",
  //     category: "snacks",
  //     image: "beef_burger.jpg",
  //     price: 500,
  //     description: "Delicious beef burger"
  //   },
  //   {
  //     name: "french fries",
  //     category: "meals/sides",
  //     image: "french_fries.jpeg",
  //     price: 700,
  //     description: "tasty french fries"
  //   }
  // ]
  
  
  // const sql = 'INSERT INTO items SET ?';
  
  // for (let item of items) {
  //   await new Promise((resolve, reject) => {
  //     db.query(sql, item, (err, result) => {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve();
  //       }
  //     });
  //   });
  // }
  // console.log("All items inserted successfully!");



 module.exports = db
  