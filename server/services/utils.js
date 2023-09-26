const { getDaysInMonth } = require('date-fns');
const validator = require('validator');
const JWT = require('jsonwebtoken');

// Months to check date
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


// Errors return a string with error or array of strings
// Email validation
function isEmail(email) {
    const options = {
        allow_utf8_local_part: true
    };
    if (validator.isEmail(email, options)) {
        return [];
    } else {
        return ['Not a valid Email']
    };
}

// Display name validation
// Alphanumeric and min length 2 characters max length 20 characters
function isValidDisplayName(displayName) {
    const errors = []

    if (!displayName) errors.push('Must input a display name');

    // Display name must be more then 1 character  but less than 21 characters
    if (!(displayName.length >= 2)) errors.push('Display name must be minimum 2 characters');
    if (displayName.length > 20) errors.push("Display name maximum of 20 characters");

    if (!(validator.isAlphanumeric(displayName) || validator.isAlpha(displayName))) {
        errors.push('Display name must be alphanumeric characters only');
    }
    return errors;
}

function validatePassword(value) {
    let errors = []
    if (!value) errors.push("Password is required");

    if (value.length < 6) errors.push("Password must be at least 6 characters");

    if (!/[A-Z]/.test(value)) errors.push("Password must have an uppercase letter");

    if (!/[a-z]/.test(value)) errors.push("Password must have a lowercase letter");

    if (!/\d/.test(value)) errors.push("Password must have a number");

    return errors;
}

function validDate(month, year, day) {
    let errors = []

    if (months.indexOf(month) === -1) errors.push("Invalid Month");
    if (2020 > year && year < 1920) errors.push("Invalid Year");
    if (day < 1 || day > 31) errors.push('Invalid Day');


    // Checking for days in each month include leap years
    daysOfMonth = getDaysInMonth(new Date(year, months.indexOf(month)))
    if (day > daysOfMonth) errors.push("Invalid date")

    return errors;
}

// validate serverName
// only letters, numbers and spaces allowed
// server name is also trimmed
function validateServerName(serverName) {
    let errors = []
    const allowedChars = /^[a-zA-Z0-9 ]+$/;


    if(!serverName  || typeof serverName !== 'string') {
        return ['Server name must be only letters, numbers and spaces'];
    }

    if (!allowedChars.test(serverName)){ 
        return ['Server name must be only letters, numbers and spaces'];
    }

    return errors;
}

function errorChecker(email, password, displayName, month, year, day) {
    let errors = [
        ...isEmail(email),
        ...isValidDisplayName(displayName),
        ...validatePassword(password),
        ...validDate(month, year, day)
    ]

    return errors;
}

// middle ware to verify user
function verifyJWT ( req, res, next ) {
    const token = req.headers['x-access-token'];

    if(!token) {
        res.send({
            success: false,
            errors:[["We need a token, please give us the token next time"]]
        });
    } else {
        JWT.verify( token, process.env.JWT_SECRET, (err, decoded) => {
            if(err) {
                res.send({
                    success: false,
                    errors:[['Failed to authenticate']]
                })
            } else {
                req.userId = decoded.userId;
                next();
            }
        });
    }
} 


module.exports = {
    errorChecker,
    isEmail,
    validateServerName,
    verifyJWT,
};