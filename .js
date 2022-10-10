const fs = require('fs')
const express = require('express')
const https = require('https')
const app = express()
const getRawBody = require('raw-body')
var mysql = require("mysql");

const crypto = require('crypto')
const secretKey = '109c2f4306991098d14cdfdff8992ff7b8a47f6dcbcd355831d02b95939d2890'
var MatomoTracker = require('matomo-tracker');
var matomo = new MatomoTracker(4, 'http://m.splittesting.com/matomo.php');

var connection = mysql.createConnection({
  host: "m.splittesting.com",
  user: "root",
  password: "2452",
  database: 'mydatabase',
});

connection.connect((err) => {
  if (err) {
    console.log("Error occurred", err);
  } else {
    console.log("Connected to MySQL Server");
  }
});


app.post('/webhook', async (req, res) => {
  console.log('🎉 We got an order!')

  // We'll compare the hmac to our own hash
  const hmac = req.get('X-Shopify-Hmac-Sha256')

  // Use raw-body to get the body (buffer)
  const body = await getRawBody(req)

  // Create a hash using the body and our key
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(body, 'utf8', 'hex')
    .digest('base64')

  // Compare our hash to Shopify's hash
  if (hash === hmac) {
    // It's a match! All good
    console.log('Phew, it came from Shopify!')
    const order = body.toString()
    const orderHandler = JSON.parse(body.toString())
    res.sendStatus(200)

    itemList = orderHandler.line_items
    
    items = []

    itemList.forEach(element => {
      items.push([element.sku, element.title, "", element.price, element.quantity])
    });

    console.log(orderHandler)
    let sql = "select ShopifyOrder('"+ order +"');";
    connection.query(sql, true, (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      const key = Object.keys(results[0])[0]
      const respons = results[0][key]
      if (respons == 1){async()=>{
        const rex = await axios.get('https://m.splittesting.com/matomo.php', { params: {
          idsite: 4,
          rec: 1,
          idgoal: 0,
          ec_items: items,
          revenue: orderHandler.total_price_set.shop_money.amount,
          ec_st: orderHandler.subtotal_price_set.shop_money.amount,
          ec_tx: orderHandler.total_tax_set.shop_money.amount,
          ec_sh: orderHandler.total_shipping_price_set.shop_money.amount,
          ec_dt: orderHandler.total_discounts_set.shop_money.amount
        } });

        console.log(rex.data) 
      }
    }
    });

  } else {
    // No match! This request didn't originate from Shopify
    console.log('Danger! Not from Shopify!')
    res.sendStatus(403)
  }
})

app.get('/', function(req, res) {
  res.status(200).send('ok')
})

https
  .createServer(
		// Provide the private and public key to the server by reading each
		// file's content with the readFileSync() method.
    {
      key: fs.readFileSync("/etc/letsencrypt/live/kevin.pilgrimconsulting.group/privkey.pem"),
      cert: fs.readFileSync("/etc/letsencrypt/live/kevin.pilgrimconsulting.group/fullchain.pem"),
    },
    app
  )
  .listen(443, () => {
    console.log("serever is runing at port 4000");
  });
