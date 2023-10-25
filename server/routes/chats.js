const express = require("express");
const router = express.Router();
const db = require("../config/databaseConfig");
const { isValidDisplayName, verifyJWT } = require("../services/utils");

//=====================//
//     CHAT ROUTES     //
//=====================//

//returns messages from -chat with person's displayname
router.get("/:displayname", verifyJWT, async (req, res) => {
	const user = req.userId;
	const displayname = req.params.displayname;

	// Query friends tabl to make sure your friends with displayname in params
	const sql = `SELECT *
  FROM friends
  WHERE (userId1 = ? AND userId2 = (SELECT id FROM users WHERE displayName = ?))
    OR
      (userId2 = ? AND userId1 = (SELECT id FROM users WHERE displayName = ?))
    AND status = 'accepted';`;

	// Second Query to get chat logs of friend
	const chatLogsQuery = `
    SELECT
        u.displayName AS author,
        c.content,
        c.timestamp
    FROM chats c
    JOIN users u ON u.id = c.authorId
    WHERE 
        (c.user1Id = ? AND c.user2Id = (SELECT id FROM users WHERE displayName = ?))
    OR 
        (c.user1Id = (SELECT id FROM users WHERE displayName = ?) AND c.user2Id = ?)
    ORDER BY c.timestamp`;

	// Make sure a valid user name is in the params or return the error to client
	let errors = isValidDisplayName(displayname);
	if (errors.length > 0) {
		res.send({
			success: false,
			errors: [errors],
		});
		return;
	}

	// look for persons id from displayname
	db.query(sql, [user, displayname, user, displayname], (error, result) => {
		if (error) {
			console.log(error);
			res.send({
				success: false,
				errors: [["SQL error in /message/:displayname"]],
			});
			return;
		}
		if (result.length == 1) {
			db.query(
				chatLogsQuery,
				[user, displayname, displayname, user],
				(err, chatLogs) => {
					if (err) {
						console.log("error in chat Logs query");
						res.send({
							success: false,
							errors: [["Error in retrieving chat logs query"]],
						});
						return;
					}
					res.send({
						success: true,
						chatLogs: chatLogs,
					});
				},
			);
		} else {
			res.send({
				success: false,
				errors: [
					["No user with this display name in your friend list."],
				],
			});
		}
	});
});

module.exports = router;
