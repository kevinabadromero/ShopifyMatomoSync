const fs = require('fs')
const express = require('express')
const axios = require('axios')
const http = require('http')
const getRawBody = require('raw-body')
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "m.splittesting.com",
    user: "root",
    password: "2452",
    database: 'mydatabase',
});


const options = {
    hostname: 'https://thejellybee.myshopify.com/admin/api/2022-07/orders.json?updated_at_min=2022-10-08T20%3A00%3A00Z&status=any&order=updated_at%20asc',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': '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'
    }
  };

connection.connect((err) => {
  if (err) {
    console.log("Error occurred", err);
  } else {
    console.log("Connected to MySQL Server");
  }
});

const req = http.request(options, (res) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
      console.log('--------');
    });
  });
  
req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});



let sql = "select ShopifyOrder('"+ order +"');";
    connection.query(sql, true, (error, results, fields) => {
        const orderHandler = JSON.parse(body.toString())
    });