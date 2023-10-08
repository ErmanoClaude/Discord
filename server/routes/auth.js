const express = require("express");
const router = express.Router();
const db = require("../config/databaseConfig");
const { errorChecker, isEmail, verifyJWT } = require("../services/utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

//=====================//
//     AUTH ROUTES     //
//=====================//

router.post("/login", async (req, res) => {
  // Get data from body
  const { email, password } = req.body;

  // Validate credentials

  // Checks if email is valid from req.body
  // isEmail returns empty array if valid email
  // else returns ['Not valid email']
  const error = isEmail(email);

  if (error.length > 0) {
    res.send({
      success: false,
      errors: [error],
    });
    return;
  }

  const sqlQuery = `SELECT * FROM users WHERE email='${email}';`;
  await db.query(sqlQuery, async (err, data) => {
    if (err) {
      error.push("Error in /login sqlQuery");
      error.push(err.sqlMessage);
      res.send({
        success: false,
        errors: [error],
      });
    } else {
      // Check user creditals here
      if (data.length === 0) {
        error.push(`'${email}' this email doesn't exist in our system.`);
        res.send({
          success: false,
          errors: [error],
        });
        return;
      }
      // Here email exist password check here
      // hash from db
      const dbHash = data[0]["password"];

      // compare and see if hashes match
      const match = await bcrypt.compare(password, dbHash);

      if (match) {
        // User successfully is logged in
        const payload = {
          userId: data[0]["id"],
        };

        // Generate JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET);

        const user = {
          ...payload,
          displayName: data[0]["displayName"],
          token: token,
          expiresIn: 300, // <-- 5 min expiration
        };

        req.session.user = user;

        res.send({
          success: true,
          token: token,
          displayName: data[0]["displayName"],
        });
      } else {
        res.send({
          success: false,
          errors: [["Incorrect Password"]],
        });
      }
    }
  });
}); // post '/login'

router.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
}); // get '/login'

router.post("/register", async (req, res) => {
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
      errors: [errors],
    });
  }

  // Check if email exist in the database
  await db.query(
    `SELECT 1 FROM users WHERE email = "${email}"`,
    (err, emailData) => {
      if (emailData.length > 0) {
        errors.push("Email already exists.");
      }

      // Check if displayName exist in the database already
      db.query(
        `SELECT 1 FROM users WHERE displayName = "${displayName}"`,
        (err, data) => {
          if (data.length > 0) {
            errors.push("Display name already exists.");
          }

          // if we have a register error send it back
          if (errors.length > 0) {
            res.send({
              success: false,
              errors: [errors],
            });
          } else {
            // Create the new user in the database
            const user = db.query(
              `
                INSERT INTO users
                (email, displayName, password, dateOfBirth, timeOfCreation) 
                VALUES (?, ?, ?, ?, NOW())`,
              [email, displayName, hashedPassword, dateOfBirth],
              (err, result) => {
                if (err) {
                  console.log(err);
                  res.send({
                    success: false,
                    errors: [["Failed to insert User to data base duplicated"]],
                  });
                }
                // Make user default home channel
                db.query(
                  `INSERT INTO servers (name, ownerId) VALUES ("Home", ${result.insertId})`,
                );
                console.log(data);
                res.send({
                  success: true,
                });
              },
            );
          }
        },
      ); // Display Name Query
    },
  ); // Email Query
}); // post /register

router.get("/isUserAuth", verifyJWT, (req, res) => {
  res.send({
    success: true,
  });
});

module.exports = router;
