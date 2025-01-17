const express = require("express");
const cors = require("cors");

const connectToMongoDB = require("./db")
const MenuRoutes = require("./routes/MenuRouter")
const app = express();

// Middleware for parsing JSON
app.use(express.json());
app.use(cors({
    origin: `${process.env.FRONTEND_URL}`, // Your frontend URL
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma"
    ],
    credentials: true,
  }));
  

app.use("/api", MenuRoutes)
connectToMongoDB();
// Example route
app.get("/", (req, res) => {
    res.send("Hello, world!");
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
