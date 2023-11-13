const express = require("express");
const { ExpressPeerServer } = require("peer");

const app = express();

app.get("/", (req, res) => {
	res.send("Hello for the peer js routes");
});

const server = app.listen(9000, () => {
	console.log("Peer server is running on port 9000");
});

// Create an ExpressPeerServer
const peerServer = ExpressPeerServer(server, {
	debug: true, // Set to true to enable debugging
});

// Add the ExpressPeerServer middleware
app.use("/peerjs", peerServer);

// Event listeners for Peer server
peerServer.on("connection", (client) => {
	console.log(`Client connected: ${client.getId()}`);
});

peerServer.on("disconnect", (client) => {
	console.log(`Client disconnected: ${client.getId()}`);
});
