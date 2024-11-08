const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Secret key for JWT
const JWT_SECRET = "your_jwt_secret_key_here";

// In-memory user data (use a database like MongoDB in production)
const users = [];

// Middleware
app.use(bodyParser.json());

// Helper function to find a user by username
function findUserByUsername(username) {
  return users.find((user) => user.username === username);
}

// Register endpoint
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Check if username already exists
  if (findUserByUsername(username)) {
    return res.status(400).json({ error: "User already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user (in a database in production)
  users.push({ username, password: hashedPassword });
  console.log("users: ", users);

  res.status(201).json({ message: "User registered successfully" });
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Find user
  const user = findUserByUsername(username);
  if (!user) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

  res.json({ message: "Login successful", token });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
