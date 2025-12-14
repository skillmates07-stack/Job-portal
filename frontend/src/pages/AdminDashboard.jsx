import { useContext, useEffect } from "react";
import {
    Link,
    NavLink,
    Outlet,
    useNavigate,
    useLocation,
} from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { LoaderCircle, LogOut, Users, Building2, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { adminData, isAdminLogin, setAdminToken, setAdminData, setIsAdminLogin } =
        useContext(AppContext);

    const sidebarLinks = [
        {
            id: "overview",
            name: "Overview",
            path: "/admin/overview",
            icon: LayoutDashboard,
        },
        {
            id: "users",
            name: "User Management",
            path: "/admin/users",
            icon: Users,
        },
        {
            id: "companies",
            name: "Company Onboarding",
            path: "/admin/companies",
            icon: Building2,
        },
    ];

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        setAdminToken(null);
        setAdminData(null);
        setIsAdminLogin(false);
        toast.success("Logged out successfully");
        navigate("/admin-login");
    };

    useEffect(() => {
        if (!isAdminLogin) {
            navigate("/admin-login");
            return;
        }

        if (
            location.pathname === "/admin" ||
            location.pathname === "/admin/"
        ) {
            navigate("/admin/overview");
        }
    }, [location.pathname, navigate, isAdminLogin]);

    if (!isAdminLogin) {
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="flex items-center justify-between border-b border-gray-200 py-3 bg-white sticky top-0 z-10 px-4">
                <Link to="/admin" className="flex items-center gap-2">
                    <img className="w-[120px]" src={assets.logo} alt="Logo" />
                    <span className="bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-1 rounded">
                        Admin
                    </span>
                </Link>
                {adminData ? (
                    <div className="flex items-center gap-4 md:gap-3">
                        <div className="flex items-center gap-2">
                            <p className="text-gray-600">Admin</p>
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-medium text-sm">A</span>
                            </div>
                        </div>
                        <button
                            className="w-[30px] h-[30px] flex items-center justify-center rounded bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={handleLogout}
                            aria-label="Logout"
                        >
                            <LogOut size={18} className="text-gray-700" />
                        </button>
                    </div>
                ) : null}
            </header>

            <div className="flex flex-1">
                <aside className="md:w-64 w-16 border-r border-gray-200 bg-white flex flex-col shrink-0">
                    <nav className="pt-4 rounded-l-2xl">
                        {sidebarLinks.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <NavLink
                                    to={item.path}
                                    key={item.id}
                                    className={({ isActive }) =>
                                        `flex items-center py-3 px-4 gap-3 transition-colors rounded-l-md ${isActive
                                            ? "border-r-4 md:border-r-[6px] bg-indigo-50 border-indigo-500 text-indigo-600 font-medium"
                                            : "text-gray-600 hover:bg-gray-50"
                                        }`
                                    }
                                >
                                    <IconComponent size={20} aria-hidden="true" />
                                    <span className="md:block hidden">{item.name}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </aside>

                <main className="flex-1 overflow-auto p-4 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
