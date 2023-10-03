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
    const id = req.userId;
    // First query for userId1
    const query1 = `
  SELECT
    f.status,
    u.displayName
  FROM friends f
  JOIN users u ON f.userId2 = u.id
  WHERE f.userId1 = ? AND f.status = 'accepted';
`;

    // Second query for userId2
    const query2 = `
  SELECT
    f.status,
    u.displayName
  FROM friends f
  JOIN users u ON f.userId1 = u.id
  WHERE f.userId2 = ? AND f.status = 'accepted';
`;
    db.query(query1, [id], (err, data) => {
        if (err) {
            res.send({
                success: false,
                errors: [['Failed to send request to get friends list in query 1.']]
            });
            return;
        }
        db.query(query2, [id], (error, response) => {
            if (error) {
                res.send({
                    success: false,
                    errors: [['Failed to send request to get friends list in query 2.']]
                })
                return;
            }
            res.send({
                success: true,
                friends: [...data, ...response]
            })
        })
    })
});


// Returns pending request recived from other users and sent out to others
// Returns both request sent and request recieved
router.get('/friendRequests', verifyJWT, (req, res) => {
    const userId = req.userId; // Assuming you have the user ID from req

    // Outgoing (user is userId1)
    const outgoingQuery = `
    SELECT
        'Outgoing' AS requestType,
        f.status,
        u.displayName
    FROM friends f
    JOIN users u ON f.userId2 = u.id
    WHERE f.userId1 = ? AND f.status = 'pending';
    `;

    // Incoming (user is userId2)
    const incomingQuery = `
    SELECT
        'Incoming' AS requestType,
        f.status,
        u.displayName
    FROM friends f
    JOIN users u ON f.userId1 = u.id
    WHERE f.userId2 = ? AND f.status = 'pending';
    `;

    db.query(outgoingQuery, [userId], (err, data)=> {
        if(err) {
            res.send({
                success:false,
                errors: [['There is an error getting outGoing friend request']]
            });
            return;
        }
        db.query(incomingQuery,[userId], (error, incomingData)=> {
            if (error) {
                res.send({
                    success:false,
                    errors:[['This is an error getting incoming friend request.']]
                })
                return;
            }
            res.send({
                success:true,
                friendRequest:[...data,...incomingData]
            })
        })

    });
})

// Route to add friends
// Need to check if Adding a Valid person First
router.post('/friends', verifyJWT, (req, res) => {
    const { displayName } = req.body;
    const errors = isValidDisplayName(displayName);

    if (errors.length > 0) {
        res.send({
            success: false,
            errors: [errors]
        })
        return;
    }

    const sql = `SELECT id FROM users WHERE displayName='${displayName}';`
    db.query(sql, (err, data) => {
        if (err) {
            console.log(err)
            res.send(
                {
                    success: false,
                    errors: [['Failed to post "/friends"']]
                }
            )
            return;
        }
        if (data.length === 0 || data.length > 1) {
            res.send({
                success: false,
                errors: [["User doesn't exist."]]
            })
            return;
        } if (data[0].id === req.userId) {
            res.send({
                success: false,
                errors: [['Trying to add yourself.']]
            })
            return;
        } else {
            const insert = `INSERT INTO friends (userId1, userId2, status) VALUES (${req.userId}, ${data[0].id}, 'pending');`
            db.query(insert, (err, data) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        res.send({
                            success: false,
                            errors: [['Already Added this person']]
                        })
                    } else {
                        console.log("errro in post /friends trying to add user.")
                        res.send({
                            success: false,
                            errors: [['Error trying to add this user']]
                        })
                    }

                    return;
                }
            })

        }
    })
})




module.exports = router;