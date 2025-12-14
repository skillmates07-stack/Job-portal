import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { LoaderCircle, AlertTriangle, ChevronDown, ChevronUp, MapPin, Users, Eye, Calendar, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ViewApplications = () => {
  const [jobsWithApplicants, setJobsWithApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [expandedJobs, setExpandedJobs] = useState({});

  const { backendUrl, companyToken, companyData } = useContext(AppContext);
  const navigate = useNavigate();

  const fetchApplicationsData = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/company/applications-grouped`,
        {
          headers: { token: companyToken },
        }
      );
      if (data?.success) {
        setJobsWithApplicants(data.jobsWithApplicants || []);
        // Auto-expand jobs with applicants
        const expanded = {};
        data.jobsWithApplicants.forEach(job => {
          if (job.applicantCount > 0) {
            expanded[job._id] = true;
          }
        });
        setExpandedJobs(expanded);
      } else {
        toast.error(data?.message || "Failed to load applications.");
      }
    } catch (error) {
      console.error(error?.response?.data || "Error fetching applications");
      toast.error(
        error?.response?.data?.message || "Failed to fetch applications"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdatingStatus(id);
    try {
      const { data } = await axios.post(
        `${backendUrl}/company/change-status`,
        { id, status },
        {
          headers: { token: companyToken },
        }
      );

      if (data?.success) {
        toast.success(data?.message || "Status updated successfully.");
        await fetchApplicationsData();
      } else {
        toast.error(data?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Error updating status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const toggleJobExpand = (jobId) => {
    setExpandedJobs(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const handleViewApplicant = (applicationId) => {
    navigate(`/dashboard/applicant/${applicationId}`);
  };

  useEffect(() => {
    document.title = "Superio - Job Portal | Dashboard";
  }, []);

  useEffect(() => {
    fetchApplicationsData();
  }, []);

  // Check if company is verified
  if (companyData && !companyData.isVerified) {
    return (
      <section>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Verification Required
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Please complete onboarding to access application management features. Your company is currently pending verification.
          </p>
        </div>
      </section>
    );
  }

  const totalApplicants = jobsWithApplicants.reduce((sum, job) => sum + job.applicantCount, 0);

  return (
    <section>
      {isLoading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <Loader />
        </div>
      ) : jobsWithApplicants.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No jobs found. Post a job to start receiving applications.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-700">{jobsWithApplicants.length} Jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-700">{totalApplicants} Total Applicants</span>
              </div>
            </div>
          </div>

          {/* Jobs with Applicants */}
          {jobsWithApplicants.map((job) => (
            <div key={job._id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Job Header */}
              <div
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => toggleJobExpand(job._id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{job.title}</h3>
                    {job.jobType && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {job.jobType}
                      </span>
                    )}
                    {job.workArrangement && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${job.workArrangement === "Remote" ? "bg-green-100 text-green-700" :
                        job.workArrangement === "Hybrid" ? "bg-purple-100 text-purple-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                        {job.workArrangement}
                      </span>
                    )}
                    {!job.visible && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {moment(job.date).format("MMM D, YYYY")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    <Users size={16} />
                    {job.applicantCount} Applicant{job.applicantCount !== 1 ? "s" : ""}
                  </button>
                  {expandedJobs[job._id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Expanded Applicants List */}
              {expandedJobs[job._id] && (
                <div className="border-t border-gray-200">
                  {job.applicants.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No applications yet for this job.
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-white border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Applied On</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Resume</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {job.applicants.map((app, index) => (
                          <tr key={app._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={app.userId?.image || assets.default_profile}
                                  alt={app.userId?.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{app.userId?.name || "Unknown"}</p>
                                  <p className="text-xs text-gray-500">{app.userId?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                              {moment(app.date).format("MMM D, YYYY")}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {app.userId?.resume ? (
                                <a
                                  href={app.userId.resume}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View
                                  <img src={assets.resume_download_icon} alt="" className="ml-1 h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400">No resume</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {updatingStatus === app._id ? (
                                <LoaderCircle className="animate-spin h-5 w-5 text-gray-500 mx-auto" />
                              ) : (
                                <select
                                  value={app.status}
                                  onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`text-xs px-3 py-1.5 rounded-full border-0 cursor-pointer font-medium focus:ring-2 focus:ring-offset-1 ${app.status === "Accepted"
                                      ? "bg-green-100 text-green-800 focus:ring-green-500"
                                      : app.status === "Rejected"
                                        ? "bg-red-100 text-red-800 focus:ring-red-500"
                                        : "bg-yellow-100 text-yellow-800 focus:ring-yellow-500"
                                    }`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Accepted">Accepted</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleViewApplicant(app._id); }}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                                title="View Full Profile"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ViewApplications;
