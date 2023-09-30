const express = require('express');
const router = express.Router();
const { verifyJWT, isValidDisplayName } = require('../services/utils');
const db = require('../config/databaseConfig');

//=====================//
//    Server Routes    //
//=====================//

// Return friends list of user sending request
// Return friends list of user accepted
router.get('/friends', verifyJWT, (req, res) => {
    const query = `
  SELECT 
    u1.displayName AS friendName,
    f.status
  FROM friends f
  LEFT JOIN users u1 ON u1.id = f.userId1 
  LEFT JOIN users u2 ON u2.id = f.userId2
  WHERE
    (f.userId1 = ? AND f.status = 'accepted')
    OR 
    (f.userId2 = ? AND f.status = 'accepted')
`;
    db.query(query, [req.userId, req.userId], (err, data) => {
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
            db.query(insert, (err, data) => {
                if (err){
                    console.log('You already added this user');
                    return;
                }
            })

        }
    })
})



module.exports = router;