const express = require("express");
const router = express.Router();
const { verifyJWT, isValidDisplayName } = require("../services/utils");
const db = require("../config/databaseConfig");

//=====================//
//    FRIEND ROUTES    //
//=====================//

// Return friends list of user sending request
// Return friends list of user accepted
router.get("/friends", verifyJWT, (req, res) => {
	const id = req.userId;
	// friends relationship is one row (userId1, userId2, status) status is for pending or accepted
	// need to get accepted where your id is the first userId1
	// then need to get accpeted where your id is the second userId2 for complete friend list
	// First query for userId1
	const query1 = `
  SELECT
    f.status,
    u.displayName,
    u.status AS availability
  FROM friends f
  JOIN users u ON f.userId2 = u.id
  WHERE f.userId1 = ? AND f.status = 'accepted';
`;

	// Second query for userId2
	const query2 = `
  SELECT
    f.status,
    u.displayName,
    u.status AS availability
  FROM friends f
  JOIN users u ON f.userId1 = u.id
  WHERE f.userId2 = ? AND f.status = 'accepted';
`;
	db.query(query1, [id], (err, data) => {
		if (err) {
			res.send({
				success: false,
				errors: [
					["Failed to send request to get friends list in query 1."],
				],
			});
			return;
		}
		db.query(query2, [id], (error, response) => {
			if (error) {
				res.send({
					success: false,
					errors: [
						[
							"Failed to send request to get friends list in query 2.",
						],
					],
				});
				return;
			}
			res.send({
				success: true,
				friends: [...data, ...response],
			});
		});
	});
});

// Returns pending request recived from other users and sent out to others
// Returns both request sent and request recieved
router.get("/friendRequests", verifyJWT, (req, res) => {
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

	db.query(outgoingQuery, [userId], (err, data) => {
		if (err) {
			res.send({
				success: false,
				errors: [["There is an error getting outGoing friend request"]],
			});
			return;
		}
		db.query(incomingQuery, [userId], (error, incomingData) => {
			if (error) {
				res.send({
					success: false,
					errors: [
						["This is an error getting incoming friend request."],
					],
				});
				return;
			}
			res.send({
				success: true,
				friendRequest: [...data, ...incomingData],
			});
		});
	});
});

// Route to add friends
// Need to check if Adding a Valid person First
router.post("/friends", verifyJWT, (req, res) => {
	const { displayName } = req.body;

	const errors = isValidDisplayName(displayName);

	if (errors.length > 0) {
		res.send({
			success: false,
			errors: [errors],
		});
		return;
	}

	const sql = `SELECT id FROM users WHERE displayName=?;`;
	db.query(sql, [displayName], (err, data) => {
		if (err) {
			console.log(err);
			res.send({
				success: false,
				errors: [['Failed to post "/friends"']],
			});
			return;
		}
		if (data.length === 0 || data.length > 1) {
			res.send({
				success: false,
				errors: [["User doesn't exist."]],
			});
			return;
		}
		if (data[0].id === req.userId) {
			res.send({
				success: false,
				errors: [["Trying to add yourself."]],
			});
			return;
		} else {
			// make sure the person with the smaller Id is first in friends table
			const insert = `INSERT INTO friends (userId1, userId2, status) VALUES (?, ?, 'pending');`;
			db.query(insert, [req.userId, data[0].id], (err, data) => {
				if (err) {
					if (err.code === "ER_DUP_ENTRY") {
						res.send({
							success: false,
							errors: [["Already Added this person"]],
						});
					} else {
						console.log(
							"error in post /friends trying to add user.",
						);
						res.send({
							success: false,
							errors: [["Error trying to add this user"]],
						});
					}

					return;
				}
			});
		}
	});
});

// Cancel Request
// Delete friends request from database has to be 'pending on status'
router.post("/cancelRequest", verifyJWT, (req, res) => {
	const { displayname } = req.body;
	const user = req.userId;
	console.log(displayname, user);

	const deleteQuery = `DELETE FROM friends WHERE 
  (userId1 = ? AND userId2 = (SELECT id FROM users WHERE displayName = ?) AND status = 'pending')
	  OR
  (userId2 = ? AND userId1 = (SELECT id FROM users WHERE displayName = ?) AND status = 'pending')`;

	db.query(deleteQuery, [user, displayname, user, displayname]);
});

router.post("/acceptRequest", verifyJWT, (req, res) => {
	const { displayname } = req.body;
	const user = req.userId;

	const acceptRequest = `UPDATE friends SET status = 'accepted'
	WHERE
    	(userId2 = ?
			AND 
		userId1 = (SELECT id FROM users WHERE displayName = ?) 
			AND 
		status = 'pending')`;
	db.query(acceptRequest, [user, displayname]);
});

// delete friend
router.get("/delete/:displayname", verifyJWT, (req, res) => {
	const { displayname } = req.params;
	const user = req.userId;

	const deleteQuery = `DELETE FROM friends WHERE 
  (userId1 = ? AND userId2 = (SELECT id FROM users WHERE displayName = ?) AND status = 'accepted')
	  OR
  (userId2 = ? AND userId1 = (SELECT id FROM users WHERE displayName = ?) AND status = 'accepted')`;

	db.query(deleteQuery, [user, displayname, user, displayname]);
});

module.exports = router;
