const mysql = require("mysql");
const env = require("dotenv").config();

// AWS database connection

const db = mysql.createConnection({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: "discord_database",
});

// local connection to the MySQL WorkBench server
/*
const db = mysql.createConnection({
	host: "localhost", // The hostname of your MySQL server
	user: "root", // Your MySQL username
	password: process.env.LOCAL_DB_PW, // Your MySQL password
	database: "discord_database", // The name of your database
});
*/
// connect to database first then set server routes.

module.exports = db;
