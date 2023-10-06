const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const JWT = require("jsonwebtoken");

// Routes
const authRoutes = require("./routes/auth");
const serverChannelRoutes = require("./routes/ServersChannel");
const friendsRoutes = require("./routes/friends");

// json() to parse body
app.use(express.json());

// dotenv config for .env
require("dotenv").config();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true, // Allows cookie to be enabled
  }),
);

// Parse cookies when returned
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Set cache-control headers to no-store middleware
// so cant go back to request that is being sent to front end
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(
  session({
    key: "userId",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24 * 10, // 10 days of saving cooke
    },
  }),
);

// connect to DB
const db = require("./config/databaseConfig");

// Routes
app.use("/", authRoutes);
app.use("/", serverChannelRoutes);
app.use("/", friendsRoutes);

const server = app.listen(5000, function () {
  console.log("Server started on port 5000");

  // Connect to the data base
  db.connect(function (err) {
    if (err) {
      console.log("Failed to connect to database.");
      throw err;
    }
    console.log("Database connected");
  });
});

// Connect user to webSocket socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true, // Allows cookie to be enabled
  },
});

// Authenticate middle for socket.
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  JWT.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication Error"));
    }

    socket.userId = decoded.userId;
    next();
  });
});

io.on("connection", async (socket) => {
  console.log(`${socket.userId} is connected to the server`);
});
