function Footer() {
    return (
        <footer className="footer-shell">
            <div className="container">
                <div className="row g-4">
                    <div className="col-md-4">
                        <h5 className="fw-bold">SCRHDP</h5>
                        <p className="text-white-50 mt-2">A modern platform for discovering safe and verified student housing with confidence.</p>
                    </div>
                    <div className="col-md-4">
                        <h6 className="fw-bold">Quick links</h6>
                        <ul className="list-unstyled mt-3 text-white-50">
                            <li>Home</li>
                            <li>Login</li>
                            <li>Sign up</li>
                        </ul>
                    </div>
                    <div className="col-md-4">
                        <h6 className="fw-bold">Contact</h6>
                        <ul className="list-unstyled mt-3 text-white-50">
                            <li>support@scrhdp.com</li>
                            <li>+91 98765 43210</li>
                            <li>Available 24/7 for students</li>
                        </ul>
                    </div>
                </div>
                <div className="border-top border-secondary mt-4 pt-3 text-center text-white-50 small">
                    © 2026 Students City Relocation & Hostel Discovery Platform
                </div>
            </div>
        </footer>
    );
}

export default Footer;