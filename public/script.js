// Login functionality
document.getElementById("login-btn").addEventListener("click", function () {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert(data.message);
                document.getElementById("login-form").style.display = "none";
                document.getElementById("register-form").style.display = "block";
                fetchRegisteredCourses(data.studentId);
            } else {
                alert(data.message);
            }
        });
});

// Sign-up functionality
document.getElementById("signup-btn").addEventListener("click", function () {
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
        .then((response) => response.json())
        .then((data) => {
            alert(data.message);
            if (data.success) {
                document.getElementById("signup-form").reset();
            }
        });
});

// Fetch and display registered courses
function fetchRegisteredCourses(studentId) {
    fetch(`/registered-courses/${studentId}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                const coursesContainer = document.getElementById("courses-container");
                coursesContainer.innerHTML = "<h3>Your Registered Courses:</h3>";
                data.courses.forEach((course) => {
                    const courseItem = document.createElement("div");
                    courseItem.textContent = `Course Name: ${course.course_name}, Time Slot: ${course.time_slot}`;
                    coursesContainer.appendChild(courseItem);
                });
            }
        });
}

// Registration functionality
document.getElementById("register-btn").addEventListener("click", function () {
    const studentId = document.getElementById("student-id").value;
    const courseId = document.getElementById("course-id").value;
    const timeSlot = document.getElementById("time-slot").value;

    fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, courseId, timeSlot }),
    })
        .then((response) => response.json())
        .then((data) => {
            alert(data.message);
            if (data.success) {
                fetchRegisteredCourses(studentId);
            }
        });
});



