const express = require('express');
const validator = require('validator');
const mysql = require('mysql');
const app = express();

// Body parser middleware
app.use(express.json());

// dotenv config
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

// connect to database first then set server routes.

db.connect((err) => {
    if (err) {
        console.log(err.message);
        return;
    }
    console.log("Database connected")
})

app.post('/login', (req, res) => {
    // Get data from body
    const { email, password } = req.body;

    // Validate credentials
    if (email && password) {
        // successfull login
        console.log({ email, password })
        res.send({
            success: true,
            message: `Welcome ${email}`
        })
    } else {
        // unsccessful login response
        res.send({
            success: false,
            message: `failed to login`
        })

    }

})

app.post('/register', (req, res) => {
    // Get data
    const { email, password, displayName, day, month, year } = req.body;

    // console.log data
    console.log(email, password, displayName, day, month, year);

    const options = {
        allow_utf8_local_part: true
    };
    console.log(validator.isEmail(email, options));
    console.log(validator.isAlphanumeric(displayName) || validator.isAlpha(displayName))


    // Sending back a success message
    res.send({
        success: `${displayName} This is the response back`
    })
})

app.listen(5000, () => console.log("Server started on port 5000"))

