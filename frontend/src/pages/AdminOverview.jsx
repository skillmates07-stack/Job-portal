import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { Users, Building2, FileText, CheckCircle, LoaderCircle } from "lucide-react";

const AdminOverview = () => {
    const { backendUrl, adminToken } = useContext(AppContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/admin/stats`, {
                    headers: { token: adminToken },
                });
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (adminToken) {
            fetchStats();
        }
    }, [backendUrl, adminToken]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoaderCircle className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Users",
            value: stats?.totalUsers || 0,
            icon: Users,
            color: "blue",
        },
        {
            title: "Users with Resume",
            value: stats?.usersWithResume || 0,
            icon: FileText,
            color: "green",
        },
        {
            title: "Total Companies",
            value: stats?.totalCompanies || 0,
            icon: Building2,
            color: "purple",
        },
        {
            title: "Verified Companies",
            value: stats?.verifiedCompanies || 0,
            icon: CheckCircle,
            color: "emerald",
        },
    ];

    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        emerald: "bg-emerald-50 text-emerald-600",
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-700 mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card, index) => {
                    const IconComponent = card.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow transition"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${colorClasses[card.color]}`}>
                                    <IconComponent size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{card.title}</p>
                                    <p className="text-2xl font-semibold text-gray-800">{card.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {stats?.pendingVerification > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                        <strong>{stats.pendingVerification}</strong> companies are pending verification.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminOverview;
