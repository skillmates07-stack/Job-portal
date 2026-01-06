import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
    User, Briefcase, GraduationCap, Code, Globe, Save,
    Plus, Trash2, Edit2, X, Check, LoaderCircle, FolderOpen
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { AppContext } from "../context/AppContext";

// Notice Period Options
const NOTICE_PERIODS = ["Immediate", "15 Days", "30 Days", "60 Days", "90+ Days"];

const CandidateProfile = () => {
    const navigate = useNavigate();
    const { userData, userToken, backendUrl, isLogin, fetchUserData, userDataLoading } = useContext(AppContext);

    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        name: "",
        headline: "",
        contactInfo: { phone: "", location: "", linkedin: "", github: "", portfolio: "", dob: "" },
        careerObjective: "",
        technicalSkills: [],
        tools: [],
        personalSkills: [],
        currentCTC: 0,
        expectedCTC: 0,
        noticePeriod: "",
        experience: { years: 0, positions: [] },
        education: [],
        projects: [],
        languages: [],
        certifications: [],
    });

    // Skill input states
    const [newSkill, setNewSkill] = useState({ technical: "", tool: "", personal: "" });

    // Load user data
    useEffect(() => {
        if (!isLogin) {
            navigate("/candidate-login");
            return;
        }
        if (userData) {
            setFormData({
                name: userData.name || "",
                headline: userData.headline || "",
                contactInfo: userData.contactInfo || { phone: "", location: "", linkedin: "", github: "", portfolio: "", dob: "" },
                careerObjective: userData.careerObjective || "",
                technicalSkills: userData.technicalSkills || [],
                tools: userData.tools || [],
                personalSkills: userData.personalSkills || [],
                currentCTC: userData.currentCTC || 0,
                expectedCTC: userData.expectedCTC || 0,
                noticePeriod: userData.noticePeriod || "",
                experience: userData.experience || { years: 0, positions: [] },
                education: userData.education || [],
                projects: userData.projects || [],
                languages: userData.languages || [],
                certifications: userData.certifications || [],
            });
        }
    }, [userData, isLogin, navigate]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleContactChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            contactInfo: { ...prev.contactInfo, [field]: value }
        }));
    };

    const handleExperienceChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            experience: { ...prev.experience, [field]: value }
        }));
    };

    // Skill management
    const addSkill = (type) => {
        const skill = newSkill[type].trim();
        if (!skill) return;

        const fieldMap = { technical: "technicalSkills", tool: "tools", personal: "personalSkills" };
        const field = fieldMap[type];

        if (!formData[field].includes(skill)) {
            setFormData(prev => ({ ...prev, [field]: [...prev[field], skill] }));
        }
        setNewSkill(prev => ({ ...prev, [type]: "" }));
    };

    const removeSkill = (type, skill) => {
        const fieldMap = { technical: "technicalSkills", tool: "tools", personal: "personalSkills" };
        const field = fieldMap[type];
        setFormData(prev => ({ ...prev, [field]: prev[field].filter(s => s !== skill) }));
    };

    // Position management
    const addPosition = () => {
        setFormData(prev => ({
            ...prev,
            experience: {
                ...prev.experience,
                positions: [...prev.experience.positions, { title: "", company: "", duration: "", description: "" }]
            }
        }));
    };

    const updatePosition = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            experience: {
                ...prev.experience,
                positions: prev.experience.positions.map((p, i) => i === index ? { ...p, [field]: value } : p)
            }
        }));
    };

    const removePosition = (index) => {
        setFormData(prev => ({
            ...prev,
            experience: {
                ...prev.experience,
                positions: prev.experience.positions.filter((_, i) => i !== index)
            }
        }));
    };

    // Education management
    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, { degree: "", institution: "", year: "", grade: "", field: "" }]
        }));
    };

    const updateEducation = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.map((e, i) => i === index ? { ...e, [field]: value } : e)
        }));
    };

    const removeEducation = (index) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
        }));
    };

    // Project management
    const addProject = () => {
        setFormData(prev => ({
            ...prev,
            projects: [...prev.projects, { name: "", description: "", duration: "", role: "", tools: [], category: "" }]
        }));
    };

    const updateProject = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.map((p, i) => i === index ? { ...p, [field]: value } : p)
        }));
    };

    const removeProject = (index) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index)
        }));
    };

    // Save profile
    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}/user/update-profile`,
                formData,
                { headers: { token: userToken } }
            );

            if (data.success) {
                toast.success("Profile updated successfully!");
                fetchUserData();
                setActiveSection(null);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    if (userDataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <section className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                        <p className="text-gray-500 text-sm">Manage your profile information</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saving ? "bg-gray-200 text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                            }`}
                    >
                        {saving ? <LoaderCircle className="animate-spin w-4 h-4" /> : <Save size={18} />}
                        {saving ? "Saving..." : "Save All Changes"}
                    </button>
                </div>

                {/* Basic Info Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <User size={20} className="text-blue-500" />
                        <h2 className="text-lg font-semibold">Basic Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Headline</label>
                            <input
                                type="text"
                                placeholder="e.g., Full Stack Developer"
                                value={formData.headline}
                                onChange={(e) => handleInputChange("headline", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={formData.contactInfo.phone}
                                onChange={(e) => handleContactChange("phone", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                placeholder="City, State"
                                value={formData.contactInfo.location}
                                onChange={(e) => handleContactChange("location", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input
                                type="text"
                                placeholder="DD/MM/YYYY"
                                value={formData.contactInfo.dob}
                                onChange={(e) => handleContactChange("dob", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Briefcase size={20} className="text-green-500" />
                        <h2 className="text-lg font-semibold">About & Availability</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Career Objective</label>
                            <textarea
                                rows={3}
                                value={formData.careerObjective}
                                onChange={(e) => handleInputChange("careerObjective", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Brief description of your career goals..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.experience.years}
                                    onChange={(e) => handleExperienceChange("years", parseInt(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current CTC (LPA)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.currentCTC}
                                    onChange={(e) => handleInputChange("currentCTC", parseFloat(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expected CTC (LPA)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.expectedCTC}
                                    onChange={(e) => handleInputChange("expectedCTC", parseFloat(e.target.value) || 0)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
                                <select
                                    value={formData.noticePeriod}
                                    onChange={(e) => handleInputChange("noticePeriod", e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select...</option>
                                    {NOTICE_PERIODS.map(period => (
                                        <option key={period} value={period}>{period}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Code size={20} className="text-purple-500" />
                        <h2 className="text-lg font-semibold">Skills</h2>
                    </div>

                    {/* Technical Skills */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.technicalSkills.map((skill, i) => (
                                <span key={i} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                    {skill}
                                    <button onClick={() => removeSkill("technical", skill)} className="hover:text-red-500 cursor-pointer">
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add skill..."
                                value={newSkill.technical}
                                onChange={(e) => setNewSkill(prev => ({ ...prev, technical: e.target.value }))}
                                onKeyPress={(e) => e.key === "Enter" && addSkill("technical")}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                            <button
                                onClick={() => addSkill("technical")}
                                className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-200 cursor-pointer"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Tools */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tools & Technologies</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.tools.map((tool, i) => (
                                <span key={i} className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                    {tool}
                                    <button onClick={() => removeSkill("tool", tool)} className="hover:text-red-500 cursor-pointer">
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add tool..."
                                value={newSkill.tool}
                                onChange={(e) => setNewSkill(prev => ({ ...prev, tool: e.target.value }))}
                                onKeyPress={(e) => e.key === "Enter" && addSkill("tool")}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                            <button
                                onClick={() => addSkill("tool")}
                                className="bg-green-100 text-green-600 px-4 py-2 rounded-lg text-sm hover:bg-green-200 cursor-pointer"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Soft Skills */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Soft Skills</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.personalSkills.map((skill, i) => (
                                <span key={i} className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                                    {skill}
                                    <button onClick={() => removeSkill("personal", skill)} className="hover:text-red-500 cursor-pointer">
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add soft skill..."
                                value={newSkill.personal}
                                onChange={(e) => setNewSkill(prev => ({ ...prev, personal: e.target.value }))}
                                onKeyPress={(e) => e.key === "Enter" && addSkill("personal")}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                            <button
                                onClick={() => addSkill("personal")}
                                className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg text-sm hover:bg-purple-200 cursor-pointer"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* Social Links Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe size={20} className="text-orange-500" />
                        <h2 className="text-lg font-semibold">Social Links</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                            <input
                                type="url"
                                placeholder="https://linkedin.com/in/..."
                                value={formData.contactInfo.linkedin}
                                onChange={(e) => handleContactChange("linkedin", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                            <input
                                type="url"
                                placeholder="https://github.com/..."
                                value={formData.contactInfo.github}
                                onChange={(e) => handleContactChange("github", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Website</label>
                            <input
                                type="url"
                                placeholder="https://..."
                                value={formData.contactInfo.portfolio}
                                onChange={(e) => handleContactChange("portfolio", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Work Experience Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Briefcase size={20} className="text-indigo-500" />
                            <h2 className="text-lg font-semibold">Work Experience</h2>
                        </div>
                        <button
                            onClick={addPosition}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                            <Plus size={16} /> Add Position
                        </button>
                    </div>

                    {formData.experience.positions.length === 0 ? (
                        <p className="text-gray-500 text-sm">No work experience added. Click "Add Position" to add.</p>
                    ) : (
                        <div className="space-y-4">
                            {formData.experience.positions.map((pos, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-end mb-2">
                                        <button
                                            onClick={() => removePosition(index)}
                                            className="text-red-500 hover:text-red-700 cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Job Title"
                                            value={pos.title}
                                            onChange={(e) => updatePosition(index, "title", e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Company Name"
                                            value={pos.company}
                                            onChange={(e) => updatePosition(index, "company", e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Duration (e.g., Jan 2022 - Present)"
                                            value={pos.duration}
                                            onChange={(e) => updatePosition(index, "duration", e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <textarea
                                        placeholder="Description of responsibilities..."
                                        value={pos.description}
                                        onChange={(e) => updatePosition(index, "description", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-3"
                                        rows={2}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Education Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <GraduationCap size={20} className="text-teal-500" />
                            <h2 className="text-lg font-semibold">Education</h2>
                        </div>
                        <button
                            onClick={addEducation}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                            <Plus size={16} /> Add Education
                        </button>
                    </div>

                    {formData.education.length === 0 ? (
                        <p className="text-gray-500 text-sm">No education added. Click "Add Education" to add.</p>
                    ) : (
                        <div className="space-y-4">
                            {formData.education.map((edu, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-end mb-2">
                                        <button
                                            onClick={() => removeEducation(index)}
                                            className="text-red-500 hover:text-red-700 cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Degree (e.g., B.Tech, M.Sc)"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(index, "degree", e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Field of Study"
                                            value={edu.field}
                                            onChange={(e) => updateEducation(index, "field", e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Institution Name"
                                            value={edu.institution}
                                            onChange={(e) => updateEducation(index, "institution", e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Year of Completion"
                                            value={edu.year}
                                            onChange={(e) => updateEducation(index, "year", e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Grade/CGPA"
                                            value={edu.grade}
                                            onChange={(e) => updateEducation(index, "grade", e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Projects Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FolderOpen size={20} className="text-pink-500" />
                            <h2 className="text-lg font-semibold">Projects</h2>
                        </div>
                        <button
                            onClick={addProject}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                            <Plus size={16} /> Add Project
                        </button>
                    </div>

                    {formData.projects.length === 0 ? (
                        <p className="text-gray-500 text-sm">No projects added. Click "Add Project" to add.</p>
                    ) : (
                        <div className="space-y-4">
                            {formData.projects.map((project, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-end mb-2">
                                        <button
                                            onClick={() => removeProject(index)}
                                            className="text-red-500 hover:text-red-700 cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Project Name"
                                            value={project.name}
                                            onChange={(e) => updateProject(index, "name", e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Your Role"
                                            value={project.role}
                                            onChange={(e) => updateProject(index, "role", e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Duration"
                                            value={project.duration}
                                            onChange={(e) => updateProject(index, "duration", e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Category (e.g., Web, Mobile, AI)"
                                            value={project.category}
                                            onChange={(e) => updateProject(index, "category", e.target.value)}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <textarea
                                        placeholder="Project description..."
                                        value={project.description}
                                        onChange={(e) => updateProject(index, "description", e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-3"
                                        rows={2}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Save Button */}
                <div className="flex justify-center mb-10">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors ${saving ? "bg-gray-200 text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                            }`}
                    >
                        {saving ? <LoaderCircle className="animate-spin w-5 h-5" /> : <Save size={20} />}
                        {saving ? "Saving..." : "Save All Changes"}
                    </button>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default CandidateProfile;
