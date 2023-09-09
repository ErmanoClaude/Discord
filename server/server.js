const express = require('express');
const validator = require('validator');
const mysql = require('mysql');
const app = express();

const  { errorChecker, isEmail }  = require('./services/utils');

// Body parser middleware
app.use(express.json());

// dotenv config
require('dotenv').config();

// connect to DB
const db = require('./config/databaseConfig');

app.post('/login', (req, res) => {
    // Get data from body
    const { email, password } = req.body;

    // Validate credentials
    // Handle this later
    let error = ['This is one error', 'This is another Error', 'This is the third error'];
    console.log(error)
    res.send({
        success:false,
        errors:[error]
    })
})

app.post('/register', (req, res) => {
    // Get data
    const { email, password, displayName, day, month, year } = req.body;

    // console.log data
    console.log(email, password, displayName, day, month, year);

    let errors = errorChecker(email, password, displayName, month, year, day)
    
    // Sending back a success message
    res.send({
        success: `${displayName} This is the response back`
    })
})


app.get('/sql', async(req, res) => {
    let sql = "SELECT * FROM users"
    await db.query(sql, (err, results) => {
        if (err) throw err;
        console.log(results[0]);
    });
});


app.listen(5000, function (){
    console.log("Server started on port 5000");

    // Connect to the data base
    db.connect(function (err) {
        if(err) throw err;
        console.log('Database connected')
    });
});

