const express = require("express");
const router = express.Router();
const { validateServerName, verifyJWT } = require("../services/utils");
const db = require("../config/databaseConfig");

//=====================//
//    Server Routes    //
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
    res.send({
      success: true,
    });
  });
});

module.exports = router;
