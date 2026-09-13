import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from "react-toastify";
import { useConfirm } from "../context/ConfirmContext";

import API, { getImageUrl } from "../config/api";

function Students() {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username") || "Student";

    const [loading, setLoading] = useState(true);
    const [activeItem, setActiveItem] = useState("Dashboard");
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState("");

    const [profile, setProfile] = useState(null);
    const [profileFormData, setProfileFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        gender: "",
        college: "",
        course: "",
        year: "",
        address: "",
        city_name: "",
        state: "",
        pincode: "",
        profile_image: "",
    });
    const [newImageFile, setNewImageFile] = useState(null);
    const [profileEditing, setProfileEditing] = useState(false);

    const [stats, setStats] = useState({
        total_bookings: 0,
        wishlist_count: 0,
        reviews_count: 0,
        unread_notifications: 0,
    });

    const [hostels, setHostels] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [analyticsData, setAnalyticsData] = useState({ expenseData: [], bookingStatusData: [] });
    const [wishlist, setWishlist] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const [selectedHostel, setSelectedHostel] = useState(null);
    const [hostelDetails, setHostelDetails] = useState({ images: [], amenities: [] });
    const [bookingHostel, setBookingHostel] = useState(null);
    const [activePaymentBooking, setActivePaymentBooking] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const [joiningDate, setJoiningDate] = useState("");
    const [leavingDate, setLeavingDate] = useState("");
    const [remarks, setRemarks] = useState("");
    const [selectedHostelId, setSelectedHostelId] = useState("");

    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [paymentAmount, setPaymentAmount] = useState("");
    const [reviewForm, setReviewForm] = useState({ rating: 5, review_text: "" });
    const [editReviewId, setEditReviewId] = useState(null);
    const [editReviewForm, setEditReviewForm] = useState({ rating: 5, review_text: "" });
    const [reviewableHostels, setReviewableHostels] = useState([]);
    const [activeReviewHostel, setActiveReviewHostel] = useState(null);
    const [activeReceipt, setActiveReceipt] = useState(null);
    const [pwdForm, setPwdForm] = useState({ current_password: "", new_password: "" });

    const [hostelSearch, setHostelSearch] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [genderFilter, setGenderFilter] = useState("");
    const [rentFilter, setRentFilter] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);

    const menuItems = [
        { name: "Dashboard", icon: "bi-speedometer2", accent: "#2563eb" },
        { name: "Browse Hostels", icon: "bi-search", accent: "#10b981" },
        { name: "My Bookings", icon: "bi-calendar2-check", accent: "#06b6d4" },
        { name: "My Profile", icon: "bi-person-circle", accent: "#8b5cf6" },
    ];

    const authHeaders = { Authorization: `Bearer ${token}` };

    const showMessage = (msg) => {
        toast.success(msg);
    };

    const getJson = async (url, options = {}) => {
        const response = await fetch(`${API}${url}`, {
            ...options,
            headers: {
                ...authHeaders,
                ...(options.headers || {}),
            },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Request failed");
        return data;
    };

    const fetchDashboardData = async () => {
        try {
            const data = await getJson("/dashboard/student");
            if (data.success) {
                setStats(data.stats || {});
                setAnalyticsData({
                    expenseData: data.expenseData || [],
                    bookingStatusData: data.bookingStatusData || []
                });
            }
        } catch (error) {
            console.error("Dashboard error:", error);
        }
    };

    const fetchProfile = async () => {
        try {
            const data = await getJson("/profile");
            if (data.success) {
                setProfile(data.profile || null);
                const p = data.profile || {};
                setProfileFormData({
                    full_name: p.full_name || "",
                    email: p.email || "",
                    phone: p.phone || "",
                    gender: p.gender || "",
                    college: p.college || "",
                    course: p.course || "",
                    year: p.year || "",
                    address: p.address || "",
                    city_name: p.city_name || "",
                    state: p.state || "",
                    pincode: p.pincode || "",
                    profile_image: p.profile_image || "",
                });
            }
        } catch (error) {
            console.error("Profile error:", error);
        }
    };

    const fetchHostels = async () => {
        try {
            const data = await getJson("/hostels");
            if (data.success) setHostels(data.hostels || []);
        } catch (error) {
            console.error("Hostels error:", error);
        }
    };

    const fetchWishlist = async () => {
        try {
            const data = await getJson("/student/wishlist");
            if (data.success) setWishlist(data.wishlist || []);
        } catch (error) {
            console.error("Wishlist error:", error);
        }
    };

    const fetchBookings = async () => {
        try {
            const data = await getJson("/student/bookings");
            if (data.success) setBookings(data.bookings || []);
        } catch (error) {
            console.error("Bookings error:", error);
        }
    };

    const fetchReviews = async () => {
        try {
            const data = await getJson("/student/reviews");
            if (data.success) setReviews(data.reviews || []);
        } catch (error) {
            console.error("Reviews error:", error);
        }
    };

    const fetchReviewableHostels = async () => {
        try {
            const data = await getJson("/student/reviewable-hostels");
            if (data.success) setReviewableHostels(data.hostels || []);
        } catch (error) {
            console.error("Reviewable hostels error:", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const data = await getJson("/student/notifications");
            if (data.success) setNotifications(data.notifications || []);
        } catch (error) {
            console.error("Notifications error:", error);
        }
    };

    const fetchHostelDetails = async (id) => {
        try {
            const data = await getJson(`/admin/hostels/${id}/details`);
            if (data.success) {
                setHostelDetails({
                    images: data.images || [],
                    amenities: data.amenities || [],
                });
            }
        } catch (error) {
            console.error("Hostel details error:", error);
            setHostelDetails({ images: [], amenities: [] });
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return undefined;
        }

        const updateClock = () => {
            setCurrentTime(
                new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                })
            );
        };

        updateClock();
        const timer = window.setInterval(updateClock, 1000);

        const load = async () => {
            setLoading(true);
            await Promise.all([
                fetchDashboardData(),
                fetchProfile(),
                fetchHostels(),
                fetchWishlist(),
                fetchBookings(),
                fetchReviews(),
                fetchReviewableHostels(),
                fetchNotifications(),
            ]);
            setLoading(false);
        };

        load();
        return () => window.clearInterval(timer);
    }, [token]);

    useEffect(() => {
        if (activePaymentBooking) {
            let calcAmount = Number(activePaymentBooking.calculated_amount || activePaymentBooking.monthly_rent || 0);

            if (!activePaymentBooking.calculated_amount && activePaymentBooking.joining_date && activePaymentBooking.leaving_date) {
                const jDate = new Date(activePaymentBooking.joining_date);
                const lDate = new Date(activePaymentBooking.leaving_date);
                const diffTime = lDate.getTime() - jDate.getTime();
                
                if (diffTime >= 0) {
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    const months = Math.floor(diffDays / 30);
                    const extraDays = diffDays % 30;
                    const mRent = Number(activePaymentBooking.monthly_rent || 0);
                    const dRent = Number(activePaymentBooking.daily_rent || (mRent / 30));
                    calcAmount = (months * mRent) + (extraDays * dRent);
                }
            }
            setPaymentAmount(calcAmount || "");
        }
    }, [activePaymentBooking]);

    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfileFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileUpdate = async (event) => {
        event.preventDefault();
        if (!await confirm({ title: "Update Profile", message: "Are you sure you want to update your profile?", confirmText: "Yes, Update", variant: "primary" })) return;
        try {
            let profileImagePath = profileFormData.profile_image;

            if (newImageFile) {
                const uploadData = new FormData();
                uploadData.append("images", newImageFile);
                const uploadResponse = await fetch(`${API}/upload`, {
                    method: "POST",
                    body: uploadData,
                });
                const uploadResult = await uploadResponse.json();
                if (!uploadResponse.ok || !uploadResult.success) {
                    throw new Error(uploadResult.message || "Image upload failed");
                }
                if (uploadResult.files?.length) {
                    const uploadedFile = uploadResult.files[0];
                    const rawUrl = uploadedFile.url || uploadedFile.filename;
                    profileImagePath = rawUrl.startsWith("http") ? rawUrl : `${API}/uploads/${rawUrl}`;
                }
            }

            const data = await getJson("/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...profileFormData, profile_image: profileImagePath }),
            });

            if (data.success) {
                setProfileFormData((prev) => ({ ...prev, profile_image: profileImagePath }));
                setProfile(data.profile || profile);
                setNewImageFile(null);
                setProfileEditing(false);
                showMessage("Profile updated successfully!");
                await fetchProfile();
            } else {
                showMessage(data.message || "Failed to update profile.");
            }
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Server error updating profile.");
        }
    };

    const handleToggleWishlist = async (hostelId) => {
        const saved = wishlist.some((item) => item.hostel_id === hostelId);
        try {
            const data = await getJson(
                saved ? `/student/wishlist/${hostelId}` : "/student/wishlist",
                {
                    method: saved ? "DELETE" : "POST",
                    headers: saved ? {} : { "Content-Type": "application/json" },
                    body: saved ? undefined : JSON.stringify({ hostel_id: hostelId }),
                }
            );
            if (data.success) {
                showMessage(saved ? "Removed from wishlist." : "Added to wishlist!");
                await Promise.all([fetchWishlist(), fetchDashboardData()]);
            } else {
                showMessage(data.message || "Wishlist update failed.");
            }
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Unable to update wishlist.");
        }
    };

    const handleDedicatedBooking = async (event) => {
        event.preventDefault();
        const hostelId = selectedHostelId || bookingHostel?.hostel_id;
        if (!hostelId) {
            showMessage("Please select a hostel.");
            return;
        }
        if (!joiningDate) {
            showMessage("Please select an expected joining date.");
            return;
        }
        if (leavingDate && leavingDate < joiningDate) {
            showMessage("Expected Leaving Date cannot be before Expected Joining Date.");
            return;
        }

        try {
            const profileData = await getJson("/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileFormData),
            });
            if (!profileData.success) {
                showMessage(profileData.message || "Please complete your profile first.");
                return;
            }

            const bookingData = await getJson("/student/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hostel_id: Number(hostelId),
                    joining_date: joiningDate,
                    leaving_date: leavingDate || null,
                    remarks: remarks || "",
                }),
            });

            if (bookingData.success) {
                showMessage("Booking request submitted successfully! Please complete the payment.");
                
                const mRent = Number(bookingHostel?.monthly_rent || bookingHostel?.rent || selectedHostel?.monthly_rent || selectedHostel?.rent || 0);
                const dRent = Number(bookingHostel?.daily_rent || selectedHostel?.daily_rent || mRent / 30);
                let calcAmount = mRent;
                
                if (leavingDate) {
                    const jDate = new Date(joiningDate);
                    const lDate = new Date(leavingDate);
                    const diffTime = lDate.getTime() - jDate.getTime();
                    if (diffTime >= 0) {
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        const months = Math.floor(diffDays / 30);
                        const extraDays = diffDays % 30;
                        calcAmount = (months * mRent) + (extraDays * dRent);
                    }
                }

                const createdBooking = { 
                    ...bookingData.booking, 
                    hostel_name: bookingHostel?.hostel_name || selectedHostel?.hostel_name, 
                    monthly_rent: mRent,
                    daily_rent: dRent,
                    calculated_amount: calcAmount
                };
                setJoiningDate("");
                setLeavingDate("");
                setRemarks("");
                setSelectedHostelId("");
                setBookingHostel(null);
                await Promise.all([fetchBookings(), fetchDashboardData(), fetchProfile()]);
                setActiveItem("My Bookings");
                
                // Open payment modal immediately
                setActivePaymentBooking(createdBooking);
                setPaymentMethod("UPI");
                setPaymentAmount(calcAmount || "");
            } else {
                showMessage(bookingData.message || "Failed to submit booking.");
            }
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Server error submitting booking request.");
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!await confirm({ title: "Cancel Booking Request", message: "Are you sure you want to cancel this booking request?", confirmText: "Yes, Cancel Request", variant: "danger" })) return;
        try {
            const data = await getJson(`/student/bookings/${bookingId}`, { method: "DELETE" });
            if (data.success) {
                showMessage("Booking cancelled successfully!");
                await Promise.all([fetchBookings(), fetchDashboardData()]);
            } else {
                showMessage(data.message || "Failed to cancel booking.");
            }
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Server error cancelling booking.");
        }
    };



    const handleMakePayment = async (event) => {
        event.preventDefault();
        if (!activePaymentBooking) return;

        const amount = Number(paymentAmount || activePaymentBooking.monthly_rent || 0);
        if (!amount || amount <= 0) {
            showMessage("Please enter a valid payment amount.");
            return;
        }

        try {
            const transactionId = `TXN${Math.floor(Math.random() * 1000000000)}`;
            const data = await getJson("/student/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    booking_id: activePaymentBooking.booking_id,
                    amount,
                    payment_method: paymentMethod,
                    transaction_id: transactionId,
                }),
            });

            if (data.success) {
                showMessage(`Payment of ₹${amount.toLocaleString()} processed successfully!`);
                setActivePaymentBooking(null);
                await Promise.all([fetchBookings(), fetchDashboardData()]);
            } else {
                showMessage(data.message || "Failed to process payment.");
            }
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Server error processing payment.");
        }
    };

    const handlePostReview = async (event) => {
        event.preventDefault();
        if (!activeReviewHostel) return;
        try {
            const data = await getJson("/student/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hostel_id: activeReviewHostel.hostel_id,
                    rating: reviewForm.rating,
                    review_text: reviewForm.review_text,
                }),
            });
            if (data.success) {
                showMessage("Review posted successfully!");
                setReviewForm({ rating: 5, review_text: "" });
                setActiveReviewHostel(null);
                await Promise.all([fetchReviews(), fetchReviewableHostels()]);
            } else {
                showMessage(data.message || "Failed to post review.");
            }
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Server error posting review.");
        }
    };

    const handleEditReview = async (e) => {
        e.preventDefault();
        if (!await confirm({ title: "Edit Review", message: "Are you sure you want to edit this review?", confirmText: "Yes, Save Edit", variant: "primary" })) return;
        try {
            const data = await getJson(`/student/reviews/${editReviewId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating: editReviewForm.rating,
                    review_text: editReviewForm.review_text,
                }),
            });
            if (data.success) {
                showMessage("Review updated successfully!");
                setEditReviewId(null);
                setEditReviewForm({ rating: 5, review_text: "" });
                await Promise.all([fetchReviews(), fetchReviewableHostels()]);
            } else {
                showMessage(data.message || "Failed to update review.");
            }
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Server error updating review.");
        }
    };

    const handleMarkNotificationRead = async (id) => {
        try {
            const data = await getJson(`/student/notifications/${id}/read`, { method: "PUT" });
            if (data.success) await Promise.all([fetchNotifications(), fetchDashboardData()]);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        if (!await confirm({ title: "Change Password", message: "Are you sure you want to change your password?", confirmText: "Yes, Change Password", variant: "warning" })) return;
        if (!pwdForm.current_password || !pwdForm.new_password) {
            showMessage("Please enter both passwords.");
            return;
        }
        try {
            const data = await getJson("/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pwdForm),
            });
            if (data.success) {
                showMessage("Password changed successfully!");
                setPwdForm({ current_password: "", new_password: "" });
            } else {
                showMessage(data.message || "Failed to change password.");
            }
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Server error changing password.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        navigate("/login");
    };

    const filteredHostels = useMemo(() => {
        const search = hostelSearch.trim().toLowerCase();
        const maxRent = Number(rentFilter);
        return hostels.filter((hostel) => {
            const matchesSearch = !search ||
                String(hostel.hostel_name || "").toLowerCase().includes(search) ||
                String(hostel.address || "").toLowerCase().includes(search);
            const matchesCity = !cityFilter || String(hostel.city_name || "") === cityFilter;
            const matchesGender = !genderFilter || String(hostel.gender_allowed || "") === genderFilter;
            const rent = Number(hostel.monthly_rent || hostel.rent || 0);
            const matchesRent = !rentFilter || (rent > 0 && rent <= maxRent);
            return matchesSearch && matchesCity && matchesGender && matchesRent;
        });
    }, [hostels, hostelSearch, cityFilter, genderFilter, rentFilter]);

    const uniqueCities = useMemo(
        () => [...new Set(hostels.map((h) => h.city_name).filter(Boolean))].sort(),
        [hostels]
    );

    const openHostel = async (hostel) => {
        setSelectedHostel(hostel);
        await fetchHostelDetails(hostel.hostel_id);
    };

    const openBooking = (hostel) => {
        setSelectedHostelId(String(hostel.hostel_id));
        setBookingHostel(hostel);
    };

    const handleMenuItemClick = (item) => {
        if (item.name === "Logout") {
            handleLogout();
            return;
        }
        setActiveItem(item.name);
        setMobileOpen(false);
    };

    const activeMenu = menuItems.find((item) => item.name === activeItem) || menuItems[0];
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    if (!token) return null;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #f6f9ff 0%, #eef4ff 100%)", color: "#0f172a", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
            />
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
            />

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

                .card-soft {
                    background: #ffffff;
                    border: 1px solid var(--bdr);
                    border-radius: 16px;
                    box-shadow: var(--sh1);
                }

                .hostel-card { overflow:hidden; height:100%; }
                .hostel-img { width:100%; height:170px; object-fit:cover; }
                .modal-backdrop-custom { position:fixed; inset:0; background:rgba(15,23,42,.45); z-index:2000; overflow:auto; padding:30px 12px; }
                .modal-card-custom { max-width:760px; margin:auto; background:#fff; border-radius:16px; overflow:hidden; }

                @media(max-width:991px){
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
                        <i className="bi bi-building" />
                    </div>
                    {!collapsed && (
                        <div className="sb-brand-text">
                            <div className="sb-name">SCRHDP</div>
                            <div className="sb-sub">Student Portal</div>
                        </div>
                    )}
                    {!collapsed && (
                        <button className="sb-collapse-btn" onClick={() => setCollapsed(true)} title="Collapse sidebar">
                            <i className="bi bi-chevron-double-left" />
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
                                onClick={() => handleMenuItemClick(item)}
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
                                {!collapsed && item.name === "Notifications" && unreadCount > 0 && <span className="badge bg-danger ms-auto">{unreadCount}</span>}
                            </div>
                        );
                    })}
                </nav>

                <div className="sb-divider" />
                <div className="sb-logout" onClick={handleLogout} title={collapsed ? "Logout" : ""} style={collapsed ? { justifyContent: "center", padding: "10px 0" } : {}}>
                    <div className="ni-icon"><i className="bi bi-box-arrow-right"></i></div>
                    {!collapsed && <span>Logout</span>}
                </div>
            </aside>

            <div className={`cit-main ${collapsed ? "col" : ""}`}>
                <header className="cit-topbar">
                    <div className="tb-left">
                        <button className="tb-mob-btn" onClick={() => setMobileOpen(p => !p)}>
                            <i className="bi bi-list"></i>
                        </button>
                        <div className="tb-breadcrumb">
                            <div className="tb-eyebrow">
                                <span className="tb-eyebrow-dot"></span>
                                Student Portal
                            </div>
                            <div className="tb-title" style={{ color: activeMenu.accent }}>{activeItem}</div>
                        </div>
                    </div>

                    <div className="tb-right">
                        <div className="clock-blk">
                            <div className="clock-t">{currentTime}</div>
                            <div className="clock-d">{new Date().toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</div>
                        </div>
                        <div className="sys-live">
                            <span className="live-dot"></span>
                            <span>Live</span>
                        </div>

                        {/* Wishlist Button */}
                        <button
                            className="tb-icon-btn"
                            onClick={() => setActiveItem("Wishlist")}
                            title="Wishlist"
                            style={activeItem === "Wishlist" ? { color: "#e11d48", background: "rgba(225,29,72,0.1)", borderColor: "rgba(225,29,72,0.2)" } : {}}
                        >
                            <i className="bi bi-heart-fill"></i>
                            {wishlist.length > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.65rem" }}>{wishlist.length}</span>}
                        </button>

                        {/* My Reviews Button */}
                        <button
                            className="tb-icon-btn"
                            onClick={() => setActiveItem("My Reviews")}
                            title="My Reviews"
                            style={activeItem === "My Reviews" ? { color: "#f59e0b", background: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.3)" } : {}}
                        >
                            <i className="bi bi-star-fill"></i>
                            {reviewableHostels.length > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{ fontSize: "0.65rem", background: "#f59e0b" }}>{reviewableHostels.length}</span>}
                        </button>


                        <div className="tb-avatar-wrap" onClick={() => setActiveItem("My Profile")}>
                            {profileFormData.profile_image ? (
                                <img src={profileFormData.profile_image} className="tb-avatar" style={{ objectFit: "cover" }} alt="profile" />
                            ) : (
                                <div className="tb-avatar">{(profileFormData.full_name || username).charAt(0).toUpperCase()}</div>
                            )}
                            <div className="d-none d-md-block text-start">
                                <div className="tb-uname">{profileFormData.full_name || username}</div>
                                <div className="tb-urole">Student</div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="cit-content">

                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary" /><p className="mt-3 text-muted">Loading student portal...</p></div>
                    ) : (
                        <>
                            {activeItem === "Dashboard" && (
                                <div className="mu-outer-container">
                                    <div className="mu-banner">
                                        <div className="mu-banner-content">
                                            <h1 className="mu-banner-title">Welcome Back, {profileFormData.full_name || username}! 👋</h1>
                                            <p className="mu-banner-subtitle">Here is your student activity and analytics overview.</p>
                                        </div>
                                        <div className="mu-stats-grid d-none d-xl-flex">
                                            {[['Active Bookings', stats.total_bookings, 'bi-journal-bookmark-fill', 'primary'], ['Wishlist Stays', stats.wishlist_count, 'bi-heart-fill', 'danger'], ['My Reviews', stats.reviews_count, 'bi-star-fill', 'warning'], ['Notifications', stats.unread_notifications, 'bi-bell-fill', 'info']].map(([label, value, icon, color]) => (
                                                <div className="mu-stat-card" key={label}>
                                                    <div className="mu-stat-icon-container"><i className={`bi ${icon}`} /></div>
                                                    <div className="mu-stat-details">
                                                        <div className="mu-stat-label">{label}</div>
                                                        <div className="mu-stat-value">{value || 0}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="row g-3 mb-4 d-xl-none">
                                        {[['Active Bookings', stats.total_bookings, 'bi-journal-bookmark-fill', 'primary'], ['Wishlist Stays', stats.wishlist_count, 'bi-heart-fill', 'danger'], ['My Reviews', stats.reviews_count, 'bi-star-fill', 'warning'], ['Notifications', stats.unread_notifications, 'bi-bell-fill', 'info']].map(([label, value, icon, color]) => (
                                            <div className="col-sm-6" key={label}>
                                                <div className="card-soft stat-card">
                                                    <div>
                                                        <div className="text-muted small fw-bold text-uppercase">{label}</div>
                                                        <div className="stat-value">{value || 0}</div>
                                                    </div>
                                                    <i className={`bi ${icon} fs-2 text-${color}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Dashboard Charts Section */}
                                    <div className="row g-4 mt-2 mb-4">
                                        <div className="col-lg-8">
                                            <div className="card-soft p-4 h-100 text-dark">
                                                <h5 className="fw-bold mb-4" style={{ color: '#0f172a' }}>Monthly Hostel Expenses</h5>
                                                {analyticsData.expenseData.length > 0 ? (
                                                    <div style={{ width: '100%', height: 350 }}>
                                                        <ResponsiveContainer>
                                                            <BarChart data={analyticsData.expenseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} dy={10} />
                                                                <YAxis tickFormatter={(val) => `₹${val}`} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} dx={-10} />
                                                                <Tooltip 
                                                                    cursor={{fill: 'rgba(37, 99, 235, 0.05)'}} 
                                                                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                                                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Total Expense']} 
                                                                />
                                                                <Bar dataKey="total_expense" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ height: 350, background: 'rgba(15, 23, 42, 0.02)', borderRadius: 12 }}>
                                                        <i className="bi bi-bar-chart fs-1 mb-3 opacity-25" />
                                                        <p>No expense data available yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="col-lg-4">
                                            <div className="card-soft p-4 h-100 text-dark">
                                                <h5 className="fw-bold mb-4" style={{ color: '#0f172a' }}>Booking Status</h5>
                                                {analyticsData.bookingStatusData.length > 0 ? (
                                                    <div style={{ width: '100%', height: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                        <ResponsiveContainer width="100%" height={250}>
                                                            <PieChart>
                                                                <Pie
                                                                    data={analyticsData.bookingStatusData}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius={60}
                                                                    outerRadius={90}
                                                                    paddingAngle={5}
                                                                    dataKey="count"
                                                                >
                                                                    {analyticsData.bookingStatusData.map((entry, index) => {
                                                                        const COLORS = { 'Approved': '#10b981', 'Pending': '#f59e0b', 'Rejected': '#ef4444' };
                                                                        return <Cell key={`cell-${index}`} fill={COLORS[entry.status] || '#64748b'} />;
                                                                    })}
                                                                </Pie>
                                                                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                        <div className="d-flex gap-3 mt-3 flex-wrap justify-content-center">
                                                            {analyticsData.bookingStatusData.map(entry => {
                                                                const COLORS = { 'Approved': '#10b981', 'Pending': '#f59e0b', 'Rejected': '#ef4444' };
                                                                return (
                                                                    <div key={entry.status} className="d-flex align-items-center gap-2 small">
                                                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[entry.status] || '#64748b' }} />
                                                                        <span className="fw-semibold text-muted">{entry.status} ({entry.count})</span>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ height: 350, background: 'rgba(15, 23, 42, 0.02)', borderRadius: 12 }}>
                                                        <i className="bi bi-pie-chart fs-1 mb-3 opacity-25" />
                                                        <p>No bookings made yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeItem === "My Profile" && (
                                <div className="mu-outer-container">
                                    <div className="mu-banner">
                                        <div className="mu-banner-content">
                                            <h1 className="mu-banner-title">My Profile</h1>
                                            <p className="mu-banner-subtitle">Manage your student information and profile photo.</p>
                                        </div>
                                        <button className="btn btn-light fw-bold" onClick={() => setProfileEditing((v) => !v)}>{profileEditing ? "Cancel" : "Edit Profile"}</button>
                                    </div>
                                    <form className="card-soft p-4 text-dark" onSubmit={handleProfileUpdate}>
                                        <div className="row g-3">
                                            <div className="col-md-3 text-center">
                                                {profileFormData.profile_image ? <img src={profileFormData.profile_image} className="rounded-circle shadow-sm" style={{ width: 150, height: 150, objectFit: "cover" }} alt="profile" /> : <div className="avatar mx-auto" style={{ width: 150, height: 150, fontSize: 50 }}>{(profileFormData.full_name || username).charAt(0).toUpperCase()}</div>}
                                                {profileEditing && <input className="form-control form-control-sm mt-3" type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files?.[0] || null)} />}
                                            </div>
                                            <div className="col-md-9 text-start">
                                                <div className="row g-3">
                                                    {[['full_name', 'Full Name', 'text'], ['email', 'Email Address', 'email'], ['phone', 'Phone', 'text'], ['college', 'College', 'text'], ['course', 'Course', 'text'], ['year', 'Year of Study', 'number'], ['city_name', 'City', 'text'], ['state', 'State', 'text'], ['pincode', 'Pincode', 'text']].map(([name, label, type]) => <div className="col-md-6" key={name}><label className="form-label small fw-semibold">{label}</label><input className="form-control text-dark" type={type} name={name} value={profileFormData[name] || ""} onChange={handleProfileChange} disabled={!profileEditing} /></div>)}
                                                    <div className="col-md-6"><label className="form-label small fw-semibold">Gender</label><select className="form-select text-dark" name="gender" value={profileFormData.gender || ""} onChange={handleProfileChange} disabled={!profileEditing}><option value="">Select Gender</option><option>Male</option><option>Female</option><option>Other</option></select></div>
                                                    <div className="col-12"><label className="form-label small fw-semibold">Address</label><textarea className="form-control text-dark" name="address" rows="3" value={profileFormData.address || ""} onChange={handleProfileChange} disabled={!profileEditing} /></div>
                                                </div>
                                            </div>
                                        </div>
                                        {profileEditing && <button type="submit" className="btn btn-primary w-100 mt-4 fw-bold">Save Profile</button>}
                                    </form>
                                </div>
                            )}

                            {activeItem === "Browse Hostels" && (
                                <div className="mu-outer-container text-dark">
                                    <div className="mu-banner">
                                        <div className="mu-banner-content">
                                            <h1 className="mu-banner-title">Browse Hostels</h1>
                                            <p className="mu-banner-subtitle">Search and filter available hostel listings.</p>
                                        </div>
                                    </div>
                                    <div className="card-soft p-3"><div className="row g-2"><div className="col-md-4"><input className="form-control" placeholder="Search by name or address..." value={hostelSearch} onChange={(e) => setHostelSearch(e.target.value)} /></div><div className="col-md-3"><select className="form-select text-dark" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}><option value="">All Cities</option>{uniqueCities.map((city) => <option key={city}>{city}</option>)}</select></div><div className="col-md-3"><select className="form-select text-dark" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}><option value="">All Genders</option><option>Boys</option><option>Girls</option><option>Co-Living</option></select></div><div className="col-md-2"><input type="number" className="form-control" placeholder="Max Rent" value={rentFilter} onChange={(e) => setRentFilter(e.target.value)} /></div></div></div>
                                    <div className="row g-4">
                                        {filteredHostels.map((h) => {
                                            const saved = wishlist.some((w) => w.hostel_id === h.hostel_id);
                                            return (
                                                <div className="col-md-6 col-xl-4" key={h.hostel_id}>
                                                    <div className="card-soft hostel-card">
                                                        <div className="position-relative">
                                                            <img className="hostel-img" src={getImageUrl(h.hostel_logo, "https://placehold.co/500x250")} alt={h.hostel_name || "hostel"} />
                                                            <div className="position-absolute top-0 end-0 m-2 d-flex gap-2" style={{ zIndex: 10 }}>
                                                                <button 
                                                                    type="button"
                                                                    className="btn btn-light rounded-circle shadow-sm" 
                                                                    style={{ width: "36px", height: "36px", display: "grid", placeItems: "center", border: "none" }} 
                                                                    onClick={() => openHostel(h)} 
                                                                    title="View Details"
                                                                >
                                                                    <i className="bi bi-eye text-primary" />
                                                                </button>
                                                                <button 
                                                                    type="button"
                                                                    className="btn btn-light rounded-circle shadow-sm" 
                                                                    style={{ width: "36px", height: "36px", display: "grid", placeItems: "center", border: "none" }} 
                                                                    onClick={() => handleToggleWishlist(h.hostel_id)} 
                                                                    title="Add to Wishlist"
                                                                >
                                                                    <i className={`bi ${saved ? "bi-heart-fill text-danger" : "bi-heart"}`} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="p-3 text-start">
                                                            <div className="d-flex justify-content-between gap-2">
                                                                <h5 className="fw-bold mb-1">{h.hostel_name}</h5>
                                                                <span className="badge bg-primary-subtle text-primary">{h.gender_allowed || "Any"}</span>
                                                            </div>
                                                            <p className="text-muted small mb-2">{h.address || h.city_name || "Location not specified"}</p>
                                                            <div className="fw-bold text-success mb-1">₹{Number(h.monthly_rent || h.rent || 0).toLocaleString()} / month</div>
                                                            <div className="fw-semibold text-primary mb-3 small">₹{Number(h.daily_rent || 0).toLocaleString()} / day</div>
                                                            <button className="btn btn-primary w-100 fw-bold" onClick={() => openBooking(h)}>Book</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {filteredHostels.length === 0 && <div className="card-soft p-5 text-center text-muted">No hostels match your filters.</div>}
                                </div>
                            )}

                            {activeItem === "Wishlist" && (
                                <div className="mu-outer-container text-dark">
                                    <div className="mu-banner">
                                        <div className="mu-banner-content">
                                            <h1 className="mu-banner-title">Wishlist</h1>
                                            <p className="mu-banner-subtitle">Your saved hostel stays.</p>
                                        </div>
                                    </div>
                                    <div className="row g-4">
                                        {wishlist.map((h) => (
                                            <div className="col-md-6 col-xl-4" key={h.hostel_id}>
                                                <div className="card-soft hostel-card">
                                                    <div className="position-relative">
                                                        <img className="hostel-img" src={h.hostel_logo || "https://placehold.co/500x250"} alt={h.hostel_name || "hostel"} />
                                                        <div className="position-absolute top-0 end-0 m-2 d-flex gap-2" style={{ zIndex: 10 }}>
                                                            <button 
                                                                type="button"
                                                                className="btn btn-light rounded-circle shadow-sm" 
                                                                style={{ width: "36px", height: "36px", display: "grid", placeItems: "center", border: "none" }} 
                                                                onClick={() => openHostel(h)} 
                                                                title="View Details"
                                                            >
                                                                <i className="bi bi-eye text-primary" />
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                className="btn btn-light rounded-circle shadow-sm" 
                                                                style={{ width: "36px", height: "36px", display: "grid", placeItems: "center", border: "none" }} 
                                                                onClick={() => handleToggleWishlist(h.hostel_id)} 
                                                                title="Remove from Wishlist"
                                                            >
                                                                <i className="bi bi-heart-fill text-danger" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 text-start">
                                                        <div className="d-flex justify-content-between gap-2">
                                                            <h5 className="fw-bold mb-1">{h.hostel_name}</h5>
                                                            <span className="badge bg-primary-subtle text-primary">{h.gender_allowed || "Any"}</span>
                                                        </div>
                                                        <p className="text-muted small mb-2">{h.address || h.city_name || "Location not specified"}</p>
                                                        <div className="fw-bold text-success mb-1">₹{Number(h.monthly_rent || h.rent || 0).toLocaleString()} / month</div>
                                                        <div className="fw-semibold text-primary mb-3 small">₹{Number(h.daily_rent || 0).toLocaleString()} / day</div>
                                                        <button className="btn btn-primary w-100 fw-bold" onClick={() => openBooking(h)}>Book</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {wishlist.length === 0 && <div className="card-soft p-5 text-center text-muted">Your wishlist is empty.</div>}
                                </div>
                            )}

                            {activeItem === "My Bookings" && (
                                <div className="mu-outer-container text-dark">
                                    <div className="mu-banner">
                                        <div className="mu-banner-content">
                                            <h1 className="mu-banner-title">My Bookings</h1>
                                            <p className="mu-banner-subtitle">Track booking requests and payments.</p>
                                        </div>
                                        <div className="mu-stats-grid d-none d-md-flex">
                                            <div className="mu-stat-card">
                                                <div className="mu-stat-icon-container"><i className="bi bi-calendar2-check" /></div>
                                                <div className="mu-stat-details">
                                                    <div className="mu-stat-label">Total</div>
                                                    <div className="mu-stat-value">{bookings.length}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {bookings.length === 0 ? (
                                        <div className="card-soft p-5 text-center text-muted">
                                            <i className="bi bi-calendar2-x fs-1 mb-3 d-block opacity-50" />
                                            No bookings found.
                                        </div>
                                    ) : (
                                        <div className="row g-3">
                                            {bookings.map((b) => {
                                                const statusColor = b.booking_status === "Approved" ? "#10b981" : b.booking_status === "Rejected" ? "#ef4444" : "#f59e0b";
                                                const payColor = b.payment_status === "Paid" ? "#10b981" : "#94a3b8";
                                                return (
                                                    <div className="col-md-6 col-xl-4" key={b.booking_id}>
                                                        <div className="card-soft p-4 h-100" style={{ borderLeft: `4px solid ${statusColor}`, transition: "all .2s" }}>
                                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                                <div>
                                                                    <h6 className="fw-bold mb-1" style={{ fontSize: 15 }}>{b.hostel_name}</h6>
                                                                    <div className="text-muted small">{b.joining_date ? new Date(b.joining_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "No date"}</div>
                                                                </div>
                                                                <div className="d-flex gap-2 align-items-center">
                                                                    <span className="badge rounded-pill" style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}40`, fontSize: 10, fontWeight: 700 }}>{b.booking_status || "Pending"}</span>
                                                                    <button className="btn btn-sm text-danger p-0 ms-1" onClick={() => handleCancelBooking(b.booking_id)} title="Delete Booking"><i className="bi bi-trash-fill fs-6" /></button>
                                                                </div>
                                                            </div>

                                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                                <span className="badge rounded-pill" style={{ background: `${payColor}18`, color: payColor, border: `1px solid ${payColor}40`, fontSize: 10, fontWeight: 700 }}>
                                                                    <i className="bi bi-credit-card me-1" />{b.payment_status || "Pending"}
                                                                </span>
                                                                {b.leaving_date && (
                                                                    <span className="text-muted small">Until {new Date(b.leaving_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                                                )}
                                                            </div>

                                                            <div className="d-flex gap-2 mt-auto">
                                                                <button
                                                                    className="btn btn-sm flex-fill fw-semibold d-flex align-items-center justify-content-center gap-1"
                                                                    style={{ background: "rgba(37,99,235,0.08)", color: "#2563eb", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 8 }}
                                                                    onClick={() => setSelectedBooking(b)}
                                                                    title="View Details"
                                                                >
                                                                    <i className="bi bi-eye" /> View
                                                                </button>
                                                                {b.booking_status === "Approved" && b.payment_status === "Paid" ? (
                                                                    <button
                                                                        className="btn btn-sm flex-fill fw-semibold d-flex align-items-center justify-content-center gap-1"
                                                                        style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8 }}
                                                                        onClick={() => setActiveReceipt(b)}
                                                                        title="Download Receipt"
                                                                    >
                                                                        <i className="bi bi-download" /> Receipt
                                                                    </button>
                                                                ) : b.booking_status === "Approved" && b.payment_status === "Pending" ? (
                                                                    <button
                                                                        className="btn btn-sm flex-fill fw-semibold d-flex align-items-center justify-content-center gap-1"
                                                                        style={{ background: "rgba(37,99,235,0.08)", color: "#2563eb", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 8 }}
                                                                        onClick={() => {
                                                                            let calcAmount = Number(b.monthly_rent || 0);
                                                                            if (b.leaving_date && b.joining_date) {
                                                                                const diffTime = new Date(b.leaving_date).getTime() - new Date(b.joining_date).getTime();
                                                                                if (diffTime > 0) {
                                                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                                                    const months = Math.floor(diffDays / 30);
                                                                                    const extraDays = diffDays % 30;
                                                                                    calcAmount = (months * calcAmount) + (extraDays * Number(b.daily_rent || calcAmount / 30));
                                                                                }
                                                                            }
                                                                            setActivePaymentBooking({ ...b, calculated_amount: calcAmount });
                                                                            setPaymentMethod("UPI");
                                                                            setPaymentAmount(calcAmount);
                                                                        }}
                                                                        title="Pay Now"
                                                                    >
                                                                        <i className="bi bi-credit-card" /> Pay Now
                                                                    </button>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeItem === "My Reviews" && (
                                <div className="mu-outer-container text-dark text-start">
                                    <div className="mu-banner">
                                        <div className="mu-banner-content">
                                            <h1 className="mu-banner-title">My Reviews</h1>
                                            <p className="mu-banner-subtitle">Rate hostels after your stay has ended.</p>
                                        </div>
                                    </div>

                                    {/* Eligible hostels to review */}
                                    {reviewableHostels.length > 0 && (
                                        <div>
                                            <h6 className="fw-bold mb-3" style={{ color: "#2563eb" }}>
                                                <i className="bi bi-pencil-square me-2" />Hostels You Can Review
                                            </h6>
                                            <div className="row g-3 mb-4">
                                                {reviewableHostels.map((h) => (
                                                    <div className="col-md-6 col-xl-4" key={h.hostel_id}>
                                                        <div className="card-soft p-3 d-flex align-items-center gap-3"
                                                            style={{ border: activeReviewHostel?.hostel_id === h.hostel_id ? "2px solid #2563eb" : "1px solid rgba(15,23,42,0.08)", cursor: "pointer", transition: "all .2s" }}
                                                            onClick={() => setActiveReviewHostel(activeReviewHostel?.hostel_id === h.hostel_id ? null : h)}
                                                        >
                                                            <img src={h.hostel_logo || "https://placehold.co/60x60"} alt={h.hostel_name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                                                            <div className="flex-grow-1">
                                                                <div className="fw-bold" style={{ fontSize: 14 }}>{h.hostel_name}</div>
                                                                <div className="text-muted" style={{ fontSize: 11 }}>Left on {new Date(h.leaving_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                                                            </div>
                                                            <i className={`bi ${activeReviewHostel?.hostel_id === h.hostel_id ? "bi-chevron-up text-primary" : "bi-chevron-down text-muted"}`} />
                                                        </div>

                                                        {activeReviewHostel?.hostel_id === h.hostel_id && (
                                                            <form className="card-soft p-3 mt-2" onSubmit={handlePostReview} style={{ border: "2px solid rgba(37,99,235,0.2)", borderRadius: 12 }}>
                                                                <div className="mb-3">
                                                                    <label className="form-label small fw-semibold">Rating</label>
                                                                    <div className="d-flex gap-2">
                                                                        {[1,2,3,4,5].map((star) => (
                                                                            <button key={star} type="button"
                                                                                onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                                                                                style={{ background: "none", border: "none", fontSize: 24, color: star <= reviewForm.rating ? "#f59e0b" : "#d1d5db", cursor: "pointer", padding: 0 }}
                                                                            >★</button>
                                                                        ))}
                                                                        <span className="text-muted small ms-2 align-self-center">{reviewForm.rating}/5</span>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label className="form-label small fw-semibold">Your Review</label>
                                                                    <textarea className="form-control text-dark" rows="3" placeholder="Share your experience..." value={reviewForm.review_text} onChange={(e) => setReviewForm(f => ({ ...f, review_text: e.target.value }))} required />
                                                                </div>
                                                                <div className="d-flex gap-2">
                                                                    <button type="submit" className="btn btn-primary fw-bold flex-fill">
                                                                        <i className="bi bi-send me-2" />Submit Review
                                                                    </button>
                                                                    <button type="button" className="btn btn-light fw-bold" onClick={() => setActiveReviewHostel(null)}>Cancel</button>
                                                                </div>
                                                            </form>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {reviewableHostels.length === 0 && reviews.length === 0 && (
                                        <div className="card-soft p-5 text-center text-muted">
                                            <i className="bi bi-star fs-1 mb-3 d-block opacity-50" />
                                            <div>No reviews yet. Reviews can only be submitted after your stay has ended.</div>
                                        </div>
                                    )}

                                    {/* Existing reviews */}
                                    {reviews.length > 0 && (
                                        <div>
                                            <h6 className="fw-bold mb-3" style={{ color: "#2563eb" }}>
                                                <i className="bi bi-star-fill me-2" />Your Reviews
                                            </h6>
                                            <div className="card-soft p-4">
                                                {reviews.map((r) => (
                                                    <div key={r.review_id} className="border-bottom py-3">
                                                        {editReviewId === r.review_id ? (
                                                            <form onSubmit={handleEditReview} className="p-3" style={{ border: "2px solid rgba(37,99,235,0.2)", borderRadius: 12 }}>
                                                                <div className="mb-3">
                                                                    <label className="form-label small fw-semibold">Rating</label>
                                                                    <div className="d-flex gap-2">
                                                                        {[1,2,3,4,5].map((star) => (
                                                                            <button key={star} type="button"
                                                                                onClick={() => setEditReviewForm(f => ({ ...f, rating: star }))}
                                                                                style={{ background: "none", border: "none", fontSize: 24, color: star <= editReviewForm.rating ? "#f59e0b" : "#d1d5db", cursor: "pointer", padding: 0 }}
                                                                            >★</button>
                                                                        ))}
                                                                        <span className="text-muted small ms-2 align-self-center">{editReviewForm.rating}/5</span>
                                                                    </div>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label className="form-label small fw-semibold">Your Review</label>
                                                                    <textarea className="form-control text-dark" rows="3" value={editReviewForm.review_text} onChange={(e) => setEditReviewForm(f => ({ ...f, review_text: e.target.value }))} required />
                                                                </div>
                                                                <div className="d-flex gap-2">
                                                                    <button type="submit" className="btn btn-primary fw-bold flex-fill">Update</button>
                                                                    <button type="button" className="btn btn-light fw-bold flex-fill" onClick={() => setEditReviewId(null)}>Cancel</button>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <>
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <strong>{r.hostel_name}</strong>
                                                                    <div className="d-flex align-items-center gap-3">
                                                                        <div className="d-flex gap-1">
                                                                            {[1,2,3,4,5].map(s => (
                                                                                <span key={s} style={{ color: s <= r.rating ? "#f59e0b" : "#d1d5db", fontSize: 16 }}>★</span>
                                                                            ))}
                                                                        </div>
                                                                        <button className="btn btn-sm text-primary p-0 m-0" onClick={() => {
                                                                            setEditReviewId(r.review_id);
                                                                            setEditReviewForm({ rating: r.rating, review_text: r.review });
                                                                        }}><i className="bi bi-pencil-square" title="Edit Review"></i></button>
                                                                    </div>
                                                                </div>
                                                                <p className="mb-0 mt-2 text-muted small">{r.review || "No review text."}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}


                            {activeItem === "Notifications" && (
                                <div className="mu-outer-container text-dark text-start">
                                    <div className="mu-banner">
                                        <div className="mu-banner-content">
                                            <h1 className="mu-banner-title">Notifications</h1>
                                            <p className="mu-banner-subtitle">Stay updated with booking and system notifications.</p>
                                        </div>
                                    </div>
                                    <div className="card-soft p-3">
                                        {notifications.filter(n => !n.is_read).map((n) => (
                                            <div key={n.notification_id} className={`p-3 border-bottom ${n.is_read ? "" : "bg-light"}`}>
                                                <div className="d-flex justify-content-between gap-3">
                                                    <div>
                                                        <span className="badge bg-secondary mb-2">{n.notification_type || "System"}</span>
                                                        <h6 className="fw-bold mb-1">{n.title}</h6>
                                                        <p className="text-muted mb-1">{n.message}</p>
                                                        <small className="text-muted">{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</small>
                                                    </div>
                                                    {!n.is_read && <button className="btn btn-sm btn-outline-primary h-25" onClick={() => handleMarkNotificationRead(n.notification_id)}>Mark read</button>}
                                                </div>
                                            </div>
                                        ))}
                                        {notifications.filter(n => !n.is_read).length === 0 && <div className="p-5 text-center text-muted">No notifications.</div>}
                                    </div>
                                </div>
                            )}

                        </>
                    )}
                </main>
            </div>

            {selectedHostel && (
                <div className="modal-backdrop-custom" onClick={() => setSelectedHostel(null)}>
                    <div className="modal-card-custom" style={{ maxWidth: "800px" }} onClick={(e) => e.stopPropagation()}>
                        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <h5 className="mb-0 fw-bold">{selectedHostel.hostel_name}</h5>
                                <span className="badge bg-primary-subtle text-primary">{selectedHostel.gender_allowed}</span>
                            </div>
                            <button className="btn-close" onClick={() => setSelectedHostel(null)} />
                        </div>
                        <div className="p-4" style={{ maxHeight: "80vh", overflowY: "auto" }}>
                            {/* Two Column Info Grid */}
                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <div className="card-soft p-3 bg-light border-0">
                                        <h6 className="fw-bold mb-3 text-primary"><i className="bi bi-info-circle-fill me-2" />Stay Details</h6>
                                        <div className="d-flex flex-column gap-2 small text-dark">
                                            <div><strong>Monthly Rent:</strong> <span className="text-success fw-bold">₹{Number(selectedHostel.monthly_rent || selectedHostel.rent || 0).toLocaleString()}</span></div>
                                            <div><strong>Daily Rent:</strong> <span className="text-success fw-bold">₹{Number(selectedHostel.daily_rent || 0).toLocaleString()}</span></div>
                                            <div><strong>Security Deposit:</strong> <span className="text-dark fw-bold">₹{Number(selectedHostel.deposit || 0).toLocaleString()}</span></div>
                                            <div><strong>Sharing Type:</strong> <span className="text-dark">{selectedHostel.sharing_type || "N/A"}</span></div>
                                            <div><strong>Gender Allowed:</strong> <span className="text-dark">{selectedHostel.gender_allowed || "N/A"}</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card-soft p-3 bg-light border-0">
                                        <h6 className="fw-bold mb-3 text-primary"><i className="bi bi-check-circle-fill me-2" />Availability & Ratings</h6>
                                        <div className="d-flex flex-column gap-2 small text-dark">
                                            <div><strong>Beds Available:</strong> <span className="text-success fw-bold">{selectedHostel.available_beds || 0} / {selectedHostel.total_beds || 0} Beds</span></div>
                                            <div><strong>Rooms Available:</strong> <span className="text-success fw-bold">{selectedHostel.available_rooms || 0} / {selectedHostel.total_rooms || 0} Rooms</span></div>
                                            <div><strong>Average Rating:</strong> <span className="text-warning fw-bold">★ {selectedHostel.average_rating || "0.0"} / 5</span></div>
                                            <div><strong>Contact Number:</strong> <span className="text-dark">{selectedHostel.contact_number || "N/A"}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description and Rules */}
                            <div className="mb-4 text-dark">
                                <h6 className="fw-bold text-primary mb-2"><i className="bi bi-card-text me-2" />Description</h6>
                                <p className="text-muted small mb-3">{selectedHostel.description || "No description provided."}</p>
                                
                                {selectedHostel.hostel_rules && (
                                    <>
                                        <h6 className="fw-bold text-primary mb-2"><i className="bi bi-exclamation-triangle-fill me-2" />House Rules</h6>
                                        <div className="p-3 bg-warning-subtle text-warning-emphasis rounded small mb-0" style={{ whiteSpace: "pre-line" }}>
                                            {selectedHostel.hostel_rules}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Address details */}
                            <div className="mb-4 text-dark">
                                <h6 className="fw-bold text-primary mb-2"><i className="bi bi-geo-alt-fill me-2" />Address</h6>
                                <p className="text-muted small mb-0">{selectedHostel.address || "N/A"}</p>
                            </div>

                            {/* Amenities */}
                            <div className="mb-4 text-dark">
                                <h6 className="fw-bold text-primary mb-2"><i className="bi bi-stars me-2" />Amenities</h6>
                                <div className="d-flex flex-wrap gap-2">
                                    {hostelDetails.amenities.map((a, index) => (
                                        <span className="badge bg-white text-dark border px-3 py-2" key={a.amenity_id || index}>
                                            {a.amenity_name || a.name || a.amenity || "Amenity"}
                                        </span>
                                    ))}
                                    {hostelDetails.amenities.length === 0 && <span className="text-muted small">No amenities listed.</span>}
                                </div>
                            </div>

                            {/* Gallery Images (Show at last) */}
                            {hostelDetails.images.length > 0 && (
                                <div className="mb-4 text-dark">
                                    <h6 className="fw-bold text-primary mb-2"><i className="bi bi-images me-2" />Gallery</h6>
                                    <div className="row g-2">
                                        {hostelDetails.images.map((img, index) => (
                                            <div className="col-4" key={img.image_id || index}>
                                                <img 
                                                    src={img.image_path || img.image_url} 
                                                    className="w-100 rounded shadow-sm" 
                                                    style={{ height: 160, objectFit: "cover", cursor: "pointer" }} 
                                                    alt={img.image_title || "hostel gallery"} 
                                                    onClick={() => setSelectedImage(img.image_path || img.image_url)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Detail View Modal */}
            {selectedBooking && (
                <div className="modal-backdrop-custom" onClick={() => setSelectedBooking(null)}>
                    <div className="modal-card-custom" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
                        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-0 fw-bold">{selectedBooking.hostel_name}</h5>
                                <small className="text-muted">Booking #{selectedBooking.booking_id}</small>
                            </div>
                            <button className="btn-close" onClick={() => setSelectedBooking(null)} />
                        </div>
                        <div className="p-4 text-dark">
                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="small text-muted fw-semibold mb-1">Booking Status</div>
                                    <span className="badge rounded-pill px-3 py-2" style={{
                                        background: selectedBooking.booking_status === "Approved" ? "rgba(16,185,129,0.1)" : selectedBooking.booking_status === "Rejected" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                                        color: selectedBooking.booking_status === "Approved" ? "#10b981" : selectedBooking.booking_status === "Rejected" ? "#ef4444" : "#f59e0b",
                                        border: `1px solid ${selectedBooking.booking_status === "Approved" ? "#10b98140" : selectedBooking.booking_status === "Rejected" ? "#ef444440" : "#f59e0b40"}`,
                                        fontWeight: 700
                                    }}>{selectedBooking.booking_status || "Pending"}</span>
                                </div>
                                <div className="col-6">
                                    <div className="small text-muted fw-semibold mb-1">Payment Status</div>
                                    <span className="badge rounded-pill px-3 py-2" style={{
                                        background: selectedBooking.payment_status === "Paid" ? "rgba(16,185,129,0.1)" : "rgba(148,163,184,0.1)",
                                        color: selectedBooking.payment_status === "Paid" ? "#10b981" : "#64748b",
                                        border: "1px solid rgba(148,163,184,0.3)",
                                        fontWeight: 700
                                    }}>{selectedBooking.payment_status || "Pending"}</span>
                                </div>
                                <div className="col-6">
                                    <div className="small text-muted fw-semibold mb-1">Joining Date</div>
                                    <div className="fw-bold">{selectedBooking.joining_date ? new Date(selectedBooking.joining_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "N/A"}</div>
                                </div>
                                <div className="col-6">
                                    <div className="small text-muted fw-semibold mb-1">Leaving Date</div>
                                    <div className="fw-bold">{selectedBooking.leaving_date ? new Date(selectedBooking.leaving_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "N/A"}</div>
                                </div>
                                {selectedBooking.remarks && (
                                    <div className="col-12">
                                        <div className="small text-muted fw-semibold mb-1">Remarks</div>
                                        <div className="p-3 rounded" style={{ background: "#f8fafc", border: "1px solid #e5e7eb", fontSize: 13 }}>{selectedBooking.remarks}</div>
                                    </div>
                                )}
                            </div>
                            <div className="d-flex gap-2 mt-4">
                                {selectedBooking.payment_status !== "Paid" && selectedBooking.booking_status !== "Rejected" && (
                                    <button className="btn btn-primary fw-bold flex-fill" onClick={() => { setActivePaymentBooking(selectedBooking); setSelectedBooking(null); }}>
                                        <i className="bi bi-credit-card me-2" />Pay Now
                                    </button>
                                )}
                                <button className="btn fw-bold flex-fill" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                                    onClick={() => { handleCancelBooking(selectedBooking.booking_id); setSelectedBooking(null); }}>
                                    <i className="bi bi-trash me-2" />Delete Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {bookingHostel && (
                <div className="modal-backdrop-custom" onClick={() => setBookingHostel(null)}>
                    <div className="modal-card-custom" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleDedicatedBooking}>
                            <div className="p-3 border-bottom d-flex justify-content-between align-items-center"><h5 className="mb-0 fw-bold">Book Hostel: {bookingHostel.hostel_name}</h5><button type="button" className="btn-close" onClick={() => setBookingHostel(null)} /></div>
                            <div className="p-4">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Expected Joining Date</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        value={joiningDate} 
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => {
                                            const newJoin = e.target.value;
                                            setJoiningDate(newJoin);
                                            if (leavingDate && newJoin && leavingDate < newJoin) {
                                                setLeavingDate(newJoin);
                                            }
                                        }} 
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Expected Leaving Date</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        value={leavingDate} 
                                        min={joiningDate || new Date().toISOString().split("T")[0]}
                                        onChange={(e) => {
                                            const newLeave = e.target.value;
                                            if (joiningDate && newLeave && newLeave < joiningDate) {
                                                showMessage("Expected Leaving Date cannot be before Expected Joining Date.");
                                                return;
                                            }
                                            setLeavingDate(newLeave);
                                        }} 
                                    />
                                    {joiningDate && (
                                        <div className="form-text text-muted small mt-1">
                                            Must be on or after Expected Joining Date ({joiningDate})
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Special Remarks / Notes</label>
                                    <textarea className="form-control" rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Any specific requirements or notes..." />
                                </div>
                                
                                {(() => {
                                    if (joiningDate && leavingDate && bookingHostel) {
                                        if (leavingDate < joiningDate) {
                                            return (
                                                <div className="mb-4 p-3 rounded bg-danger-subtle text-danger border border-danger-subtle d-flex align-items-center gap-2">
                                                    <i className="bi bi-exclamation-triangle-fill fs-5" />
                                                    <div>
                                                        <strong>Invalid Date Selection:</strong> Expected Leaving Date cannot be before Expected Joining Date.
                                                    </div>
                                                </div>
                                            );
                                        }
                                        const start = new Date(joiningDate);
                                        const end = new Date(leavingDate);
                                        const timeDiff = end.getTime() - start.getTime();
                                        if (timeDiff >= 0) {
                                            const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
                                            const months = Math.floor(totalDays / 30);
                                            const remainingDays = totalDays % 30;
                                            const mRent = Number(bookingHostel.monthly_rent || bookingHostel.rent || 0);
                                            const dRent = Number(bookingHostel.daily_rent || (mRent / 30));
                                            const calculatedRent = (months * mRent) + (remainingDays * dRent);
                                            
                                            const breakdownText = months > 0 
                                                ? `${months} Month(s) @ ₹${mRent} + ${remainingDays} Day(s) @ ₹${dRent}`
                                                : `${totalDays} Day(s) @ ₹${dRent} / day`;
                                                
                                            return (
                                                <div className="mb-4 p-3 rounded" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <div className="text-success fw-bold small text-uppercase">Estimated Total Rent</div>
                                                            <div className="text-muted small">{breakdownText}</div>
                                                        </div>
                                                        <div className="fs-3 fw-bold text-success">₹{calculatedRent.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    }
                                    return null;
                                })()}
                                
                                <button 
                                    type="submit" 
                                    className="btn btn-success w-100 fw-bold py-2"
                                    disabled={Boolean(joiningDate && leavingDate && leavingDate < joiningDate)}
                                >
                                    Confirm & Submit Booking Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activePaymentBooking && (
                <div className="modal-backdrop-custom" onClick={() => setActivePaymentBooking(null)}>
                    <div className="modal-card-custom" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleMakePayment}>
                            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold text-dark">Complete Payment</h5>
                                <button type="button" className="btn-close" onClick={() => setActivePaymentBooking(null)} />
                            </div>
                            <div className="p-4 text-center">
                                <p className="text-muted mb-3">Paying for: <strong className="text-dark">{activePaymentBooking.hostel_name}</strong></p>
                                
                                <div className="mb-4">
                                    <label className="form-label fw-semibold text-dark">Amount to Pay (₹)</label>
                                    <input type="number" className="form-control text-center fs-4 fw-bold text-success" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required />
                                </div>
                                
                                <div className="mb-4">
                                    <p className="fw-semibold text-dark mb-2">Scan QR Code using any UPI App</p>
                                    <div className="d-inline-block p-2 bg-white rounded shadow-sm border">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=merchant@upi&pn=HostelBooking&am=${paymentAmount || 0}`} alt="UPI QR Code" style={{ width: 150, height: 150 }} />
                                    </div>
                                    <p className="small text-muted mt-2 mb-0">Supported: GPay, PhonePe, Paytm, etc.</p>
                                </div>

                                <button className="btn btn-success w-100 fw-bold py-2 fs-6 shadow-sm">
                                    <i className="bi bi-check-circle me-2" />Confirm Payment of ₹{Number(paymentAmount || 0).toLocaleString()}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Print Styles */}
            {activeReceipt && (
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        #receipt-printable-area, #receipt-printable-area * { visibility: visible; }
                        #receipt-printable-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; box-shadow: none !important; border: none !important; }
                        .modal-backdrop-custom { background: white !important; }
                        .no-print { display: none !important; }
                    }
                `}</style>
            )}

            {/* Active Receipt Modal */}
            {activeReceipt && (
                <div className="modal-backdrop-custom d-flex align-items-center justify-content-center" onClick={() => setActiveReceipt(null)} style={{ padding: "1rem" }}>
                    <div id="receipt-printable-area" className="modal-card-custom d-flex flex-column" style={{ maxWidth: 650, width: "100%", maxHeight: "90vh", margin: "0 auto", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
                        
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center no-print" style={{ flexShrink: 0 }}>
                            <h5 className="mb-0 fw-bold text-dark"><i className="bi bi-receipt me-2" />Payment Receipt</h5>
                            <button className="btn-close" onClick={() => setActiveReceipt(null)} />
                        </div>

                        <div className="p-4 text-dark" style={{ overflowY: "auto", flexGrow: 1 }}>
                            <div className="text-center mb-5 border-bottom pb-4">
                                <h2 className="fw-bold mb-1" style={{ color: "#2563eb", letterSpacing: "-0.5px" }}>{activeReceipt.hostel_name}</h2>
                                <p className="text-muted mb-0">{activeReceipt.hostel_address || ""} {activeReceipt.city_name ? `, ${activeReceipt.city_name}` : ""}</p>
                                <div className="mt-3 badge bg-success-subtle text-success fs-6 px-3 py-2 border border-success-subtle rounded-pill">
                                    <i className="bi bi-check-circle-fill me-2" />Payment Successful
                                </div>
                            </div>

                            <div className="row g-4 mb-4">
                                <div className="col-sm-6">
                                    <div className="text-muted small fw-semibold text-uppercase mb-1">Student Details</div>
                                    <div className="fw-bold fs-6">{profile?.full_name || profile?.name || "Student Name"}</div>
                                    <div className="text-muted">{profile?.email || ""}</div>
                                    <div className="text-muted">{profile?.phone || ""}</div>
                                    <div className="text-muted">{profile?.gender || ""}</div>
                                </div>
                                <div className="col-sm-6 text-sm-end">
                                    <div className="text-muted small fw-semibold text-uppercase mb-1">Receipt Info</div>
                                    <div className="mb-1"><span className="text-muted">Receipt No:</span> <span className="fw-bold">#{activeReceipt.booking_id}-{Math.floor(Math.random()*1000)}</span></div>
                                    <div className="mb-1"><span className="text-muted">Txn ID:</span> <span className="fw-bold text-break">{activeReceipt.transaction_id || "N/A"}</span></div>
                                    <div><span className="text-muted">Date Paid:</span> <span className="fw-bold">{activeReceipt.payment_date ? new Date(activeReceipt.payment_date).toLocaleString() : new Date().toLocaleString()}</span></div>
                                </div>
                            </div>

                            <div className="bg-light rounded p-4 mb-4 border">
                                <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                                    <div className="fw-semibold">Description</div>
                                    <div className="fw-semibold">Amount</div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <div className="fw-bold text-dark">Hostel Booking Advance</div>
                                        <div className="text-muted small">Stay from {activeReceipt.joining_date ? new Date(activeReceipt.joining_date).toLocaleDateString() : "N/A"} to {activeReceipt.leaving_date ? new Date(activeReceipt.leaving_date).toLocaleDateString() : "N/A"}</div>
                                    </div>
                                    <div className="fw-bold">₹{Number(activeReceipt.payment_amount || activeReceipt.monthly_rent || 0).toLocaleString()}</div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                    <div className="fw-bold fs-5">Total Paid</div>
                                    <div className="fw-bold fs-4 text-success">₹{Number(activeReceipt.payment_amount || activeReceipt.monthly_rent || 0).toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="text-center text-muted small mt-2 mb-2">
                                <p className="mb-1">This is a computer generated receipt and does not require a physical signature.</p>
                                <p className="mb-0">Payment Method: <strong>{activeReceipt.payment_method || "UPI"}</strong></p>
                            </div>
                        </div>

                        <div className="p-3 bg-light border-top d-flex justify-content-end gap-2 no-print rounded-bottom" style={{ flexShrink: 0 }}>
                            <button className="btn btn-light fw-bold" onClick={() => setActiveReceipt(null)}>Close</button>
                            <button className="btn btn-primary fw-bold" onClick={() => {
                                window.print();
                                setTimeout(() => setActiveReceipt(null), 1000);
                            }}>
                                <i className="bi bi-file-earmark-pdf me-2" />Save as PDF / Print
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Viewer Modal */}
            {selectedImage && (
                <div className="modal-backdrop-custom d-flex justify-content-center align-items-center" onClick={() => setSelectedImage(null)} style={{ zIndex: 3000, background: "rgba(0,0,0,0.85)" }}>
                    <div style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}>
                        <button className="btn-close position-absolute top-0 start-100 translate-middle mt-2 ms-2 bg-white rounded-circle p-2 shadow" style={{ zIndex: 3010 }} onClick={() => setSelectedImage(null)}></button>
                        <img src={selectedImage} alt="Fullscreen Gallery" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "8px", objectFit: "contain", cursor: "default" }} onClick={(e) => e.stopPropagation()} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Students;
