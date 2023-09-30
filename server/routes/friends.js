const express = require('express');
const router = express.Router();
const { verifyJWT, isValidDisplayName } = require('../services/utils');
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


// Route to add friends
// Need to check if Adding a Valid person First
router.post('/friends', verifyJWT, (req, res) => {
    const { displayName } = req.body;


    const errors = isValidDisplayName(displayName);
    
    
    if (errors.length > 0) {
        res.send({
            success: false,
            errors:[errors]
        })
        return;
    }

    const sql = `SELECT id FROM users WHERE displayName='${displayName}';`
    db.query(sql, (err, data) => {
        if (err) {
            console.log(err)
            res.send(
                {
                    success:false,
                    errors:[['Failed to post "/friends"']]
                }
            )
            return;
        }
        if (data.length === 0 || data.length > 1) {
            res.send({
                success: false,
                errors:[["User doesn't exist."]]
            })
            return;
        } else {
            const insert = `INSERT INTO friends (userId1, userId2, status) VALUES (${req.userId}, ${data[0].id}, 'pending');`
            const insert2 = `INSERT INTO friends (userId1, userId2, status) VALUES (${data[0].id}, ${req.userId}, 'pending');`

            db.query(insert, (err, data) => {
                if (err){
                    console.log('You already added this user');
                    return;
                }
                db.query(insert2, (error, response) => {
                    if (err){
                        console.log('They aleady added you');
                    }
                })
            })

        }
    })
})



module.exports = router;