import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { Filter, FileText, Mail, Briefcase, LoaderCircle, Eye, Code, Wrench } from "lucide-react";
import toast from "react-hot-toast";

const AdminUsers = () => {
    const navigate = useNavigate();
    const { backendUrl, adminToken } = useContext(AppContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        skills: "",
        minExperience: "",
        maxExperience: "",
        minCTC: "",
        maxCTC: "",
        projectTypes: [], // Changed to array for multi-select
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.skills) params.append("skills", filters.skills);
            if (filters.minExperience) params.append("minExperience", filters.minExperience);
            if (filters.maxExperience) params.append("maxExperience", filters.maxExperience);
            if (filters.minCTC) params.append("minCTC", filters.minCTC);
            if (filters.maxCTC) params.append("maxCTC", filters.maxCTC);
            if (filters.projectTypes.length > 0) params.append("projectType", filters.projectTypes.join(","));

            const { data } = await axios.get(
                `${backendUrl}/admin/users?${params.toString()}`,
                { headers: { token: adminToken } }
            );

            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminToken) {
            fetchUsers();
        }
    }, [adminToken]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleProjectTypeToggle = (type) => {
        setFilters((prev) => {
            const currentTypes = prev.projectTypes;
            if (currentTypes.includes(type)) {
                return { ...prev, projectTypes: currentTypes.filter(t => t !== type) };
            } else {
                return { ...prev, projectTypes: [...currentTypes, type] };
            }
        });
    };

    const applyFilters = () => {
        fetchUsers();
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({
            skills: "",
            minExperience: "",
            maxExperience: "",
            minCTC: "",
            maxCTC: "",
            projectTypes: [],
        });
    };

    const projectTypeOptions = [
        "UI/UX Design",
        "Web Development",
        "Mobile Development",
        "AI/ML",
        "Data Science",
        "IoT",
        "Cloud/DevOps",
        "Blockchain",
        "Game Development",
        "E-commerce",
        "Education",
    ];

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-700">User Management</h1>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                    <Filter size={18} />
                    <span>Filters</span>
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Skills (comma separated)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., React, Figma, Python"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                value={filters.skills}
                                onChange={(e) => handleFilterChange("skills", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Experience (years)
                            </label>
                            <input
                                type="number"
                                placeholder="0"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                value={filters.minExperience}
                                onChange={(e) => handleFilterChange("minExperience", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Experience (years)
                            </label>
                            <input
                                type="number"
                                placeholder="10"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                value={filters.maxExperience}
                                onChange={(e) => handleFilterChange("maxExperience", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min CTC (LPA)
                            </label>
                            <input
                                type="number"
                                placeholder="0"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                value={filters.minCTC}
                                onChange={(e) => handleFilterChange("minCTC", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max CTC (LPA)
                            </label>
                            <input
                                type="number"
                                placeholder="50"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                value={filters.maxCTC}
                                onChange={(e) => handleFilterChange("maxCTC", e.target.value)}
                            />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Types (select multiple)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {projectTypeOptions.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleProjectTypeToggle(type)}
                                        className={`px-3 py-1.5 text-sm rounded-full border transition ${filters.projectTypes.includes(type)
                                                ? "bg-indigo-600 text-white border-indigo-600"
                                                : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Users List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <LoaderCircle className="animate-spin h-8 w-8 text-indigo-600" />
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-500">No users found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {users.map((user) => (
                        <div
                            key={user._id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow transition"
                        >
                            <div className="flex items-start gap-4">
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-800">{user.name}</h3>
                                        {user.resumeParseScore > 0 && (
                                            <span className={`text-xs px-2 py-0.5 rounded ${user.resumeParseScore >= 70 ? "bg-green-100 text-green-700" :
                                                user.resumeParseScore >= 40 ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-gray-100 text-gray-600"
                                                }`}>
                                                {user.resumeParseScore}%
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <Mail size={14} /> {user.email}
                                    </p>

                                    {/* Technical Skills */}
                                    {user.technicalSkills?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {user.technicalSkills.slice(0, 5).map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                                                >
                                                    <Code size={10} /> {skill}
                                                </span>
                                            ))}
                                            {user.technicalSkills.length > 5 && (
                                                <span className="text-xs text-gray-500 py-1">
                                                    +{user.technicalSkills.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Tools */}
                                    {user.tools?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {user.tools.slice(0, 4).map((tool, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                                                >
                                                    <Wrench size={10} /> {tool}
                                                </span>
                                            ))}
                                            {user.tools.length > 4 && (
                                                <span className="text-xs text-gray-500 py-1">
                                                    +{user.tools.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Project Types */}
                                    {user.projectTypes?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {user.projectTypes.slice(0, 3).map((type, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded-full"
                                                >
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="text-right flex flex-col gap-2">
                                    {user.experience?.years > 0 && (
                                        <p className="text-sm text-gray-600 flex items-center justify-end gap-1">
                                            <Briefcase size={14} />
                                            {user.experience.years} yrs
                                        </p>
                                    )}
                                    {user.expectedCTC > 0 && (
                                        <p className="text-sm text-green-600 font-medium">₹{user.expectedCTC} LPA</p>
                                    )}
                                    {user.resume && (
                                        <a
                                            href={user.resume}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-indigo-600 hover:underline flex items-center gap-1 text-sm justify-end"
                                        >
                                            <FileText size={14} /> Resume
                                        </a>
                                    )}
                                    <button
                                        onClick={() => navigate(`/admin/users/${user._id}`)}
                                        className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-100 transition"
                                    >
                                        <Eye size={14} /> View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminUsers;

