import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(cors({
  origin: ["http://localhost:3000", "https://your-frontend-url.vercel.app"], // Replace with your frontend URLs
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
})); // Ensure CORS is enabled
app.use(bodyParser.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true, // Enables the new connection management engine
  maxPoolSize: 10, // Maintain up to 10 socket connections
})
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit if MongoDB connection fails
  });

// User schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  sessionToken: String, // To restrict access to one device
});
const User = mongoose.model("User", userSchema);

// Signup route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate email error
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a session token
    const sessionToken = Math.random().toString(36).substring(2);
    user.sessionToken = sessionToken;
    await user.save();

    res.status(200).json({ message: "Login successful", sessionToken });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Middleware to check session token
const authenticate = async (req, res, next) => {
  const { email, sessionToken } = req.body;
  const user = await User.findOne({ email, sessionToken });
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Logout route
app.post("/logout", authenticate, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    user.sessionToken = null;
    await user.save();
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check route
app.get("/health", async (req, res) => {
  try {
    // Check MongoDB connection state
    const mongoState = mongoose.connection.readyState;
    const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
    res.status(200).json({
      status: "OK",
      mongoConnection: states[mongoState] || "Unknown",
    });
  } catch (error) {
    res.status(500).json({ status: "Error", error: error.message });
  }
});

// Start the server
app.listen(3001, () => {
  console.log("Backend API running on http://localhost:3001");
});
