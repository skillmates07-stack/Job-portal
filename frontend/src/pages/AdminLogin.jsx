import React, { useContext, useState } from "react";
import { Mail, Lock, LoaderCircle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { backendUrl, setAdminToken, setAdminData, setIsAdminLogin } =
        useContext(AppContext);

    const adminLoginHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/admin/login`, {
                email,
                password,
            });

            if (data.success) {
                setAdminToken(data.token);
                setAdminData(data.adminData);
                setIsAdminLogin(true);
                localStorage.setItem("adminToken", data.token);
                toast.success(data.message);
                navigate("/admin");
            } else {
                toast.error(data.message || "Login failed");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Invalid admin credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="flex flex-col min-h-screen">
                <main className="flex-grow flex items-center justify-center py-12">
                    <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                        <div className="text-center mb-6">
                            <div className="flex justify-center mb-4">
                                <div className="bg-indigo-100 p-3 rounded-full">
                                    <ShieldCheck className="h-8 w-8 text-indigo-600" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-semibold text-gray-700 mb-1">
                                Admin Login
                            </h1>
                            <p className="text-sm text-gray-600">
                                Access the admin dashboard
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={adminLoginHandler}>
                            <div className="border border-gray-300 rounded flex items-center p-2.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
                                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                                <input
                                    type="email"
                                    placeholder="Admin Email"
                                    className="w-full outline-none text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="border border-gray-300 rounded flex items-center p-2.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
                                <Lock className="h-5 w-5 text-gray-400 mr-2" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full outline-none text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition flex justify-center items-center cursor-pointer ${loading ? "cursor-not-allowed opacity-50" : ""
                                    }`}
                            >
                                {loading ? (
                                    <LoaderCircle className="animate-spin h-5 w-5" />
                                ) : (
                                    "Login as Admin"
                                )}
                            </button>
                        </form>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default AdminLogin;
