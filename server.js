const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const contactRoutes = require("./routes/contactRoutes");
const quoteRoutes = require("./routes/quoteRoutes");

dotenv.config();
connectDB();

const app = express();

// Allow ALL Origins
app.use(cors({ origin: "*" }));

// Body parser
app.use(express.json());

// API Routes
app.use("/api/contact", contactRoutes);
app.use("/api/quotes", quoteRoutes);

app.get("/", (req, res) => {
  res.send("Contact API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
