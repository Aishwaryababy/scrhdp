import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useConfirm } from "../context/ConfirmContext";
import API from "../config/api";

function Admin() {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeItem, setActiveItem] = useState("Dashboard");
    const [username, setUsername] = useState("");
    const [time, setTime] = useState(new Date());
    const [loading, setLoading] = useState(true);

    // Statistics
    const [stats, setStats] = useState({
        total_students: 0,
        total_owners: 0,
        total_hostels: 0,
        pending_hostels: 0,
        total_bookings: 0,
        pending_bookings: 0,
        total_reviews: 0
    });

    // Data lists
    const [students, setStudents] = useState([]);
    const [owners, setOwners] = useState([]);
    const [hostels, setHostels] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [popularHostels, setPopularHostels] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [cities, setCities] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [reportsData, setReportsData] = useState(null);

    // Search and filters
    const [studentSearch, setStudentSearch] = useState("");
    const [ownerSearch, setOwnerSearch] = useState("");
    const [bookingSearch, setBookingSearch] = useState("");
    const [reviewHostelFilter, setReviewHostelFilter] = useState("");
    const [reviewStudentFilter, setReviewStudentFilter] = useState("");
    const [accountRoleFilter, setAccountRoleFilter] = useState("");

    // Modals / Editing states
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editStudentForm, setEditStudentForm] = useState(null);

    const [selectedOwner, setSelectedOwner] = useState(null);
    const [editOwnerForm, setEditOwnerForm] = useState(null);

    const [selectedHostel, setSelectedHostel] = useState(null);
    const [hostelDetails, setHostelDetails] = useState({ images: [], amenities: [] });
    const [editHostelForm, setEditHostelForm] = useState(null);

    const [cityForm, setCityForm] = useState({ city_id: null, city_name: "" });

    const [notificationForm, setNotificationForm] = useState({
        username: "All",
        notification_type: "System",
        title: "",
        message: ""
    });

    const [resetPasswordUsername, setResetPasswordUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [fullScreenImage, setFullScreenImage] = useState(null);

    const token = localStorage.getItem("token");

    // Menu Configuration
    const menuItems = [
        { name: "Dashboard", icon: "bi-speedometer2", accent: "#2563eb" },
        { name: "Manage Students", icon: "bi-people", accent: "#3b82f6" },
        { name: "Hostel Owners", icon: "bi-building", accent: "#d97706" },
        { name: "Manage Hostels", icon: "bi-house-heart", accent: "#10b981" },
        { name: "Manage Cities", icon: "bi-geo-alt", accent: "#0d9488" },
    ];

    useEffect(() => {
        const role = localStorage.getItem("role");
        const user = localStorage.getItem("username");
        if (!token || role !== "Admin") {
            navigate("/login");
            return;
        }
        setUsername(user || "Admin");
        fetchDashboardData();
        fetchNotifications();
    }, [token, navigate]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!token) return;
        if (activeItem === "Manage Students") fetchStudents();
        else if (activeItem === "Hostel Owners") fetchOwners();
        else if (activeItem === "Manage Hostels") fetchHostels();
        else if (activeItem === "Manage Bookings") fetchBookings();
        else if (activeItem === "Manage Reviews") fetchReviews();
        else if (activeItem === "Manage Wishlist") fetchWishlist();
        else if (activeItem === "Notifications") fetchNotifications();
        else if (activeItem === "Manage Cities") fetchCities();
        else if (activeItem === "Login Accounts") fetchAccounts();
        else if (activeItem === "Reports") fetchReports();
    }, [activeItem, studentSearch, ownerSearch, bookingSearch, accountRoleFilter]);

    const showMessage = (msg) => {
        toast.success(msg);
    };

    const getProfileImageUrl = (path) => {
        if (!path || path === "null" || path === "undefined" || path.trim() === "") {
            return null;
        }
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        const cleanPath = path.replace(/\\/g, "/");
        if (cleanPath.startsWith("uploads/")) {
            return `${API}/${cleanPath}`;
        } else if (cleanPath.startsWith("/uploads/")) {
            return `${API}${cleanPath}`;
        }
        return `${API}/uploads/${cleanPath}`;
    };

    // --- API Fetch ---
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API}/dashboard/admin`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const resData = await response.json();
            if (resData.success) {
                setStats(resData.stats);
            } else {
                showMessage(resData.message || "Failed to load dashboard statistics");
            }
        } catch (error) {
            console.error(error);
            showMessage("Server error loading dashboard stats.");
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await fetch(`${API}/admin/students?search=${studentSearch}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) setStudents(res.students);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchOwners = async () => {
        try {
            const response = await fetch(`${API}/admin/owners?search=${ownerSearch}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) setOwners(res.owners);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHostels = async () => {
        try {
            const response = await fetch(`${API}/admin/hostels`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) setHostels(res.hostels);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHostelDetails = async (hostelId) => {
        try {
            const response = await fetch(`${API}/admin/hostels/${hostelId}/details`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
                setHostelDetails({
                    images: res.images,
                    amenities: res.amenities
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await fetch(`${API}/admin/bookings?search=${bookingSearch}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) setBookings(res.bookings);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await fetch(`${API}/admin/reviews`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) setReviews(res.reviews);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchWishlist = async () => {
        try {
            const response = await fetch(`${API}/admin/wishlist`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
                setWishlist(res.wishlist);
                setPopularHostels(res.popularHostels);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${API}/admin/notifications`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) setNotifications(res.notifications);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCities = async () => {
        try {
            const response = await fetch(`${API}/admin/cities`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) setCities(res.cities);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAccounts = async () => {
        try {
            const response = await fetch(`${API}/admin/accounts?role=${accountRoleFilter}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) setAccounts(res.accounts);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReports = async () => {
        try {
            const response = await fetch(`${API}/admin/reports`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) setReportsData(res.reports);
        } catch (err) {
            console.error(err);
        }
    };

    // --- Action Handlers ---
    const handleToggleUserStatus = async (user_username, currentStatus) => {
        const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
        if (!await confirm({ title: "Toggle User Status", message: `Are you sure you want to ${nextStatus === "Inactive" ? "deactivate" : "activate"} user ${user_username}?`, confirmText: `Yes, ${nextStatus === "Inactive" ? "Deactivate" : "Activate"}`, variant: nextStatus === "Inactive" ? "danger" : "primary" })) return;
        try {
            const response = await fetch(`${API}/admin/accounts/${user_username}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: nextStatus })
            });
            const res = await response.json();
            if (res.success) {
                showMessage(`User ${user_username} status set to ${nextStatus}`);
                if (activeItem === "Manage Students") fetchStudents();
                else if (activeItem === "Hostel Owners") fetchOwners();
                else if (activeItem === "Login Accounts") fetchAccounts();
            } else {
                showMessage(res.message);
            }
        } catch (error) {
            console.error(error);
            showMessage("Error updating user status.");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword) return;
        if (!await confirm({ title: "Reset Password", message: "Are you sure you want to reset the password?", confirmText: "Yes, Reset Password", variant: "warning" })) return;
        try {
            const response = await fetch(`${API}/admin/accounts/${resetPasswordUsername}/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ password: newPassword })
            });
            const res = await response.json();
            if (res.success) {
                showMessage(`Password reset successfully for user: ${resetPasswordUsername}`);
                setResetPasswordUsername("");
                setNewPassword("");
            } else {
                showMessage(res.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        if (!await confirm({ title: "Update Student", message: "Are you sure you want to update this student?", confirmText: "Yes, Update", variant: "primary" })) return;
        try {
            const response = await fetch(`${API}/admin/students/${editStudentForm.student_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(editStudentForm)
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Student profile updated successfully");
                setEditStudentForm(null);
                fetchStudents();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (!await confirm({ title: "Delete Student Profile", message: "Delete this student profile?", confirmText: "Yes, Delete", variant: "danger" })) return;
        try {
            const response = await fetch(`${API}/admin/students/${studentId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Student deleted successfully");
                fetchStudents();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateOwner = async (e) => {
        e.preventDefault();
        if (!await confirm({ title: "Update Owner Profile", message: "Are you sure you want to update this owner?", confirmText: "Yes, Update", variant: "primary" })) return;
        try {
            const response = await fetch(`${API}/admin/owners/${editOwnerForm.owner_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(editOwnerForm)
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Owner profile updated successfully");
                setEditOwnerForm(null);
                fetchOwners();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteOwner = async (ownerId) => {
        if (!await confirm({ title: "Delete Owner Account", message: "Delete owner? Hostels under them will be removed.", confirmText: "Yes, Delete Owner", variant: "danger" })) return;
        try {
            const response = await fetch(`${API}/admin/owners/${ownerId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Owner deleted successfully");
                fetchOwners();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateHostelApprovalStatus = async (hostelId, newStatus) => {
        if (!await confirm({ title: "Update Hostel Approval Status", message: `Are you sure you want to update hostel approval status to ${newStatus}?`, confirmText: `Yes, Set to ${newStatus}`, variant: newStatus === "Approved" ? "primary" : "danger" })) return;
        try {
            const response = await fetch(`${API}/hostels/${hostelId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const res = await response.json();
            if (res.success) {
                showMessage(`Hostel approved status updated to: ${newStatus}`);
                fetchHostels();
                fetchDashboardData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleHostelVerification = async (hostelId, currentVerify) => {
        if (!await confirm({ title: "Toggle Verification", message: "Are you sure you want to toggle verification?", confirmText: "Yes, Toggle", variant: "warning" })) return;
        try {
            const response = await fetch(`${API}/admin/hostels/${hostelId}/verify`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ is_verified: !currentVerify })
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Verification state updated successfully");
                fetchHostels();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateHostel = async (e) => {
        e.preventDefault();
        if (!await confirm({ title: "Update Hostel", message: "Are you sure you want to update hostel details?", confirmText: "Yes, Save Details", variant: "primary" })) return;
        try {
            const response = await fetch(`${API}/admin/hostels/${editHostelForm.hostel_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(editHostelForm)
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Hostel details updated");
                setEditHostelForm(null);
                fetchHostels();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteHostel = async (hostelId) => {
        if (!await confirm({ title: "Delete Hostel", message: "Delete this hostel?", confirmText: "Yes, Delete", variant: "danger" })) return;
        try {
            const response = await fetch(`${API}/admin/hostels/${hostelId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Hostel deleted successfully");
                fetchHostels();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateBookingStatus = async (bookingId, status) => {
        if (!await confirm({ title: "Update Booking Status", message: `Are you sure you want to update booking status to ${status}?`, confirmText: `Yes, Set to ${status}`, variant: status === "Approved" ? "primary" : "danger" })) return;
        try {
            const response = await fetch(`${API}/admin/bookings/${bookingId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ booking_status: status })
            });
            const res = await response.json();
            if (res.success) {
                showMessage(`Booking status set to ${status}`);
                fetchBookings();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateBookingPayment = async (bookingId, status) => {
        if (!await confirm({ title: "Update Payment Status", message: `Are you sure you want to update payment status to ${status}?`, confirmText: `Yes, Set to ${status}`, variant: status === "Paid" ? "primary" : "warning" })) return;
        try {
            const response = await fetch(`${API}/admin/bookings/${bookingId}/payment`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ payment_status: status })
            });
            const res = await response.json();
            if (res.success) {
                showMessage(`Payment status set to ${status}`);
                fetchBookings();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!await confirm({ title: "Delete Review", message: "Delete this review?", confirmText: "Yes, Delete", variant: "danger" })) return;
        try {
            const response = await fetch(`${API}/admin/reviews/${reviewId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Review deleted successfully");
                fetchReviews();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API}/admin/notifications`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(notificationForm)
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Notification dispatched successfully");
                setNotificationForm({ username: "All", notification_type: "System", title: "", message: "" });
                fetchNotifications();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteNotification = async (notifId) => {
        if (!await confirm({ title: "Delete Notification", message: "Are you sure you want to delete this notification?", confirmText: "Yes, Delete", variant: "danger" })) return;
        try {
            const response = await fetch(`${API}/admin/notifications/${notifId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Notification removed");
                fetchNotifications();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleApplyPresetNotification = (type, title, message) => {
        setNotificationForm({
            ...notificationForm,
            notification_type: type,
            title: title,
            message: message
        });
    };

    const handleSaveCity = async (e) => {
        e.preventDefault();
        if (!await confirm({ title: "Save City", message: "Are you sure you want to save this city?", confirmText: "Yes, Save", variant: "primary" })) return;
        try {
            let url = `${API}/admin/cities`;
            let method = "POST";
            if (cityForm.city_id) {
                url = `${API}/admin/cities/${cityForm.city_id}`;
                method = "PUT";
            }
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ city_name: cityForm.city_name })
            });
            const res = await response.json();
            if (res.success) {
                showMessage(cityForm.city_id ? "City updated successfully" : "City added successfully");
                setCityForm({ city_id: null, city_name: "" });
                fetchCities();
            } else {
                showMessage(res.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCity = async (cityId) => {
        if (!await confirm({ title: "Delete City", message: "Delete city?", confirmText: "Yes, Delete", variant: "danger" })) return;
        try {
            const response = await fetch(`${API}/admin/cities/${cityId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
                showMessage("City deleted");
                fetchCities();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMenuClick = (itemName) => {
        setActiveItem(itemName);
        setMobileOpen(false);
    };

    const formatTime = (d) =>
        d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const formatDate = (d) =>
        d.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

    const activeMenu = menuItems.find((m) => m.name === activeItem) || menuItems[0];

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        navigate("/login");
    };

    // Calculate details rates
    const bookingApprovalRate = stats.total_bookings > 0
        ? Math.round(((stats.total_bookings - stats.pending_bookings) / stats.total_bookings) * 100)
        : 0;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #f6f9ff 0%, #eef4ff 100%)", color: "#0f172a", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
                
                :root {
                    --sb-w: 260px;
                    --sb-col: 74px;
                    --sb-hover: rgba(37, 99, 235, 0.06);
                    --bdr: rgba(15, 23, 42, 0.08);
                    --sh1: 0 1px 3px rgba(15, 23, 42, 0.05);
                    --sh2: 0 10px 25px rgba(15, 23, 42, 0.05);
                }

                .cit-sidebar {
                    width: var(--sb-w);
                    min-height: 100vh;
                    position: fixed; top: 0; left: 0;
                    display: flex; flex-direction: column;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(18px);
                    z-index: 1050;
                    transition: width 0.3s cubic-bezier(.4,0,.2,1);
                    overflow: hidden;
                    box-shadow: 4px 0 24px rgba(15, 23, 42, 0.03);
                    border-right: 1px solid var(--bdr);
                }
                .cit-sidebar.col { width: var(--sb-col); }

                .sb-brand {
                    display: flex; align-items: center; gap: 12px;
                    padding: 0 18px;
                    min-height: 68px;
                    background: rgba(255, 255, 255, 0.95);
                    border-bottom: 1px solid var(--bdr);
                    flex-shrink: 0;
                    position: relative;
                }
                .sb-logo {
                    width: 38px; height: 38px; border-radius: 12px;
                    background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 18px; color: #ffffff;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
                    flex-shrink: 0;
                }
                .sb-brand-text { white-space: nowrap; }
                .sb-name {
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 800; font-size: 15.5px; color: #2563eb;
                }
                .sb-sub {
                    font-size: 8px; color: #475569;
                    text-transform: uppercase; letter-spacing: 2px; font-weight: 700;
                    opacity: 0.8;
                }
                .sb-collapse-btn {
                    position: absolute; right: 12px;
                    width: 24px; height: 24px; border-radius: 6px;
                    background: rgba(15, 23, 42, 0.03);
                    border: 1px solid rgba(15, 23, 42, 0.06);
                    color: #475569;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all .2s;
                }
                .sb-collapse-btn:hover { background: rgba(37, 99, 235, 0.08); color: #2563eb; border-color: rgba(37, 99, 235, 0.15); }

                .sb-nav { flex: 1; overflow-y: auto; padding: 10px 0; }
                .sb-nav-item {
                    display: flex; align-items: center; gap: 11px;
                    margin: 2px 10px; padding: 9px 12px;
                    border-radius: 10px; cursor: pointer;
                    color: #475569; font-size: 13px; font-weight: 500;
                    transition: all 0.2s cubic-bezier(.4,0,.2,1);
                    white-space: nowrap; overflow: hidden;
                    border: 1px solid transparent;
                    position: relative;
                }
                .sb-nav-item::before {
                    content: "";
                    position: absolute; left: 0; top: 25%; bottom: 25%;
                    width: 3px; border-radius: 0 3px 3px 0;
                    background: transparent;
                    transition: all 0.2s;
                }
                .sb-nav-item .ni-icon {
                    width: 30px; height: 30px; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 14px; flex-shrink: 0;
                    background: rgba(15, 23, 42, 0.03);
                    transition: all .2s;
                    border: 1px solid rgba(15, 23, 42, 0.05);
                }
                .sb-nav-item:hover {
                    background: var(--sb-hover);
                    color: #2563eb;
                    transform: translateX(2px);
                }
                .sb-nav-item.active {
                    color: #2563eb;
                    font-weight: 600;
                }
                .sb-nav-item.active::before {
                    background: #2563eb;
                    box-shadow: 2px 0 8px rgba(37, 99, 235, 0.4);
                }

                .sb-divider { height: 1px; background: var(--bdr); margin: 8px 14px; }
                .sb-logout {
                    display: flex; align-items: center; gap: 11px;
                    margin: 4px 10px 18px; padding: 9px 12px;
                    border-radius: 10px; cursor: pointer;
                    color: #ef4444; font-size: 12.5px; font-weight: 500;
                    transition: all .2s; white-space: nowrap; overflow: hidden;
                    border: 1px solid transparent;
                }
                .sb-logout .ni-icon { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); font-size: 14px; color: #ef4444; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .sb-logout:hover { background: rgba(239, 68, 68, 0.08); transform: translateX(2px); }

                .cit-main {
                    margin-left: var(--sb-w);
                    flex: 1; display: flex; flex-direction: column;
                    min-width: 0;
                    transition: margin-left 0.3s cubic-bezier(.4,0,.2,1);
                }
                .cit-main.col { margin-left: var(--sb-col); }

                .cit-topbar {
                    position: sticky; top: 0; z-index: 1000;
                    height: 68px;
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0 28px;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(18px);
                    border-bottom: 1px solid var(--bdr);
                    box-shadow: 0 2px 12px rgba(15, 23, 42, 0.02);
                }
                .tb-left { display: flex; align-items: center; gap: 18px; }
                .tb-breadcrumb { display: flex; flex-direction: column; gap: 1px; }
                .tb-eyebrow {
                    font-size: 9px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700;
                    color: #2563eb; display: flex; align-items: center; gap: 5px; opacity: 0.8;
                }
                .tb-eyebrow-dot { width: 4px; height: 4px; border-radius: 50%; background: #2563eb; display: inline-block; }
                .tb-title {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 18px; font-weight: 700; color: #0f172a;
                    line-height: 1.2; letter-spacing: -.3px;
                }
                .tb-right { display: flex; align-items: center; gap: 12px; }
                .clock-blk {
                    display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
                    padding: 4px 12px; background: rgba(15, 23, 42, 0.02);
                    border: 1px solid rgba(15, 23, 42, 0.04); border-radius: 10px;
                }
                .clock-t { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; color: #0f172a; }
                .clock-d { font-size: 9px; color: #2563eb; font-weight: 600; opacity: 0.85; }

                .sys-live {
                    display: flex; align-items: center; gap: 7px;
                    padding: 6px 12px; border-radius: 20px;
                    background: rgba(16, 185, 129, 0.08);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    font-size: 10px; font-weight: 700; color: #059669;
                    letter-spacing: .5px; text-transform: uppercase;
                }
                .live-dot {
                    width: 7px; height: 7px; border-radius: 50%; background: #10b981;
                    animation: blink 2s infinite;
                }
                @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:.4;} }

                .tb-icon-btn {
                    width: 36px; height: 36px; border-radius: 9px;
                    background: rgba(15, 23, 42, 0.02);
                    border: 1px solid rgba(15, 23, 42, 0.05);
                    color: #475569; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all .2s; position: relative; font-size: 14px;
                }
                .tb-icon-btn:hover { background: rgba(37, 99, 235, 0.08); color: #2563eb; border-color: rgba(37, 99, 235, 0.15); }
                
                .tb-avatar-wrap {
                    display: flex; align-items: center; gap: 9px;
                    padding: 4px 12px 4px 4px; background: rgba(15, 23, 42, 0.02);
                    border: 1px solid rgba(15, 23, 42, 0.05); border-radius: 12px;
                    cursor: pointer; transition: all .25s;
                }
                .tb-avatar-wrap:hover { border-color: rgba(37, 99, 235, 0.2); background: rgba(37, 99, 235, 0.04); }
                .tb-avatar {
                    width: 32px; height: 32px; border-radius: 8px;
                    background: linear-gradient(135deg, #2563eb, #3b82f6);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 14px; color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .tb-uname { font-size: 12px; font-weight: 700; color: #0f172a; }
                .tb-urole { font-size: 8px; color: #475569; letter-spacing: 1px; text-transform: uppercase; font-weight: 600; }
                .tb-mob-btn {
                    display: none; width: 36px; height: 36px; border-radius: 9px;
                    background: rgba(15, 23, 42, 0.03); border: 1px solid rgba(15, 23, 42, 0.05);
                    color: #475569; cursor: pointer; font-size: 18px;
                    align-items: center; justify-content: center;
                }

                .cit-content { flex: 1; padding: 24px; overflow-y: auto; max-height: calc(100vh - 68px); }

                .mob-overlay {
                    display: none; position: fixed; inset: 0;
                    background: rgba(0,0,0,.4); z-index: 1040;
                }

                /* ── COMPONENT-LEVEL CONTAINER STYLES (PIDRS MATCH) ── */
                .mu-outer-container {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    width: 100%;
                    padding: 24px;
                    background: #ffffff;
                    border-radius: 30px;
                    box-shadow: 0 8px 32px rgba(15, 23, 42, 0.02);
                    box-sizing: border-box;
                    animation: fadeEntrance 0.5s ease-out;
                    border: 1px solid var(--bdr);
                }
                @keyframes fadeEntrance {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .mu-banner {
                    background: #2563eb;
                    background-image: 
                        linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
                    border-radius: 32px 12px 32px 12px;
                    padding: 22px 28px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 12px 40px rgba(37, 99, 235, 0.15);
                    color: #ffffff;
                }
                .mu-banner::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-image: 
                        linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
                    background-size: 15px 15px;
                    pointer-events: none;
                }
                .mu-banner-content {
                    position: relative;
                    z-index: 2;
                }
                .mu-banner-title {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 24px;
                    font-weight: 850;
                    margin: 0;
                    letter-spacing: -0.5px;
                    color: #ffffff;
                }
                .mu-banner-subtitle {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.95);
                    margin: 4px 0 0;
                    font-weight: 500;
                }

                .mu-stats-grid {
                    display: flex;
                    gap: 12px;
                    z-index: 2;
                }
                .mu-stat-card {
                    background: rgba(255, 255, 255, 0.06);
                    backdrop-filter: blur(8px);
                    border-radius: 12px 4px 12px 4px;
                    padding: 8px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }
                .mu-stat-icon-container {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    background: rgba(255, 255, 255, 0.15);
                    color: #ffffff;
                }
                .mu-stat-details {
                    display: flex;
                    flex-direction: column;
                }
                .mu-stat-label {
                    font-size: 8px;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.6);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .mu-stat-value {
                    font-size: 16px;
                    font-weight: 850;
                    color: #ffffff;
                    font-family: 'Space Grotesk', sans-serif;
                }

                /* Control/Search Action Bar */
                .mu-control-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                }
                .mu-search-wrapper {
                    position: relative;
                    flex-grow: 1;
                    max-width: 400px;
                }
                .mu-search-wrapper i {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #2563eb;
                    font-size: 14px;
                }
                .mu-search-input {
                    width: 100%;
                    padding: 8px 12px 8px 36px;
                    border-radius: 10px;
                    border: 1.5px solid #e2e8f0;
                    font-size: 13px;
                    color: #0f172a;
                    background: #ffffff;
                    transition: all 0.2s ease;
                }
                .mu-search-input:focus {
                    border-color: #2563eb;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
                }
                .mu-btn-add {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                }
                .mu-btn-add:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                }

                /* Custom Grid Tables */
                .mu-table-card-wrapper {
                    border: 1px solid var(--bdr);
                    border-radius: 16px;
                    overflow: hidden;
                    background: #ffffff;
                    box-shadow: var(--sh1);
                }
                .mu-header-bar {
                    background: #f8fafc;
                    padding: 12px 20px;
                    border-bottom: 2px solid #e2e8f0;
                    font-size: 10px;
                    font-weight: 750;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }
                .mu-user-card-row {
                    background: #ffffff;
                    padding: 14px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    transition: all 0.2s;
                }
                .mu-user-card-row:last-child {
                    border-bottom: none;
                }
                .mu-user-card-row:hover {
                    background: rgba(37, 99, 235, 0.02);
                }

                .mu-avatar {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    color: #ffffff;
                    font-weight: 700;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-transform: uppercase;
                    background: linear-gradient(135deg, #2563eb, #3b82f6);
                }

                .mu-id-badge {
                    background: #f1f5f9;
                    color: #475569;
                    border: 1px solid #e2e8f0;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 11px;
                    font-weight: 700;
                }

                .badge-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                }

                @media (max-width: 991px) {
                    .cit-sidebar { transform: translateX(-100%); width: var(--sb-w) !important; }
                    .cit-sidebar.mob-open { transform: translateX(0); }
                    .cit-main, .cit-main.col { margin-left: 0 !important; }
                    .mob-overlay.show { display: block; }
                    .tb-mob-btn { display: flex !important; }
                    .sb-collapse-btn { display: none; }
                    .clock-blk { display: none; }
                    .cit-content { padding: 16px; }
                }
            `}</style>

            {/* Mobile overlay */}
            <div className={`mob-overlay ${mobileOpen ? "show" : ""}`} onClick={() => setMobileOpen(false)} />

            {/* Collapsible Sidebar */}
            <aside className={`cit-sidebar ${collapsed ? "col" : ""} ${mobileOpen ? "mob-open" : ""}`}>
                <div className="sb-brand">
                    <div className="sb-logo" onClick={collapsed ? () => setCollapsed(false) : undefined} style={collapsed ? { cursor: "pointer" } : {}}>
                        <i className="bi bi-shield-lock-fill"></i>
                    </div>
                    {!collapsed && (
                        <div className="sb-brand-text">
                            <div className="sb-name">SCRHDP</div>
                            <div className="sb-sub">Admin Console</div>
                        </div>
                    )}
                    {!collapsed && (
                        <button className="sb-collapse-btn" onClick={() => setCollapsed(true)} title="Collapse sidebar">
                            <i className="bi bi-chevron-double-left"></i>
                        </button>
                    )}
                </div>

                <nav className="sb-nav">
                    {menuItems.map((item, i) => {
                        const isActive = activeItem === item.name;
                        return (
                            <div
                                key={i}
                                className={`sb-nav-item ${isActive ? "active" : ""}`}
                                title={collapsed ? item.name : ""}
                                onClick={() => handleMenuClick(item.name)}
                                style={{
                                    ...(collapsed ? { justifyContent: "center", padding: "10px 0" } : {}),
                                    ...(isActive ? {
                                        background: `${item.accent}12`,
                                        border: `1px solid ${item.accent}20`,
                                        color: item.accent,
                                    } : {}),
                                }}
                            >
                                <div className="ni-icon" style={isActive ? { background: `${item.accent}18`, color: item.accent } : {}}>
                                    <i className={`bi ${item.icon}`}></i>
                                </div>
                                {!collapsed && <span>{item.name}</span>}
                            </div>
                        );
                    })}
                </nav>

                <div className="sb-divider" />
                <div className="sb-logout" onClick={logout} title={collapsed ? "Logout" : ""} style={collapsed ? { justifyContent: "center", padding: "10px 0" } : {}}>
                    <div className="ni-icon"><i className="bi bi-box-arrow-right"></i></div>
                    {!collapsed && <span>Logout</span>}
                </div>
            </aside>

            {/* Main Shell */}
            <div className={`cit-main ${collapsed ? "col" : ""}`}>
                {/* Topbar */}
                <header className="cit-topbar">
                    <div className="tb-left">
                        <button className="tb-mob-btn" onClick={() => setMobileOpen(p => !p)}>
                            <i className="bi bi-list"></i>
                        </button>
                        <div className="tb-breadcrumb">
                            <div className="tb-eyebrow">
                                <span className="tb-eyebrow-dot"></span>
                                Admin Console
                            </div>
                            <div className="tb-title" style={{ color: activeMenu.accent }}>{activeItem}</div>
                        </div>
                    </div>

                    <div className="tb-right">
                        <div className="clock-blk">
                            <div className="clock-t">{formatTime(time)}</div>
                            <div className="clock-d">{formatDate(time)}</div>
                        </div>
                        <div className="sys-live">
                            <span className="live-dot"></span>
                            <span>Live</span>
                        </div>

                        {/* Notifications Broadcast Link */}
                        <button
                            className="tb-icon-btn"
                            onClick={() => setActiveItem("Notifications")}
                            title="Broadcast Notifications"
                            style={activeItem === "Notifications" ? { color: "#6366f1", background: "rgba(99, 102, 241, 0.1)", borderColor: "rgba(99, 102, 241, 0.2)" } : {}}
                        >
                            <i className="bi bi-bell"></i>
                        </button>

                        <div className="tb-avatar-wrap">
                            <div className="tb-avatar"><i className="bi bi-person-fill"></i></div>
                            <div className="d-none d-md-block">
                                <div className="tb-uname">{username}</div>
                                <div className="tb-urole">Global Admin</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="cit-content">

                    {/* 📊 DASHBOARD VIEW */}
                    {activeItem === "Dashboard" && (
                        <div className="mu-outer-container">
                            {/* HUD Banner */}
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Welcome back, {username}! 👋</h1>
                                    <p className="mu-banner-subtitle">Configure cities, register Listings, check bookings, and monitor user logins.</p>
                                </div>
                                <div className="mu-stats-grid">
                                    <div className="mu-stat-card">
                                        <div className="mu-stat-icon-container"><i className="bi bi-people-fill"></i></div>
                                        <div className="mu-stat-details">
                                            <div className="mu-stat-label">Students</div>
                                            <div className="mu-stat-value">{stats.total_students}</div>
                                        </div>
                                    </div>
                                    <div className="mu-stat-card">
                                        <div className="mu-stat-icon-container"><i className="bi bi-building"></i></div>
                                        <div className="mu-stat-details">
                                            <div className="mu-stat-label">Owners</div>
                                            <div className="mu-stat-value">{stats.total_owners}</div>
                                        </div>
                                    </div>
                                    <div className="mu-stat-card">
                                        <div className="mu-stat-icon-container"><i className="bi bi-house-door-fill"></i></div>
                                        <div className="mu-stat-details">
                                            <div className="mu-stat-label">Hostels</div>
                                            <div className="mu-stat-value">{stats.total_hostels}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* KPI Details Grid */}
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <div className="kpi-card h-100">
                                        <div>
                                            <span className="text-muted small text-uppercase">Pending Listings</span>
                                            <h3 className="fw-bold text-danger mt-1 mb-0">{stats.pending_hostels}</h3>
                                            <span className="text-muted small" style={{ fontSize: "0.7rem" }}>Awaiting review</span>
                                        </div>
                                        <div className="kpi-icon-wrapper kpi-yellow"><i className="bi bi-exclamation-triangle-fill"></i></div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="kpi-card h-100">
                                        <div>
                                            <span className="text-muted small text-uppercase">Total Bookings</span>
                                            <h3 className="fw-bold text-dark mt-1 mb-0">{stats.total_bookings}</h3>
                                            <span className="text-muted small" style={{ fontSize: "0.7rem" }}>Reservations</span>
                                        </div>
                                        <div className="kpi-icon-wrapper kpi-blue"><i className="bi bi-calendar-range"></i></div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="kpi-card h-100">
                                        <div>
                                            <span className="text-muted small text-uppercase">Pending Bookings</span>
                                            <h3 className="fw-bold text-warning mt-1 mb-0">{stats.pending_bookings}</h3>
                                            <span className="text-muted small" style={{ fontSize: "0.7rem" }}>Awaiting Host approval</span>
                                        </div>
                                        <div className="kpi-icon-wrapper kpi-yellow"><i className="bi bi-clock-history"></i></div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="kpi-card h-100">
                                        <div>
                                            <span className="text-muted small text-uppercase">Total Reviews</span>
                                            <h3 className="fw-bold text-dark mt-1 mb-0">{stats.total_reviews}</h3>
                                            <span className="text-muted small" style={{ fontSize: "0.7rem" }}>Submitted feedback</span>
                                        </div>
                                        <div className="kpi-icon-wrapper kpi-green"><i className="bi bi-chat-left-heart"></i></div>
                                    </div>
                                </div>
                            </div>

                            {/* Graphical Statistics Section */}
                            <div className="row g-4 mt-3 text-dark">
                                {/* User Accounts Distribution CSS Bar Chart */}
                                <div className="col-md-6">
                                    <div className="mu-table-card-wrapper p-4 bg-white shadow-sm" style={{ borderRadius: "16px" }}>
                                        <h6 className="fw-bold mb-4 text-primary">
                                            <i className="bi bi-people-fill me-2"></i>User Registration Distribution
                                        </h6>
                                        <div className="d-flex flex-column gap-3">
                                            {/* Students ratio */}
                                            {(() => {
                                                const totalUsers = (parseInt(stats.total_students) || 0) + (parseInt(stats.total_owners) || 0) || 1;
                                                const studentPct = Math.round(((parseInt(stats.total_students) || 0) / totalUsers) * 100);
                                                const ownerPct = Math.round(((parseInt(stats.total_owners) || 0) / totalUsers) * 100);
                                                return (
                                                    <>
                                                        <div>
                                                            <div className="d-flex justify-content-between small fw-semibold mb-1">
                                                                <span>Students Registrations</span>
                                                                <span>{stats.total_students} ({studentPct}%)</span>
                                                            </div>
                                                            <div className="progress" style={{ height: "12px", borderRadius: "6px", background: "#f1f5f9" }}>
                                                                <div className="progress-bar bg-primary" style={{ width: `${studentPct}%`, borderRadius: "6px" }}></div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="d-flex justify-content-between small fw-semibold mb-1">
                                                                <span>Hostel Owners Accounts</span>
                                                                <span>{stats.total_owners} ({ownerPct}%)</span>
                                                            </div>
                                                            <div className="progress" style={{ height: "12px", borderRadius: "6px", background: "#f1f5f9" }}>
                                                                <div className="progress-bar bg-success" style={{ width: `${ownerPct}%`, borderRadius: "6px" }}></div>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Platform listings & bookings CSS Bar Chart */}
                                <div className="col-md-6">
                                    <div className="mu-table-card-wrapper p-4 bg-white shadow-sm" style={{ borderRadius: "16px" }}>
                                        <h6 className="fw-bold mb-4 text-primary">
                                            <i className="bi bi-bar-chart-line-fill me-2"></i>Platform Listing Metrics
                                        </h6>
                                        <div className="d-flex flex-column gap-3">
                                            {/* Listings Status */}
                                            {(() => {
                                                const totalHostels = parseInt(stats.total_hostels) || 0;
                                                const pendingHostels = parseInt(stats.pending_hostels) || 0;
                                                const approvedHostels = Math.max(0, totalHostels - pendingHostels);
                                                const approvedHostelPct = totalHostels > 0 ? Math.round((approvedHostels / totalHostels) * 100) : 0;
                                                return (
                                                    <div>
                                                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                                                            <span>Active Listings vs Pending Verification</span>
                                                            <span>{approvedHostels} Approved / {pendingHostels} Pending</span>
                                                        </div>
                                                        <div className="progress" style={{ height: "12px", borderRadius: "6px", background: "#f1f5f9" }}>
                                                            <div className="progress-bar bg-info" style={{ width: `${approvedHostelPct}%`, borderRadius: "6px" }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                            {/* Bookings Status */}
                                            {(() => {
                                                const totalBookings = parseInt(stats.total_bookings) || 0;
                                                const pendingBookings = parseInt(stats.pending_bookings) || 0;
                                                const activeBookings = Math.max(0, totalBookings - pendingBookings);
                                                const activeBookingPct = totalBookings > 0 ? Math.round((activeBookings / totalBookings) * 100) : 0;
                                                return (
                                                    <div>
                                                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                                                            <span>Confirmed Bookings vs Pending Approval</span>
                                                            <span>{activeBookings} Confirmed / {pendingBookings} Pending</span>
                                                        </div>
                                                        <div className="progress" style={{ height: "12px", borderRadius: "6px", background: "#f1f5f9" }}>
                                                            <div className="progress-bar bg-warning" style={{ width: `${activeBookingPct}%`, borderRadius: "6px" }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 👤 MANAGE STUDENTS VIEW */}
                    {activeItem === "Manage Students" && (
                        <div className="mu-outer-container">
                            {/* HUD Banner */}
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Manage Students</h1>
                                    <p className="mu-banner-subtitle">Configure student directory, view profiles, edit details, and block/unblock login access.</p>
                                </div>
                                <div className="mu-stats-grid">
                                    <div className="mu-stat-card">
                                        <div className="mu-stat-icon-container"><i className="bi bi-people-fill"></i></div>
                                        <div className="mu-stat-details">
                                            <div className="mu-stat-label">Total registered</div>
                                            <div className="mu-stat-value">{students.length}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Control Bar */}
                            <div className="mu-control-bar">
                                <div className="mu-search-wrapper">
                                    <i className="bi bi-search"></i>
                                    <input
                                        type="text"
                                        className="mu-search-input"
                                        placeholder="Search student directories..."
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Table List */}
                            <div className="mu-table-card-wrapper">
                                <div className="mu-header-bar" style={{ display: "grid", gridTemplateColumns: "10% 25% 20% 20% 12% 13%", alignItems: "center" }}>
                                    <div>ID</div>
                                    <div>Student Name</div>
                                    <div>Username</div>
                                    <div>Email Address</div>
                                    <div>Status</div>
                                    <div style={{ textAlign: "right" }}>Actions</div>
                                </div>
                                <div className="mu-rows-container">
                                    {students.map(s => (
                                        <div key={s.student_id} className="mu-user-card-row" style={{ display: "grid", gridTemplateColumns: "10% 25% 20% 20% 12% 13%", alignItems: "center" }}>
                                            <div><span className="mu-id-badge">#{s.student_id}</span></div>
                                            <div className="mu-user-cell">
                                                {getProfileImageUrl(s.profile_image) ? (
                                                    <img src={getProfileImageUrl(s.profile_image)} className="rounded-circle" style={{ width: "38px", height: "38px", objectFit: "cover" }} alt="student" />
                                                ) : (
                                                    <div className="mu-avatar">{s.full_name.charAt(0)}</div>
                                                )}
                                                <div className="mu-name">{s.full_name}</div>
                                            </div>
                                            <div className="text-secondary">{s.username}</div>
                                            <div className="text-secondary">{s.email}</div>
                                            <div>
                                                <span className={`badge-status bg-${s.status === "Active" ? "success-subtle text-success" : "danger-subtle text-danger"}`}>
                                                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.status === "Active" ? "#22c55e" : "#ef4444", display: "inline-block" }}></span> {s.status}
                                                </span>
                                            </div>
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button className="btn btn-sm btn-info text-white" onClick={() => setSelectedStudent(s)}><i className="bi bi-eye"></i></button>
                                                <button className="btn btn-sm btn-warning" onClick={() => setEditStudentForm(s)}><i className="bi bi-pencil"></i></button>
                                                <button className="btn btn-sm btn-secondary" onClick={() => handleToggleUserStatus(s.username, s.status)}>
                                                    <i className={s.status === "Active" ? "bi bi-lock-fill" : "bi bi-unlock-fill"}></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteStudent(s.student_id)}><i className="bi bi-trash"></i></button>
                                            </div>
                                        </div>
                                    ))}
                                    {students.length === 0 && <div className="p-4 text-center text-muted">No student records found.</div>}
                                </div>
                            </div>

                            {/* View Profile Modal */}
                            {selectedStudent && (
                                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                                    <div className="modal-dialog modal-lg">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Student Profile: {selectedStudent.full_name}</h5>
                                                <button type="button" className="btn-close" onClick={() => setSelectedStudent(null)}></button>
                                            </div>
                                            <div className="modal-body text-dark">
                                                <div className="row">
                                                    <div className="col-md-4 text-center mb-3">
                                                        <img src={selectedStudent.profile_image || "https://placehold.co/150"} className="img-thumbnail rounded-circle" style={{ width: "150px", height: "150px", objectFit: "cover" }} alt="profile" />
                                                    </div>
                                                    <div className="col-md-8">
                                                        <table className="table table-sm">
                                                            <tbody>
                                                                <tr><th>Username:</th><td>{selectedStudent.username}</td></tr>
                                                                <tr><th>Email:</th><td>{selectedStudent.email}</td></tr>
                                                                <tr><th>Phone:</th><td>{selectedStudent.phone || "N/A"}</td></tr>
                                                                <tr><th>Gender:</th><td>{selectedStudent.gender || "N/A"}</td></tr>
                                                                <tr><th>College:</th><td>{selectedStudent.college || "N/A"}</td></tr>
                                                                <tr><th>Course:</th><td>{selectedStudent.course || "N/A"}</td></tr>
                                                                <tr><th>Year:</th><td>{selectedStudent.year || "N/A"}</td></tr>
                                                                <tr><th>City:</th><td>{selectedStudent.city_name || "N/A"}</td></tr>
                                                                <tr><th>State:</th><td>{selectedStudent.state || "N/A"}</td></tr>
                                                                <tr><th>Pincode:</th><td>{selectedStudent.pincode || "N/A"}</td></tr>
                                                                <tr><th>Address:</th><td>{selectedStudent.address || "N/A"}</td></tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Edit Student Modal */}
                            {editStudentForm && (
                                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                                    <div className="modal-dialog">
                                        <form onSubmit={handleUpdateStudent} className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Edit Student Profile</h5>
                                                <button type="button" className="btn-close" onClick={() => setEditStudentForm(null)}></button>
                                            </div>
                                            <div className="modal-body text-dark">
                                                <div className="mb-3">
                                                    <label className="form-label">Full Name</label>
                                                    <input type="text" className="form-control" value={editStudentForm.full_name || ""} onChange={(e) => setEditStudentForm({ ...editStudentForm, full_name: e.target.value })} required />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Email</label>
                                                    <input type="email" className="form-control" value={editStudentForm.email || ""} onChange={(e) => setEditStudentForm({ ...editStudentForm, email: e.target.value })} required />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Phone</label>
                                                    <input type="text" className="form-control" value={editStudentForm.phone || ""} onChange={(e) => setEditStudentForm({ ...editStudentForm, phone: e.target.value })} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">College</label>
                                                    <input type="text" className="form-control" value={editStudentForm.college || ""} onChange={(e) => setEditStudentForm({ ...editStudentForm, college: e.target.value })} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Course</label>
                                                    <input type="text" className="form-control" value={editStudentForm.course || ""} onChange={(e) => setEditStudentForm({ ...editStudentForm, course: e.target.value })} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Year</label>
                                                    <input type="number" className="form-control" value={editStudentForm.year || ""} onChange={(e) => setEditStudentForm({ ...editStudentForm, year: parseInt(e.target.value, 10) })} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Address</label>
                                                    <textarea className="form-control" value={editStudentForm.address || ""} onChange={(e) => setEditStudentForm({ ...editStudentForm, address: e.target.value })}></textarea>
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="submit" className="btn btn-primary">Save Changes</button>
                                                <button type="button" className="btn btn-secondary" onClick={() => setEditStudentForm(null)}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 🏢 MANAGE HOSTEL OWNERS VIEW */}
                    {activeItem === "Hostel Owners" && (
                        <div className="mu-outer-container">
                            {/* HUD Banner */}
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Hostel Owners</h1>
                                    <p className="mu-banner-subtitle">Configure owner directories, inspect listings, modify profiles, and toggle active states.</p>
                                </div>
                                <div className="mu-stats-grid">
                                    <div className="mu-stat-card">
                                        <div className="mu-stat-icon-container"><i className="bi bi-building"></i></div>
                                        <div className="mu-stat-details">
                                            <div className="mu-stat-label">Total registered</div>
                                            <div className="mu-stat-value">{owners.length}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Control Bar */}
                            <div className="mu-control-bar">
                                <div className="mu-search-wrapper">
                                    <i className="bi bi-search"></i>
                                    <input
                                        type="text"
                                        className="mu-search-input"
                                        placeholder="Search hostel owners..."
                                        value={ownerSearch}
                                        onChange={(e) => setOwnerSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Table list */}
                            <div className="mu-table-card-wrapper">
                                <div className="mu-header-bar" style={{ display: "grid", gridTemplateColumns: "10% 25% 20% 20% 12% 13%", alignItems: "center" }}>
                                    <div>ID</div>
                                    <div>Owner Name</div>
                                    <div>Username</div>
                                    <div>Email Address</div>
                                    <div>Status</div>
                                    <div style={{ textAlign: "right" }}>Actions</div>
                                </div>
                                <div className="mu-rows-container">
                                    {owners.map(o => (
                                        <div key={o.owner_id} className="mu-user-card-row" style={{ display: "grid", gridTemplateColumns: "10% 25% 20% 20% 12% 13%", alignItems: "center" }}>
                                            <div><span className="mu-id-badge">#{o.owner_id}</span></div>
                                            <div className="mu-user-cell">
                                                {o.profile_image ? (
                                                    <img src={o.profile_image} className="rounded-circle" style={{ width: "38px", height: "38px", objectFit: "cover" }} alt="owner" />
                                                ) : (
                                                    <div className="mu-avatar" style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)" }}>{o.owner_name.charAt(0)}</div>
                                                )}
                                                <div className="mu-name">{o.owner_name}</div>
                                            </div>
                                            <div className="text-secondary">{o.username}</div>
                                            <div className="text-secondary">{o.email}</div>
                                            <div>
                                                <span className={`badge-status bg-${o.status === "Active" ? "success-subtle text-success" : "danger-subtle text-danger"}`}>
                                                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: o.status === "Active" ? "#22c55e" : "#ef4444", display: "inline-block" }}></span> {o.status}
                                                </span>
                                            </div>
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button className="btn btn-sm btn-info text-white" onClick={() => setSelectedOwner(o)}><i className="bi bi-eye"></i></button>
                                                <button className="btn btn-sm btn-warning" onClick={() => setEditOwnerForm(o)}><i className="bi bi-pencil"></i></button>
                                                <button className="btn btn-sm btn-secondary" onClick={() => handleToggleUserStatus(o.username, o.status)}>
                                                    <i className={o.status === "Active" ? "bi bi-lock-fill" : "bi bi-unlock-fill"}></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteOwner(o.owner_id)}><i className="bi bi-trash"></i></button>
                                            </div>
                                        </div>
                                    ))}
                                    {owners.length === 0 && <div className="p-4 text-center text-muted">No owner records found.</div>}
                                </div>
                            </div>

                            {/* View Owner Details modal */}
                            {selectedOwner && (
                                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                                    <div className="modal-dialog modal-lg">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Hostel Owner: {selectedOwner.owner_name}</h5>
                                                <button type="button" className="btn-close" onClick={() => setSelectedOwner(null)}></button>
                                            </div>
                                            <div className="modal-body text-dark">
                                                <div className="row">
                                                    <div className="col-md-4 text-center mb-3">
                                                        <img src={selectedOwner.profile_image || "https://placehold.co/150"} className="img-thumbnail rounded-circle" style={{ width: "150px", height: "150px", objectFit: "cover" }} alt="profile" />
                                                    </div>
                                                    <div className="col-md-8">
                                                        <table className="table table-sm">
                                                            <tbody>
                                                                <tr><th>Username:</th><td>{selectedOwner.username}</td></tr>
                                                                <tr><th>Email:</th><td>{selectedOwner.email}</td></tr>
                                                                <tr><th>Phone:</th><td>{selectedOwner.phone || "N/A"}</td></tr>
                                                                <tr><th>Address:</th><td>{selectedOwner.address || "N/A"}</td></tr>
                                                                <tr><th>City:</th><td>{selectedOwner.city_name || "N/A"}</td></tr>
                                                                <tr><th>State:</th><td>{selectedOwner.state || "N/A"}</td></tr>
                                                                <tr><th>Pincode:</th><td>{selectedOwner.pincode || "N/A"}</td></tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Edit Owner modal */}
                            {editOwnerForm && (
                                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                                    <div className="modal-dialog">
                                        <form onSubmit={handleUpdateOwner} className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Edit Owner Details</h5>
                                                <button type="button" className="btn-close" onClick={() => setEditOwnerForm(null)}></button>
                                            </div>
                                            <div className="modal-body text-dark">
                                                <div className="mb-3">
                                                    <label className="form-label">Owner Name</label>
                                                    <input type="text" className="form-control" value={editOwnerForm.owner_name || ""} onChange={(e) => setEditOwnerForm({ ...editOwnerForm, owner_name: e.target.value })} required />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Email</label>
                                                    <input type="email" className="form-control" value={editOwnerForm.email || ""} onChange={(e) => setEditOwnerForm({ ...editOwnerForm, email: e.target.value })} required />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Phone</label>
                                                    <input type="text" className="form-control" value={editOwnerForm.phone || ""} onChange={(e) => setEditOwnerForm({ ...editOwnerForm, phone: e.target.value })} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Address</label>
                                                    <textarea className="form-control" value={editOwnerForm.address || ""} onChange={(e) => setEditOwnerForm({ ...editOwnerForm, address: e.target.value })}></textarea>
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="submit" className="btn btn-primary">Save Changes</button>
                                                <button type="button" className="btn btn-secondary" onClick={() => setEditOwnerForm(null)}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 🏠 MANAGE HOSTELS VIEW */}
                    {activeItem === "Manage Hostels" && (
                        <div className="mu-outer-container">
                            {/* HUD Banner */}
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Manage Hostels</h1>
                                    <p className="mu-banner-subtitle">Inspect property listings, update amenities, change approval states, and toggle verifications.</p>
                                </div>
                                <div className="mu-stats-grid">
                                    <div className="mu-stat-card">
                                        <div className="mu-stat-icon-container"><i className="bi bi-house-fill"></i></div>
                                        <div className="mu-stat-details">
                                            <div className="mu-stat-label">Total registered</div>
                                            <div className="mu-stat-value">{hostels.length}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Table list */}
                            <div className="mu-table-card-wrapper">
                                <div className="mu-header-bar" style={{ display: "grid", gridTemplateColumns: "8% 22% 12% 10% 13% 15% 20%", alignItems: "center" }}>
                                    <div>ID</div>
                                    <div>Hostel Name</div>
                                    <div>Owner</div>
                                    <div>Rent</div>
                                    <div>Beds</div>
                                    <div>Verification</div>
                                    <div style={{ textAlign: "right" }}>Actions</div>
                                </div>
                                <div className="mu-rows-container">
                                    {hostels.map(h => (
                                        <div key={h.hostel_id} className="mu-user-card-row" style={{ display: "grid", gridTemplateColumns: "8% 22% 12% 10% 13% 15% 20%", alignItems: "center" }}>
                                            <div><span className="mu-id-badge">#{h.hostel_id}</span></div>
                                            <div className="mu-user-cell">
                                                {h.hostel_logo ? (
                                                    <img src={h.hostel_logo} className="rounded-circle" style={{ width: "32px", height: "32px", objectFit: "cover" }} alt="logo" />
                                                ) : (
                                                    <div className="mu-avatar" style={{ background: "linear-gradient(135deg, #10b981, #059669)", width: "32px", height: "32px", fontSize: "11px" }}>{h.hostel_name.charAt(0)}</div>
                                                )}
                                                <div className="mu-name" style={{ fontSize: "13px" }}>{h.hostel_name}</div>
                                            </div>
                                            <div className="text-secondary" style={{ fontSize: "12.5px" }}>{h.owner_name}</div>
                                            <div className="fw-bold d-flex flex-column">
                                                <span>₹{parseFloat(h.monthly_rent).toLocaleString()} <span className="text-muted small">/ mo</span></span>
                                                <span className="text-primary small">₹{parseFloat(h.daily_rent || 0).toLocaleString()} / day</span>
                                            </div>
                                            <div className="text-secondary">{h.available_beds}/{h.total_beds}</div>
                                            <div>
                                                <span className={`badge bg-${h.is_verified ? "success" : "secondary"}`}>{h.is_verified ? "Verified" : "Unverified"}</span>
                                                <span className={`badge ms-1 bg-${h.status === "Approved" ? "success" : h.status === "Rejected" ? "danger" : "warning"}`}>{h.status}</span>
                                            </div>
                                            <div className="d-flex gap-1 justify-content-end flex-wrap">
                                                <button className="btn btn-sm btn-info text-white" onClick={() => { setSelectedHostel(h); fetchHostelDetails(h.hostel_id); }}><i className="bi bi-eye"></i></button>
                                                <button className="btn btn-sm btn-warning" onClick={() => setEditHostelForm(h)}><i className="bi bi-pencil"></i></button>
                                                <button className="btn btn-sm btn-secondary" onClick={() => handleToggleHostelVerification(h.hostel_id, h.is_verified)}>
                                                    <i className="bi bi-patch-check"></i>
                                                </button>
                                                <select
                                                    className="form-select form-select-sm d-inline-block w-auto"
                                                    value={h.status}
                                                    style={{ paddingRight: "20px", fontSize: "12px", border: "1px solid #cbd5e1" }}
                                                    onChange={(e) => handleUpdateHostelApprovalStatus(h.hostel_id, e.target.value)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteHostel(h.hostel_id)}><i className="bi bi-trash"></i></button>
                                            </div>
                                        </div>
                                    ))}
                                    {hostels.length === 0 && <div className="p-4 text-center text-muted">No hostel records found.</div>}
                                </div>
                            </div>

                            {/* Details modal */}
                            {selectedHostel && (
                                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)", overflowY: "auto" }}>
                                    <div className="modal-dialog modal-lg">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Hostel details: {selectedHostel.hostel_name}</h5>
                                                <button type="button" className="btn-close" onClick={() => setSelectedHostel(null)}></button>
                                            </div>
                                            <div className="modal-body text-dark">
                                                <div className="row mb-3">
                                                    <div className="col-md-6 border-end">
                                                        <h6 className="fw-bold text-primary mb-3"><i className="bi bi-info-circle"></i> Basic Details</h6>
                                                        <table className="table table-sm table-borderless small">
                                                            <tbody>
                                                                <tr><td><strong>Monthly Rent:</strong></td><td>₹{parseFloat(selectedHostel.monthly_rent).toLocaleString()}</td></tr>
                                                                <tr><td><strong>Daily Rent:</strong></td><td>₹{parseFloat(selectedHostel.daily_rent || 0).toLocaleString()}</td></tr>
                                                                <tr><td><strong>Security Deposit:</strong></td><td>₹{parseFloat(selectedHostel.deposit).toLocaleString()}</td></tr>
                                                                <tr><td><strong>Gender Allowed:</strong></td><td>{selectedHostel.gender_allowed}</td></tr>
                                                                <tr><td><strong>Sharing Type:</strong></td><td>{selectedHostel.sharing_type}</td></tr>
                                                                <tr><td><strong>Contact:</strong></td><td>{selectedHostel.contact_number || "N/A"}</td></tr>
                                                                <tr><td><strong>Total Rooms / Beds:</strong></td><td>{selectedHostel.total_rooms} Rooms / {selectedHostel.total_beds} Beds</td></tr>
                                                                <tr><td><strong>Available Rooms / Beds:</strong></td><td>{selectedHostel.available_rooms} Rooms / {selectedHostel.available_beds} Beds</td></tr>
                                                                <tr><td><strong>Verification:</strong></td><td><span className={`badge bg-${selectedHostel.is_verified ? "success" : "secondary"}`}>{selectedHostel.is_verified ? "Verified" : "Unverified"}</span></td></tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <h6 className="fw-bold text-primary mb-3"><i className="bi bi-geo-alt"></i> Location & Amenities</h6>
                                                        <table className="table table-sm table-borderless small">
                                                            <tbody>
                                                                <tr><td><strong>Address:</strong></td><td>{selectedHostel.address || "N/A"}</td></tr>
                                                                <tr><td><strong>Location details:</strong></td><td>{selectedHostel.location || "N/A"}</td></tr>
                                                                <tr><td><strong>Coordinates:</strong></td><td>Lat: {selectedHostel.latitude || "N/A"} | Lng: {selectedHostel.longitude || "N/A"}</td></tr>
                                                            </tbody>
                                                        </table>

                                                        <h6 className="fw-bold text-primary mt-3 mb-2"><i className="bi bi-stars"></i> Amenities</h6>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {hostelDetails.amenities.map(a => (
                                                                <span key={a.id} className="badge bg-secondary">{a.amenity_name}</span>
                                                            ))}
                                                            {hostelDetails.amenities.length === 0 && <span className="text-muted small">No amenities listed</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border-top pt-3 mb-3">
                                                    <h6 className="fw-bold text-primary"><i className="bi bi-book"></i> Description & House Rules</h6>
                                                    <p className="small"><strong>Description:</strong> {selectedHostel.description || "No description provided."}</p>
                                                    <p className="small"><strong>House Rules:</strong> {selectedHostel.hostel_rules || "No specific house rules listed."}</p>
                                                </div>

                                                <div className="border-top pt-3">
                                                    <h6 className="fw-bold text-primary mb-2"><i className="bi bi-images"></i> Gallery</h6>
                                                    <div className="row g-2">
                                                        {hostelDetails.images.map(img => (
                                                            <div key={img.image_id} className="col-md-4">
                                                                <div className="card h-100">
                                                                    <img src={img.image_path} className="card-img-top" style={{ height: "120px", objectFit: "cover", cursor: "pointer" }} alt="gallery" onClick={() => setFullScreenImage(img.image_path)} />
                                                                    <div className="p-1 text-center small text-muted">{img.image_title || "Untitled Image"}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {hostelDetails.images.length === 0 && <p className="text-muted small col-12">No photos uploaded to gallery.</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Edit Hostel Modal */}
                            {editHostelForm && (
                                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)", overflowY: "auto" }}>
                                    <div className="modal-dialog modal-lg">
                                        <form onSubmit={handleUpdateHostel} className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Edit Hostel Details</h5>
                                                <button type="button" className="btn-close" onClick={() => setEditHostelForm(null)}></button>
                                            </div>
                                            <div className="modal-body text-dark">
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Hostel Name</label>
                                                        <input type="text" className="form-control" value={editHostelForm.hostel_name || ""} onChange={(e) => setEditHostelForm({ ...editHostelForm, hostel_name: e.target.value })} required />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Rent</label>
                                                        <input type="number" className="form-control" value={editHostelForm.monthly_rent || 0} onChange={(e) => setEditHostelForm({ ...editHostelForm, monthly_rent: parseFloat(e.target.value) })} required />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Deposit</label>
                                                        <input type="number" className="form-control" value={editHostelForm.deposit || 0} onChange={(e) => setEditHostelForm({ ...editHostelForm, deposit: parseFloat(e.target.value) })} required />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Contact</label>
                                                        <input type="text" className="form-control" value={editHostelForm.contact_number || ""} onChange={(e) => setEditHostelForm({ ...editHostelForm, contact_number: e.target.value })} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Total Beds</label>
                                                        <input type="number" className="form-control" value={editHostelForm.total_beds || 0} onChange={(e) => setEditHostelForm({ ...editHostelForm, total_beds: parseInt(e.target.value, 10) })} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Available Beds</label>
                                                        <input type="number" className="form-control" value={editHostelForm.available_beds || 0} onChange={(e) => setEditHostelForm({ ...editHostelForm, available_beds: parseInt(e.target.value, 10) })} />
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label className="form-label">Address</label>
                                                        <textarea className="form-control" value={editHostelForm.address || ""} onChange={(e) => setEditHostelForm({ ...editHostelForm, address: e.target.value })}></textarea>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label className="form-label">Description</label>
                                                        <textarea className="form-control" value={editHostelForm.description || ""} onChange={(e) => setEditHostelForm({ ...editHostelForm, description: e.target.value })}></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="submit" className="btn btn-primary">Save Changes</button>
                                                <button type="button" className="btn btn-secondary" onClick={() => setEditHostelForm(null)}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 📅 MANAGE BOOKINGS VIEW */}
                    {activeItem === "Manage Bookings" && (
                        <div className="mu-outer-container">
                            {/* HUD Banner */}
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Manage Bookings</h1>
                                    <p className="mu-banner-subtitle">Review room reservations, update payment status parameters, and change booking status configurations.</p>
                                </div>
                                <div className="mu-stats-grid">
                                    <div className="mu-stat-card">
                                        <div className="mu-stat-icon-container"><i className="bi bi-calendar2-range"></i></div>
                                        <div className="mu-stat-details">
                                            <div className="mu-stat-label">Total Bookings</div>
                                            <div className="mu-stat-value">{bookings.length}</div>
                                        </div>
                                    </div>
                                    <div className="mu-stat-card">
                                        <div className="mu-stat-icon-container"><i className="bi bi-check-circle-fill"></i></div>
                                        <div className="mu-stat-details">
                                            <div className="mu-stat-label">Confirm Rate</div>
                                            <div className="mu-stat-value">{bookingApprovalRate}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Control Bar */}
                            <div className="mu-control-bar">
                                <div className="mu-search-wrapper">
                                    <i className="bi bi-search"></i>
                                    <input
                                        type="text"
                                        className="mu-search-input"
                                        placeholder="Search bookings by student or hostel name..."
                                        value={bookingSearch}
                                        onChange={(e) => setBookingSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Table Grid list */}
                            <div className="mu-table-card-wrapper">
                                <div className="mu-header-bar" style={{ display: "grid", gridTemplateColumns: "8% 22% 20% 12% 13% 13% 12%", alignItems: "center" }}>
                                    <div>ID</div>
                                    <div>Student</div>
                                    <div>Hostel</div>
                                    <div>Rent</div>
                                    <div>Booking Status</div>
                                    <div>Payment</div>
                                    <div style={{ textAlign: "right" }}>Actions</div>
                                </div>
                                <div className="mu-rows-container">
                                    {bookings.map(b => (
                                        <div key={b.booking_id} className="mu-user-card-row" style={{ display: "grid", gridTemplateColumns: "8% 22% 20% 12% 13% 13% 12%", alignItems: "center" }}>
                                            <div><span className="mu-id-badge">#{b.booking_id}</span></div>
                                            <div className="mu-user-cell">
                                                <div className="mu-avatar" style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)", width: "32px", height: "32px", fontSize: "11px" }}>{b.student_name.charAt(0)}</div>
                                                <div className="mu-name" style={{ fontSize: "13px" }}>{b.student_name}</div>
                                            </div>
                                            <div className="text-secondary">{b.hostel_name}</div>
                                            <div className="fw-semibold">₹{parseFloat(b.monthly_rent).toLocaleString()}</div>
                                            <div>
                                                <span className={`badge bg-${b.booking_status === "Approved" ? "success" : b.booking_status === "Rejected" ? "danger" : b.booking_status === "Cancelled" ? "secondary" : "warning"}`}>
                                                    {b.booking_status}
                                                </span>
                                            </div>
                                            <div>
                                                <span className={`badge bg-${b.payment_status === "Paid" ? "success" : b.payment_status === "Refunded" ? "info" : "warning"}`}>
                                                    {b.payment_status}
                                                </span>
                                            </div>
                                            <div className="d-flex gap-1 justify-content-end">
                                                <div className="dropdown">
                                                    <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                                        Booking
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li><button type="button" className="dropdown-item" onClick={() => handleUpdateBookingStatus(b.booking_id, "Approved")}>Approve</button></li>
                                                        <li><button type="button" className="dropdown-item" onClick={() => handleUpdateBookingStatus(b.booking_id, "Rejected")}>Reject</button></li>
                                                        <li><button type="button" className="dropdown-item" onClick={() => handleUpdateBookingStatus(b.booking_id, "Cancelled")}>Cancel</button></li>
                                                    </ul>
                                                </div>
                                                <div className="dropdown">
                                                    <button className="btn btn-sm btn-outline-info dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                                        Payment
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li><button type="button" className="dropdown-item" onClick={() => handleUpdateBookingPayment(b.booking_id, "Paid")}>Paid</button></li>
                                                        <li><button type="button" className="dropdown-item" onClick={() => handleUpdateBookingPayment(b.booking_id, "Refunded")}>Refunded</button></li>
                                                        <li><button type="button" className="dropdown-item" onClick={() => handleUpdateBookingPayment(b.booking_id, "Pending")}>Pending</button></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {bookings.length === 0 && <div className="p-4 text-center text-muted">No booking records found.</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ⭐ MANAGE REVIEWS VIEW */}
                    {activeItem === "Manage Reviews" && (
                        <div className="mu-outer-container">
                            {/* HUD Banner */}
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Manage Reviews</h1>
                                    <p className="mu-banner-subtitle">Inspect student feedbacks, audit ratings, and delete abusive/inappropriate reviews.</p>
                                </div>
                                <div className="mu-stats-grid">
                                    <div className="mu-stat-card">
                                        <div className="mu-stat-icon-container"><i className="bi bi-star-fill"></i></div>
                                        <div className="mu-stat-details">
                                            <div className="mu-stat-label">Total Feedbacks</div>
                                            <div className="mu-stat-value">{reviews.length}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Control Bar filters */}
                            <div className="mu-control-bar">
                                <input
                                    type="text"
                                    className="form-control dashboard-input w-25"
                                    placeholder="Filter by hostel..."
                                    value={reviewHostelFilter}
                                    onChange={(e) => setReviewHostelFilter(e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-control dashboard-input w-25"
                                    placeholder="Filter by student..."
                                    value={reviewStudentFilter}
                                    onChange={(e) => setReviewStudentFilter(e.target.value)}
                                />
                            </div>

                            {/* Custom Grid table */}
                            <div className="mu-table-card-wrapper">
                                <div className="mu-header-bar" style={{ display: "grid", gridTemplateColumns: "8% 22% 20% 15% 25% 10%", alignItems: "center" }}>
                                    <div>ID</div>
                                    <div>Student</div>
                                    <div>Hostel</div>
                                    <div>Rating</div>
                                    <div>Review Description</div>
                                    <div style={{ textAlign: "right" }}>Actions</div>
                                </div>
                                <div className="mu-rows-container">
                                    {reviews
                                        .filter(r => r.hostel_name.toLowerCase().includes(reviewHostelFilter.toLowerCase()))
                                        .filter(r => r.student_name.toLowerCase().includes(reviewStudentFilter.toLowerCase()))
                                        .map(r => (
                                            <div key={r.review_id} className="mu-user-card-row" style={{ display: "grid", gridTemplateColumns: "8% 22% 20% 15% 25% 10%", alignItems: "center" }}>
                                                <div><span className="mu-id-badge">#{r.review_id}</span></div>
                                                <div className="mu-user-cell">
                                                    <div className="mu-avatar" style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", width: "32px", height: "32px", fontSize: "11px" }}>{r.student_name.charAt(0)}</div>
                                                    <div className="mu-name" style={{ fontSize: "13px" }}>{r.student_name}</div>
                                                </div>
                                                <div className="text-secondary">{r.hostel_name}</div>
                                                <td>
                                                    <span className="text-warning" style={{ fontSize: "14px" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                                                </td>
                                                <div className="text-secondary text-truncate" title={r.review}>{r.review}</div>
                                                <div className="d-flex gap-1 justify-content-end">
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteReview(r.review_id)}><i className="bi bi-trash"></i></button>
                                                </div>
                                            </div>
                                        ))}
                                    {reviews.length === 0 && <div className="p-4 text-center text-muted">No reviews recorded.</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ❤️ MANAGE WISHLIST VIEW */}
                    {activeItem === "Manage Wishlist" && (
                        <div className="mu-outer-container">
                            {/* HUD Banner */}
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Manage Wishlist</h1>
                                    <p className="mu-banner-subtitle">Inspect popular hostels, student favorites, and trending property listings.</p>
                                </div>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-7">
                                    <div className="mu-table-card-wrapper p-3">
                                        <h6 className="fw-bold mb-3 text-dark"><i className="bi bi-heart-fill text-danger"></i> Wishlisted Items</h6>
                                        <div className="table-responsive">
                                            <table className="table table-dark-custom align-middle">
                                                <thead>
                                                    <tr>
                                                        <th>Student</th>
                                                        <th>Hostel</th>
                                                        <th>City</th>
                                                        <th>Rating</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {wishlist.map(w => (
                                                        <tr key={w.wishlist_id}>
                                                            <td><strong>{w.student_name}</strong></td>
                                                            <td>{w.hostel_name}</td>
                                                            <td>{w.city_name}</td>
                                                            <td>★{w.average_rating}</td>
                                                        </tr>
                                                    ))}
                                                    {wishlist.length === 0 && <tr><td colSpan="4" className="text-center text-muted">No wishlist items recorded.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-5">
                                    <div className="mu-table-card-wrapper p-3">
                                        <h6 className="fw-bold mb-3 text-dark"><i className="bi bi-graph-up-arrow text-primary"></i> Popular Hostels Leaderboard</h6>
                                        <ul className="list-group list-group-flush">
                                            {popularHostels.map((ph, idx) => (
                                                <li key={ph.hostel_id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent text-dark border-secondary-subtle">
                                                    <div>
                                                        <span className="badge bg-primary me-2">#{idx + 1}</span>
                                                        <strong>{ph.hostel_name}</strong>
                                                        <div className="text-muted small">Rating: ★{ph.average_rating}</div>
                                                    </div>
                                                    <span className="badge bg-danger rounded-pill">{ph.wishlist_occurrences} Wishlists</span>
                                                </li>
                                            ))}
                                            {popularHostels.length === 0 && <li className="list-group-item text-muted text-center">No popular items computed.</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 🔔 NOTIFICATIONS VIEW */}
                    {activeItem === "Notifications" && (
                        <div className="mu-outer-container">
                            {/* HUD Banner */}
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">System Notifications Log</h1>
                                    <p className="mu-banner-subtitle">Monitor and review all system-wide alerts, student bookings notifications, and reviews actions logs.</p>
                                </div>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-12">
                                    <div className="mu-table-card-wrapper p-4 text-dark">
                                        <h6 className="fw-bold mb-4"><i className="bi bi-clock-history me-2 text-primary"></i> Notification Records</h6>
                                        {notifications.map(n => (
                                            <div key={n.notification_id} className="p-3 mb-3 border rounded border-light bg-light text-dark d-flex justify-content-between align-items-start shadow-sm" style={{ borderRadius: "12px" }}>
                                                <div>
                                                    <span className="badge bg-secondary-subtle text-secondary border border-secondary mb-2">{n.notification_type}</span>
                                                    <h6 className="mb-1 fw-bold">{n.title}</h6>
                                                    <p className="mb-1 text-muted small">{n.message}</p>
                                                    <span className="text-muted small" style={{ fontSize: "0.7rem" }}>Recipient: <strong>{n.username}</strong> | {new Date(n.created_at).toLocaleString()}</span>
                                                </div>
                                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteNotification(n.notification_id)}><i className="bi bi-trash"></i></button>
                                            </div>
                                        ))}
                                        {notifications.length === 0 && <p className="text-muted text-center p-4">No notifications recorded.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 🏙️ MANAGE CITIES VIEW */}
                    {activeItem === "Manage Cities" && (
                        <div className="mu-outer-container">
                            {/* HUD Banner */}
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Manage Cities</h1>
                                    <p className="mu-banner-subtitle">Configure available cities listings database, add new names, and manage details.</p>
                                </div>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-5">
                                    <div className="dashboard-pane">
                                        <h6 className="fw-bold mb-3 text-dark">{cityForm.city_id ? "✏️ Edit City" : "➕ Add City"}</h6>
                                        <form onSubmit={handleSaveCity}>
                                            <div className="mb-3">
                                                <label className="form-label text-muted small fw-semibold">City Name</label>
                                                <input type="text" className="form-control" value={cityForm.city_name} onChange={(e) => setCityForm({ ...cityForm, city_name: e.target.value })} required />
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button type="submit" className="btn btn-success w-100">{cityForm.city_id ? "Update" : "Save"}</button>
                                                {cityForm.city_id && (
                                                    <button type="button" className="btn btn-secondary w-100" onClick={() => setCityForm({ city_id: null, city_name: "" })}>Cancel</button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                <div className="col-md-7">
                                    <div className="mu-table-card-wrapper p-3">
                                        <h6 className="fw-bold mb-3 text-dark"><i className="bi bi-globe-americas"></i> Registered Cities Database</h6>
                                        <table className="table table-dark-custom align-middle">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>City Name</th>
                                                    <th style={{ textAlign: "right" }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cities.map(c => (
                                                    <tr key={c.city_id}>
                                                        <td><span className="mu-id-badge">#{c.city_id}</span></td>
                                                        <td><strong>{c.city_name}</strong></td>
                                                        <td style={{ textAlign: "right" }}>
                                                            <button type="button" className="btn btn-sm btn-warning me-1" onClick={() => setCityForm(c)}><i className="bi bi-pencil"></i></button>
                                                            <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDeleteCity(c.city_id)}><i className="bi bi-trash"></i></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {cities.length === 0 && <tr><td colSpan="3" className="text-center text-muted">No cities registered.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ⚙️ LOGIN ACCOUNTS VIEW */}
                    {activeItem === "Login Accounts" && (
                        <div className="mu-outer-container">
                            {/* HUD Banner */}
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Login Accounts Settings</h1>
                                    <p className="mu-banner-subtitle">Configure system login credentials parameters, toggle status active keys, and perform password overrides.</p>
                                </div>
                            </div>

                            {/* Control Bar filters */}
                            <div className="mu-control-bar">
                                <select
                                    className="form-select dashboard-input w-25"
                                    value={accountRoleFilter}
                                    onChange={(e) => setAccountRoleFilter(e.target.value)}
                                >
                                    <option value="">All System Roles</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Owner">Owner</option>
                                    <option value="Student">Student</option>
                                </select>
                            </div>

                            {/* Table list */}
                            <div className="mu-table-card-wrapper">
                                <div className="mu-header-bar" style={{ display: "grid", gridTemplateColumns: "20% 15% 15% 20% 15% 15%", alignItems: "center" }}>
                                    <div>Username</div>
                                    <div>System Role</div>
                                    <div>Status</div>
                                    <div>Last Login Timestamp</div>
                                    <div>Created Date</div>
                                    <div style={{ textAlign: "right" }}>Actions</div>
                                </div>
                                <div className="mu-rows-container">
                                    {accounts.map(a => (
                                        <div key={a.username} className="mu-user-card-row" style={{ display: "grid", gridTemplateColumns: "20% 15% 15% 20% 15% 15%", alignItems: "center" }}>
                                            <div><strong>{a.username}</strong></div>
                                            <div>
                                                <span className={`badge ${a.role === "Admin" ? "bg-danger" : a.role === "Owner" ? "bg-success" : "bg-primary"}`}>
                                                    {a.role}
                                                </span>
                                            </div>
                                            <div>
                                                <span className={`badge-status bg-${a.status === "Active" ? "success-subtle text-success" : "danger-subtle text-danger"}`}>
                                                    {a.status}
                                                </span>
                                            </div>
                                            <div className="text-secondary small">{a.last_login ? new Date(a.last_login).toLocaleString() : "Never Logged In"}</div>
                                            <div className="text-secondary small">{new Date(a.created_at).toLocaleDateString()}</div>
                                            <div className="d-flex gap-1 justify-content-end">
                                                <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => setResetPasswordUsername(a.username)}>Reset Pass</button>
                                                <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleToggleUserStatus(a.username, a.status)}>
                                                    {a.status === "Active" ? "Block" : "Unblock"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {accounts.length === 0 && <div className="p-4 text-center text-muted">No credentials found.</div>}
                                </div>
                            </div>

                            {/* Reset Password Modal */}
                            {resetPasswordUsername && (
                                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                                    <div className="modal-dialog">
                                        <form onSubmit={handleResetPassword} className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Reset Password: {resetPasswordUsername}</h5>
                                                <button type="button" className="btn-close" onClick={() => setResetPasswordUsername("")}></button>
                                            </div>
                                            <div className="modal-body text-dark">
                                                <div className="mb-3">
                                                    <label className="form-label">New Password</label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        placeholder="Enter new override password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="submit" className="btn btn-warning">Save Override</button>
                                                <button type="button" className="btn btn-secondary" onClick={() => setResetPasswordUsername("")}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 📈 REPORTS VIEW */}
                    {activeItem === "Reports" && reportsData && (
                        <div className="mu-outer-container">
                            {/* HUD Banner */}
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">System telemetry & Analytics</h1>
                                    <p className="mu-banner-subtitle">Real-time statistics compilation and aggregated reports from listings and registrations.</p>
                                </div>
                            </div>

                            <div className="row g-4 text-dark">
                                <div className="col-md-6">
                                    <div className="mu-table-card-wrapper p-3">
                                        <h6 className="fw-bold mb-3 text-dark"><i className="bi bi-geo-fill text-primary"></i> Students registrations per City</h6>
                                        <ul className="list-group list-group-flush">
                                            {reportsData.studentsPerCity.map(item => (
                                                <li key={item.city_name} className="list-group-item d-flex justify-content-between align-items-center bg-transparent text-dark border-secondary-subtle">
                                                    <span>{item.city_name}</span>
                                                    <span className="badge bg-primary rounded-pill">{item.count}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mu-table-card-wrapper p-3">
                                        <h6 className="fw-bold mb-3 text-dark"><i className="bi bi-building-fill text-success"></i> Hostels listings per City</h6>
                                        <ul className="list-group list-group-flush">
                                            {reportsData.hostelsPerCity.map(item => (
                                                <li key={item.city_name} className="list-group-item d-flex justify-content-between align-items-center bg-transparent text-dark border-secondary-subtle">
                                                    <span>{item.city_name}</span>
                                                    <span className="badge bg-success rounded-pill">{item.count}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mu-table-card-wrapper p-3">
                                        <h6 className="fw-bold mb-3 text-dark"><i className="bi bi-fire text-danger"></i> Popular Properties (Most Booked)</h6>
                                        <ul className="list-group list-group-flush">
                                            {reportsData.mostBooked.map(item => (
                                                <li key={item.hostel_name} className="list-group-item d-flex justify-content-between align-items-center bg-transparent text-dark border-secondary-subtle">
                                                    <span>{item.hostel_name}</span>
                                                    <span className="badge bg-danger rounded-pill">{item.booking_count} Bookings</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mu-table-card-wrapper p-3">
                                        <h6 className="fw-bold mb-3 text-dark"><i className="bi bi-star-fill text-warning"></i> Highest Rated Properties</h6>
                                        <ul className="list-group list-group-flush">
                                            {reportsData.highestRated.map(item => (
                                                <li key={item.hostel_name} className="list-group-item d-flex justify-content-between align-items-center bg-transparent text-dark border-secondary-subtle">
                                                    <span>{item.hostel_name}</span>
                                                    <span className="badge bg-warning text-dark">★ {item.average_rating}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="mu-table-card-wrapper p-3">
                                        <h6 className="fw-bold mb-3 text-dark"><i className="bi bi-graph-up"></i> Booking Reservation Trends (Timeline logs)</h6>
                                        <div className="table-responsive">
                                            <table className="table table-dark-custom align-middle">
                                                <thead>
                                                    <tr>
                                                        <th>Booking Date</th>
                                                        <th>Total Bookings</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportsData.bookingTrends.map(item => (
                                                        <tr key={item.booking_date}>
                                                            <td>{new Date(item.booking_date).toLocaleDateString()}</td>
                                                            <td><strong>{item.count} Bookings</strong></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            
            {/* Lightbox Image Viewer */}
            {fullScreenImage && (
                <div 
                    style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}
                    onClick={() => setFullScreenImage(null)}
                >
                    <span 
                        className="position-absolute top-0 end-0 m-4 text-white" 
                        style={{ fontSize: "2rem", cursor: "pointer", zIndex: 10000 }}
                        onClick={() => setFullScreenImage(null)}
                    >
                        &times;
                    </span>
                    <img 
                        src={fullScreenImage} 
                        alt="fullscreen" 
                        style={{ maxHeight: "90vh", maxWidth: "90vw", objectFit: "contain", borderRadius: "8px" }} 
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}

export default Admin;
