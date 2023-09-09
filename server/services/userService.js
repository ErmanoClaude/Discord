const bcrypt = require('bcrypt')


async function userLogin (req, res) {
    const { email, password } = req.body;

    const sqlQuery = `SELECT * FROM user_infomation WHERE email=${email}`
}

async function userRegister ( req, res) {

}