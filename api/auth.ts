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
  role: String, // Add role field if not already present
});
const User = mongoose.model("User", userSchema, "users"); // Explicitly specify the collection name

// Signup route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newUser = new User({ name, email, password });
    await newUser.save(); // Inserts into the "users" collection
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate email errorEmail already exists" });
      res.status(400).json({ error: "Email already exists" });
    } else {atus(500).json({ error: "Internal server error" });
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
// Login route
// Login routein", async (req, res) => {
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {st user = await User.findOne({ email });
    const user = await User.findOne({ email }); // Queries the "users" collection
    if (!user || user.password !== password) {valid credentials" });
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Generate a session token
    // Generate a session tokenandom().toString(36).substring(2);
    const sessionToken = Math.random().toString(36).substring(2);
    user.sessionToken = sessionToken;
    await user.save();
    res.status(200).json({ message: "Login successful", sessionToken });
    res.status(200).json({ message: "Login successful", sessionToken });
  } catch (error) {.json({ error: "Internal server error" });
    res.status(500).json({ error: "Internal server error" });
  }
});
// Middleware to check session token
// Middleware to check session token, next) => {
const authenticate = async (req, res, next) => {
  const { email, sessionToken } = req.body;sessionToken });
  const user = await User.findOne({ email, sessionToken });
  if (!user) {.status(401).json({ error: "Unauthorized" });
    return res.status(401).json({ error: "Unauthorized" });
  }ext();
  next();
};
// Logout route
// Logout routeut", authenticate, async (req, res) => {
app.post("/logout", authenticate, async (req, res) => {
  const { email } = req.body;
  try {st user = await User.findOne({ email });
    const user = await User.findOne({ email });
    user.sessionToken = null;
    await user.save();on({ message: "Logged out successfully" });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {.json({ error: "Internal server error" });
    res.status(500).json({ error: "Internal server error" });
  }
});
// Route to add sample user
// Route to add sample user, async (req, res) => {
app.post("/add-sample-user", async (req, res) => {
  try {st sampleUser = {
    const sampleUser = {",
      name: "Sample User",xample.com",
      email: "sampleuser@example.com",
      password: "password123",
      role: "user", null,
      sessionToken: null,
    };
    const existingUser = await User.findOne({ email: sampleUser.email });
    const existingUser = await User.findOne({ email: sampleUser.email });
    if (existingUser) {(400).json({ error: "User already exists" });
      return res.status(400).json({ error: "User already exists" });
    }
    const newUser = new User(sampleUser);
    const newUser = new User(sampleUser);
    await newUser.save();{ message: "Sample user added successfully" });
    res.status(201).json({ message: "Sample user added successfully" });
  } catch (error) {.json({ error: "Failed to add sample user" });
    res.status(500).json({ error: "Failed to add sample user" });
  }
});
// Health check route
// Health check routeync (req, res) => {
app.get("/health", async (req, res) => {
  try {Check MongoDB connection state
    // Check MongoDB connection statection.readyState;
    const mongoState = mongoose.connection.readyState;ecting", "Disconnecting"];
    const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
    res.status(200).json({
      status: "OK",on: states[mongoState] || "Unknown",
      mongoConnection: states[mongoState] || "Unknown",
    });ch (error) {
  } catch (error) {.json({ status: "Error", error: error.message });
    res.status(500).json({ status: "Error", error: error.message });
  }
});
// Start the server
// Start the server => {
app.listen(3001, () => {PI running on http://localhost:3001");
  console.log("Backend API running on http://localhost:3001");
});