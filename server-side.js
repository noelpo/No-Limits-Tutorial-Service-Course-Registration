require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable or default to 3000

// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(express.static("public"));

// MySQL Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost", // Use default localhost if DB_HOST is not set
    user: process.env.DB_USER || "root",      // Default user is 'root'
    password: process.env.DB_PASSWORD || "",  // Default password is empty
    database: process.env.DB_NAME || "",      // Default to an empty database name
    port: process.env.DB_PORT || 3306         // Use default MySQL port 3306
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err.message);
        return;
    }
    console.log("Connected to MySQL database!");
});

// Login endpoint
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const query = "SELECT * FROM students WHERE username = ? AND password = ?";
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            res.status(500).json({ success: false, message: "Database error." });
            return;
        }

        if (results.length > 0) {
            res.json({ success: true, message: "Login successful!", studentId: results[0].id });
        } else {
            res.json({ success: false, message: "Invalid username or password." });
        }
    });
});

// Sign-up endpoint
app.post("/signup", (req, res) => {
    const { username, password } = req.body;

    const query = "INSERT INTO students (username, password) VALUES (?, ?)";
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            res.status(500).json({ success: false, message: "Username already exists or other error." });
            return;
        }

        res.json({ success: true, message: "Sign-up successful! You can now log in." });
    });
});

// Registration endpoint
app.post("/register", (req, res) => {
    const { studentId, courseId, timeSlot } = req.body;

    const checkQuery = "SELECT * FROM registrations WHERE course_id = ? AND time_slot = ?";
    db.query(checkQuery, [courseId, timeSlot], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            res.status(500).json({ success: false, message: "Database error." });
            return;
        }

        if (results.length > 0) {
            res.json({ success: false, message: "Time slot is already taken for this course." });
        } else {
            const insertQuery = "INSERT INTO registrations (student_id, course_id, time_slot) VALUES (?, ?, ?)";
            db.query(insertQuery, [studentId, courseId, timeSlot], (err, results) => {
                if (err) {
                    console.error("Database error:", err.message);
                    res.status(500).json({ success: false, message: "Database error." });
                    return;
                }

                res.json({ success: true, message: "Registration successful!" });
            });
        }
    });
});

// Fetch registered courses for a student
app.get("/registered-courses/:studentId", (req, res) => {
    const studentId = req.params.studentId;

    const query = `
        SELECT registrations.course_id, courses.course_name, registrations.time_slot
        FROM registrations
        JOIN courses ON registrations.course_id = courses.id
        WHERE registrations.student_id = ?`;

    db.query(query, [studentId], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            res.status(500).json({ success: false, message: "Database error." });
            return;
        }

        res.json({ success: true, courses: results });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
