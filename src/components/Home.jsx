import React from "react";
import { Link } from "react-router-dom";

const features = [
    {
        icon: "🏠",
        title: "Verified stays",
        desc: "Every hostel is screened for safety, comfort, and student-friendly standards."
    },
    {
        icon: "📍",
        title: "Campus-smart search",
        desc: "Find accommodations close to your college with precise location insights."
    },
    {
        icon: "⭐",
        title: "Real student reviews",
        desc: "See honest feedback from fellow students before you commit to a place."
    },
    {
        icon: "🔒",
        title: "Secure booking",
        desc: "Book confidently with clear pricing, transparent policies, and support."
    }
];

const steps = [
    { number: "01", title: "Create your account", text: "Join as a student or hostel owner in a few clicks." },
    { number: "02", title: "Search nearby hostels", text: "Filter by city, gender, budget, and sharing type." },
    { number: "03", title: "Compare and confirm", text: "Review amenities, photos, and student feedback before booking." },
    { number: "04", title: "Move in smoothly", text: "Secure your stay and start your new chapter with confidence." }
];

const stats = [
    { value: "500+", label: "verified hostels" },
    { value: "1500+", label: "happy students" },
    { value: "50+", label: "cities covered" },
    { value: "4.8/5", label: "average rating" }
];

function Home() {
    return (
        <div className="page-shell">

            <section className="hero-section">
                <div className="container py-5">
                    <div className="row g-4 align-items-center">
                        <div className="col-lg-7">
                            <span className="soft-pill shadow-sm">
                                <span className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px', fontSize: '12px' }}>🎓</span>
                                Student-first housing discovery
                            </span>
                            <h1 className="hero-title fw-bold text-white mt-3">
                                Find a safe, verified place <br/> to live in <span style={{ color: '#60a5fa' }}>minutes.</span>
                            </h1>
                            <p className="lead hero-copy mt-3">
                                SCRHDP helps students discover hostels, PGs, and private rooms near campus with verified listings, transparent pricing, and real feedback.
                            </p>

                            <div className="d-flex flex-wrap gap-3 mt-4">
                                <Link to="/signup" className="btn btn-warning btn-lg px-4">
                                    Create account
                                </Link>
                                <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                                    Explore listings
                                </Link>
                            </div>

                            <div className="hero-trust mt-5 d-flex align-items-center gap-4 text-white-50">
                                <span><span className="text-white me-1">✓</span> Verified hostels</span>
                                <span className="text-white-50">|</span>
                                <span><span className="text-white me-1">⭐</span> Trusted reviews</span>
                                <span className="text-white-50">|</span>
                                <span><span className="text-white me-1">💬</span> Quick support</span>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="hero-card glass-card p-4 p-lg-4">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="mb-1 text-uppercase small fw-semibold text-muted">Live preview</p>
                                        <h3 className="fw-bold mb-0">A better way to discover student housing</h3>
                                    </div>
                                    <span className="badge rounded-pill bg-primary-subtle text-primary">4.9 ★</span>
                                </div>

                                <div className="hostel-preview mt-4 shadow-sm">
                                    <div className="preview-top" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', height: '160px' }} />
                                    <div className="preview-body">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h5 className="fw-bold mb-1">Green Nest Hostel</h5>
                                                <p className="text-muted mb-0">2.3 km from campus • Wi-Fi • Food • 24/7 security</p>
                                            </div>
                                            <span className="text-primary fw-semibold">₹8,500</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <span className="mini-pill">Double Sharing</span>
                                            <button className="btn btn-sm btn-primary">Book now</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="row mt-4 g-3">
                                    <div className="col-6">
                                        <div className="mini-stat shadow-sm d-flex flex-row align-items-center gap-3 p-3">
                                            <div className="text-primary fs-4">🎧</div>
                                            <div className="d-flex flex-column text-start">
                                                <strong className="text-dark mb-0">24/7</strong>
                                                <span className="text-muted small">Support</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="mini-stat shadow-sm d-flex flex-row align-items-center gap-3 p-3">
                                            <div className="text-primary fs-4">🛡️</div>
                                            <div className="d-flex flex-column text-start">
                                                <strong className="text-dark mb-0">Safe</strong>
                                                <span className="text-muted small">Environment</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container py-5">
                <div className="search-card glass-card p-4 p-lg-5">
                    <div className="row g-3 align-items-end">
                        <div className="col-lg-3">
                            <label className="form-label fw-semibold">City</label>
                            <input type="text" className="form-control" placeholder="e.g. Bengaluru" />
                        </div>
                        <div className="col-lg-2">
                            <label className="form-label fw-semibold">Gender</label>
                            <select className="form-select">
                                <option>Any</option>
                                <option>Boys</option>
                                <option>Girls</option>
                                <option>Co-Living</option>
                            </select>
                        </div>
                        <div className="col-lg-3">
                            <label className="form-label fw-semibold">Sharing type</label>
                            <select className="form-select">
                                <option>Any</option>
                                <option>Single Sharing</option>
                                <option>Double Sharing</option>
                                <option>Triple Sharing</option>
                                <option>Dormitory</option>
                            </select>
                        </div>
                        <div className="col-lg-2">
                            <label className="form-label fw-semibold">Budget</label>
                            <select className="form-select">
                                <option>Any</option>
                                <option>Under ₹8k</option>
                                <option>₹8k–₹12k</option>
                                <option>Above ₹12k</option>
                            </select>
                        </div>
                        <div className="col-lg-2">
                            <button className="btn btn-primary w-100">Search</button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container py-5">
                <div className="text-center mb-4">
                    <p className="eyebrow">Why students choose SCRHDP</p>
                    <h2 className="fw-bold">Everything you need for a smooth stay</h2>
                </div>
                <div className="row g-4">
                    {features.map((item) => (
                        <div className="col-md-6 col-lg-3" key={item.title}>
                            <div className="feature-card glass-card h-100 p-4 text-center">
                                <div className="feature-icon mx-auto">{item.icon}</div>
                                <h5 className="fw-bold mt-3">{item.title}</h5>
                                <p className="text-muted mb-0">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="container py-5">
                <div className="row g-4 align-items-stretch">
                    <div className="col-lg-6">
                        <div className="glass-card p-4 p-lg-5 h-100">
                            <p className="eyebrow">How it works</p>
                            <h3 className="fw-bold mb-4">From sign-up to move-in in four simple steps</h3>
                            <div className="d-grid gap-3">
                                {steps.map((step) => (
                                    <div className="step-row" key={step.number}>
                                        <div className="step-number">{step.number}</div>
                                        <div>
                                            <h6 className="fw-bold mb-1">{step.title}</h6>
                                            <p className="text-muted mb-0">{step.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="glass-card p-4 p-lg-5 h-100">
                            <p className="eyebrow">Built for modern student life</p>
                            <h3 className="fw-bold mb-4">Trusted by students seeking comfort and convenience</h3>
                            <ul className="list-unstyled d-grid gap-3">
                                <li className="d-flex align-items-start gap-2">
                                    <span className="check-mark">✓</span>
                                    <span>Explore curated listings tailored for students near colleges and tech parks.</span>
                                </li>
                                <li className="d-flex align-items-start gap-2">
                                    <span className="check-mark">✓</span>
                                    <span>Compare amenities, rent, rules, and location all in one place.</span>
                                </li>
                                <li className="d-flex align-items-start gap-2">
                                    <span className="check-mark">✓</span>
                                    <span>Support both students and hostel owners through one dependable platform.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container pb-5">
                <div className="stats-banner glass-card p-4 p-lg-5">
                    <div className="row g-3 text-center">
                        {stats.map((stat) => (
                            <div className="col-6 col-md-3" key={stat.label}>
                                <div className="stat-box">
                                    <h3 className="fw-bold mb-1">{stat.value}</h3>
                                    <p className="text-muted mb-0">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="container pb-5">
                <div className="cta-banner text-center">
                    <h2 className="fw-bold">Ready to find your perfect hostel?</h2>
                    <p className="mt-3 mb-4">Join thousands of students discovering safe, affordable, and verified accommodation.</p>
                    <Link to="/signup" className="btn btn-warning btn-lg px-4">Register now</Link>
                </div>
            </section>

        </div>
    );
}

export default Home;