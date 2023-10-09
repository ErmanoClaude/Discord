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
};
