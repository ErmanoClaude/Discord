const express = require('express');
const validator = require('validator');
const mysql = require('mysql');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// express json
app.use(express.json());

// dotenv config
require('dotenv').config();

app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true // Allows cookie to be enabled
}))

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    key: "userId",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24 * 10 // 10 days of logged in
    },
}))

const saltRounds = 10;

const { errorChecker, isEmail, verifyJWT } = require('./services/utils');

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];


// connect to DB
const db = require('./config/databaseConfig');

app.post('/login', async (req, res) => {
    // Get data from body
    const { email, password } = req.body;

    // Validate credentials


    // Checks if email is valid from req.body
    // isEmail returns empty array if valid email
    // else returns ['Not valid email']
    const error = isEmail(email);
    console.log(email);
    console.log(error.length, error)
    if (error.length > 0) {
        res.send({
            success: false,
            errors: [error]
        })
        return;
    }

    const sqlQuery = `SELECT * FROM users WHERE email='${email}';`;
    await db.query(sqlQuery, async (err, data) => {
        if (err) {
            error.push('Error in /login sqlQuery');
            error.push(err.sqlMessage);
            res.send({
                success: false,
                errors: [error]
            })
        } else {

            // Check user creditals here
            if (data.length === 0) {
                error.push(`'${email}' this email doesn't exist in our system.`);
                res.send({
                    success: false,
                    errors: [error]
                })
                return;
            }
            // Here email exist password check here
            // hash from db
            const dbHash = data[0]['password'];


            // compare and see if hashes match
            const match = await bcrypt.compare(password, dbHash);

            if (match) {
                // User successfully is logged in
                const payload = {
                    "userId": data[0]['id']
                }


                // Generate JWT
                const token = jwt.sign(payload, process.env.JWT_SECRET);


                const user = {
                    ...payload,
                    "displayName": data[0]['displayName'],
                    token: token,
                    expiresIn: 300, // <-- 5 min expiration
                }

                req.session.user = user

                console.log(req.session.user);

                res.send({
                    success: true,
                    token: token
                });
                console.log(`${email} You are logged in`)

            } else {
                res.send({
                    success: false,
                    errors: [['Incorrect Password']]
                })
            }

        }
    })


}) // post /login


app.get('/login', (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
})


app.get('/isUserAuth', verifyJWT, (req, res) => {
})

app.post('/register', async (req, res) => {
    // Get data
    const { email, password, displayName, day, month, year } = req.body;

    const dateOfBirth = year + "-" + (months.indexOf(month) + 1) + "-" + day;

    // generate salt for password
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    let errors = errorChecker(email, password, displayName, month, year, day);

    // If error checker finds errors return early
    if (errors.length > 0) {
        return res.send({
            success: false,
            errors: [errors]
        });
    }

    // Check if email exist in the database
    await db.query(`SELECT 1 FROM users WHERE email = "${email}"`, (err, emailData) => {

        if (emailData.length > 0) {
            errors.push('Email already exists.');
        }

        // Check if displayName exist in the database already
        db.query(`SELECT 1 FROM users WHERE displayName = "${displayName}"`, (err, data) => {
            if (data.length > 0) {
                errors.push('Display name already exists.');
            }

            // if we have a register error send it back
            if (errors.length > 0) {
                res.send({
                    success: false,
                    errors: [errors]
                })
            } else {
                const user = db.query(`
                INSERT INTO users 
                (email, displayName, password, dateOfBirth, timeOfCreation) 
                VALUES (?, ?, ?, ?, ?, NOW())`,
                    [email, displayName, hashedPassword, dateOfBirth]
                );
            }
        }); // Display Name Query

    }); // Email Query


}) // post /register


app.get('/sql', async (req, res) => {
    let sql = "SELECT * FROM users"
    await db.query(sql, (err, results) => {
        if (err) throw err;
        console.log(results[0]);
        console.log("asdfa;dslfjka");
        res.send({
            data: results
        })
    });
});


app.listen(5000, function () {
    console.log("Server started on port 5000");

    // Connect to the data base
    db.connect(function (err) {
        if (err) throw err;
        console.log('Database connected')
    });
});

