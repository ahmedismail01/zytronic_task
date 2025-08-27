require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const corsConfig = require("./config/cors");
const connectDB = require("./config/database");
const establishSocket = require("./socket");
const routes = require("./routes");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

const app = express();
const server = http.createServer(app);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const io = require("socket.io")(server, {
  cors: corsConfig,
});

connectDB();
app.use(morgan("dev"));
app.use(cors(corsConfig));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api", routes);
app.use("/api/upload", require("./routes/upload.routes"));

establishSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
