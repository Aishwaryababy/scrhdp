const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const { pool, supabase } = require("./db");

pool.query("ALTER TABLE hostels ADD COLUMN IF NOT EXISTS daily_rent NUMERIC(10,2);").catch(err => console.error("Auto-migration error:", err));

const app = express();


// Middleware

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.use("/uploads",express.static("uploads"));


// --------------------------
// Multer Storage
// --------------------------

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});


// --------------------------
// Home Route
// --------------------------

app.get("/",(req,res)=>{

    res.json({

        success:true,

        message:"SCRHDP Backend Running Successfully"

    });

});


// --------------------------
// Database Test
// --------------------------

app.get("/test-db",async(req,res)=>{

    try{

        const result=await pool.query("SELECT NOW()");

        res.json({

            success:true,

            time:result.rows[0]

        });

    }

    catch(error){

        res.status(500).json(error);

    }

});


// --------------------------
// Signup API
// --------------------------

app.post("/signup", async (req, res) => {

    try {

        const {
            username,
            password,
            role,
            full_name,
            owner_name,
            email,
            phone,
            gender,
            college,
            course,
            year,
            address,
            city,
            state,
            pincode,
            profile_image
        } = req.body;

        const normalizedUsername = (username || "").trim();
        const normalizedPassword = (password || "").trim();
        const normalizedRole = (role || "").toLowerCase() === "owner" ? "Owner" : "Student";

        if (!normalizedUsername || !normalizedPassword) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        const user = await pool.query(
            "SELECT * FROM login WHERE username=$1",
            [normalizedUsername]
        );

        if (user.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Username Already Exists"
            });
        }

        const hashPassword = await bcrypt.hash(normalizedPassword, 10);

        await pool.query(
            `INSERT INTO login (username, password, role, status)
            VALUES ($1, $2, $3, 'Active')`,
            [normalizedUsername, hashPassword, normalizedRole]
        );

        const cityName = (city || "Unknown").trim() || "Unknown";
        let cityResult = await pool.query(
            "SELECT city_id FROM cities WHERE city_name=$1",
            [cityName]
        );

        let cityId;

        if (cityResult.rows.length > 0) {
            cityId = cityResult.rows[0].city_id;
        } else {
            cityResult = await pool.query(
                "INSERT INTO cities (city_name) VALUES ($1) RETURNING city_id",
                [cityName]
            );
            cityId = cityResult.rows[0].city_id;
        }

        if (normalizedRole === "Student") {
            await pool.query(
                `INSERT INTO students (
                    username,
                    full_name,
                    email,
                    phone,
                    gender,
                    college,
                    course,
                    year,
                    address,
                    city_id,
                    state,
                    pincode,
                    profile_image
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [
                    normalizedUsername,
                    (full_name || "").trim(),
                    email || null,
                    phone || null,
                    gender || null,
                    college || null,
                    course || null,
                    year ? parseInt(year, 10) : null,
                    address || null,
                    cityId,
                    state || null,
                    pincode || null,
                    profile_image || null
                ]
            );
        } else {
            await pool.query(
                `INSERT INTO hostel_owners (
                    username,
                    owner_name,
                    email,
                    phone,
                    address,
                    city_id,
                    state,
                    pincode,
                    profile_image
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    normalizedUsername,
                    (owner_name || full_name || "").trim(),
                    email || null,
                    phone || null,
                    address || null,
                    cityId,
                    state || null,
                    pincode || null,
                    profile_image || null
                ]
            );
        }

        res.json({
            success: true,
            message: "Account Created Successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }

});


// --------------------------
// Login API
// --------------------------

app.post("/login",async(req,res)=>{

    try{

        const{

            username,

            password

        }=req.body;

        const user=await pool.query(

            "SELECT * FROM login WHERE username=$1",

            [username]

        );

        if(user.rows.length===0){

            return res.json({

                success:false,

                message:"User Not Found"

            });

        }

        const valid=await bcrypt.compare(

            password,

            user.rows[0].password

        );

        if(!valid){

            return res.json({

                success:false,

                message:"Invalid Password"

            });

        }

        const token=jwt.sign(

            {

                username:user.rows[0].username,

                role:user.rows[0].role

            },

            process.env.JWT_SECRET,

            {

                expiresIn:"1d"

            }

        );

        await pool.query(

            "UPDATE login SET last_login=NOW() WHERE username=$1",

            [username]

        );

        res.json({

            success:true,

            token,

            role:user.rows[0].role,

            username:user.rows[0].username

        });

    }

    catch(error){

        res.status(500).json(error);

    }

});


// --------------------------
// Profile API
// --------------------------

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

app.get("/profile", authenticateToken, async (req, res) => {
    try {
        const { username, role } = req.user;
        const loginRes = await pool.query(
            "SELECT username, role, status, created_at FROM login WHERE username = $1 OR LOWER(username) = LOWER($1)",
            [username]
        );
        if (loginRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        let profileData = {};
        if (role === "Student") {
            const studentRes = await pool.query(
                `SELECT s.*, c.city_name 
                 FROM students s
                 LEFT JOIN cities c ON s.city_id = c.city_id
                 WHERE s.username = $1 OR LOWER(s.username) = LOWER($1)`,
                [username]
            );
            if (studentRes.rows.length > 0) {
                profileData = studentRes.rows[0];
            } else {
                const newStudent = await pool.query(
                    `INSERT INTO students (username, full_name, email)
                     VALUES ($1, $2, $3)
                     RETURNING *`,
                    [username, username, `${username}@example.com`]
                );
                profileData = newStudent.rows[0] || {};
            }
        } else if (role === "Owner") {
            const ownerRes = await pool.query(
                `SELECT o.*, c.city_name 
                 FROM hostel_owners o
                 LEFT JOIN cities c ON o.city_id = c.city_id
                 WHERE o.username = $1 OR LOWER(o.username) = LOWER($1)`,
                [username]
            );
            if (ownerRes.rows.length > 0) {
                profileData = ownerRes.rows[0];
            } else {
                const newOwner = await pool.query(
                    `INSERT INTO hostel_owners (username, owner_name, email)
                     VALUES ($1, $2, $3)
                     RETURNING *`,
                    [username, username, `${username}@example.com`]
                );
                profileData = newOwner.rows[0] || {};
            }
        }
        res.json({
            success: true,
            user: loginRes.rows[0],
            profile: profileData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.put("/profile", authenticateToken, async (req, res) => {
    try {
        const { username, role } = req.user;
        const body = req.body;
        let cityId = null;
        if (body.city_name) {
            const cityName = body.city_name.trim();
            let cityRes = await pool.query("SELECT city_id FROM cities WHERE city_name = $1", [cityName]);
            if (cityRes.rows.length > 0) {
                cityId = cityRes.rows[0].city_id;
            } else {
                cityRes = await pool.query("INSERT INTO cities (city_name) VALUES ($1) RETURNING city_id", [cityName]);
                cityId = cityRes.rows[0].city_id;
            }
        }
        if (role === "Student") {
            await pool.query(
                `UPDATE students 
                 SET full_name = $1, email = $2, phone = $3, gender = $4, college = $5, 
                     course = $6, year = $7, address = $8, city_id = $9, state = $10, 
                     pincode = $11, profile_image = $12, updated_at = NOW()
                 WHERE username = $13`,
                [
                    body.full_name || "",
                    body.email || "",
                    body.phone || null,
                    body.gender || null,
                    body.college || null,
                    body.course || null,
                    body.year ? parseInt(body.year, 10) : null,
                    body.address || null,
                    cityId,
                    body.state || null,
                    body.pincode || null,
                    body.profile_image || null,
                    username
                ]
            );
        } else if (role === "Owner") {
            await pool.query(
                `UPDATE hostel_owners 
                 SET owner_name = $1, email = $2, phone = $3, address = $4, city_id = $5, 
                     state = $6, pincode = $7, profile_image = $8, updated_at = NOW()
                 WHERE username = $9`,
                [
                    body.owner_name || body.full_name || "",
                    body.email || "",
                    body.phone || null,
                    body.address || null,
                    cityId,
                    body.state || null,
                    body.pincode || null,
                    body.profile_image || null,
                    username
                ]
            );
        }
        res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


// --------------------------
// Dashboard API
// --------------------------

app.get("/dashboard/student", authenticateToken, async (req, res) => {
    try {
        const { username } = req.user;
        const studentRes = await pool.query("SELECT student_id FROM students WHERE username = $1", [username]);
        if (studentRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Student record not found" });
        }
        const studentId = studentRes.rows[0].student_id;

        const bookingsCount = await pool.query("SELECT COUNT(*) FROM bookings WHERE student_id = $1", [studentId]);
        const wishlistCount = await pool.query("SELECT COUNT(*) FROM wishlist WHERE student_id = $1", [studentId]);
        const reviewsCount = await pool.query("SELECT COUNT(*) FROM reviews WHERE student_id = $1", [studentId]);
        const notificationsCount = await pool.query("SELECT COUNT(*) FROM notifications WHERE username = $1 AND is_read = false", [username]);

        const bookingsList = await pool.query(
            `SELECT b.*, h.hostel_name, h.monthly_rent, h.daily_rent 
             FROM bookings b
             JOIN hostels h ON b.hostel_id = h.hostel_id
             WHERE b.student_id = $1
             ORDER BY b.created_at DESC`,
            [studentId]
        );

        // Fetch monthly expense data for the chart
        const expenseQuery = await pool.query(`
            SELECT to_char(p.created_at, 'Mon YYYY') as month, 
                   SUM(p.amount) as total_expense
            FROM payments p
            JOIN bookings b ON p.booking_id = b.booking_id
            WHERE b.student_id = $1 AND p.payment_status = 'Completed'
            GROUP BY to_char(p.created_at, 'Mon YYYY'), date_trunc('month', p.created_at)
            ORDER BY date_trunc('month', p.created_at) ASC
            LIMIT 12
        `, [studentId]);

        // Fetch booking status data for the pie chart / bar chart
        const statusQuery = await pool.query(`
            SELECT booking_status as status, COUNT(*) as count
            FROM bookings
            WHERE student_id = $1
            GROUP BY booking_status
        `, [studentId]);

        res.json({
            success: true,
            stats: {
                total_bookings: parseInt(bookingsCount.rows[0].count, 10),
                wishlist_count: parseInt(wishlistCount.rows[0].count, 10),
                reviews_count: parseInt(reviewsCount.rows[0].count, 10),
                unread_notifications: parseInt(notificationsCount.rows[0].count, 10)
            },
            expenseData: expenseQuery.rows.map(r => ({ ...r, total_expense: parseFloat(r.total_expense) })),
            bookingStatusData: statusQuery.rows.map(r => ({ ...r, count: parseInt(r.count, 10) })),
            bookings: bookingsList.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.get("/dashboard/owner", authenticateToken, async (req, res) => {
    try {
        const { username } = req.user;
        const ownerRes = await pool.query("SELECT owner_id FROM hostel_owners WHERE username = $1", [username]);
        if (ownerRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Hostel owner record not found" });
        }
        const ownerId = ownerRes.rows[0].owner_id;

        const hostelsCount = await pool.query("SELECT COUNT(*) FROM hostels WHERE owner_id = $1", [ownerId]);
        const bookingsCount = await pool.query(
            "SELECT COUNT(*) FROM bookings b JOIN hostels h ON b.hostel_id = h.hostel_id WHERE h.owner_id = $1",
            [ownerId]
        );
        const pendingBookingsCount = await pool.query(
            "SELECT COUNT(*) FROM bookings b JOIN hostels h ON b.hostel_id = h.hostel_id WHERE h.owner_id = $1 AND b.booking_status = 'Pending'",
            [ownerId]
        );
        const reviewsCount = await pool.query(
            "SELECT COUNT(*) FROM reviews r JOIN hostels h ON r.hostel_id = h.hostel_id WHERE h.owner_id = $1",
            [ownerId]
        );

        const hostelsList = await pool.query("SELECT * FROM hostels WHERE owner_id = $1 ORDER BY created_at DESC", [ownerId]);

        const bookingsList = await pool.query(
            `SELECT b.*, h.hostel_name, s.full_name as student_name, s.email as student_email, s.phone as student_phone 
             FROM bookings b
             JOIN hostels h ON b.hostel_id = h.hostel_id
             JOIN students s ON b.student_id = s.student_id
             WHERE h.owner_id = $1
             ORDER BY b.created_at DESC`,
            [ownerId]
        );

        res.json({
            success: true,
            stats: {
                total_hostels: parseInt(hostelsCount.rows[0].count, 10),
                total_bookings: parseInt(bookingsCount.rows[0].count, 10),
                pending_bookings: parseInt(pendingBookingsCount.rows[0].count, 10),
                reviews_count: parseInt(reviewsCount.rows[0].count, 10)
            },
            hostels: hostelsList.rows,
            bookings: bookingsList.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.put("/bookings/:id/status", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query(
            "UPDATE bookings SET booking_status = $1 WHERE booking_id = $2",
            [status, id]
        );
        res.json({ success: true, message: `Booking status updated to ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.get("/dashboard/admin", authenticateToken, async (req, res) => {
    try {
        const studentsCount = await pool.query("SELECT COUNT(*) FROM students");
        const ownersCount = await pool.query("SELECT COUNT(*) FROM hostel_owners");
        const hostelsCount = await pool.query("SELECT COUNT(*) FROM hostels");
        const pendingHostelsCount = await pool.query("SELECT COUNT(*) FROM hostels WHERE status = 'Pending'");
        const bookingsCount = await pool.query("SELECT COUNT(*) FROM bookings");
        const pendingBookingsCount = await pool.query("SELECT COUNT(*) FROM bookings WHERE booking_status = 'Pending'");
        const reviewsCount = await pool.query("SELECT COUNT(*) FROM reviews");

        const pendingHostels = await pool.query(
            `SELECT h.*, o.owner_name, o.email as owner_email, o.phone as owner_phone 
             FROM hostels h
             JOIN hostel_owners o ON h.owner_id = o.owner_id
             WHERE h.status = 'Pending'
             ORDER BY h.created_at DESC`
        );

        const usersList = await pool.query(
            "SELECT username, role, status, last_login, created_at FROM login ORDER BY created_at DESC"
        );

        res.json({
            success: true,
            stats: {
                total_students: parseInt(studentsCount.rows[0].count, 10),
                total_owners: parseInt(ownersCount.rows[0].count, 10),
                total_hostels: parseInt(hostelsCount.rows[0].count, 10),
                pending_hostels: parseInt(pendingHostelsCount.rows[0].count, 10),
                total_bookings: parseInt(bookingsCount.rows[0].count, 10),
                pending_bookings: parseInt(pendingBookingsCount.rows[0].count, 10),
                total_reviews: parseInt(reviewsCount.rows[0].count, 10)
            },
            pendingHostels: pendingHostels.rows,
            users: usersList.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.put("/hostels/:id/status", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query(
            "UPDATE hostels SET status = $1 WHERE hostel_id = $2",
            [status, id]
        );
        res.json({ success: true, message: `Hostel approval status updated to ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


// --------------------------
// ADMIN MANAGEMENT APIs
// --------------------------

// 1. Manage Students
app.get("/admin/students", authenticateToken, async (req, res) => {
    try {
        const search = req.query.search || "";
        const query = `
            SELECT s.*, l.status, c.city_name 
            FROM students s
            JOIN login l ON s.username = l.username
            LEFT JOIN cities c ON s.city_id = c.city_id
            WHERE s.full_name ILIKE $1 OR s.email ILIKE $1 OR s.username ILIKE $1
            ORDER BY s.student_id DESC
        `;
        const result = await pool.query(query, [`%${search}%`]);
        res.json({ success: true, students: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.put("/admin/students/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, gender, college, course, year, address } = req.body;
        await pool.query(
            `UPDATE students SET full_name=$1, email=$2, phone=$3, gender=$4, college=$5, course=$6, year=$7, address=$8, updated_at=NOW()
             WHERE student_id=$9`,
            [full_name, email, phone, gender, college, course, year ? parseInt(year, 10) : null, address, id]
        );
        res.json({ success: true, message: "Student updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.delete("/admin/students/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const studentRes = await pool.query("SELECT username FROM students WHERE student_id=$1", [id]);
        if (studentRes.rows.length > 0) {
            const username = studentRes.rows[0].username;
            await pool.query("DELETE FROM login WHERE username=$1", [username]);
        }
        res.json({ success: true, message: "Student deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 2. Manage Hostel Owners
app.get("/admin/owners", authenticateToken, async (req, res) => {
    try {
        const search = req.query.search || "";
        const query = `
            SELECT o.*, l.status, c.city_name 
            FROM hostel_owners o
            JOIN login l ON o.username = l.username
            LEFT JOIN cities c ON o.city_id = c.city_id
            WHERE o.owner_name ILIKE $1 OR o.email ILIKE $1 OR o.username ILIKE $1
            ORDER BY o.owner_id DESC
        `;
        const result = await pool.query(query, [`%${search}%`]);
        res.json({ success: true, owners: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.put("/admin/owners/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { owner_name, email, phone, address } = req.body;
        await pool.query(
            `UPDATE hostel_owners SET owner_name=$1, email=$2, phone=$3, address=$4, updated_at=NOW()
             WHERE owner_id=$5`,
            [owner_name, email, phone, address, id]
        );
        res.json({ success: true, message: "Owner updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.delete("/admin/owners/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const ownerRes = await pool.query("SELECT username FROM hostel_owners WHERE owner_id=$1", [id]);
        if (ownerRes.rows.length > 0) {
            const username = ownerRes.rows[0].username;
            await pool.query("DELETE FROM login WHERE username=$1", [username]);
        }
        res.json({ success: true, message: "Owner deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Block/Unblock Account
app.put("/admin/accounts/:username/status", authenticateToken, async (req, res) => {
    try {
        const { username } = req.params;
        const { status } = req.body; // 'Active' or 'Inactive'
        await pool.query("UPDATE login SET status=$1 WHERE username=$2", [status, username]);
        res.json({ success: true, message: `Account status updated to ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Reset Password
app.put("/admin/accounts/:username/password", authenticateToken, async (req, res) => {
    try {
        const { username } = req.params;
        const { password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        await pool.query("UPDATE login SET password=$1 WHERE username=$2", [hashPassword, username]);
        res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 3. Manage Hostels
app.get("/admin/hostels", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT h.*, o.owner_name, c.city_name 
            FROM hostels h
            JOIN hostel_owners o ON h.owner_id = o.owner_id
            LEFT JOIN cities c ON h.city_id = c.city_id
            ORDER BY h.hostel_id DESC
        `);
        res.json({ success: true, hostels: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.get("/admin/hostels/:id/details", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const images = await pool.query("SELECT * FROM hostel_images WHERE hostel_id=$1", [id]);
        const amenities = await pool.query("SELECT * FROM hostel_amenities WHERE hostel_id=$1", [id]);
        res.json({ success: true, images: images.rows, amenities: amenities.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.put("/admin/hostels/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { hostel_name, gender_allowed, sharing_type, address, location, monthly_rent, deposit, total_rooms, available_rooms, total_beds, available_beds, contact_number, hostel_rules, description } = req.body;
        await pool.query(
            `UPDATE hostels SET hostel_name=$1, gender_allowed=$2, sharing_type=$3, address=$4, location=$5, monthly_rent=$6, deposit=$7,
             total_rooms=$8, available_rooms=$9, total_beds=$10, available_beds=$11, contact_number=$12, hostel_rules=$13, description=$14, updated_at=NOW()
             WHERE hostel_id=$15`,
            [hostel_name, gender_allowed, sharing_type, address, location, monthly_rent, deposit, total_rooms, available_rooms, total_beds, available_beds, contact_number, hostel_rules, description, id]
        );
        res.json({ success: true, message: "Hostel updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.delete("/admin/hostels/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM hostels WHERE hostel_id=$1", [id]);
        res.json({ success: true, message: "Hostel deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.put("/admin/hostels/:id/verify", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { is_verified } = req.body;
        await pool.query("UPDATE hostels SET is_verified=$1 WHERE hostel_id=$2", [is_verified, id]);
        res.json({ success: true, message: `Hostel verification status updated` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 4. Manage Bookings
app.get("/admin/bookings", authenticateToken, async (req, res) => {
    try {
        const search = req.query.search || "";
        const query = `
            SELECT b.*, s.full_name as student_name, s.email as student_email, s.phone as student_phone, h.hostel_name, h.monthly_rent
            FROM bookings b
            JOIN students s ON b.student_id = s.student_id
            JOIN hostels h ON b.hostel_id = h.hostel_id
            WHERE s.full_name ILIKE $1 OR h.hostel_name ILIKE $1
            ORDER BY b.booking_id DESC
        `;
        const result = await pool.query(query, [`%${search}%`]);
        res.json({ success: true, bookings: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.put("/admin/bookings/:id/status", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { booking_status } = req.body;
        await pool.query("UPDATE bookings SET booking_status=$1 WHERE booking_id=$2", [booking_status, id]);
        res.json({ success: true, message: `Booking status updated to ${booking_status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.put("/admin/bookings/:id/payment", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;
        await pool.query("UPDATE bookings SET payment_status=$1 WHERE booking_id=$2", [payment_status, id]);
        res.json({ success: true, message: `Payment status updated to ${payment_status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 5. Manage Reviews
app.get("/admin/reviews", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, s.full_name as student_name, s.username as student_username, h.hostel_name
            FROM reviews r
            JOIN students s ON r.student_id = s.student_id
            JOIN hostels h ON r.hostel_id = h.hostel_id
            ORDER BY r.review_id DESC
        `);
        res.json({ success: true, reviews: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.delete("/admin/reviews/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM reviews WHERE review_id=$1", [id]);
        res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 6. Manage Wishlist
app.get("/admin/wishlist", authenticateToken, async (req, res) => {
    try {
        const wishlists = await pool.query(`
            SELECT w.*, s.full_name as student_name, h.hostel_name, h.average_rating, c.city_name
            FROM wishlist w
            JOIN students s ON w.student_id = s.student_id
            JOIN hostels h ON w.hostel_id = h.hostel_id
            LEFT JOIN cities c ON h.city_id = c.city_id
            ORDER BY w.wishlist_id DESC
        `);

        // Popular Hostels: order by number of times wishlisted
        const popular = await pool.query(`
            SELECT h.hostel_id, h.hostel_name, h.average_rating, h.wishlist_count, COUNT(w.wishlist_id) as wishlist_occurrences
            FROM hostels h
            LEFT JOIN wishlist w ON h.hostel_id = w.hostel_id
            GROUP BY h.hostel_id, h.hostel_name, h.average_rating, h.wishlist_count
            ORDER BY wishlist_occurrences DESC, h.average_rating DESC
            LIMIT 5
        `);

        res.json({ success: true, wishlist: wishlists.rows, popularHostels: popular.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 7. Notifications
app.get("/admin/notifications", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM notifications ORDER BY created_at DESC");
        res.json({ success: true, notifications: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.post("/admin/notifications", authenticateToken, async (req, res) => {
    try {
        const { username, notification_type, title, message } = req.body;
        // If username is "All", broadcast to all active logins
        if (username === "All") {
            const users = await pool.query("SELECT username FROM login");
            for (let u of users.rows) {
                await pool.query(
                    `INSERT INTO notifications (username, notification_type, title, message)
                     VALUES ($1, $2, $3, $4)`,
                    [u.username, notification_type, title, message]
                );
            }
        } else {
            await pool.query(
                `INSERT INTO notifications (username, notification_type, title, message)
                 VALUES ($1, $2, $3, $4)`,
                [username, notification_type, title, message]
            );
        }
        res.json({ success: true, message: "Notification sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.delete("/admin/notifications/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM notifications WHERE notification_id=$1", [id]);
        res.json({ success: true, message: "Notification deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 8. Cities
app.get("/admin/cities", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM cities ORDER BY city_name ASC");
        res.json({ success: true, cities: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.post("/admin/cities", authenticateToken, async (req, res) => {
    try {
        const { city_name } = req.body;
        const check = await pool.query("SELECT * FROM cities WHERE city_name=UPPER($1) OR city_name=$1", [city_name]);
        if (check.rows.length > 0) {
            return res.json({ success: false, message: "City already exists" });
        }
        await pool.query("INSERT INTO cities (city_name) VALUES ($1)", [city_name]);
        res.json({ success: true, message: "City added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.put("/admin/cities/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { city_name } = req.body;
        await pool.query("UPDATE cities SET city_name=$1 WHERE city_id=$2", [city_name, id]);
        res.json({ success: true, message: "City updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.delete("/admin/cities/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM cities WHERE city_id=$1", [id]);
        res.json({ success: true, message: "City deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 9. Login Accounts
app.get("/admin/accounts", authenticateToken, async (req, res) => {
    try {
        const roleFilter = req.query.role || "";
        let query = "SELECT username, role, status, last_login, created_at FROM login";
        let params = [];
        if (roleFilter) {
            query += " WHERE role = $1";
            params.push(roleFilter);
        }
        query += " ORDER BY created_at DESC";
        const result = await pool.query(query, params);
        res.json({ success: true, accounts: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 10. Reports
app.get("/admin/reports", authenticateToken, async (req, res) => {
    try {
        const studentsPerCity = await pool.query(`
            SELECT c.city_name, COUNT(s.student_id) as count 
            FROM cities c 
            LEFT JOIN students s ON c.city_id = s.city_id 
            GROUP BY c.city_name
            ORDER BY count DESC
        `);

        const hostelsPerCity = await pool.query(`
            SELECT c.city_name, COUNT(h.hostel_id) as count 
            FROM cities c 
            LEFT JOIN hostels h ON c.city_id = h.city_id 
            GROUP BY c.city_name
            ORDER BY count DESC
        `);

        const mostBooked = await pool.query(`
            SELECT h.hostel_name, COUNT(b.booking_id) as booking_count 
            FROM hostels h 
            JOIN bookings b ON h.hostel_id = b.hostel_id 
            GROUP BY h.hostel_name 
            ORDER BY booking_count DESC 
            LIMIT 5
        `);

        const highestRated = await pool.query(`
            SELECT hostel_name, average_rating 
            FROM hostels 
            ORDER BY average_rating DESC 
            LIMIT 5
        `);

        const bookingTrends = await pool.query(`
            SELECT booking_date, COUNT(*) as count 
            FROM bookings 
            GROUP BY booking_date 
            ORDER BY booking_date DESC 
            LIMIT 10
        `);

        res.json({
            success: true,
            reports: {
                studentsPerCity: studentsPerCity.rows,
                hostelsPerCity: hostelsPerCity.rows,
                mostBooked: mostBooked.rows,
                highestRated: highestRated.rows,
                bookingTrends: bookingTrends.rows
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


// --------------------------
// Upload Images (Strict Supabase Storage)
// --------------------------

app.post(
    "/upload",
    upload.array("images", 10),
    async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ success: false, message: "No files provided" });
            }

            if (!supabase) {
                return res.status(500).json({
                    success: false,
                    message: "Supabase Storage not configured. Please set SUPABASE_KEY in backend/.env"
                });
            }

            const bucketName = process.env.SUPABASE_BUCKET || "uploads";
            const uploadedFiles = [];

            for (const file of req.files) {
                const uniqueName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

                const { data, error } = await supabase.storage
                    .from(bucketName)
                    .upload(uniqueName, file.buffer, {
                        contentType: file.mimetype,
                        upsert: true
                    });

                if (error) {
                    console.error("Supabase Storage Upload Error:", error);
                    throw new Error(`Supabase Storage upload failed: ${error.message}`);
                }

                const { data: publicUrlData } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(uniqueName);

                const publicUrl = publicUrlData.publicUrl;

                uploadedFiles.push({
                    filename: publicUrl,
                    url: publicUrl,
                    path: publicUrl,
                    supabase: true
                });
            }

            res.json({
                success: true,
                files: uploadedFiles,
                urls: uploadedFiles.map(f => f.url)
            });
        } catch (err) {
            console.error("Upload error:", err);
            res.status(500).json({ success: false, message: err.message || "Upload failed" });
        }
    }
);


// --------------------------
// OWNER PORTAL APIs
// --------------------------

// Helpers
const getOwnerId = async (username) => {
    const res = await pool.query("SELECT owner_id FROM hostel_owners WHERE username = $1", [username]);
    if (res.rows.length === 0) throw new Error("Owner not found");
    return res.rows[0].owner_id;
};

// 1. Get Hostels
app.get("/owner/hostels", authenticateToken, async (req, res) => {
    try {
        const ownerId = await getOwnerId(req.user.username);
        const result = await pool.query(`
            SELECT h.*, c.city_name 
            FROM hostels h
            LEFT JOIN cities c ON h.city_id = c.city_id
            WHERE h.owner_id = $1
            ORDER BY h.hostel_id DESC
        `, [ownerId]);
        res.json({ success: true, hostels: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
});

// 2. Add Hostel
app.post("/owner/hostels", authenticateToken, async (req, res) => {
    try {
        const ownerId = await getOwnerId(req.user.username);
        const {
            hostel_name, city_name, gender_allowed, sharing_type, address, location,
            latitude, longitude, description, monthly_rent, daily_rent, deposit, total_rooms, available_rooms,
            total_beds, available_beds, contact_number, hostel_rules, hostel_logo
        } = req.body;

        // Resolve City ID
        const cityName = (city_name || "Unknown").trim();
        let cityRes = await pool.query("SELECT city_id FROM cities WHERE city_name = $1", [cityName]);
        let cityId;
        if (cityRes.rows.length > 0) {
            cityId = cityRes.rows[0].city_id;
        } else {
            cityRes = await pool.query("INSERT INTO cities (city_name) VALUES ($1) RETURNING city_id", [cityName]);
            cityId = cityRes.rows[0].city_id;
        }

        const parseVal = (val, isFloat = false) => {
            if (val === undefined || val === null || val === "" || isNaN(Number(val))) return 0;
            return isFloat ? parseFloat(val) : parseInt(val, 10);
        };

        const parseCoords = (val) => {
            if (val === undefined || val === null || val === "" || isNaN(Number(val))) return null;
            return parseFloat(val);
        };

        const result = await pool.query(`
            INSERT INTO hostels (
                owner_id, city_id, hostel_name, hostel_logo, gender_allowed, sharing_type,
                address, location, latitude, longitude, description, monthly_rent, daily_rent, deposit, total_rooms,
                available_rooms, total_beds, available_beds, contact_number, hostel_rules, status, is_verified
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'Pending', false)
            RETURNING *
        `, [
            ownerId, cityId, hostel_name, hostel_logo || null, gender_allowed, sharing_type,
            address || null, location || null, parseCoords(latitude), parseCoords(longitude), description || null, 
            parseVal(monthly_rent, true), parseVal(daily_rent, true), parseVal(deposit, true),
            parseVal(total_rooms), parseVal(available_rooms), 
            parseVal(total_beds), parseVal(available_beds),
            contact_number || null, hostel_rules || null
        ]);

        res.json({ success: true, hostel: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
});

// 3. Edit Hostel
app.put("/owner/hostels/:id", authenticateToken, async (req, res) => {
    try {
        const ownerId = await getOwnerId(req.user.username);
        const { id } = req.params;
        const {
            hostel_name, city_name, gender_allowed, sharing_type, address, location,
            latitude, longitude, description, monthly_rent, daily_rent, deposit, total_rooms, available_rooms,
            total_beds, available_beds, contact_number, hostel_rules, hostel_logo
        } = req.body;

        // Resolve City ID
        const cityName = (city_name || "Unknown").trim();
        let cityRes = await pool.query("SELECT city_id FROM cities WHERE city_name = $1", [cityName]);
        let cityId;
        if (cityRes.rows.length > 0) {
            cityId = cityRes.rows[0].city_id;
        } else {
            cityRes = await pool.query("INSERT INTO cities (city_name) VALUES ($1) RETURNING city_id", [cityName]);
            cityId = cityRes.rows[0].city_id;
        }

        const parseVal = (val, isFloat = false) => {
            if (val === undefined || val === null || val === "" || isNaN(Number(val))) return 0;
            return isFloat ? parseFloat(val) : parseInt(val, 10);
        };

        const parseCoords = (val) => {
            if (val === undefined || val === null || val === "" || isNaN(Number(val))) return null;
            return parseFloat(val);
        };

        const result = await pool.query(`
            UPDATE hostels SET
                hostel_name = $1, city_id = $2, hostel_logo = $3, gender_allowed = $4, sharing_type = $5,
                address = $6, location = $7, latitude = $8, longitude = $9, description = $10, 
                monthly_rent = $11, daily_rent = $12, deposit = $13, total_rooms = $14, available_rooms = $15, 
                total_beds = $16, available_beds = $17, contact_number = $18, hostel_rules = $19, updated_at = NOW()
            WHERE hostel_id = $20 AND owner_id = $21
            RETURNING *
        `, [
            hostel_name, cityId, hostel_logo || null, gender_allowed, sharing_type,
            address || null, location || null, parseCoords(latitude), parseCoords(longitude), description || null, 
            parseVal(monthly_rent, true), parseVal(daily_rent, true), parseVal(deposit, true),
            parseVal(total_rooms), parseVal(available_rooms), 
            parseVal(total_beds), parseVal(available_beds),
            contact_number || null, hostel_rules || null, id, ownerId
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Hostel not found or unauthorized" });
        }
        res.json({ success: true, hostel: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 4. Delete Hostel
app.delete("/owner/hostels/:id", authenticateToken, async (req, res) => {
    try {
        const ownerId = await getOwnerId(req.user.username);
        const { id } = req.params;
        const result = await pool.query("DELETE FROM hostels WHERE hostel_id = $1 AND owner_id = $2", [id, ownerId]);
        res.json({ success: true, message: "Hostel deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 5. Get Owner Images
app.get("/owner/images", authenticateToken, async (req, res) => {
    try {
        const ownerId = await getOwnerId(req.user.username);
        const result = await pool.query(`
            SELECT img.*, h.hostel_name 
            FROM hostel_images img
            JOIN hostels h ON img.hostel_id = h.hostel_id
            WHERE h.owner_id = $1
            ORDER BY img.image_id DESC
        `, [ownerId]);
        res.json({ success: true, images: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 6. Add Image
app.post("/owner/images", authenticateToken, async (req, res) => {
    try {
        const { hostel_id, image_title, image_path } = req.body;
        const ownerId = await getOwnerId(req.user.username);
        // Verify owner owns this hostel
        const hostelRes = await pool.query("SELECT * FROM hostels WHERE hostel_id = $1 AND owner_id = $2", [hostel_id, ownerId]);
        if (hostelRes.rows.length === 0) {
            return res.status(403).json({ success: false, message: "Unauthorized hostel assignment" });
        }
        const result = await pool.query(`
            INSERT INTO hostel_images (hostel_id, image_title, image_path)
            VALUES ($1, $2, $3) RETURNING *
        `, [hostel_id, image_title || null, image_path]);
        res.json({ success: true, image: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 7. Delete Image
app.delete("/owner/images/:id", authenticateToken, async (req, res) => {
    try {
        const ownerId = await getOwnerId(req.user.username);
        const { id } = req.params;
        const result = await pool.query(`
            DELETE FROM hostel_images 
            WHERE image_id = $1 AND hostel_id IN (SELECT hostel_id FROM hostels WHERE owner_id = $2)
        `, [id, ownerId]);
        res.json({ success: true, message: "Image deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 8. Get Amenities
app.get("/owner/amenities", authenticateToken, async (req, res) => {
    try {
        const ownerId = await getOwnerId(req.user.username);
        const result = await pool.query(`
            SELECT a.*, h.hostel_name 
            FROM hostel_amenities a
            JOIN hostels h ON a.hostel_id = h.hostel_id
            WHERE h.owner_id = $1
            ORDER BY a.id DESC
        `, [ownerId]);
        res.json({ success: true, amenities: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 9. Add Amenity
app.post("/owner/amenities", authenticateToken, async (req, res) => {
    try {
        const { hostel_id, amenity_name } = req.body;
        const ownerId = await getOwnerId(req.user.username);
        const hostelRes = await pool.query("SELECT * FROM hostels WHERE hostel_id = $1 AND owner_id = $2", [hostel_id, ownerId]);
        if (hostelRes.rows.length === 0) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        const result = await pool.query(`
            INSERT INTO hostel_amenities (hostel_id, amenity_name)
            VALUES ($1, $2) RETURNING *
        `, [hostel_id, amenity_name]);
        res.json({ success: true, amenity: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 10. Delete Amenity
app.delete("/owner/amenities/:id", authenticateToken, async (req, res) => {
    try {
        const ownerId = await getOwnerId(req.user.username);
        const { id } = req.params;
        await pool.query(`
            DELETE FROM hostel_amenities 
            WHERE id = $1 AND hostel_id IN (SELECT hostel_id FROM hostels WHERE owner_id = $2)
        `, [id, ownerId]);
        res.json({ success: true, message: "Amenity deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 11. Get Bookings
app.get("/owner/bookings", authenticateToken, async (req, res) => {
    try {
        const ownerId = await getOwnerId(req.user.username);
        const result = await pool.query(`
            SELECT b.*, h.hostel_name, s.full_name as student_name, s.email as student_email, s.phone as student_phone, s.profile_image, s.college as student_college, s.course as student_course, s.year as student_year, s.address as student_address, s.gender as student_gender
            FROM bookings b
            JOIN hostels h ON b.hostel_id = h.hostel_id
            JOIN students s ON b.student_id = s.student_id
            WHERE h.owner_id = $1
            ORDER BY b.booking_id DESC
        `, [ownerId]);
        res.json({ success: true, bookings: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 12. Get Reviews
app.get("/owner/reviews", authenticateToken, async (req, res) => {
    try {
        const ownerId = await getOwnerId(req.user.username);
        const result = await pool.query(`
            SELECT r.*, h.hostel_name, s.full_name as student_name
            FROM reviews r
            JOIN hostels h ON r.hostel_id = h.hostel_id
            JOIN students s ON r.student_id = s.student_id
            WHERE h.owner_id = $1
            ORDER BY r.review_id DESC
        `, [ownerId]);
        res.json({ success: true, reviews: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 13. Reply to Review
app.put("/owner/reviews/:id/reply", authenticateToken, async (req, res) => {
    try {
        const ownerId = await getOwnerId(req.user.username);
        const { id } = req.params;
        const { owner_reply } = req.body;
        const result = await pool.query(`
            UPDATE reviews SET owner_reply = $1
            WHERE review_id = $2 AND hostel_id IN (SELECT hostel_id FROM hostels WHERE owner_id = $3)
            RETURNING *
        `, [owner_reply, id, ownerId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Review not found or unauthorized" });
        }
        res.json({ success: true, review: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 14. Get Owner Notifications
app.get("/owner/notifications", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM notifications WHERE username = $1 ORDER BY created_at DESC", [req.user.username]);
        res.json({ success: true, notifications: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 15. Mark Read Notification
app.put("/owner/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE notifications SET is_read = true WHERE notification_id = $1 AND username = $2", [id, req.user.username]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 16. Change Password
app.put("/owner/change-password", authenticateToken, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        const userRes = await pool.query("SELECT password FROM login WHERE username = $1", [req.user.username]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const valid = await bcrypt.compare(current_password, userRes.rows[0].password);
        if (!valid) {
            return res.json({ success: false, message: "Invalid current password" });
        }
        const hash = await bcrypt.hash(new_password, 10);
        await pool.query("UPDATE login SET password = $1 WHERE username = $2", [hash, req.user.username]);
        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


// 17. Public/Student Get Approved Hostels
app.get("/hostels", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT h.*, COALESCE(o.owner_name, 'Hostel Owner') as owner_name, c.city_name 
            FROM hostels h
            LEFT JOIN hostel_owners o ON h.owner_id = o.owner_id
            LEFT JOIN cities c ON h.city_id = c.city_id
            WHERE h.status != 'Rejected' OR h.status IS NULL
            ORDER BY h.hostel_id DESC
        `);
        res.json({ success: true, hostels: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});



// --------------------------
// Student APIs
// --------------------------

const getStudentId = async (username) => {
    const res = await pool.query("SELECT student_id FROM students WHERE username = $1 OR LOWER(username) = LOWER($1)", [username]);
    if (res.rows.length > 0) return res.rows[0].student_id;
    
    const newStudent = await pool.query(
        "INSERT INTO students (username, full_name, email) VALUES ($1, $2, $3) RETURNING student_id",
        [username, username, `${username}@example.com`]
    );
    return newStudent.rows[0].student_id;
};

// 1. Wishlist operations
app.get("/student/wishlist", authenticateToken, async (req, res) => {
    try {
        const studentId = await getStudentId(req.user.username);
        const result = await pool.query(`
            SELECT w.wishlist_id, w.created_at as wishlisted_at, h.*, c.city_name
            FROM wishlist w
            JOIN hostels h ON w.hostel_id = h.hostel_id
            LEFT JOIN cities c ON h.city_id = c.city_id
            WHERE w.student_id = $1
            ORDER BY w.wishlist_id DESC
        `, [studentId]);
        res.json({ success: true, wishlist: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
});

app.post("/student/wishlist", authenticateToken, async (req, res) => {
    try {
        const studentId = await getStudentId(req.user.username);
        const { hostel_id } = req.body;
        // Check if already in wishlist
        const check = await pool.query("SELECT * FROM wishlist WHERE student_id = $1 AND hostel_id = $2", [studentId, hostel_id]);
        if (check.rows.length > 0) {
            return res.json({ success: false, message: "Hostel is already in your wishlist" });
        }
        const result = await pool.query(
            "INSERT INTO wishlist (student_id, hostel_id) VALUES ($1, $2) RETURNING *",
            [studentId, hostel_id]
        );
        // Increment wishlist count
        await pool.query("UPDATE hostels SET wishlist_count = wishlist_count + 1 WHERE hostel_id = $1", [hostel_id]);
        res.json({ success: true, wishlist: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
});

app.delete("/student/wishlist/:id", authenticateToken, async (req, res) => {
    try {
        const studentId = await getStudentId(req.user.username);
        const { id } = req.params;
        
        // Find hostel_id first to decrement count
        const wishlistRes = await pool.query("SELECT hostel_id FROM wishlist WHERE wishlist_id = $1 AND student_id = $2", [id, studentId]);
        if (wishlistRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Wishlist item not found" });
        }
        const hostelId = wishlistRes.rows[0].hostel_id;

        await pool.query("DELETE FROM wishlist WHERE wishlist_id = $1 AND student_id = $2", [id, studentId]);
        // Decrement wishlist count
        await pool.query("UPDATE hostels SET wishlist_count = GREATEST(0, wishlist_count - 1) WHERE hostel_id = $1", [hostelId]);
        res.json({ success: true, message: "Removed from wishlist" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 2. Bookings operations
app.get("/student/bookings", authenticateToken, async (req, res) => {
    try {
        const studentId = await getStudentId(req.user.username);
        const result = await pool.query(`
            SELECT b.*, h.hostel_name, h.monthly_rent, h.address as hostel_address, c.city_name,
                   p.transaction_id, p.amount as payment_amount, p.payment_method, p.created_at as payment_date
            FROM bookings b
            JOIN hostels h ON b.hostel_id = h.hostel_id
            LEFT JOIN cities c ON h.city_id = c.city_id
            LEFT JOIN payments p ON b.booking_id = p.booking_id
            WHERE b.student_id = $1
            ORDER BY b.created_at DESC
        `, [studentId]);
        res.json({ success: true, bookings: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
});

app.delete("/student/bookings/:id", authenticateToken, async (req, res) => {
    try {
        const studentId = await getStudentId(req.user.username);
        const { id } = req.params;
        const check = await pool.query(
            "SELECT * FROM bookings WHERE booking_id=$1 AND student_id=$2",
            [id, studentId]
        );
        if (check.rows.length === 0) {
            return res.json({ success: false, message: "Cannot cancel: booking not found." });
        }
        
        // If it's already rejected or cancelled, maybe just delete the record entirely so it disappears?
        // Let's actually delete the record from the database so they can "Delete" it from their view.
        await pool.query("DELETE FROM bookings WHERE booking_id=$1", [id]);
        res.json({ success: true, message: "Booking cancelled successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
});

app.post("/student/bookings", authenticateToken, async (req, res) => {
    try {
        const studentId = await getStudentId(req.user.username);
        const { hostel_id, joining_date, leaving_date, remarks } = req.body;
        
        // Check if pending booking already exists
        const check = await pool.query(
            "SELECT * FROM bookings WHERE student_id = $1 AND hostel_id = $2 AND booking_status = 'Pending'",
            [studentId, hostel_id]
        );
        if (check.rows.length > 0) {
            return res.json({ success: false, message: "You already have a pending booking request for this hostel." });
        }

        const result = await pool.query(`
            INSERT INTO bookings (student_id, hostel_id, joining_date, leaving_date, booking_status, payment_status, remarks)
            VALUES ($1, $2, $3, $4, 'Pending', 'Pending', $5)
            RETURNING *
        `, [studentId, hostel_id, joining_date || null, leaving_date || null, remarks || null]);

        // Insert notification for hostel owner
        const ownerRes = await pool.query("SELECT ho.username, h.hostel_name FROM hostels h JOIN hostel_owners ho ON h.owner_id = ho.owner_id WHERE h.hostel_id = $1", [hostel_id]);
        if (ownerRes.rows.length > 0) {
            const ownerUsername = ownerRes.rows[0].username;
            const hostelName = ownerRes.rows[0].hostel_name;
            await pool.query(`
                INSERT INTO notifications (username, notification_type, title, message)
                VALUES ($1, 'Booking', 'New Booking Request', $2)
            `, [ownerUsername, `A student has requested a booking at ${hostelName}.`]);
        }

        res.json({ success: true, booking: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
});

// 3. Reviews operations
app.get("/student/reviews", authenticateToken, async (req, res) => {
    try {
        const studentId = await getStudentId(req.user.username);
        const result = await pool.query(`
            SELECT r.*, h.hostel_name
            FROM reviews r
            JOIN hostels h ON r.hostel_id = h.hostel_id
            WHERE r.student_id = $1
            ORDER BY r.review_id DESC
        `, [studentId]);
        res.json({ success: true, reviews: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.post("/student/reviews", authenticateToken, async (req, res) => {
    try {
        const studentId = await getStudentId(req.user.username);
        const { hostel_id, rating, review_text } = req.body;

        // Check if student has an approved booking with a past leaving_date for this hostel
        const eligibility = await pool.query(`
            SELECT booking_id FROM bookings
            WHERE student_id = $1
              AND hostel_id = $2
              AND booking_status = 'Approved'
              AND leaving_date IS NOT NULL
              AND leaving_date <= CURRENT_DATE
        `, [studentId, hostel_id]);

        if (eligibility.rows.length === 0) {
            return res.status(403).json({ success: false, message: "You can only review hostels after your stay has ended (leaving date must have passed)." });
        }

        // Check if student already reviewed this hostel
        const existing = await pool.query(
            "SELECT review_id FROM reviews WHERE student_id = $1 AND hostel_id = $2",
            [studentId, hostel_id]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, message: "You have already reviewed this hostel." });
        }

        const result = await pool.query(`
            INSERT INTO reviews (hostel_id, student_id, rating, review)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [hostel_id, studentId, parseFloat(rating) || 5.0, review_text || ""]);

        // Recalculate average rating for hostel
        const ratingsRes = await pool.query("SELECT AVG(rating) as avg_rating FROM reviews WHERE hostel_id = $1", [hostel_id]);
        const newAvg = parseFloat(ratingsRes.rows[0].avg_rating) || 0.0;
        await pool.query("UPDATE hostels SET average_rating = $1 WHERE hostel_id = $2", [newAvg.toFixed(1), hostel_id]);

        res.json({ success: true, review: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
});

app.put("/student/reviews/:id", authenticateToken, async (req, res) => {
    try {
        const studentId = await getStudentId(req.user.username);
        const { rating, review_text } = req.body;
        const reviewId = req.params.id;

        // Verify ownership
        const existing = await pool.query("SELECT * FROM reviews WHERE review_id = $1 AND student_id = $2", [reviewId, studentId]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Review not found or unauthorized." });
        }

        const hostel_id = existing.rows[0].hostel_id;

        const result = await pool.query(`
            UPDATE reviews 
            SET rating = $1, review = $2
            WHERE review_id = $3 AND student_id = $4
            RETURNING *
        `, [parseFloat(rating) || 5.0, review_text || "", reviewId, studentId]);

        // Recalculate average rating for hostel
        const ratingsRes = await pool.query("SELECT AVG(rating) as avg_rating FROM reviews WHERE hostel_id = $1", [hostel_id]);
        const newAvg = parseFloat(ratingsRes.rows[0].avg_rating) || 0.0;
        await pool.query("UPDATE hostels SET average_rating = $1 WHERE hostel_id = $2", [newAvg.toFixed(1), hostel_id]);

        res.json({ success: true, review: result.rows[0], message: "Review updated successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
});

// Get hostels eligible for review (approved booking with past leaving_date, not yet reviewed)
app.get("/student/reviewable-hostels", authenticateToken, async (req, res) => {
    try {
        const studentId = await getStudentId(req.user.username);
        const result = await pool.query(`
            SELECT DISTINCT h.hostel_id, h.hostel_name, h.hostel_logo, b.leaving_date
            FROM bookings b
            JOIN hostels h ON b.hostel_id = h.hostel_id
            WHERE b.student_id = $1
              AND b.booking_status = 'Approved'
              AND b.leaving_date IS NOT NULL
              AND b.leaving_date <= CURRENT_DATE
              AND h.hostel_id NOT IN (
                  SELECT hostel_id FROM reviews WHERE student_id = $1
              )
            ORDER BY b.leaving_date DESC
        `, [studentId]);
        res.json({ success: true, hostels: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 4. Notifications operations
app.get("/student/notifications", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM notifications WHERE username = $1 ORDER BY created_at DESC",
            [req.user.username]
        );
        res.json({ success: true, notifications: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.put("/student/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
        await pool.query(
            "UPDATE notifications SET is_read = true WHERE notification_id = $1 AND username = $2",
            [req.params.id, req.user.username]
        );
        res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 5. Change Password
app.post("/student/change-password", authenticateToken, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        const username = req.user.username;

        const userRes = await pool.query("SELECT * FROM login WHERE username = $1", [username]);
        if (userRes.rows.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }
        const user = userRes.rows[0];

        if (user.password !== current_password) {
            return res.json({ success: false, message: "Current password is incorrect" });
        }

        await pool.query("UPDATE login SET password = $1 WHERE username = $2", [new_password, username]);
        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


// Payments Endpoint
app.post("/student/payments", authenticateToken, async (req, res) => {
    try {
        const { booking_id, amount, payment_method, transaction_id } = req.body;
        console.log("PAYMENT REQUEST RECEIVED:", req.body);
        
        // Insert payment record
        await pool.query(`
            INSERT INTO payments (booking_id, amount, payment_method, transaction_id, payment_status)
            VALUES ($1, $2, $3, $4, 'Completed')
        `, [booking_id, amount, payment_method, transaction_id]);
        
        console.log("PAYMENT INSERTED SUCCESSFULLY");

        // Update booking payment status
        await pool.query(`
            UPDATE bookings
            SET payment_status = 'Paid'
            WHERE booking_id = $1
        `, [booking_id]);

        res.json({ success: true, message: "Payment processed successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
});

// --------------------------
// Server
// --------------------------

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server Running On Port ${PORT}`);
    });
}

module.exports = app;