const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const contactRoutes = require("./routes/contactRoutes");
const quoteRoutes = require("./routes/quoteRoutes");
const authRoutes = require("./routes/authRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const blogRoutes = require("./routes/blogRoutes");
const commentRoutes = require("./routes/commentRoutes");

dotenv.config();
connectDB();

const app = express();

// Allow ALL Origins
app.use(cors({ origin: "*" }));

// Body parser with increased limit for profile pictures
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use("/api/auth", require("./routes/authRoutes"));


// API Routes
console.log('Mounting contact routes at /api/contact');
app.use("/api/contact", contactRoutes);
console.log('Contact routes mounted successfully');
console.log('Mounting quote routes at /api/quotes');
app.use("/api/quotes", quoteRoutes);
console.log('Quote routes mounted successfully');
console.log('Mounting auth routes at /api/auth');
app.use("/api/auth", authRoutes);
console.log('Auth routes mounted successfully');
console.log('Mounting settings routes at /api/settings');
app.use("/api/settings", settingsRoutes);
console.log('Settings routes mounted successfully');
console.log('Mounting blog routes at /api/blog');
app.use("/api/blog", blogRoutes);
console.log('Blog routes mounted successfully');
console.log('Mounting comment routes at /api/comments');
app.use("/api/comments", commentRoutes);
console.log('Comment routes mounted successfully');

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.json({ message: "Contact API is running...", authRoutes: "mounted at /api/auth" });
});

// Add a debug route to check if auth routes are working
app.get("/api/test-auth", (req, res) => {
  console.log("Test auth route accessed");
  res.json({ message: "Auth routes are accessible" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
