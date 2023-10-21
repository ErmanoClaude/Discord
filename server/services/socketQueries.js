const db = require("../config/databaseConfig");

async function getFriendshipId(userId, displayname) {
	return new Promise((resolve, reject) => {
		const sql = `SELECT id
  FROM friends
  WHERE (userId1 = ${userId} AND userId2 = (SELECT id FROM users WHERE displayName = '${displayname}'))
    OR (userId2 = ${userId} AND userId1 = (SELECT id FROM users WHERE displayName = '${displayname}'))
    AND status = 'accepted';`;

		db.query(sql, (err, data) => {
			if (err) {
				console.log("error finding friend");
				reject(err);
			}
			if (data.length == 1) {
				resolve(data[0].id);
			} else {
				console.log("Throwing Erro from getFriendshipId");
				reject(err);
			}
		});
	});
}

async function insertMessage(userId, displayname, message) {
	return new Promise((resolve, reject) => {
		// first find the id of the person with that displayname
		// second query insert the message to databse with the current timestamp send
		const now = new Date(message.timestamp)
			.toISOString()
			.slice(0, 19)
			.replace("T", " ");

		const idQuery = `SELECT id FROM users WHERE displayName='${displayname}'`;
		db.query(idQuery, (err, user) => {
			if (err) {
				reject(err);
			} else {
				if (user.length === 1) {
					const insert = `
					INSERT INTO chats 
						(user1Id, user2Id, authorId, content, timestamp) 
					VALUES(
						(LEAST(${userId}, ${user[0].id})), 
						(GREATEST(${userId}, ${user[0].id})), 
						${userId}, 
						'${message.content}', 
						NOW() 
					);`;

					db.query(insert, (err, data) => {
						if (err) {
							reject(err);
						} else {
							const lastInsertedRow = data.insertId;
							const lastRowSql = `SELECT * FROM chats WHERE id=${lastInsertedRow}`;
							db.query(
								lastRowSql,
								(lastRowError, lastRowResults) => {
									if (lastRowError) {
										console.log(lastRowError);
										reject(lastRowError);
									} else {
										resolve(lastRowResults);
									}
								},
							);
						}
					});
				} else {
					reject("Couldn't find user");
				}
			}
		});
	});
}

async function checkServerMember(user, serverId) {
	return new Promise((resolve, reject) => {
		const checkServerSql = `SELECT * FROM members WHERE serverId=${serverId} AND userId=${user};`;
		db.query(checkServerSql, (error, result) => {
			if (error) {
				console.error(error);
				console.error(
					"Error checking if server member in socketQueries",
				);
				reject("Error Checking member in socket Queries");
			} else {
				resolve(result.length !== 0);
			}
		});
	});
}

async function getDisplayName(user) {
	return new Promise((resolve, reject) => {
		const getDisplayNameSql = `SELECT displayName FROM users WHERE id=${user}`;
		db.query(getDisplayNameSql, (err, result) => {
			if (err) {
				console.log("Error getting display name");
				console.log(err);
				reject(err);
			} else {
				resolve(result[0].displayName);
			}
		});
	});
}

async function insertGroupMessage(userId, author, message, channelId) {
	return new Promise((resolve, reject) => {
		// first find the id of the person with that displayname
		// second query insert the message to databse with the current timestamp send

		const idQuery = `SELECT id FROM users WHERE displayName='${displayname}' AND id=${userId}`;
		db.query(idQuery, (err, user) => {
			if (err) {
				reject(err);
			} else {
				const insert = `
        INSERT INTO chats 
            (user1Id, user2Id, authorId, content, timestamp) 
        VALUES(
            (LEAST(${userId}, ${user[0].id})), 
            (GREATEST(${userId}, ${user[0].id})), 
            ${userId}, 
            '${message.content}', 
            '${now}' 
        );`;

				db.query(insert, (err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			}
		});
	});
}
module.exports = {
	getFriendshipId,
	insertMessage,
	checkServerMember,
	getDisplayName,
};
