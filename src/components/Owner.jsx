import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useConfirm } from "../context/ConfirmContext";
import API, { getImageUrl, handleImageError } from "../config/api";

function Owner() {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeItem, setActiveItem] = useState("Dashboard");
    const [time, setTime] = useState(new Date());
    const [loading, setLoading] = useState(true);

    // Statistics
    const [stats, setStats] = useState({
        total_hostels: 0,
        total_bookings: 0,
        pending_bookings: 0,
        reviews_count: 0
    });

    // Profile Data
    const [profile, setProfile] = useState(null);
    const [profileUser, setProfileUser] = useState(null);
    const [profileFormData, setProfileFormData] = useState({
        owner_name: "",
        email: "",
        phone: "",
        address: "",
        city_name: "",
        state: "",
        pincode: "",
        profile_image: ""
    });
    const [newImageFile, setNewImageFile] = useState(null);
    const [profileEditing, setProfileEditing] = useState(false);

    // Change Password
    const [pwdForm, setPwdForm] = useState({ current_password: "", new_password: "" });

    // Listings/Data arrays
    const [hostels, setHostels] = useState([]);
    const [images, setImages] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [editReplyId, setEditReplyId] = useState(null);
    const [editReplyText, setEditReplyText] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [cities, setCities] = useState([]);

    // Filters and Modals
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [hostelSearch, setHostelSearch] = useState("");
    const [bookingSearch, setBookingSearch] = useState("");
    
    // Create/Edit Hostel
    const [hostelFormOpen, setHostelFormOpen] = useState(false);
    const [editHostelId, setEditHostelId] = useState(null);
    const [selectedHostel, setSelectedHostel] = useState(null);
    const [hostelDetails, setHostelDetails] = useState({ images: [], amenities: [] });
    const [hostelForm, setHostelForm] = useState({
        hostel_name: "",
        city_name: "",
        gender_allowed: "Boys",
        sharing_type: "Single Sharing",
        address: "",
        location: "",
        latitude: "",
        longitude: "",
        description: "",
        monthly_rent: 0,
        daily_rent: 0,
        deposit: 0,
        total_rooms: 0,
        available_rooms: 0,
        total_beds: 0,
        available_beds: 0,
        contact_number: "",
        hostel_rules: "",
        hostel_logo: ""
    });

    // Add Image / Add Amenity
    const [newImageForm, setNewImageForm] = useState({ hostel_id: "", image_title: "", image_path: "" });
    const [newImageUploadFile, setNewImageUploadFile] = useState(null);
    const [newAmenityForm, setNewAmenityForm] = useState({ hostel_id: "", amenity_name: "" });
    const [fullScreenImage, setFullScreenImage] = useState(null);

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username") || "Owner";

    const approvedBookingsCount = bookings.filter(b => b.booking_status === "Approved").length;
    const pendingBookingsCount = bookings.filter(b => b.booking_status === "Pending").length;
    const cancelledBookingsCount = bookings.filter(b => ["Cancelled", "Rejected"].includes(b.booking_status)).length;
    const totalBookingsCount = bookings.length || 1;

    const totalRooms = hostels.reduce((sum, h) => sum + (parseInt(h.total_rooms) || 0), 0);
    const availableRooms = hostels.reduce((sum, h) => sum + (parseInt(h.available_rooms) || 0), 0);
    const occupiedRooms = Math.max(0, totalRooms - availableRooms);

    const totalBeds = hostels.reduce((sum, h) => sum + (parseInt(h.total_beds) || 0), 0);
    const availableBeds = hostels.reduce((sum, h) => sum + (parseInt(h.available_beds) || 0), 0);
    const occupiedBeds = Math.max(0, totalBeds - availableBeds);

    // Menu Configuration
    const menuItems = [
        { name: "Dashboard",        icon: "bi-speedometer2",       accent: "#2563eb" },
        { name: "My Hostels",       icon: "bi-building-fill",      accent: "#10b981" },
        { name: "Bookings",         icon: "bi-calendar2-check",    accent: "#06b6d4" },
    ];

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (!token || role !== "Owner") {
            navigate("/login");
            return;
        }
        fetchDashboardData();
        fetchProfile();
        fetchNotifications();
        fetchCities();
    }, [token, navigate]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!token) return;
        if (activeItem === "My Hostels") {
            fetchHostels();
            fetchImages();
            fetchAmenities();
        }
        else if (activeItem === "Bookings") fetchBookings();
        else if (activeItem === "Reviews") fetchReviews();
        else if (activeItem === "Notifications") fetchNotifications();
    }, [activeItem]);

    useEffect(() => {
        if (editHostelId) {
            fetchHostelDetails(editHostelId);
        }
    }, [editHostelId]);

    const showMessage = (msg) => {
        toast.success(msg);
    };

    // --- API Fetch Handlers ---
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API}/dashboard/owner`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const resData = await response.json();
            if (resData.success) {
                setStats(resData.stats);
                setHostels(resData.hostels);
                setBookings(resData.bookings);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${API}/profile`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const resData = await response.json();
            if (resData.success) {
                setProfileUser(resData.user);
                setProfile(resData.profile);
                setProfileFormData({
                    owner_name: resData.profile.owner_name || "",
                    email: resData.profile.email || "",
                    phone: resData.profile.phone || "",
                    address: resData.profile.address || "",
                    city_name: resData.profile.city_name || "",
                    state: resData.profile.state || "",
                    pincode: resData.profile.pincode || "",
                    profile_image: resData.profile.profile_image || ""
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchHostels = async () => {
        try {
            const response = await fetch(`${API}/owner/hostels`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) setHostels(res.hostels);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHostelDetails = async (id) => {
        try {
            const response = await fetch(`${API}/admin/hostels/${id}/details`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
                setHostelDetails({ images: res.images, amenities: res.amenities });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchImages = async () => {
        try {
            const response = await fetch(`${API}/owner/images`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) setImages(res.images);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAmenities = async () => {
        try {
            const response = await fetch(`${API}/owner/amenities`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) setAmenities(res.amenities);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await fetch(`${API}/owner/bookings`, {
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
            const response = await fetch(`${API}/owner/reviews`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) setReviews(res.reviews);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${API}/owner/notifications`, {
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

    // --- Action Functions ---
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (!await confirm({ title: "Update Profile", message: "Are you sure you want to update your profile?", confirmText: "Yes, Update", variant: "primary" })) return;
        try {
            let profileImagePath = profileFormData.profile_image;
            if (newImageFile) {
                const uploadData = new FormData();
                uploadData.append("images", newImageFile);
                const uploadRes = await fetch(`${API}/upload`, {
                    method: "POST",
                    body: uploadData
                });
                if (uploadRes.ok) {
                    const uploadResult = await uploadRes.json();
                    if (uploadResult.success && uploadResult.files.length > 0) {
                        const uploadedFile = uploadResult.files[0];
                        const rawUrl = uploadedFile.url || uploadedFile.filename;
                        profileImagePath = rawUrl.startsWith("http") ? rawUrl : `${API}/uploads/${rawUrl}`;
                    }
                }
            }

            const response = await fetch(`${API}/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...profileFormData,
                    profile_image: profileImagePath
                })
            });
            const resData = await response.json();
            if (resData.success) {
                showMessage("Profile updated successfully!");
                setProfileEditing(false);
                setNewImageFile(null);
                fetchProfile();
            } else {
                showMessage(resData.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!await confirm({ title: "Change Password", message: "Are you sure you want to change your password?", confirmText: "Yes, Change", variant: "warning" })) return;
        try {
            const response = await fetch(`${API}/owner/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(pwdForm)
            });
            const res = await response.json();
            showMessage(res.message);
            if (res.success) setPwdForm({ current_password: "", new_password: "" });
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveHostel = async (e) => {
        e.preventDefault();
        if (!await confirm({ title: "Save Hostel", message: "Are you sure you want to save these hostel details?", confirmText: "Yes, Save", variant: "primary" })) return;
        try {
            const url = editHostelId ? `${API}/owner/hostels/${editHostelId}` : `${API}/owner/hostels`;
            const method = editHostelId ? "PUT" : "POST";
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(hostelForm)
            });
            const res = await response.json();
            if (res.success) {
                showMessage(editHostelId ? "Hostel updated successfully" : "Hostel added successfully! You can now configure images and amenities below.");
                fetchHostels();
                fetchDashboardData();
                if (!editHostelId && res.hostel) {
                    setEditHostelId(res.hostel.hostel_id);
                } else {
                    setHostelFormOpen(false);
                    setEditHostelId(null);
                    setHostelForm({
                        hostel_name: "", city_name: "", gender_allowed: "Boys", sharing_type: "Single Sharing",
                        address: "", location: "", latitude: "", longitude: "", description: "", monthly_rent: 0, daily_rent: 0, deposit: 0,
                        total_rooms: 0, available_rooms: 0, total_beds: 0, available_beds: 0,
                        contact_number: "", hostel_rules: "", hostel_logo: ""
                    });
                }
            } else {
                showMessage(res.message || "Failed to save hostel details.");
            }
        } catch (err) {
            console.error(err);
            showMessage("Server communication error. Please try again.");
        }
    };

    const handleLogoUpload = async (file) => {
        if (!file) return;
        try {
            const uploadData = new FormData();
            uploadData.append("images", file);
            const uploadRes = await fetch(`${API}/upload`, {
                method: "POST",
                body: uploadData
            });
            if (uploadRes.ok) {
                const uploadResult = await uploadRes.json();
                if (uploadResult.success && uploadResult.files.length > 0) {
                    const uploadedFile = uploadResult.files[0];
                    const rawUrl = uploadedFile.url || uploadedFile.filename;
                    const logoUrl = rawUrl.startsWith("http") ? rawUrl : `${API}/uploads/${rawUrl}`;
                    setHostelForm(prev => ({ ...prev, hostel_logo: logoUrl }));
                    showMessage("Logo uploaded successfully!");
                }
            }
        } catch (err) {
            console.error(err);
            showMessage("Logo upload failed.");
        }
    };

    const handleEditHostelClick = (h) => {
        setHostelForm({
            hostel_name: h.hostel_name || "",
            city_name: h.city_name || "",
            gender_allowed: h.gender_allowed || "Boys",
            sharing_type: h.sharing_type || "Single Sharing",
            address: h.address || "",
            location: h.location || "",
            latitude: h.latitude || "",
            longitude: h.longitude || "",
            description: h.description || "",
            monthly_rent: parseFloat(h.monthly_rent) || 0,
            daily_rent: parseFloat(h.daily_rent) || 0,
            deposit: parseFloat(h.deposit) || 0,
            total_rooms: h.total_rooms || 0,
            available_rooms: h.available_rooms || 0,
            total_beds: h.total_beds || 0,
            available_beds: h.available_beds || 0,
            contact_number: h.contact_number || "",
            hostel_rules: h.hostel_rules || "",
            hostel_logo: h.hostel_logo || ""
        });
        setEditHostelId(h.hostel_id);
        setHostelFormOpen(true);
    };

    const handleDeleteHostel = async (id) => {
        if (!await confirm({ title: "Delete Property", message: "Are you sure you want to delete this property?", confirmText: "Yes, Delete", variant: "danger" })) return;
        try {
            const response = await fetch(`${API}/owner/hostels/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Hostel property removed");
                fetchHostels();
                fetchDashboardData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveImage = async (e) => {
        e.preventDefault();
        if (!await confirm({ title: "Save Image", message: "Are you sure you want to save this image?", confirmText: "Yes, Save", variant: "primary" })) return;
        const hostelIdToUse = newImageForm.hostel_id || editHostelId;
        if (!hostelIdToUse) return;
        try {
            let imagePath = newImageForm.image_path;
            if (newImageUploadFile) {
                const uploadData = new FormData();
                uploadData.append("images", newImageUploadFile);
                const uploadRes = await fetch(`${API}/upload`, {
                    method: "POST",
                    body: uploadData
                });
                if (uploadRes.ok) {
                    const uploadResult = await uploadRes.json();
                    if (uploadResult.success && uploadResult.files.length > 0) {
                        const uploadedFile = uploadResult.files[0];
                        const rawUrl = uploadedFile.url || uploadedFile.filename;
                        imagePath = rawUrl.startsWith("http") ? rawUrl : `${API}/uploads/${rawUrl}`;
                    }
                }
            }

            const response = await fetch(`${API}/owner/images`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ...newImageForm, hostel_id: hostelIdToUse, image_path: imagePath })
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Image uploaded successfully!");
                setNewImageForm({ hostel_id: "", image_title: "", image_path: "" });
                setNewImageUploadFile(null);
                fetchImages();
                if (editHostelId) {
                    fetchHostelDetails(editHostelId);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteImage = async (id) => {
        if (!await confirm({ title: "Delete Image", message: "Are you sure you want to delete this image?", confirmText: "Yes, Delete", variant: "danger" })) return;
        try {
            const response = await fetch(`${API}/owner/images/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Image removed");
                fetchImages();
                if (editHostelId) {
                    fetchHostelDetails(editHostelId);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveAmenity = async (e) => {
        e.preventDefault();
        if (!await confirm({ title: "Save Amenity", message: "Are you sure you want to save this amenity?", confirmText: "Yes, Save", variant: "primary" })) return;
        const hostelIdToUse = newAmenityForm.hostel_id || editHostelId;
        if (!hostelIdToUse || !newAmenityForm.amenity_name) return;
        try {
            const response = await fetch(`${API}/owner/amenities`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ...newAmenityForm, hostel_id: hostelIdToUse })
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Amenity added!");
                setNewAmenityForm({ hostel_id: "", amenity_name: "" });
                fetchAmenities();
                if (editHostelId) {
                    fetchHostelDetails(editHostelId);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteAmenity = async (id) => {
        if (!await confirm({ title: "Delete Amenity", message: "Are you sure you want to delete this amenity?", confirmText: "Yes, Delete", variant: "danger" })) return;
        try {
            const response = await fetch(`${API}/owner/amenities/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Amenity deleted");
                fetchAmenities();
                if (editHostelId) {
                    fetchHostelDetails(editHostelId);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateBookingStatus = async (bookingId, status) => {
        if (!await confirm({
            title: "Update Booking Status",
            message: `Are you sure you want to update booking status to ${status}?`,
            confirmText: `Yes, Set to ${status}`,
            variant: status === "Approved" ? "primary" : status === "Rejected" ? "danger" : "warning"
        })) return;
        try {
            const response = await fetch(`${API}/bookings/${bookingId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const res = await response.json();
            if (res.success) {
                showMessage(`Booking updated to ${status}`);
                fetchBookings();
                fetchDashboardData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveReply = async (reviewId, reply) => {
        if (!await confirm({ title: "Save Reply", message: "Are you sure you want to save this reply?", confirmText: "Yes, Post Reply", variant: "primary" })) return;
        try {
            const response = await fetch(`${API}/owner/reviews/${reviewId}/reply`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ owner_reply: reply })
            });
            const res = await response.json();
            if (res.success) {
                showMessage("Reply posted");
                setEditReplyId(null);
                setEditReplyText("");
                fetchReviews();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkNotificationRead = async (id) => {
        try {
            const response = await fetch(`${API}/owner/notifications/${id}/read`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const res = await response.json();
            if (res.success) {
                fetchNotifications();
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

                /* Modern & Professional Modal Styling */
                .modal {
                    backdrop-filter: blur(10px);
                    background-color: rgba(15, 23, 42, 0.3) !important;
                }
                .modal-content {
                    border: 1px solid rgba(15, 23, 42, 0.08) !important;
                    border-radius: 20px !important;
                    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25) !important;
                    overflow: hidden;
                    background: #ffffff;
                }
                .modal-header {
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    border-bottom: 1px solid rgba(15, 23, 42, 0.08) !important;
                    padding: 18px 24px !important;
                }
                .modal-title {
                    font-family: 'Space Grotesk', sans-serif;
                    font-weight: 700;
                    font-size: 18px;
                    color: #0f172a;
                }
                .modal-body {
                    padding: 24px !important;
                }
                .modal-body::-webkit-scrollbar {
                    width: 6px;
                }
                .modal-body::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                .modal-body::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .modal-body::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                .modal-footer {
                    background: #f8fafc;
                    border-top: 1px solid rgba(15, 23, 42, 0.08) !important;
                    padding: 16px 24px !important;
                }
                .form-label {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #475569;
                    margin-bottom: 6px;
                }
                .form-control, .form-select {
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 9px 14px;
                    font-size: 13.5px;
                    color: #0f172a;
                    background-color: #ffffff;
                    transition: all 0.2s ease;
                }
                .form-control:focus, .form-select:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3.5px rgba(37, 99, 235, 0.1);
                    outline: none;
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
                    border-bottom: 2px solid #e2e8f0;
                    font-size: 11px;
                    font-weight: 750;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    padding: 0 !important;
                }
                .mu-user-card-row {
                    background: #ffffff;
                    border-bottom: 1px solid #e2e8f0;
                    transition: all 0.2s;
                    padding: 0 !important;
                }
                .mu-user-card-row:last-child {
                    border-bottom: none;
                }
                .mu-user-card-row:hover {
                    background: rgba(37, 99, 235, 0.02);
                }
                .mu-header-bar > div, .mu-user-card-row > div {
                    border-right: 1px solid #e2e8f0;
                    padding: 12px 16px !important;
                    min-height: 52px;
                    display: flex;
                    align-items: center;
                }
                .mu-header-bar > div:last-child, .mu-user-card-row > div:last-child {
                    border-right: none;
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

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .kpi-card {
                    background: #ffffff;
                    border: 1px solid var(--bdr);
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: var(--sh1);
                    transition: transform 0.2s;
                }
                .kpi-card:hover {
                    transform: translateY(-2px);
                }
                .kpi-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: grid;
                    place-items: center;
                    font-size: 20px;
                }
                .kpi-blue { background: rgba(37, 99, 235, 0.08); color: #2563eb; }
                .kpi-green { background: rgba(16, 185, 129, 0.08); color: #059669; }
                .kpi-purple { background: rgba(139, 92, 246, 0.08); color: #8b5cf6; }
                .kpi-yellow { background: rgba(245, 158, 11, 0.08); color: #d97706; }

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

            {/* Mobile Overlay */}
            <div className={`mob-overlay ${mobileOpen ? "show" : ""}`} onClick={() => setMobileOpen(false)} />

            {/* Sidebar */}
            <aside className={`cit-sidebar ${collapsed ? "col" : ""} ${mobileOpen ? "mob-open" : ""}`}>
                <div className="sb-brand">
                    <div className="sb-logo" onClick={collapsed ? () => setCollapsed(false) : undefined} style={collapsed ? { cursor: "pointer" } : {}}>
                        <i className="bi bi-building"></i>
                    </div>
                    {!collapsed && (
                        <div className="sb-brand-text">
                            <div className="sb-name">SCRHDP</div>
                            <div className="sb-sub">Owner Portal</div>
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
                                Owner Portal
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

                        {/* Reviews Link */}
                        <button 
                            className="tb-icon-btn" 
                            onClick={() => setActiveItem("Reviews")} 
                            title="Reviews"
                            style={activeItem === "Reviews" ? { color: "#f59e0b", background: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.2)" } : {}}
                        >
                            <i className="bi bi-star"></i>
                        </button>

                        {/* Notifications Link */}
                        <button 
                            className="tb-icon-btn" 
                            onClick={() => setActiveItem("Notifications")} 
                            title="Notifications"
                            style={{
                                position: "relative",
                                ...(activeItem === "Notifications" ? { color: "#6366f1", background: "rgba(99, 102, 241, 0.1)", borderColor: "rgba(99, 102, 241, 0.2)" } : {})
                            }}
                        >
                            <i className="bi bi-bell"></i>
                            {notifications.filter(n => !n.is_read).length > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.65rem", padding: "3px 6px" }}>
                                    {notifications.filter(n => !n.is_read).length}
                                </span>
                            )}
                        </button>

                        <div className="tb-avatar-wrap" onClick={() => setActiveItem("My Profile")}>
                            {profile?.profile_image ? (
                                <img src={profile.profile_image} className="tb-avatar" style={{ objectFit: "cover" }} alt="avatar" />
                            ) : (
                                <div className="tb-avatar"><i className="bi bi-person-fill"></i></div>
                            )}
                            <div className="d-none d-md-block">
                                <div className="tb-uname">{profile?.owner_name || username}</div>
                                <div className="tb-urole">Hostel Owner</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="cit-content">

                    {/* 🏠 DASHBOARD VIEW */}
                    {activeItem === "Dashboard" && (
                        <div className="mu-outer-container">
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Welcome back, {profile?.owner_name || username}! 👋</h1>
                                    <p className="mu-banner-subtitle">Configure hostels properties, respond to room bookings, and reply to student reviews.</p>
                                </div>
                                <div className="mu-stats-grid">
                                    <div className="mu-stat-card">
                                        <div className="mu-stat-icon-container"><i className="bi bi-building"></i></div>
                                        <div className="mu-stat-details">
                                            <div className="mu-stat-label">Listed Hostels</div>
                                            <div className="mu-stat-value">{stats.total_hostels}</div>
                                        </div>
                                    </div>
                                    <div className="mu-stat-card">
                                        <div className="mu-stat-icon-container"><i className="bi bi-calendar-check"></i></div>
                                        <div className="mu-stat-details">
                                            <div className="mu-stat-label">Bookings</div>
                                            <div className="mu-stat-value">{stats.total_bookings}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="kpi-grid">
                                <div className="kpi-card">
                                    <div>
                                        <span className="text-muted small text-uppercase">Listed Properties</span>
                                        <h3 className="fw-bold mt-1 mb-0">{stats.total_hostels}</h3>
                                    </div>
                                    <div className="kpi-icon-wrapper kpi-blue"><i className="bi bi-building"></i></div>
                                </div>
                                <div className="kpi-card">
                                    <div>
                                        <span className="text-muted small text-uppercase">Pending Bookings</span>
                                        <h3 className="fw-bold text-warning mt-1 mb-0">{stats.pending_bookings}</h3>
                                    </div>
                                    <div className="kpi-icon-wrapper kpi-yellow"><i className="bi bi-clock-history"></i></div>
                                </div>
                                <div className="kpi-card">
                                    <div>
                                        <span className="text-muted small text-uppercase">Students Feedback</span>
                                        <h3 className="fw-bold mt-1 mb-0">{stats.reviews_count} Reviews</h3>
                                    </div>
                                    <div className="kpi-icon-wrapper kpi-green"><i className="bi bi-star"></i></div>
                                </div>
                            </div>

                            {/* Graphical Statistics Section */}
                            <div className="row g-4 mt-1 text-dark">
                                {/* Booking Distribution CSS Bar Chart */}
                                <div className="col-md-6">
                                    <div className="mu-table-card-wrapper p-4 bg-white">
                                        <h6 className="fw-bold mb-4 text-primary">
                                            <i className="bi bi-bar-chart-fill me-2"></i>Bookings Status Distribution
                                        </h6>
                                        <div className="d-flex flex-column gap-3">
                                            {/* Approved Bar */}
                                            <div>
                                                <div className="d-flex justify-content-between small fw-semibold mb-1">
                                                    <span>Approved Bookings</span>
                                                    <span>{approvedBookingsCount} ({Math.round((approvedBookingsCount/totalBookingsCount)*100)}%)</span>
                                                </div>
                                                <div className="progress" style={{ height: "12px", borderRadius: "6px", background: "#f1f5f9" }}>
                                                    <div className="progress-bar bg-success" style={{ width: `${(approvedBookingsCount/totalBookingsCount)*100}%`, borderRadius: "6px" }}></div>
                                                </div>
                                            </div>
                                            {/* Pending Bar */}
                                            <div>
                                                <div className="d-flex justify-content-between small fw-semibold mb-1">
                                                    <span>Pending Review</span>
                                                    <span>{pendingBookingsCount} ({Math.round((pendingBookingsCount/totalBookingsCount)*100)}%)</span>
                                                </div>
                                                <div className="progress" style={{ height: "12px", borderRadius: "6px", background: "#f1f5f9" }}>
                                                    <div className="progress-bar bg-warning" style={{ width: `${(pendingBookingsCount/totalBookingsCount)*100}%`, borderRadius: "6px" }}></div>
                                                </div>
                                            </div>
                                            {/* Cancelled/Rejected Bar */}
                                            <div>
                                                <div className="d-flex justify-content-between small fw-semibold mb-1">
                                                    <span>Rejected / Cancelled</span>
                                                    <span>{cancelledBookingsCount} ({Math.round((cancelledBookingsCount/totalBookingsCount)*100)}%)</span>
                                                </div>
                                                <div className="progress" style={{ height: "12px", borderRadius: "6px", background: "#f1f5f9" }}>
                                                    <div className="progress-bar bg-danger" style={{ width: `${(cancelledBookingsCount/totalBookingsCount)*100}%`, borderRadius: "6px" }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Room / Bed Occupancy Rate Progress Graph */}
                                <div className="col-md-6">
                                    <div className="mu-table-card-wrapper p-4 bg-white">
                                        <h6 className="fw-bold mb-4 text-primary">
                                            <i className="bi bi-pie-chart-fill me-2"></i>Occupancy Status
                                        </h6>
                                        <div className="d-flex flex-column gap-3">
                                            {/* Rooms Occupancy */}
                                            <div>
                                                <div className="d-flex justify-content-between small fw-semibold mb-1">
                                                    <span>Room Occupancy</span>
                                                    <span>{occupiedRooms} / {totalRooms || 0} Rooms Occupied</span>
                                                </div>
                                                <div className="progress" style={{ height: "12px", borderRadius: "6px", background: "#f1f5f9" }}>
                                                    <div className="progress-bar bg-primary" style={{ width: totalRooms > 0 ? `${(occupiedRooms/totalRooms)*100}%` : "0%", borderRadius: "6px" }}></div>
                                                </div>
                                            </div>
                                            {/* Beds Occupancy */}
                                            <div>
                                                <div className="d-flex justify-content-between small fw-semibold mb-1">
                                                    <span>Bed Occupancy</span>
                                                    <span>{occupiedBeds} / {totalBeds || 0} Beds Occupied</span>
                                                </div>
                                                <div className="progress" style={{ height: "12px", borderRadius: "6px", background: "#f1f5f9" }}>
                                                    <div className="progress-bar bg-info" style={{ width: totalBeds > 0 ? `${(occupiedBeds/totalBeds)*100}%` : "0%", borderRadius: "6px" }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    )}

                    {/* 👤 MY PROFILE VIEW */}
                    {activeItem === "My Profile" && profile && (
                        <div className="mu-outer-container">
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">My Profile</h1>
                                    <p className="mu-banner-subtitle">Configure your owner details, upload profile image, and modify coordinates.</p>
                                </div>
                            </div>

                            <div className="mu-table-card-wrapper p-4 text-dark">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h6 className="fw-bold mb-0">Profile Information</h6>
                                    <button className={`btn btn-sm ${profileEditing ? "btn-secondary" : "btn-primary"}`} onClick={() => setProfileEditing(!profileEditing)}>
                                        {profileEditing ? "Cancel Edit" : "Edit Profile"}
                                    </button>
                                </div>

                                <div className="row">
                                    <div className="col-md-3 text-center mb-4">
                                        <img 
                                            src={profileFormData.profile_image || "https://placehold.co/150"} 
                                            className="img-thumbnail rounded-circle mb-3" 
                                            style={{ width: "150px", height: "150px", objectFit: "cover" }} 
                                            alt="profile" 
                                        />
                                        {profileEditing && (
                                            <div className="mb-3">
                                                <input type="file" className="form-control form-control-sm" accept="image/*" onChange={(e) => setNewImageFile(e.target.files[0])} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-9">
                                        <form onSubmit={handleProfileUpdate}>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label text-muted small fw-semibold">Owner Name</label>
                                                    <input type="text" className="form-control" name="owner_name" value={profileFormData.owner_name} onChange={handleProfileChange} disabled={!profileEditing} required />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label text-muted small fw-semibold">Email Address</label>
                                                    <input type="email" className="form-control" name="email" value={profileFormData.email} onChange={handleProfileChange} disabled={!profileEditing} required />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label text-muted small fw-semibold">Phone</label>
                                                    <input type="text" className="form-control" name="phone" value={profileFormData.phone} onChange={handleProfileChange} disabled={!profileEditing} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label text-muted small fw-semibold">City</label>
                                                    <input type="text" className="form-control" name="city_name" value={profileFormData.city_name} onChange={handleProfileChange} disabled={!profileEditing} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label text-muted small fw-semibold">State</label>
                                                    <input type="text" className="form-control" name="state" value={profileFormData.state} onChange={handleProfileChange} disabled={!profileEditing} />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label text-muted small fw-semibold">Pincode</label>
                                                    <input type="text" className="form-control" name="pincode" value={profileFormData.pincode} onChange={handleProfileChange} disabled={!profileEditing} />
                                                </div>
                                                <div className="col-md-12">
                                                    <label className="form-label text-muted small fw-semibold">Address</label>
                                                    <textarea className="form-control" name="address" rows="2" value={profileFormData.address} onChange={handleProfileChange} disabled={!profileEditing}></textarea>
                                                </div>
                                            </div>
                                            {profileEditing && (
                                                <button type="submit" className="btn btn-success mt-3">Save profile updates</button>
                                            )}
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 🏢 MY HOSTELS VIEW */}
                    {activeItem === "My Hostels" && (
                        <div className="mu-outer-container">
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">My Hostels</h1>
                                    <p className="mu-banner-subtitle">Configure listed properties, add new hostels details, and check approval states.</p>
                                </div>
                                <button className="btn btn-light text-primary fw-bold" onClick={() => {
                                    setEditHostelId(null);
                                    setHostelForm({
                                        hostel_name: "", city_name: "", gender_allowed: "Boys", sharing_type: "Single Sharing",
                                        address: "", location: "", description: "", monthly_rent: 0, daily_rent: 0, deposit: 0,
                                        total_rooms: 0, available_rooms: 0, total_beds: 0, available_beds: 0,
                                        contact_number: "", hostel_rules: "", hostel_logo: ""
                                    });
                                    setHostelFormOpen(true);
                                }}>
                                    <i className="bi bi-plus-lg"></i> Add Hostel
                                </button>
                            </div>

                            <div className="mu-control-bar">
                                <div className="mu-search-wrapper">
                                    <i className="bi bi-search"></i>
                                    <input type="text" className="mu-search-input" placeholder="Search hostels..." value={hostelSearch} onChange={(e) => setHostelSearch(e.target.value)} />
                                </div>
                            </div>

                            <div className="mu-table-card-wrapper">
                                <div className="mu-header-bar" style={{ display: "grid", gridTemplateColumns: "10% 25% 15% 15% 10% 12% 13%", alignItems: "center" }}>
                                    <div>ID</div>
                                    <div>Hostel Name</div>
                                    <div>City</div>
                                    <div>Sharing Type</div>
                                    <div>Rent</div>
                                    <div>Status</div>
                                    <div style={{ textAlign: "right" }}>Actions</div>
                                </div>
                                <div className="mu-rows-container">
                                    {hostels.filter(h => h.hostel_name.toLowerCase().includes(hostelSearch.toLowerCase())).map(h => (
                                        <div key={h.hostel_id} className="mu-user-card-row" style={{ display: "grid", gridTemplateColumns: "10% 25% 15% 15% 10% 12% 13%", alignItems: "center" }}>
                                            <div><span className="mu-id-badge">#{h.hostel_id}</span></div>
                                            <div className="mu-user-cell">
                                                {h.hostel_logo ? (
                                                    <img src={h.hostel_logo} className="rounded-circle" style={{ width: "32px", height: "32px", objectFit: "cover" }} alt="logo" />
                                                ) : (
                                                    <div className="mu-avatar" style={{ width: "32px", height: "32px", fontSize: "11px" }}>{h.hostel_name.charAt(0)}</div>
                                                )}
                                                <div className="mu-name" style={{ fontSize: "13px" }}>{h.hostel_name}</div>
                                            </div>
                                            <div className="text-secondary">{h.city_name || "N/A"}</div>
                                            <div className="text-secondary">{h.sharing_type}</div>
                                            <div className="fw-bold d-flex flex-column">
                                                <span>₹{parseFloat(h.monthly_rent).toLocaleString()} <span className="text-muted small">/ mo</span></span>
                                                <span className="text-primary small">₹{parseFloat(h.daily_rent || 0).toLocaleString()} / day</span>
                                            </div>
                                            <div>
                                                <span className={`badge bg-${h.status === "Approved" ? "success" : h.status === "Rejected" ? "danger" : "warning"}`}>{h.status}</span>
                                            </div>
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button className="btn btn-sm btn-info text-white" onClick={() => { setSelectedHostel(h); fetchHostelDetails(h.hostel_id); }}><i className="bi bi-eye"></i></button>
                                                <button className="btn btn-sm btn-warning" onClick={() => handleEditHostelClick(h)}><i className="bi bi-pencil"></i></button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteHostel(h.hostel_id)}><i className="bi bi-trash"></i></button>
                                            </div>
                                        </div>
                                    ))}
                                    {hostels.length === 0 && <div className="p-4 text-center text-muted">No hostel listings found.</div>}
                                </div>
                            </div>

                            {/* Add/Edit Hostel Modal */}
                            {hostelFormOpen && (
                                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                                        <form onSubmit={handleSaveHostel} className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">{editHostelId ? "Edit Hostel Details" : "Create New Property Listing"}</h5>
                                                <button type="button" className="btn-close" onClick={() => { setHostelFormOpen(false); setEditHostelId(null); }}></button>
                                            </div>
                                            <div className="modal-body text-dark">
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Hostel Name</label>
                                                        <input type="text" className="form-control" value={hostelForm.hostel_name} onChange={(e) => setHostelForm({ ...hostelForm, hostel_name: e.target.value })} required />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">City Name</label>
                                                        <select 
                                                            className="form-select" 
                                                            value={hostelForm.city_name} 
                                                            onChange={(e) => setHostelForm({ ...hostelForm, city_name: e.target.value })} 
                                                            required
                                                        >
                                                            <option value="">-- Select City --</option>
                                                            {cities.map(c => (
                                                                <option key={c.city_id} value={c.city_name}>{c.city_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Logo Image Upload</label>
                                                        <input type="file" className="form-control" accept="image/*" onChange={(e) => handleLogoUpload(e.target.files[0])} />
                                                        {hostelForm.hostel_logo && (
                                                            <div className="mt-1 small text-success">✓ Uploaded: {hostelForm.hostel_logo.split('/').pop()}</div>
                                                        )}
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Gender Allowed</label>
                                                        <select className="form-select" value={hostelForm.gender_allowed} onChange={(e) => setHostelForm({ ...hostelForm, gender_allowed: e.target.value })}>
                                                            <option value="Boys">Boys</option>
                                                            <option value="Girls">Girls</option>
                                                            <option value="Co-Living">Co-Living</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Sharing Type</label>
                                                        <select className="form-select" value={hostelForm.sharing_type} onChange={(e) => setHostelForm({ ...hostelForm, sharing_type: e.target.value })}>
                                                            <option value="Single Sharing">Single Sharing</option>
                                                            <option value="Double Sharing">Double Sharing</option>
                                                            <option value="Triple Sharing">Triple Sharing</option>
                                                            <option value="Four Sharing">Four Sharing</option>
                                                            <option value="Dormitory">Dormitory</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label className="form-label">Physical Address</label>
                                                        <textarea className="form-control" value={hostelForm.address} onChange={(e) => setHostelForm({ ...hostelForm, address: e.target.value })}></textarea>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label className="form-label">Location description (map, near landmarks)</label>
                                                        <textarea className="form-control" value={hostelForm.location} onChange={(e) => setHostelForm({ ...hostelForm, location: e.target.value })}></textarea>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label d-flex justify-content-between align-items-center w-100">
                                                            <span>Latitude</span>
                                                            <button type="button" className="btn btn-xs btn-outline-primary" style={{ fontSize: "10px", padding: "1px 5px", border: "1px solid #2563eb", borderRadius: "4px", background: "none", color: "#2563eb", cursor: "pointer" }} onClick={() => {
                                                                if (navigator.geolocation) {
                                                                    navigator.geolocation.getCurrentPosition((pos) => {
                                                                        setHostelForm(prev => ({
                                                                            ...prev,
                                                                            latitude: pos.coords.latitude.toString(),
                                                                            longitude: pos.coords.longitude.toString()
                                                                        }));
                                                                    }, (err) => {
                                                                        showMessage("Error getting location: " + err.message);
                                                                    });
                                                                } else {
                                                                    showMessage("Geolocation is not supported by this browser.");
                                                                }
                                                            }}>
                                                                <i className="bi bi-geo-fill"></i> Detect Location
                                                            </button>
                                                        </label>
                                                        <input type="text" className="form-control" placeholder="e.g. 12.971598" value={hostelForm.latitude} onChange={(e) => setHostelForm({ ...hostelForm, latitude: e.target.value })} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Longitude</label>
                                                        <input type="text" className="form-control" placeholder="e.g. 77.594562" value={hostelForm.longitude} onChange={(e) => setHostelForm({ ...hostelForm, longitude: e.target.value })} />
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label className="form-label">Description / Tagline</label>
                                                        <textarea className="form-control" value={hostelForm.description} onChange={(e) => setHostelForm({ ...hostelForm, description: e.target.value })}></textarea>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Monthly Rent (₹)</label>
                                                        <input type="number" className="form-control" value={hostelForm.monthly_rent} onChange={(e) => setHostelForm({ ...hostelForm, monthly_rent: parseFloat(e.target.value) })} required />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Daily Rent (₹)</label>
                                                        <input type="number" className="form-control" value={hostelForm.daily_rent} onChange={(e) => setHostelForm({ ...hostelForm, daily_rent: parseFloat(e.target.value) })} required />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Security Deposit (₹)</label>
                                                        <input type="number" className="form-control" value={hostelForm.deposit} onChange={(e) => setHostelForm({ ...hostelForm, deposit: parseFloat(e.target.value) })} required />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Total Rooms</label>
                                                        <input type="number" className="form-control" value={hostelForm.total_rooms} onChange={(e) => setHostelForm({ ...hostelForm, total_rooms: parseInt(e.target.value, 10) })} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Available Rooms</label>
                                                        <input type="number" className="form-control" value={hostelForm.available_rooms} onChange={(e) => setHostelForm({ ...hostelForm, available_rooms: parseInt(e.target.value, 10) })} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Total Beds</label>
                                                        <input type="number" className="form-control" value={hostelForm.total_beds} onChange={(e) => setHostelForm({ ...hostelForm, total_beds: parseInt(e.target.value, 10) })} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Available Beds</label>
                                                        <input type="number" className="form-control" value={hostelForm.available_beds} onChange={(e) => setHostelForm({ ...hostelForm, available_beds: parseInt(e.target.value, 10) })} />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Contact Number</label>
                                                        <input type="text" className="form-control" value={hostelForm.contact_number} onChange={(e) => setHostelForm({ ...hostelForm, contact_number: e.target.value })} />
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label className="form-label">House Rules</label>
                                                        <textarea className="form-control" value={hostelForm.hostel_rules} onChange={(e) => setHostelForm({ ...hostelForm, hostel_rules: e.target.value })}></textarea>
                                                    </div>

                                                    {editHostelId ? (
                                                        <div className="col-md-12 border-top pt-4 mt-4">
                                                            <h5 className="fw-bold text-primary mb-3"><i className="bi bi-stars"></i> Manage Amenities</h5>
                                                            <div className="d-flex flex-wrap gap-2 mb-3">
                                                                {hostelDetails.amenities.map(a => (
                                                                    <span key={a.id} className="badge bg-secondary d-flex align-items-center gap-2 p-2" style={{ fontSize: "12px" }}>
                                                                        {a.amenity_name}
                                                                        <button type="button" className="btn-close btn-close-white" style={{ fontSize: "8px" }} onClick={() => handleDeleteAmenity(a.id)}></button>
                                                                    </span>
                                                                ))}
                                                                {hostelDetails.amenities.length === 0 && <span className="text-muted small">No amenities added yet.</span>}
                                                            </div>
                                                            <div className="row g-2 align-items-center mb-4">
                                                                <div className="col-auto">
                                                                    <input 
                                                                        type="text" 
                                                                        className="form-control form-control-sm" 
                                                                        placeholder="e.g. WiFi, AC, Laundry" 
                                                                        value={newAmenityForm.amenity_name} 
                                                                        onChange={(e) => setNewAmenityForm({ ...newAmenityForm, amenity_name: e.target.value })} 
                                                                    />
                                                                </div>
                                                                <div className="col-auto">
                                                                    <button type="button" className="btn btn-sm btn-primary" onClick={handleSaveAmenity}>
                                                                        Add Amenity
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <h5 className="fw-bold text-primary mb-3 border-top pt-4 mt-4"><i className="bi bi-images"></i> Manage Hostel Images</h5>
                                                            <div className="row g-3 mb-3">
                                                                {hostelDetails.images.map(img => (
                                                                    <div key={img.image_id} className="col-md-3">
                                                                        <div className="card h-100 shadow-sm border border-secondary-subtle">
                                                                            <img src={img.image_path} className="card-img-top" style={{ height: "90px", objectFit: "cover" }} alt="gallery" />
                                                                            <div className="card-body p-2 text-center">
                                                                                <div className="fw-semibold small text-truncate" style={{ fontSize: "11px" }}>{img.image_title || "Untitled"}</div>
                                                                                <button type="button" className="btn btn-xs btn-outline-danger mt-1 py-0 px-2" style={{ fontSize: "10px" }} onClick={() => handleDeleteImage(img.image_id)}>
                                                                                    <i className="bi bi-trash"></i> Remove
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {hostelDetails.images.length === 0 && <p className="text-muted small col-12">No images uploaded yet.</p>}
                                                            </div>

                                                            <div className="card p-3 bg-light border border-secondary-subtle">
                                                                <h6 className="fw-bold small mb-2 text-dark">Add New Image</h6>
                                                                <div className="row g-3 align-items-end">
                                                                    <div className="col-md-6">
                                                                        <label className="form-label small text-muted">Image Title</label>
                                                                        <input 
                                                                            type="text" 
                                                                            className="form-control form-control-sm" 
                                                                            placeholder="e.g. Room, Kitchen" 
                                                                            value={newImageForm.image_title} 
                                                                            onChange={(e) => setNewImageForm({ ...newImageForm, image_title: e.target.value })} 
                                                                        />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <label className="form-label small text-muted">Upload File</label>
                                                                        <input 
                                                                            type="file" 
                                                                            className="form-control form-control-sm" 
                                                                            accept="image/*" 
                                                                            onChange={(e) => setNewImageUploadFile(e.target.files[0])} 
                                                                        />
                                                                    </div>
                                                                    <div className="col-12 mt-2">
                                                                        <button type="button" className="btn btn-sm btn-primary" onClick={handleSaveImage}>
                                                                            Upload Image
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="col-md-12 border-top pt-3 mt-3">
                                                            <div className="alert alert-warning d-flex align-items-center gap-2 mb-0" role="alert">
                                                                <i className="bi bi-info-circle-fill"></i>
                                                                <div className="small">
                                                                    Note: Hostel images and amenities can be managed after saving the initial hostel details.
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="submit" className="btn btn-primary">Save Properties</button>
                                                <button type="button" className="btn btn-secondary" onClick={() => { setHostelFormOpen(false); setEditHostelId(null); }}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                             {/* View Hostel Details modal */}
                             {selectedHostel && (
                                 <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                                     <div className="modal-dialog modal-lg modal-dialog-scrollable">
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
                        </div>
                    )}

                    {/* 🖼️ HOSTEL IMAGES VIEW */}
                    {activeItem === "Hostel Images" && (
                        <div className="mu-outer-container">
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Hostel Images Gallery</h1>
                                    <p className="mu-banner-subtitle">Configure images, upload new photographs to property listings, and manage gallery titles.</p>
                                </div>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-5">
                                    <div className="dashboard-pane text-dark">
                                        <h6 className="fw-bold mb-3">➕ Add Image to Hostel</h6>
                                        <form onSubmit={handleSaveImage}>
                                            <div className="mb-3">
                                                <label className="form-label text-muted small fw-semibold">Select Hostel</label>
                                                <select className="form-select" value={newImageForm.hostel_id} onChange={(e) => setNewImageForm({ ...newImageForm, hostel_id: e.target.value })} required>
                                                    <option value="">-- Choose Hostel Property --</option>
                                                    {hostels.map(h => (
                                                        <option key={h.hostel_id} value={h.hostel_id}>{h.hostel_name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label text-muted small fw-semibold">Image Title</label>
                                                <input type="text" className="form-control" placeholder="Room View, Kitchen, Balcony..." value={newImageForm.image_title} onChange={(e) => setNewImageForm({ ...newImageForm, image_title: e.target.value })} />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label text-muted small fw-semibold">Upload Photo File</label>
                                                <input type="file" className="form-control" accept="image/*" onChange={(e) => setNewImageUploadFile(e.target.files[0])} />
                                            </div>
                                            <div className="text-center text-muted mb-2">OR</div>
                                            <div className="mb-3">
                                                <label className="form-label text-muted small fw-semibold">Image URL Link</label>
                                                <input type="text" className="form-control" placeholder="https://..." value={newImageForm.image_path} onChange={(e) => setNewImageForm({ ...newImageForm, image_path: e.target.value })} />
                                            </div>
                                            <button type="submit" className="btn btn-primary w-100">Upload Image</button>
                                        </form>
                                    </div>
                                </div>
                                <div className="col-md-7">
                                    <div className="mu-table-card-wrapper p-3" style={{ maxHeight: "550px", overflowY: "auto" }}>
                                        <h6 className="fw-bold mb-3 text-dark">🖼️ Uploaded Photo Galleries</h6>
                                        <div className="row g-2">
                                            {images.map(img => (
                                                <div key={img.image_id} className="col-md-6">
                                                    <div className="card h-100 shadow-sm border border-secondary-subtle">
                                                        <img src={img.image_path} className="card-img-top" style={{ height: "130px", objectFit: "cover", cursor: "pointer" }} alt="gallery" onClick={() => setFullScreenImage(img.image_path)} />
                                                        <div className="card-body p-2 text-dark">
                                                            <div className="fw-semibold small">{img.image_title || "Untitled Image"}</div>
                                                            <div className="text-muted small" style={{ fontSize: "0.75rem" }}>Hostel: {img.hostel_name}</div>
                                                            <button className="btn btn-xs btn-outline-danger mt-2 w-100" onClick={() => handleDeleteImage(img.image_id)}><i className="bi bi-trash"></i> Remove Image</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {images.length === 0 && <p className="text-muted text-center p-4">No images listed. Use form on the left to add.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ✨ HOSTEL AMENITIES VIEW */}
                    {activeItem === "Hostel Amenities" && (
                        <div className="mu-outer-container">
                            {/* HUD Banner */}
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Hostel Amenities</h1>
                                    <p className="mu-banner-subtitle">Configure amenities lists, insert parameters (Wi-Fi, AC, Laundry), and assign to properties.</p>
                                </div>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-5">
                                    <div className="dashboard-pane text-dark">
                                        <h6 className="fw-bold mb-3">➕ Add Amenity</h6>
                                        <form onSubmit={handleSaveAmenity}>
                                            <div className="mb-3">
                                                <label className="form-label text-muted small fw-semibold">Select Hostel</label>
                                                <select className="form-select" value={newAmenityForm.hostel_id} onChange={(e) => setNewAmenityForm({ ...newAmenityForm, hostel_id: e.target.value })} required>
                                                    <option value="">-- Choose Hostel Property --</option>
                                                    {hostels.map(h => (
                                                        <option key={h.hostel_id} value={h.hostel_id}>{h.hostel_name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label text-muted small fw-semibold">Amenity Name</label>
                                                <input type="text" className="form-control" placeholder="High-speed Wi-Fi, AC, CCTV, Laundry..." value={newAmenityForm.amenity_name} onChange={(e) => setNewAmenityForm({ ...newAmenityForm, amenity_name: e.target.value })} required />
                                            </div>
                                            <button type="submit" className="btn btn-primary w-100">Add Amenity</button>
                                        </form>
                                    </div>
                                </div>
                                <div className="col-md-7">
                                    <div className="mu-table-card-wrapper p-3">
                                        <h6 className="fw-bold mb-3 text-dark">🌟 Configured Amenities List</h6>
                                        <div className="table-responsive">
                                            <table className="table table-dark-custom align-middle">
                                                <thead>
                                                    <tr>
                                                        <th>Hostel Name</th>
                                                        <th>Amenity</th>
                                                        <th style={{ textAlign: "right" }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {amenities.map(a => (
                                                        <tr key={a.id}>
                                                            <td><strong>{a.hostel_name}</strong></td>
                                                            <td><span className="badge bg-info">{a.amenity_name}</span></td>
                                                            <td style={{ textAlign: "right" }}>
                                                                <button className="btn btn-xs btn-outline-danger" onClick={() => handleDeleteAmenity(a.id)}><i className="bi bi-trash"></i></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {amenities.length === 0 && <tr><td colSpan="3" className="text-center text-muted">No amenities configured yet.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 📅 BOOKINGS VIEW */}
                    {activeItem === "Bookings" && (
                        <div className="mu-outer-container">
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Incoming Student Bookings</h1>
                                    <p className="mu-banner-subtitle">Configure bookings status parameters, approve room requests, and check contact details.</p>
                                </div>
                            </div>

                            <div className="mu-control-bar">
                                <div className="mu-search-wrapper">
                                    <i className="bi bi-search"></i>
                                    <input type="text" className="mu-search-input" placeholder="Search by student..." value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} />
                                </div>
                            </div>

                            <div className="mu-table-card-wrapper">
                                <div className="mu-header-bar" style={{ display: "grid", gridTemplateColumns: "8% 22% 18% 15% 12% 12% 13%", alignItems: "center" }}>
                                    <div>ID</div>
                                    <div>Student</div>
                                    <div>Hostel</div>
                                    <div>Reservation Date</div>
                                    <div>Status</div>
                                    <div>Payment</div>
                                    <div style={{ textAlign: "right" }}>Actions</div>
                                </div>
                                <div className="mu-rows-container">
                                    {bookings.filter(b => b.student_name.toLowerCase().includes(bookingSearch.toLowerCase())).map(b => (
                                        <div key={b.booking_id} className="mu-user-card-row" style={{ display: "grid", gridTemplateColumns: "8% 22% 18% 15% 12% 12% 13%", alignItems: "center" }}>
                                            <div><span className="mu-id-badge">#{b.booking_id}</span></div>
                                            <div className="mu-user-cell">
                                                {b.profile_image ? (
                                                    <img src={b.profile_image.startsWith("http") ? b.profile_image : `${API}/${b.profile_image}`} className="rounded-circle" style={{ width: "32px", height: "32px", objectFit: "cover" }} alt="student" />
                                                ) : (
                                                    <div className="mu-avatar" style={{ width: "32px", height: "32px", fontSize: "11px" }}>{b.student_name.charAt(0)}</div>
                                                )}
                                                <div>
                                                    <div className="mu-name" style={{ fontSize: "13px" }}>{b.student_name}</div>
                                                    <div className="text-muted small" style={{ fontSize: "0.7rem" }}>{b.student_email} | {b.student_phone}</div>
                                                </div>
                                            </div>
                                            <div className="text-secondary">{b.hostel_name}</div>
                                            <div className="text-secondary">{new Date(b.booking_date).toLocaleDateString()}</div>
                                            <div>
                                                <span className={`badge bg-${b.booking_status === "Approved" ? "success" : b.booking_status === "Rejected" ? "danger" : "warning"}`}>{b.booking_status}</span>
                                            </div>
                                            <div>
                                                <span className={`badge bg-${b.payment_status === "Paid" ? "success" : b.payment_status === "Refunded" ? "info" : "secondary"}`} style={{ fontSize: "11px" }}>
                                                    {b.payment_status || "Pending"}
                                                </span>
                                            </div>
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button className="btn btn-sm btn-info text-white" onClick={() => setSelectedBooking(b)} title="View Student details"><i className="bi bi-eye"></i></button>
                                                {b.booking_status === "Pending" && (
                                                    <>
                                                        <button className="btn btn-sm btn-success px-2" onClick={() => handleUpdateBookingStatus(b.booking_id, "Approved")}>Approve</button>
                                                        <button className="btn btn-sm btn-danger px-2" onClick={() => handleUpdateBookingStatus(b.booking_id, "Rejected")}>Reject</button>
                                                    </>
                                                )}
                                                {b.booking_status === "Approved" && (
                                                    <button className="btn btn-sm btn-outline-secondary px-2" onClick={() => handleUpdateBookingStatus(b.booking_id, "Cancelled")}>Cancel</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {bookings.length === 0 && <div className="p-4 text-center text-muted">No bookings received.</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ⭐ REVIEWS VIEW */}
                    {activeItem === "Reviews" && (
                        <div className="mu-outer-container">
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Reviews & Feedback</h1>
                                    <p className="mu-banner-subtitle">Monitor ratings, check reviews, and write replies to students feedback.</p>
                                </div>
                            </div>

                            <div className="mu-table-card-wrapper">
                                <div className="mu-header-bar" style={{ display: "grid", gridTemplateColumns: "15% 15% 15% 25% 30%", alignItems: "center" }}>
                                    <div>Student</div>
                                    <div>Hostel</div>
                                    <div>Rating</div>
                                    <div>Review Comment</div>
                                    <div>Owner Reply / Actions</div>
                                </div>
                                <div className="mu-rows-container">
                                    {reviews.map(r => (
                                        <div key={r.review_id} className="mu-user-card-row" style={{ display: "grid", gridTemplateColumns: "15% 15% 15% 25% 30%", alignItems: "center" }}>
                                            <div className="fw-bold">{r.student_name}</div>
                                            <div className="text-secondary">{r.hostel_name}</div>
                                            <div><span className="text-warning">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span></div>
                                            <div className="text-secondary small">{r.review}</div>
                                            <div>
                                                {r.owner_reply && editReplyId !== r.review_id ? (
                                                    <div className="p-2 bg-light border rounded small text-dark mt-1">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div><strong>Reply: </strong> {r.owner_reply}</div>
                                                            <button className="btn btn-sm text-primary p-0 m-0" onClick={() => { setEditReplyId(r.review_id); setEditReplyText(r.owner_reply); }}><i className="bi bi-pencil-square" title="Edit Reply"></i></button>
                                                        </div>
                                                    </div>
                                                ) : editReplyId === r.review_id ? (
                                                    <form onSubmit={(e) => {
                                                        e.preventDefault();
                                                        if (editReplyText) {
                                                            handleSaveReply(r.review_id, editReplyText);
                                                        }
                                                    }} className="d-flex flex-column gap-2 mt-1">
                                                        <input type="text" className="form-control form-control-sm" value={editReplyText} onChange={(e) => setEditReplyText(e.target.value)} required />
                                                        <div className="d-flex gap-2">
                                                            <button type="submit" className="btn btn-sm btn-primary">Save</button>
                                                            <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setEditReplyId(null); setEditReplyText(""); }}>Cancel</button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <form onSubmit={(e) => {
                                                        e.preventDefault();
                                                        const replyVal = e.target.replyInput.value;
                                                        if (replyVal) {
                                                            handleSaveReply(r.review_id, replyVal);
                                                            e.target.reset();
                                                        }
                                                    }} className="d-flex gap-2">
                                                        <input type="text" name="replyInput" className="form-control form-control-sm" placeholder="Write reply..." required />
                                                        <button type="submit" className="btn btn-sm btn-outline-primary">Send</button>
                                                    </form>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {reviews.length === 0 && <div className="p-4 text-center text-muted">No reviews recorded.</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 🔔 NOTIFICATIONS VIEW */}
                    {activeItem === "Notifications" && (
                        <div className="mu-outer-container">
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Notifications</h1>
                                    <p className="mu-banner-subtitle">Check bookings updates, approve notifications, and system alerts.</p>
                                </div>
                            </div>

                            <div className="mu-table-card-wrapper p-3" style={{ maxHeight: "550px", overflowY: "auto" }}>
                                <h6 className="fw-bold mb-3 text-dark"><i className="bi bi-bell-fill text-primary"></i> Notification Alerts</h6>
                                {notifications.filter(n => !n.is_read).map(n => (
                                    <div key={n.notification_id} className={`p-3 mb-2 border rounded text-dark d-flex justify-content-between align-items-start ${n.is_read ? "bg-light border-secondary-subtle" : "bg-primary-subtle border-primary"}`} style={{ opacity: n.is_read ? 0.75 : 1 }}>
                                        <div>
                                            <span className="badge bg-secondary mb-2">{n.notification_type}</span>
                                            <h6 className="mb-1 fw-bold">{n.title}</h6>
                                            <p className="mb-1 text-muted small">{n.message}</p>
                                            <span className="text-muted small" style={{ fontSize: "0.7rem" }}>{new Date(n.created_at).toLocaleString()}</span>
                                        </div>
                                        {!n.is_read && (
                                            <button className="btn btn-xs btn-primary" onClick={() => handleMarkNotificationRead(n.notification_id)}>Mark read</button>
                                        )}
                                    </div>
                                ))}
                                {notifications.filter(n => !n.is_read).length === 0 && <p className="text-muted text-center p-4">No notifications dispatched.</p>}
                            </div>
                        </div>
                    )}

                    {/* ⚙️ CHANGE PASSWORD VIEW */}
                    {activeItem === "Change Password" && (
                        <div className="mu-outer-container">
                            <div className="mu-banner">
                                <div className="mu-banner-content">
                                    <h1 className="mu-banner-title">Change Password</h1>
                                    <p className="mu-banner-subtitle">Configure your system login security credentials settings.</p>
                                </div>
                            </div>

                            <div className="mu-table-card-wrapper p-4 text-dark" style={{ maxWidth: "500px" }}>
                                <h6 className="fw-bold mb-4">Reset Login Password</h6>
                                <form onSubmit={handleUpdatePassword}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-semibold">Current Password</label>
                                        <input type="password" className="form-control" value={pwdForm.current_password} onChange={(e) => setPwdForm({ ...pwdForm, current_password: e.target.value })} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-semibold">New Password</label>
                                        <input type="password" className="form-control" value={pwdForm.new_password} onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">Update Password</button>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* View Booking Details Modal */}
            {selectedBooking && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)", overflowY: "auto" }}>
                    <div className="modal-dialog modal-dialog-centered text-dark" style={{ maxWidth: "550px" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Booking Application: #{selectedBooking.booking_id}</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedBooking(null)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-center mb-3">
                                    {selectedBooking.profile_image ? (
                                        <img src={selectedBooking.profile_image.startsWith("http") ? selectedBooking.profile_image : `${API}/${selectedBooking.profile_image}`} className="rounded-circle img-thumbnail" style={{ width: "90px", height: "90px", objectFit: "cover" }} alt="student" />
                                    ) : (
                                        <div className="mu-avatar mx-auto" style={{ width: "90px", height: "90px", fontSize: "28px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "#3b82f6", color: "white" }}>
                                            {selectedBooking.student_name.charAt(0)}
                                        </div>
                                    )}
                                    <h5 className="fw-bold mt-2 mb-0">{selectedBooking.student_name}</h5>
                                    <span className="badge bg-primary-subtle text-primary small">Student Profile</span>
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6 border-end">
                                        <h6 className="fw-bold text-primary mb-2 small"><i className="bi bi-person-lines-fill"></i> Contact & College</h6>
                                        <div className="small mb-1"><strong>Email:</strong> {selectedBooking.student_email}</div>
                                        <div className="small mb-1"><strong>Phone:</strong> {selectedBooking.student_phone || "N/A"}</div>
                                        <div className="small mb-1"><strong>Gender:</strong> {selectedBooking.student_gender || "N/A"}</div>
                                        <div className="small mb-1"><strong>College:</strong> {selectedBooking.student_college || "N/A"}</div>
                                        <div className="small mb-1"><strong>Course:</strong> {selectedBooking.student_course || "N/A"}</div>
                                        <div className="small mb-1"><strong>Year:</strong> {selectedBooking.student_year || "N/A"}</div>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold text-primary mb-2 small"><i className="bi bi-calendar-check"></i> Reservation settings</h6>
                                        <div className="small mb-1"><strong>Hostel Name:</strong> {selectedBooking.hostel_name}</div>
                                        <div className="small mb-1"><strong>Apply Date:</strong> {new Date(selectedBooking.booking_date).toLocaleDateString()}</div>
                                        <div className="small mb-1"><strong>Join Date:</strong> {selectedBooking.joining_date ? new Date(selectedBooking.joining_date).toLocaleDateString() : "N/A"}</div>
                                        <div className="small mb-1"><strong>Leave Date:</strong> {selectedBooking.leaving_date ? new Date(selectedBooking.leaving_date).toLocaleDateString() : "N/A"}</div>
                                        <div className="small mb-1"><strong>Status:</strong> <span className={`badge bg-${selectedBooking.booking_status === "Approved" ? "success" : selectedBooking.booking_status === "Rejected" ? "danger" : "warning"}`}>{selectedBooking.booking_status}</span></div>
                                        <div className="small mb-1"><strong>Payment:</strong> <span className={`badge bg-${selectedBooking.payment_status === "Paid" ? "success" : "secondary"}`}>{selectedBooking.payment_status || "Pending"}</span></div>
                                    </div>
                                    <div className="col-12 border-top pt-2 mt-2">
                                        <h6 className="fw-bold text-primary mb-1 small"><i className="bi bi-chat-left-text"></i> Address & Remarks</h6>
                                        <div className="small mb-2"><strong>Permanent Address:</strong> {selectedBooking.student_address || "N/A"}</div>
                                        <div className="small"><strong>Remarks:</strong> {selectedBooking.remarks || <span className="text-muted italic">None</span>}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

    function handleProfileChange(e) {
        setProfileFormData({
            ...profileFormData,
            [e.target.name]: e.target.value
        });
    }
}

export default Owner;
