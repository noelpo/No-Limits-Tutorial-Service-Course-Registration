const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
require("dotenv").config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static("public"));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost", // Use environment variable or fallback to localhost
    user: process.env.DB_USER || "root", // Use environment variable or fallback to 'root'
    password: process.env.DB_PASSWORD || "vgairlvnoa?!$", // Use environment variable or fallback to an empty password
    database: process.env.DB_NAME || "course_registrationn", // Use environment variable or fallback to default DB name
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }
    console.log("Connected to the database!");
});

// Endpoints

// Sign up endpoint
app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;
    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(query, [username, email, password], (err, result) => {
        if (err) {
            console.error("Error inserting user:", err.message);
            return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "User signed up successfully!" });
    });
});

// Login endpoint
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error("Error fetching user:", err.message);
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length > 0) {
            res.json({ message: "Login successful!", user: results[0] });
        } else {
            res.status(401).json({ message: "Invalid username or password" });
        }
    });
});

// Register for a course
app.post("/register", (req, res) => {
    const { student_id, course_id, time_slot } = req.body;
    const query = "INSERT INTO registrations (student_id, course_id, time_slot) VALUES (?, ?, ?)";
    db.query(query, [student_id, course_id, time_slot], (err, result) => {
        if (err) {
            console.error("Error registering for course:", err.message);
            return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "Course registered successfully!" });
    });
});

// Fetch registered courses for a student
app.get("/courses/:student_id", (req, res) => {
    const student_id = req.params.student_id;
    const query = `
        SELECT courses.name AS course_name, registrations.time_slot
        FROM registrations
        INNER JOIN courses ON registrations.course_id = courses.id
        WHERE registrations.student_id = ?
    `;
    db.query(query, [student_id], (err, results) => {
        if (err) {
            console.error("Error fetching courses:", err.message);
            return res.status(500).json({ message: "Database error" });
        }
        res.json({ courses: results });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
