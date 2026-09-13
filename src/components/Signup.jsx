import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../config/api";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: "student",
        full_name: "",
        email: "",
        phone: "",
        gender: "",
        college: "",
        course: "",
        year: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    const [profileImageFile, setProfileImageFile] = useState(null);
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setProfileImageFile(e.target.files[0]);
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            let profileImagePath = null;
            if (profileImageFile) {
                const uploadData = new FormData();
                uploadData.append("images", profileImageFile);
                const uploadRes = await fetch(`${API}/upload`, {
                    method: "POST",
                    body: uploadData
                });
                if (uploadRes.ok) {
                    const uploadResult = await uploadRes.json();
                    if (uploadResult.success && uploadResult.files.length > 0) {
                        const uploadedFile = uploadResult.files[0];
                        const rawUrl = uploadedFile.url || uploadedFile.filename || uploadedFile.path;
                        profileImagePath = (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
                            ? rawUrl
                            : `https://cznfksfrmdvvajbufavx.supabase.co/storage/v1/object/public/uploads/${String(rawUrl).replace(/^uploads\//, "")}`;
                    }
                }
            }

            const payload = {
                ...formData,
                role: formData.role === "owner" ? "Owner" : "Student",
                owner_name: formData.full_name,
                profile_image: profileImagePath
            };

            const response = await fetch(`${API}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Account created successfully. Redirecting to login...");
                setTimeout(() => {
                    navigate("/login");
                }, 1400);
            } else {
                toast.error(data.message || "Something went wrong");
            }
        } catch (error) {
            console.log(error);
            toast.error("Server error. Please try again later.");
        }
    };

    const isOwner = formData.role === "owner";

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <div className="row g-0">
                    <div className="col-lg-5 auth-left d-flex flex-column justify-content-center">
                        <Link to="/" className="text-white text-decoration-none fw-bold fs-4 mb-5">
                            SCRHDP.
                        </Link>
                        <span className="soft-pill bg-white bg-opacity-10 text-white border-0 shadow-sm" style={{ width: 'fit-content' }}>
                            <span className="me-2">✨</span> Create your account
                        </span>
                        <h2 className="fw-bold mb-4 mt-4 display-6" style={{ lineHeight: '1.2' }}>Join the community.</h2>
                        <p className="mb-5 text-white-50" style={{ fontSize: '1.1rem' }}>Whether you're a student looking for a stay or an owner managing properties, we've got you covered.</p>
                        <ul className="list-unstyled d-flex flex-column gap-3 text-white-50">
                            <li className="d-flex align-items-center"><span className="bg-white bg-opacity-25 rounded-circle p-1 me-3 d-flex"><span style={{ fontSize: '12px' }}>✓</span></span> Secure platform access</li>
                            <li className="d-flex align-items-center"><span className="bg-white bg-opacity-25 rounded-circle p-1 me-3 d-flex"><span style={{ fontSize: '12px' }}>✓</span></span> Verified student profiles</li>
                            <li className="d-flex align-items-center"><span className="bg-white bg-opacity-25 rounded-circle p-1 me-3 d-flex"><span style={{ fontSize: '12px' }}>✓</span></span> Easy listing management</li>
                        </ul>
                    </div>

                    <div className="col-lg-7 auth-right py-4 px-md-5" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold mb-1">Sign up</h3>
                                <p className="text-muted mb-0">Fill in your details below.</p>
                            </div>
                            <Link to="/login" className="text-primary fw-semibold text-decoration-none px-3 py-2 bg-primary bg-opacity-10 rounded-3">Login instead</Link>
                        </div>

                        <form onSubmit={handleSignup} className="d-flex flex-column gap-3">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-medium mb-1">Username</label>
                                    <input className="auth-input mb-0" type="text" name="username" placeholder="johndoe" value={formData.username} onChange={handleChange} required autoComplete="off" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-medium mb-1">Password</label>
                                    <input className="auth-input mb-0" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required autoComplete="new-password" />
                                </div>
                            </div>

                            <div>
                                <label className="form-label text-muted small fw-medium mb-1">I am a...</label>
                                <select className="auth-input mb-0 cursor-pointer" name="role" value={formData.role} onChange={handleChange}>
                                    <option value="student">Student</option>
                                    <option value="owner">Hostel owner</option>
                                </select>
                            </div>
                            
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <label className="form-label text-muted small fw-medium mb-1">{isOwner ? "Owner name" : "Full name"}</label>
                                    <input className="auth-input mb-0" type="text" name="full_name" placeholder={isOwner ? "John Doe" : "John Doe"} value={formData.full_name} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-medium mb-1">Email address</label>
                                    <input className="auth-input mb-0" type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-muted small fw-medium mb-1">Phone number</label>
                                    <input className="auth-input mb-0" type="text" name="phone" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} required />
                                </div>
                            </div>

                            {!isOwner && (
                                <>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-medium mb-1">Gender</label>
                                            <select className="auth-input mb-0 cursor-pointer" name="gender" value={formData.gender} onChange={handleChange}>
                                                <option value="">Select gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-medium mb-1">College</label>
                                            <input className="auth-input mb-0" type="text" name="college" placeholder="College name" value={formData.college} onChange={handleChange} required />
                                        </div>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-medium mb-1">Course</label>
                                            <input className="auth-input mb-0" type="text" name="course" placeholder="B.Tech" value={formData.course} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label text-muted small fw-medium mb-1">Year</label>
                                            <input className="auth-input mb-0" type="number" name="year" placeholder="1" value={formData.year} onChange={handleChange} />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="form-label text-muted small fw-medium mb-1">Profile Image (Optional)</label>
                                <input className="form-control auth-input mb-0 cursor-pointer" type="file" accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div>
                                <label className="form-label text-muted small fw-medium mb-1">Address</label>
                                <input className="auth-input mb-0" type="text" name="address" placeholder="123 Street Name" value={formData.address} onChange={handleChange} required />
                            </div>

                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label text-muted small fw-medium mb-1">City</label>
                                    <input className="auth-input mb-0" type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-muted small fw-medium mb-1">State</label>
                                    <input className="auth-input mb-0" type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-muted small fw-medium mb-1">Pincode</label>
                                    <input className="auth-input mb-0" type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary py-2 fw-semibold w-100 mt-4 shadow-sm rounded-3">
                                Create account
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
