import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../config/api";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem("token", data.token || "");
                const userRole = data.role || "";
                localStorage.setItem("role", userRole);
                localStorage.setItem("username", data.username || formData.username);

                toast.success("Login successful. Redirecting...");
                setTimeout(() => {
                    if (userRole === "Admin") {
                        navigate("/admin");
                    } else if (userRole === "Owner") {
                        navigate("/owner");
                    } else {
                        navigate("/students");
                    }
                }, 1000);
            } else {
                toast.error(data.message || "Login failed");
            }
        } catch (error) {
            console.log(error);
            toast.error("Server error. Please try again later.");
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <div className="row g-0">
                    <div className="col-lg-5 auth-left d-flex flex-column justify-content-center">
                        <Link to="/" className="text-white text-decoration-none fw-bold fs-4 mb-5">
                            SCRHDP.
                        </Link>
                        <span className="soft-pill bg-white bg-opacity-10 text-white border-0 shadow-sm" style={{ width: 'fit-content' }}>
                            <span className="me-2">👋</span> Welcome back
                        </span>
                        <h2 className="fw-bold mb-4 mt-4 display-6" style={{ lineHeight: '1.2' }}>Log in to your account.</h2>
                        <p className="mb-5 text-white-50" style={{ fontSize: '1.1rem' }}>Access your personalized housing dashboard, saved searches, and management tools.</p>
                        <ul className="list-unstyled d-flex flex-column gap-3 text-white-50">
                            <li className="d-flex align-items-center"><span className="bg-white bg-opacity-25 rounded-circle p-1 me-3 d-flex"><span style={{ fontSize: '12px' }}>✓</span></span> Secure account access</li>
                            <li className="d-flex align-items-center"><span className="bg-white bg-opacity-25 rounded-circle p-1 me-3 d-flex"><span style={{ fontSize: '12px' }}>✓</span></span> Student housing search</li>
                            <li className="d-flex align-items-center"><span className="bg-white bg-opacity-25 rounded-circle p-1 me-3 d-flex"><span style={{ fontSize: '12px' }}>✓</span></span> Hostel-owner management</li>
                        </ul>
                    </div>

                    <div className="col-lg-7 auth-right d-flex flex-column justify-content-center py-5 px-md-5">
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <div>
                                <h3 className="fw-bold mb-1">Login</h3>
                                <p className="text-muted mb-0">Enter your credentials to continue.</p>
                            </div>
                            <Link to="/signup" className="text-primary fw-semibold text-decoration-none px-3 py-2 bg-primary bg-opacity-10 rounded-3">Sign up</Link>
                        </div>

                        <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
                            <div>
                                <label className="form-label text-muted small fw-medium mb-1">Username</label>
                                <input className="auth-input mb-0" type="text" name="username" placeholder="johndoe" value={formData.username} onChange={handleChange} required autoComplete="off" />
                            </div>
                            
                            <div>
                                <label className="form-label text-muted small fw-medium mb-1">Password</label>
                                <input className="auth-input mb-0" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required autoComplete="new-password" />
                            </div>

                            <button type="submit" className="btn btn-primary py-2 fw-semibold w-100 mt-3 shadow-sm rounded-3">
                                Login to account
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;