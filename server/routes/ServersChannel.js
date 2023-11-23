const express = require("express");
const router = express.Router();
const { validateServerName, verifyJWT } = require("../services/utils");
const db = require("../config/databaseConfig");

//=====================//
//    SERVER ROUTES    //
//=====================//

router.get("/servers", verifyJWT, (req, res) => {
	const sql = `SELECT id, name FROM servers WHERE ownerId = ?
    UNION 
    SELECT s.id, s.name FROM servers s
    JOIN members m ON s.id = m.serverId
    WHERE m.userId = ?`;

	db.query(sql, [req.userId, req.userId], (err, data) => {
		if (err) {
			console.log(err);
			res.send({
				success: false,
				errors: [["Unable to process db query from servers OwnerId"]],
			});
		}
		res.send({
			servers: data,
		});
	});
});

// Create new server
router.post("/servers", verifyJWT, async (req, res) => {
	const { serverName } = req.body;
	const sql = `INSERT INTO servers (name, ownerId) VALUES (?, ?)`;
	const errors = validateServerName(serverName);

	if (errors.length > 0) {
		res.send({
			success: false,
			errors: [errors],
		});
		return;
	}

	if (serverName.length > 100) {
		res.send({
			success: false,
			errors: [["Server name must be up to 100 characters"]],
		});
		return;
	}

	db.query(sql, [serverName, req.userId], (err, data) => {
		if (err) {
			console.log("error is in post /server");
			console.log(err);
			res.send({
				success: false,
				errors: [["Error in sql"]],
			});
			return;
		}
		// insert owner into members of their own channel
		const insertMemeber = `
      INSERT INTO members (userId, serverId) VALUES
        (?, ?)`;
		db.query(
			insertMemeber,
			[req.userId, data.insertId],
			(insertMemeberError, insertMemeberData) => {
				if (err) {
					console.log("Error in inserting owner to memebers");
					res.send({
						success: false,
						errors: [["Error in inserting owner to members"]],
					});
					return;
				}
			},
		);

		// Create general text chat and general voice chat channels
		const insertGeneral = `
      INSERT INTO channels (serverId, name, type) VALUES
        (${data.insertId}, 'general', 'text'),
        (${data.insertId}, 'general', 'voice');`;

		db.query(insertGeneral, (generalErrors, generalResults) => {
			if (generalErrors) {
				res.send({
					success: false,
					errors: [["Error in inserting general voice and text chat"]],
				});
				return;
			}
			res.send({
				success: true,
			});
		});
	});
});

// Create a channel for a server
router.post("/channels", verifyJWT, (req, res) => {
	const { serverId, serverName, channelName, channelType } = req.body;
	const user = req.userId;
	// find the matching serverName and Id make sure they exist
	// Got to make sure user is a memmber of that server to do this
	const sql = `SELECT serverId FROM members WHERE userId=? AND serverId=?`;

	const errors = validateServerName(serverName);

	if (errors.length > 0) {
		// changer 'Server' to channel cause same name errros as sever names
		errors = errors.map((error) => error.replace("Server", "Channel"));

		res.send({
			success: false,
			errors: [errors],
		});
		return;
	}

	db.query(sql, [user, serverId], (err, data) => {
		if (err) {
			console.log(err);
			res.send({
				success: false,
				errors: [["Error in db query POST channels route"]],
			});
			return;
		}

		if (data.length == 0) {
			console.log("no person");
			res.send({
				success: false,
				errors: [["Error finding server or user that in this server"]],
			});
		} else {
			// Insert Channel to the server
			const insertChannel = `
      INSERT INTO channels (serverId, name, type) 
      VALUES (?, ?, ?);`;

			db.query(
				insertChannel,
				[data[0].serverId, channelName, channelType],
				(error, result) => {
					if (err || result === undefined) {
						res.send({
							success: false,
							errors: [
								["Error inserting channel in database in POST channel"],
							],
						});
					} else {
						res.send({
							success: true,
						});
					}
				},
			);
		}
	});
});

// Returns all the channels of a given server
router.get("/channels/:serverId", verifyJWT, (req, res) => {
	const { serverId } = req.params;
	const user = req.userId;
	// make sure their apart of the the server their requesting channels from
	const sql = `SELECT serverId FROM members WHERE userId=? AND serverId=  ?`;

	db.query(sql, [user, serverId], (error, results) => {
		if (error) {
			console.log(error);
			res.send({
				success: false,
				errors: [["Error fetching Channels for this server"]],
			});
			return;
		}

		if (results.length === 0) {
			res.send({
				success: false,
				errors: [["No Server with this id"]],
			});
			return;
		}
		const channelsQuery = `
    SELECT id, name, type FROM channels WHERE serverId = ?`;
		db.query(channelsQuery, [results[0].serverId], (err, data) => {
			if (err) {
				console.log("Error fetching channels");
				res.send({
					success: false,
					errors: [["Error fetching channels for this server"]],
				});
				return;
			}
			res.send({
				success: true,
				channels: data,
			});
			return;
		});
	});
});

// Invite person to server
router.post("/serverinvite/:serverId/:receiver", verifyJWT, (req, res) => {
	const { serverId, receiver } = req.params;
	const user = req.userId;

	// Check if the receiver is a valid user
	const checkReceiverSql = `SELECT * FROM users WHERE displayName = ?`;

	db.query(checkReceiverSql, [receiver], (errReceiver, dataReceiver) => {
		if (errReceiver) {
			console.log("Error checking if receiver is a valid user");
			console.log(errReceiver);
			res.send({
				success: false,
				errors: [["Error checking if receiver is a valid user"]],
			});
			return;
		}

		if (dataReceiver.length === 0) {
			res.send({
				success: false,
				errors: [["Receiver is not a valid user"]],
			});
			return;
		}

		// Check if the requester is a member of the server
		const checkMemberSql = `SELECT * FROM members WHERE userId = ? AND serverId = ?`;

		db.query(checkMemberSql, [user, serverId], (err, data) => {
			if (err) {
				console.log("Error checking if user is a member of the server");
				console.log(err);
				res.send({
					success: false,
					errors: [["Error checking if user is a member of the server"]],
				});
				return;
			}

			if (data.length === 0) {
				res.send({
					success: false,
					errors: [["You are not a member of this server"]],
				});
				return;
			}

			// Check if the receiver is already a member of the server
			const checkReceiverMembershipSql = `
			SELECT * 
			FROM members 
			WHERE userId =? AND serverId = ?`;
			db.query(
				checkReceiverMembershipSql,
				[dataReceiver[0].id, serverId],
				(errReceiverMembership, dataReceiverMembership) => {
					if (errReceiverMembership) {
						console.log("Error checking if receiver is already a member");
						console.log(errReceiverMembership);
						res.send({
							success: false,
							errors: [
								["Error checking if receiver is already a member"],
							],
						});
						return;
					}

					if (dataReceiverMembership.length > 0) {
						res.send({
							success: false,
							errors: [["Receiver is already a member of this server"]],
						});
						return;
					}

					// Check their being invited to someones Home Server

					const homeServerSql = `SELECT name from servers WHERE id=?`;
					db.query(
						homeServerSql,
						[serverId],
						(homeServerSqlError, homeServer) => {
							if (homeServerSqlError) {
								console.log(homeServerSqlError);
								res.send({
									success: false,
									errors: [["Being invited to home server"]],
								});
								return;
							}
							if (homeServer[0].name === "Home") {
								res.send({
									success: false,
									errors: [["Being invited to Home server"]],
								});
								return;
							}

							// At this point, the receiver is a valid user and not a member of the server
							const insertInviteSql = `
							INSERT INTO server_invitations (serverId, receiverId) VALUES (?, ?)`;

							db.query(
								insertInviteSql,
								[serverId, dataReceiver[0].id],
								(err, dataInvite) => {
									if (err) {
										console.log("Error inserting invite to database");
										console.log(err);
										res.send({
											success: false,
											errors: [
												["Error inserting invite to database"],
											],
										});
										return;
									}
									res.send({
										success: true,
									});
								},
							);
						},
					);
				},
			);
		});
	});
});

// accept server invite
router.get("/serverinvite/:serverId", verifyJWT, (req, res) => {
	const { serverId } = req.params;
	const user = req.userId;

	// Check if user has a server_invite to this server
	const sql = `SELECT serverId FROM server_invitations WHERE receiverId=? AND serverId=?`;

	db.query(sql, [user, serverId], (err, result) => {
		if (err) {
			console.log("Error accepting invite");
			res.send({
				success: false,
				errors: [["Error Accepting invite to server"]],
			});
			return;
		}
		// ...

		if (result.length == 1) {
			const insertQuery = `INSERT INTO members (userId, serverId) VALUES (?, ?)`;
			const deleteQuery = `DELETE FROM server_invitations WHERE receiverId=? AND serverId=?`;
			db.query(
				insertQuery,
				[user, result[0].serverId],
				(error, insertResult) => {
					if (error) {
						console.log("Error inserting user to server");
						console.log(error);
						res.send({
							success: false,
							errors: [["Couldn't insert you to this server."]],
						});
						return;
					}

					db.query(
						deleteQuery,
						[user, serverId],
						(deleteError, deleteResult) => {
							if (deleteError) {
								console.log("Error deleting server invitation");
								console.log(deleteError);
								res.send({
									success: false,
									errors: [["Error deleting server invitation"]],
								});
								return;
							}
							res.send({
								success: true,
							});
						},
					);
				},
			);
		} else {
			res.send({
				success: false,
				errors: [["Don't have an invite to this server."]],
			});
		}
	});
});

// Decline server a server invite
router.get("/serverinvites/:serverId", verifyJWT, (req, res) => {
	const { serverId } = req.params;
	const sql = `
    DELETE FROM server_invitations
    WHERE receiverId = ? AND serverId=?;`;

	db.query(sql, [req.userId, serverId]);
	res.send({
		success: true,
	});
});

// Return all server invites for a givein user
router.get("/serverinvite", verifyJWT, (req, res) => {
	const sql = `
  SELECT name, serverId 
  FROM server_invitations 
  JOIN servers ON server_invitations.serverId = servers.id 
  WHERE receiverId = ?;
  `;
	db.query(sql, [req.userId], (err, invites) => {
		if (err) {
			res.send({
				success: false,
				errors: [["Error getting server invites"]],
			});
			console.log("Error getting server invites");
			return;
		}
		res.send({
			success: true,
			invites: invites,
		});
		return;
	});
});

// Returns the displaynames of members of a server
router.get("/members/:serverId", verifyJWT, (req, res) => {
	const { serverId } = req.params;
	const sql = `
    SELECT displayName
    FROM members JOIN users ON members.userId = users.id
    WHERE serverId=(
      SELECT serverId 
      FROM members 
      WHERE userId = ? AND serverId=?
      );`;

	db.query(sql, [req.userId, serverId], (err, members) => {
		if (err) {
			res.send({
				success: false,
				errors: [["Error Retrieveing members of this server"]],
			});
			console.log(
				"Error Retrieveing members of server in /members/:serverId GET route",
			);
			return;
		}
		res.send({
			success: true,
			members: members,
		});
	});
});

// Check if someone is a member of a server
router.get("/member/:serverId", verifyJWT, (req, res) => {
	const { serverId } = req.params;
	const user = req.userId;
	const checkServerSql = `SELECT * FROM members WHERE serverId=? AND userId=?;`;

	db.query(checkServerSql, [serverId, user], (error, result) => {
		if (error) {
			console.log("Error checking if server member route");
			res.send({
				success: false,
				errors: [["Error Checking member in /member route"]],
			});
			return;
		} else if (result.length === 0) {
			res.send({
				success: false,
				errors: [["You aren't a member of this server"]],
			});
		} else {
			res.send({
				success: true,
			});
		}
	});
});

// Checks if user is in this channel
// As well as if channel exist
// Also returns channel group chat logs if channelType is text
router.post("/channelcheck", verifyJWT, (req, res) => {
	const { serverId, channelId, channelName, name, channelType } = req.body;
	const user = req.userId;

	const checkChannelSql = `
	SELECT 
		servers.name as serverName,
		servers.id as serverId,
		channels.id as channelId
	FROM servers
	JOIN channels ON servers.id = channels.serverId
	WHERE servers.id IN (
		SELECT serverId
		FROM members
		WHERE userId = ?
	) 
	AND (serverId = ?)
	AND (channels.id = ?)
	AND (servers.name = ?)
	AND (channels.name = ?)
	AND (type = ?)`;

	const groupChatSql = `
		SELECT 
			displayName AS author, 
			content, 
			timestamp 
		FROM messages 
		JOIN users ON users.id = messages.authorId 
		WHERE channelId = ?;`;

	db.query(
		checkChannelSql,
		[user, serverId, channelId, name, channelName, channelType],
		(error, checkChannelResult) => {
			if (error) {
				console.log(error);
				console.log("Error in check channel");
				res.send({
					success: false,
					errors: [["Error checking if channel exist"]],
				});
				return;
			}

			if (checkChannelResult.length == 1) {
				if (channelType === "text") {
					db.query(
						groupChatSql,
						[channelId],
						(groupChatError, groupChatResults) => {
							if (groupChatError) {
								console.log(groupChatError);
								console.log("Error in fetching group chat");
								res.send({
									success: false,
									errors: [["Error fetching group chat"]],
								});
							} else {
								res.send({
									success: true,
									chatLogs: groupChatResults,
								});
							}
						},
					);
				} else {
					res.send({
						success: true,
					});
					return;
				}
			} else {
				console.log(checkChannelResult);
				res.send({
					success: false,
					errors: [["Error Checking if channel exist"]],
				});
				return;
			}
		},
	);
});

router.get("/getname/:id", verifyJWT, (req, res) => {
	const { id } = req.params;
	const sql = "SELECT displayName FROM users WHERE id=?";

	db.query(sql, [id], (error, result) => {
		if (error) {
			res.send({
				success: false,
				errors: [["Error getting displayname"]],
			});
			console.log(error);
		} else {
			res.send({
				success: true,
				displayname: result[0].displayName,
				id: id,
			});
		}
	});
});
module.exports = router;
