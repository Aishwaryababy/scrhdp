import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    const role = localStorage.getItem("role");

    const getDashboardLink = () => {
        if (role === "Admin") return "/admin";
        if (role === "Owner") return "/owner";
        return "/students";
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light sticky-top nav-glass">
            <div className="container">
                <div className="d-flex align-items-center">
                    <Link className="navbar-brand fw-bold text-primary mb-0" to="/" style={{ fontSize: '1.4rem' }}>
                        SCRHDP
                    </Link>
                    <div className="d-none d-lg-block ms-3 ps-3 border-start border-2 border-secondary-subtle">
                        <span className="text-muted small fw-medium">Student City Relocation & Hostel Discovery Platform</span>
                    </div>
                </div>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="menu">
                    <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
                        <li className="nav-item">
                            <Link className="nav-link text-dark" to="/">
                                Home
                            </Link>
                        </li>
                        {token ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link text-dark fw-semibold" to={getDashboardLink()}>
                                        👋 {username}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-outline-danger btn-sm px-3" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link text-dark" to="/login">
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-primary btn-sm px-3" to="/signup">
                                        Sign up
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;