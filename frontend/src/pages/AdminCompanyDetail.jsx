import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    Building2,
    Mail,
    Globe,
    MapPin,
    Phone,
    User,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    LoaderCircle,
    Users,
    Briefcase,
    ExternalLink,
    LinkedinIcon,
} from "lucide-react";

const AdminCompanyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { backendUrl, adminToken } = useContext(AppContext);

    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [verificationNote, setVerificationNote] = useState("");

    useEffect(() => {
        if (adminToken && id) {
            fetchCompanyDetails();
        }
    }, [adminToken, id]);

    const fetchCompanyDetails = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/admin/company/${id}`, {
                headers: { token: adminToken },
            });
            if (data.success) {
                setCompany(data.company);
                setVerificationNote(data.company.verificationNote || "");
            }
        } catch (error) {
            toast.error("Failed to fetch company details");
            navigate("/admin/companies");
        } finally {
            setLoading(false);
        }
    };

    const handleVerification = async (isVerified) => {
        setVerifying(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}/admin/verify-company`,
                { companyId: id, isVerified, verificationNote },
                { headers: { token: adminToken } }
            );

            if (data.success) {
                toast.success(data.message);
                fetchCompanyDetails();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to update verification status");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoaderCircle className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="text-center py-12">
                <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Company not found</p>
            </div>
        );
    }

    const hasOnboardingData = company.onboardingComplete;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => navigate("/admin/companies")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
            >
                <ArrowLeft size={18} />
                <span>Back to Companies</span>
            </button>

            {/* Header Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-6">
                    <img
                        src={company.image}
                        alt={company.name}
                        className="w-20 h-20 rounded-lg object-contain border border-gray-200"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-800">{company.name}</h1>
                            {company.isVerified ? (
                                <span className="flex items-center gap-1 text-sm bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-200">
                                    <CheckCircle size={14} />
                                    Verified
                                </span>
                            ) : company.onboardingComplete ? (
                                <span className="flex items-center gap-1 text-sm bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full border border-yellow-200">
                                    <Clock size={14} />
                                    Pending Verification
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full border border-gray-200">
                                    <XCircle size={14} />
                                    Onboarding Incomplete
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <Mail size={14} />
                                {company.email}
                            </span>
                            {company.industry && (
                                <span className="flex items-center gap-1">
                                    <Briefcase size={14} />
                                    {company.industry}
                                </span>
                            )}
                            {company.city && company.state && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {company.city}, {company.state}
                                </span>
                            )}
                        </div>
                        {company.verificationDate && (
                            <p className="text-xs text-gray-400 mt-2">
                                Verified on: {new Date(company.verificationDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {!hasOnboardingData ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <Clock size={48} className="mx-auto text-yellow-500 mb-4" />
                    <h3 className="text-lg font-semibold text-yellow-700 mb-2">
                        Onboarding Not Complete
                    </h3>
                    <p className="text-yellow-600">
                        This company has not completed their onboarding form yet. They need to fill out company details before verification.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-lg font-semibold text-gray-800">Company Information</h2>
                        </div>
                        <div className="space-y-3">
                            <InfoRow label="Industry" value={company.industry} />
                            <InfoRow label="Company Size" value={company.companySize ? `${company.companySize} employees` : "-"} />
                            <InfoRow
                                label="Website"
                                value={company.website}
                                link={company.website}
                            />
                            <InfoRow
                                label="LinkedIn"
                                value={company.linkedIn}
                                link={company.linkedIn}
                            />
                            {company.description && (
                                <div>
                                    <span className="text-sm text-gray-500">Description</span>
                                    <p className="text-gray-800 mt-1">{company.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-lg font-semibold text-gray-800">Location</h2>
                        </div>
                        <div className="space-y-3">
                            <InfoRow label="Address" value={company.address || "-"} />
                            <InfoRow label="City" value={company.city || "-"} />
                            <InfoRow label="State" value={company.state || "-"} />
                            <InfoRow label="Country" value={company.country || "India"} />
                        </div>
                    </div>

                    {/* Contact Person */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-lg font-semibold text-gray-800">Contact Person</h2>
                        </div>
                        <div className="space-y-3">
                            <InfoRow label="Name" value={company.contactPerson || "-"} />
                            <InfoRow label="Phone" value={company.contactPhone || "-"} />
                            <InfoRow label="Email" value={company.email} />
                        </div>
                    </div>

                    {/* Verification Documents */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-lg font-semibold text-gray-800">Verification Documents</h2>
                        </div>
                        <div className="space-y-3">
                            <InfoRow
                                label="GST Number"
                                value={company.gstNumber || "Not provided"}
                                highlight={!!company.gstNumber}
                            />
                            <InfoRow
                                label="CIN / Registration"
                                value={company.registrationNumber || "Not provided"}
                                highlight={!!company.registrationNumber}
                            />
                        </div>
                        {!company.gstNumber && !company.registrationNumber && (
                            <p className="text-sm text-gray-500 mt-4 bg-gray-50 p-3 rounded">
                                ⚠️ No verification documents provided. Consider verifying through website or LinkedIn.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Verification Actions */}
            {hasOnboardingData && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Verification Actions</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Note (optional)
                        </label>
                        <textarea
                            value={verificationNote}
                            onChange={(e) => setVerificationNote(e.target.value)}
                            placeholder="Add notes about this company or rejection reason..."
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-4">
                        {company.isVerified ? (
                            <button
                                onClick={() => handleVerification(false)}
                                disabled={verifying}
                                className="flex items-center gap-2 px-6 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                            >
                                {verifying ? (
                                    <LoaderCircle className="animate-spin h-5 w-5" />
                                ) : (
                                    <>
                                        <XCircle size={18} />
                                        Revoke Verification
                                    </>
                                )}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleVerification(true)}
                                    disabled={verifying}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {verifying ? (
                                        <LoaderCircle className="animate-spin h-5 w-5" />
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            Approve Company
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleVerification(false)}
                                    disabled={verifying}
                                    className="flex items-center gap-2 px-6 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                                >
                                    <XCircle size={18} />
                                    Reject
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper component for info rows
const InfoRow = ({ label, value, link, highlight }) => (
    <div className="flex justify-between items-start">
        <span className="text-sm text-gray-500">{label}</span>
        {link ? (
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline flex items-center gap-1 text-sm"
            >
                {value || "-"}
                <ExternalLink size={12} />
            </a>
        ) : (
            <span className={`text-gray-800 ${highlight ? "font-medium text-green-600" : ""}`}>
                {value || "-"}
            </span>
        )}
    </div>
);

export default AdminCompanyDetail;
