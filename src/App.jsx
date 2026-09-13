import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Admin from "./components/Admin";
import Owner from "./components/Owner";
import Students from "./components/Students";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfirmProvider } from "./context/ConfirmContext";

function App() {
    const location = useLocation();
    const isDashboard = ["/admin", "/owner", "/students"].includes(location.pathname);

    return (
        <ConfirmProvider>
            <div className="page-shell d-flex flex-column min-vh-100">
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
                {!isDashboard && <Navbar />}
                <main className="flex-grow-1">
                    <Routes>

                        <Route path="/" element={<Home />} />

                        <Route path="/login" element={<Login />} />

                        <Route path="/signup" element={<Signup />} />

                        <Route path="/admin" element={<Admin />} />

                        <Route path="/owner" element={<Owner />} />

                        <Route path="/students" element={<Students />} />

                    </Routes>
                </main>
                {!isDashboard && <Footer />}
            </div>
        </ConfirmProvider>
    );

}

export default App;