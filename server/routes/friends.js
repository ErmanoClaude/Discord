const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../services/utils');
const db = require('../config/databaseConfig');

//=====================//
//    Server Routes    //
//=====================//

// Return friends list of user sending request
// Returns both accepted friends request and pending friends
router.get('/friends', verifyJWT, (req, res) => {
    const sql = `
    SELECT users.displayName, friends.status 
    FROM friends
    JOIN users ON friends.userId2 = users.id
    WHERE friends.userId1 = ${req.userId}
  `;
    db.query(sql, (err, data) => {
        if (err) {
            res.send({
                success: false,
                errors: [['Failed to send request to get friends list.']]
            });
            return;
        }
        res.send({
            friends: data
        })
    })
});



module.exports = router;