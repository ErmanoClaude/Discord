const express = require("express");
const router = express.Router();
const { validateServerName, verifyJWT } = require("../services/utils");
const db = require("../config/databaseConfig");

//=====================//
//    SERVER ROUTES    //
//=====================//

router.get("/servers", verifyJWT, (req, res) => {
  const sql = `SELECT id, name FROM servers WHERE ownerId = ${req.userId}
    UNION 
    SELECT s.id, s.name FROM servers s
    JOIN members m ON s.id = m.serverId
    WHERE m.userId = ${req.userId}`;

  db.query(sql, (err, data) => {
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
  const sql = `INSERT INTO servers (name, ownerId) VALUES ('${serverName}', ${req.userId})`;
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

  db.query(sql, (err, data) => {
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
        (${req.userId}, ${data.insertId})`;
    db.query(insertMemeber, (insertMemeberError, insertMemeberData) => {
      if (err) {
        console.log("Error in inserting owner to memebers");
        res.send({
          success: false,
          errors: [["Error in inserting owner to members"]],
        });
        return;
      }
    });

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
  const sql = `SELECT serverId FROM members WHERE userId=${user} AND serverId=${serverId}`;

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

  db.query(sql, (err, data) => {
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
      // insert Channel to the server

      const insertChannel = `
      INSERT INTO channels (serverId, name, type) 
      VALUES (${data[0].serverId}, '${channelName}', '${channelType}');`;
      console.log(insertChannel);

      db.query(insertChannel, (error, result) => {
        if (err || result === undefined) {
          res.send({
            success: false,
            errors: [["Error inserting channel in database in POST channel"]],
          });
        } else {
          res.send({
            success: true,
          });
        }
      });
    }
  });
});

// Returns all the channels of a given server
router.get("/channels/:serverId", verifyJWT, (req, res) => {
  const { serverId } = req.params;
  const user = req.userId;
  // make sure their apart of the the server their requesting channels from
  const sql = `SELECT serverId FROM members WHERE userId=${user} AND serverId=  ${serverId}`;

  db.query(sql, (error, results) => {
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
    SELECT name, type FROM channels WHERE serverId = ${results[0].serverId}`;

    db.query(channelsQuery, (err, data) => {
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

router.post("/serverInvite/:serverId/:receiver", verifyJWT, (req, res) => {
  const { serverId, receiver } = req.params;
  const user = req.userId;

  // Check if the receiver is a valid user
  const checkReceiverSql = `SELECT * FROM users WHERE displayName = ${receiver}`;

  db.query(checkReceiverSql, (errReceiver, dataReceiver) => {
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
    const checkMemberSql = `SELECT * FROM members WHERE userId = ${user} AND serverId = ${serverId}`;

    db.query(checkMemberSql, (err, data) => {
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
      const checkReceiverMembershipSql = `SELECT * FROM members WHERE userId = ${dataReceiver[0].id} AND serverId = ${serverId}`;

      db.query(
        checkReceiverMembershipSql,
        (errReceiverMembership, dataReceiverMembership) => {
          if (errReceiverMembership) {
            console.log("Error checking if receiver is already a member");
            console.log(errReceiverMembership);
            res.send({
              success: false,
              errors: [["Error checking if receiver is already a member"]],
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

          // At this point, the receiver is a valid user and not a member of the server

          const insertInviteSql = `INSERT INTO server_invitations (serverId, receiverId) VALUES
        (${serverId}, ${dataReceiver[0].id})`;

          db.query(insertInviteSql, (err, dataInvite) => {
            if (err) {
              console.log("Error inserting invite to database");
              console.log(err);
              res.send({
                success: false,
                errors: [["Error inserting invite to database"]],
              });
              return;
            }
            res.send({
              success: true,
            });
          });
        },
      );
    });
  });
});

// accept server invite
router.get("/serverInvite/:serverId", verifyJWT, (req, res) => {
  const { serverId } = req.params;
  const user = req.userId;

  // Check if user has a server_invite to this server
  const sql = `SELECT serverId FROM server_invitations WHERE receiverId=${req.userId} AND ${serverId}`;

  // Add user to the members table of that server then delete the server_invitation row
  const acceptInviteQuery = `INSERT INTO members (userId, serverid) VALUES (?, ?);
    DELETE FROM server_invitations WHERE receiverId=${req.userid} AND serverId=${serverId};`;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Error accepting invite");
      res.send({
        success: false,
        errors: [["Error Accepting invite to server"]],
      });
      return;
    }
    if (result.length == 1) {
      db.query(acceptInviteQuery, (error, inviteResult) => {
        if (err) {
          console.log("Error inserting user to server");
          console.log(err);
          res.send({
            success: false,
            errors: [["Couldn't insert you to this server."]],
          });
          return;
        }
        res.send({
          success: true,
        });
      });
    }
  });
});

module.exports = router;
