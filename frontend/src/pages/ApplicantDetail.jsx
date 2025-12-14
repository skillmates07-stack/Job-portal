import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Github,
    Calendar,
    Briefcase,
    GraduationCap,
    Code,
    Wrench,
    Award,
    Globe,
    Heart,
    Star,
    FileText,
    LoaderCircle,
    Target,
    Trophy,
} from "lucide-react";
import toast from "react-hot-toast";

const ApplicantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { backendUrl, companyToken } = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchApplicantDetail = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/company/applicant/${id}`,
                { headers: { token: companyToken } }
            );
            if (data.success) {
                setUser(data.applicant);
                setApplication(data.application);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch applicant details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (companyToken && id) {
            fetchApplicantDetail();
        }
    }, [companyToken, id, backendUrl]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoaderCircle className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Applicant not found</p>
            </div>
        );
    }

    const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
        <div className={`bg-white border border-gray-200 rounded-lg p-5 hover:shadow transition ${className}`}>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <Icon size={20} className="text-indigo-600" />
                <h3 className="font-semibold text-gray-800">{title}</h3>
            </div>
            {children}
        </div>
    );

    const SkillTag = ({ skill, color = "blue" }) => {
        const colors = {
            blue: "bg-blue-50 text-blue-600",
            green: "bg-green-50 text-green-600",
            purple: "bg-purple-50 text-purple-600",
            orange: "bg-orange-50 text-orange-600",
            pink: "bg-pink-50 text-pink-600",
            indigo: "bg-indigo-50 text-indigo-600",
        };
        return (
            <span className={`${colors[color]} text-xs px-3 py-1.5 rounded-full`}>
                {skill}
            </span>
        );
    };

    return (
        <div>
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/dashboard/view-applications")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Applications</span>
                </button>
            </div>

            {/* User Profile Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <img
                        src={user.image}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-semibold text-gray-800">{user.name}</h1>
                            {user.resumeParseScore > 0 && (
                                <span className={`text-xs px-2 py-1 rounded ${user.resumeParseScore >= 70 ? "bg-green-100 text-green-700" :
                                    user.resumeParseScore >= 40 ? "bg-yellow-100 text-yellow-700" :
                                        "bg-red-100 text-red-700"
                                    }`}>
                                    Parse Score: {user.resumeParseScore}%
                                </span>
                            )}
                            {application && (
                                <span className={`text-xs px-2 py-1 rounded ${application.status === "Accepted" ? "bg-green-100 text-green-700" :
                                        application.status === "Rejected" ? "bg-red-100 text-red-700" :
                                            "bg-yellow-100 text-yellow-700"
                                    }`}>
                                    {application.status}
                                </span>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-gray-400" />
                                {user.email}
                            </div>
                            {user.contactInfo?.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-gray-400" />
                                    {user.contactInfo.phone}
                                </div>
                            )}
                            {user.contactInfo?.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-gray-400" />
                                    {user.contactInfo.location}
                                </div>
                            )}
                            {user.contactInfo?.linkedin && (
                                <a
                                    href={`https://linkedin.com/in/${user.contactInfo.linkedin}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                >
                                    <Linkedin size={16} />
                                    {user.contactInfo.linkedin}
                                </a>
                            )}
                            {user.contactInfo?.github && (
                                <a
                                    href={`https://github.com/${user.contactInfo.github}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-gray-800 hover:underline"
                                >
                                    <Github size={16} />
                                    {user.contactInfo.github}
                                </a>
                            )}
                            {user.contactInfo?.dob && (
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    DOB: {user.contactInfo.dob}
                                </div>
                            )}
                        </div>

                        {/* Resume Actions */}
                        {user.resume && (
                            <div className="flex flex-wrap items-center gap-3 mt-4">
                                <a
                                    href={user.resume}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                                >
                                    <FileText size={18} /> View Resume
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Career Objective */}
                {user.careerObjective && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Career Objective</h4>
                        <p className="text-gray-600 text-sm">{user.careerObjective}</p>
                    </div>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Technical Skills */}
                {user.technicalSkills?.length > 0 && (
                    <SectionCard title="Technical Skills" icon={Code}>
                        <div className="flex flex-wrap gap-2">
                            {user.technicalSkills.map((skill, idx) => (
                                <SkillTag key={idx} skill={skill} color="blue" />
                            ))}
                        </div>
                    </SectionCard>
                )}

                {/* Tools & Technologies */}
                {user.tools?.length > 0 && (
                    <SectionCard title="Tools & Technologies" icon={Wrench}>
                        <div className="flex flex-wrap gap-2">
                            {user.tools.map((tool, idx) => (
                                <SkillTag key={idx} skill={tool} color="purple" />
                            ))}
                        </div>
                    </SectionCard>
                )}

                {/* Personal Skills */}
                {user.personalSkills?.length > 0 && (
                    <SectionCard title="Personal Skills" icon={Star}>
                        <div className="flex flex-wrap gap-2">
                            {user.personalSkills.map((skill, idx) => (
                                <SkillTag key={idx} skill={skill} color="green" />
                            ))}
                        </div>
                    </SectionCard>
                )}

                {/* Areas of Interest */}
                {user.areasOfInterest?.length > 0 && (
                    <SectionCard title="Areas of Interest" icon={Target}>
                        <div className="flex flex-wrap gap-2">
                            {user.areasOfInterest.map((interest, idx) => (
                                <SkillTag key={idx} skill={interest} color="indigo" />
                            ))}
                        </div>
                    </SectionCard>
                )}

                {/* Project Types */}
                {user.projectTypes?.length > 0 && (
                    <SectionCard title="Project Categories" icon={Briefcase}>
                        <div className="flex flex-wrap gap-2">
                            {user.projectTypes.map((type, idx) => (
                                <SkillTag key={idx} skill={type} color="orange" />
                            ))}
                        </div>
                    </SectionCard>
                )}

                {/* Languages */}
                {user.languages?.length > 0 && (
                    <SectionCard title="Languages Known" icon={Globe}>
                        <div className="flex flex-wrap gap-2">
                            {user.languages.map((lang, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full">
                                    {lang.language} {lang.proficiency && `(${lang.proficiency})`}
                                </span>
                            ))}
                        </div>
                    </SectionCard>
                )}
            </div>

            {/* Education - Full Width */}
            {user.education?.length > 0 && (
                <SectionCard title="Education Background" icon={GraduationCap} className="mt-6">
                    <div className="space-y-4">
                        {user.education.map((edu, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <GraduationCap size={18} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800">
                                        {edu.degree} {edu.field && `in ${edu.field}`}
                                    </h4>
                                    {edu.institution && (
                                        <p className="text-sm text-gray-600">{edu.institution}</p>
                                    )}
                                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                        {edu.year && <span>{edu.year}</span>}
                                        {edu.grade && (
                                            <span className="text-green-600 font-medium">{edu.grade}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* Projects - Full Width */}
            {user.projects?.length > 0 && (
                <SectionCard title="Projects" icon={Briefcase} className="mt-6">
                    <div className="space-y-4">
                        {user.projects.map((project, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-800">{project.name}</h4>
                                    {project.category && (
                                        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">
                                            {project.category}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                                    {project.duration && (
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} /> {project.duration}
                                        </span>
                                    )}
                                    {project.role && (
                                        <span className="flex items-center gap-1">
                                            <Briefcase size={14} /> {project.role}
                                        </span>
                                    )}
                                </div>
                                {project.tools?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {project.tools.map((tool, tidx) => (
                                            <span key={tidx} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                                                {tool}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {project.description && (
                                    <p className="text-sm text-gray-600">{project.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* Certifications */}
            {user.certifications?.length > 0 && (
                <SectionCard title="Certifications" icon={Award} className="mt-6">
                    <div className="space-y-2">
                        {user.certifications.map((cert, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Award size={18} className="text-yellow-500" />
                                <div>
                                    <p className="font-medium text-gray-800">{cert.name}</p>
                                    {cert.issuer && (
                                        <p className="text-sm text-gray-500">Issued by: {cert.issuer}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* Extra Curricular & Hobbies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {user.extraCurricular?.length > 0 && (
                    <SectionCard title="Extra-Curricular Activities" icon={Trophy}>
                        <ul className="space-y-2">
                            {user.extraCurricular.map((activity, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="text-indigo-600 mt-1">•</span>
                                    {activity.activity}
                                </li>
                            ))}
                        </ul>
                    </SectionCard>
                )}

                {user.hobbies?.length > 0 && (
                    <SectionCard title="Hobbies" icon={Heart}>
                        <div className="flex flex-wrap gap-2">
                            {user.hobbies.map((hobby, idx) => (
                                <SkillTag key={idx} skill={hobby} color="pink" />
                            ))}
                        </div>
                    </SectionCard>
                )}
            </div>
        </div>
    );
};

export default ApplicantDetail;
