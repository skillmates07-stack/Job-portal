import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { assets } from "../assets/assets";
import moment from "moment";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import { LoaderCircle, Settings } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

// Job Categories for matchmaking
const JOB_CATEGORIES = [
  "Programming",
  "Data Science",
  "Designing",
  "Networking",
  "Management",
  "Marketing",
  "Cybersecurity"
];

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Freelance"];
const WORK_MODES = ["Remote", "Onsite", "Hybrid"];

const Applications = () => {
  const {
    userApplication,
    applicationsLoading,
    backendUrl,
    userToken,
    userData,
    fetchUserData,
    fetchUserApplication,
  } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Job Preferences State
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load existing preferences
  useEffect(() => {
    if (userData?.jobPreferences) {
      setSelectedCategories(userData.jobPreferences.categories || []);
      setSelectedJobTypes(userData.jobPreferences.jobTypes || []);
      setSelectedWorkModes(userData.jobPreferences.workModes || []);
      setNotificationsEnabled(userData.jobPreferences.notifications !== false);
    }
  }, [userData]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleJobType = (type) => {
    setSelectedJobTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleWorkMode = (mode) => {
    setSelectedWorkModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  const handleSavePreferences = async () => {
    setPreferencesLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/user/update-job-preferences`,
        {
          categories: selectedCategories,
          jobTypes: selectedJobTypes,
          workModes: selectedWorkModes,
          notifications: notificationsEnabled
        },
        { headers: { token: userToken } }
      );

      if (data.success) {
        toast.success("Job preferences saved! You'll get notified for matching jobs.");
        fetchUserData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save preferences");
    } finally {
      setPreferencesLoading(false);
    }
  };

  const handleResumeSave = async () => {
    if (!resumeFile) {
      toast.error("Please select a resume file");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const { data } = await axios.post(
        `${backendUrl}/user/upload-resume`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token: userToken,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        fetchUserData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Resume upload error:", error);
      toast.error(error?.response?.data?.message || "Resume upload failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserApplication();
  }, []);

  return (
    <>
      <Navbar />
      <section>
        {/* Resume Section */}
        <div className="mb-10">
          <h1 className="text-lg font-medium mb-3">Your Resume</h1>
          {isEdit ? (
            <div className="flex items-center flex-wrap gap-3">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
                <span className="bg-blue-100 text-blue-500 rounded px-3 py-1.5 text-sm hover:bg-blue-200 transition-colors">
                  {resumeFile ? resumeFile.name : "Select resume"}
                </span>
                <img
                  className="w-8"
                  src={assets.profile_upload_icon}
                  alt="Upload icon"
                />
              </label>

              <div className="flex gap-2">
                <button
                  disabled={!resumeFile || loading}
                  onClick={handleResumeSave}
                  className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors border border-gray-200  ${!resumeFile || loading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-100 text-blue-500 hover:bg-blue-200 cursor-pointer"
                    }`}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin w-4 h-4" />
                      Uploading...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {userData?.resume ? (
                <a
                  href={userData.resume}
                  target="_blank"
                  className="bg-blue-100 text-blue-500 rounded px-3 py-1.5 text-sm hover:bg-blue-200 transition-colors"
                >
                  View Resume
                </a>
              ) : (
                <span className="bg-blue-100 text-blue-500 rounded px-3 py-1.5 text-sm hover:bg-blue-200 transition-colors">
                  No resume uploaded
                </span>
              )}
              <button
                onClick={() => setIsEdit(true)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {userData?.resume ? "Update" : "Upload"}
              </button>
            </div>
          )}
        </div>

        {/* Job Preferences Section */}
        <div className="mb-10 border border-gray-200 rounded-lg">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings size={20} className="text-blue-500" />
              <h2 className="text-lg font-medium">Job Preferences</h2>
              {selectedCategories.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  {selectedCategories.length} categories selected
                </span>
              )}
            </div>
            <span className="text-gray-400">{showPreferences ? "▲" : "▼"}</span>
          </button>

          {showPreferences && (
            <div className="p-4 pt-0 space-y-5">
              <p className="text-sm text-gray-500">
                Select your preferences to get notified when matching jobs are posted.
              </p>

              {/* Job Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Job Categories *</h3>
                <div className="flex flex-wrap gap-2">
                  {JOB_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors cursor-pointer ${selectedCategories.includes(category)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Types */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preferred Job Types</h3>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleJobType(type)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors cursor-pointer ${selectedJobTypes.includes(type)
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-green-300"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Modes */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preferred Work Mode</h3>
                <div className="flex flex-wrap gap-2">
                  {WORK_MODES.map((mode) => (
                    <button
                      key={mode}
                      onClick={() => toggleWorkMode(mode)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors cursor-pointer ${selectedWorkModes.includes(mode)
                          ? "bg-purple-500 text-white border-purple-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-purple-300"
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications Toggle */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
                <span className="text-sm text-gray-700">Receive job match notifications</span>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSavePreferences}
                disabled={preferencesLoading || selectedCategories.length === 0}
                className={`flex items-center gap-2 rounded px-4 py-2 text-sm transition-colors ${preferencesLoading || selectedCategories.length === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  }`}
              >
                {preferencesLoading ? (
                  <>
                    <LoaderCircle className="animate-spin w-4 h-4" />
                    Saving...
                  </>
                ) : (
                  "Save Preferences"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Applications Table */}
        {applicationsLoading ? (
          <div className="flex justify-center items-center mt-20">
            <Loader />
          </div>
        ) : !userApplication || userApplication.length === 0 ? (
          <p className="text-center text-gray-500">No applications found.</p>
        ) : (
          <>
            <h1 className="text-lg font-medium mb-3">Jobs Applied</h1>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...userApplication].reverse().map((job) => (
                      <tr key={job._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <img
                              src={
                                job?.companyId?.image || assets.default_profile
                              }
                              alt={job?.companyId?.name || "Company logo"}
                              className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.src = assets.default_profile;
                              }}
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900 truncate max-w-[150px]">
                              {job?.companyId?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 max-w-[200px] truncate">
                          {job?.jobId?.title}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 hidden sm:table-cell">
                          {job?.jobId?.location}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 hidden md:table-cell">
                          {moment(job.date).format("ll")}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 inline-flex text-xs font-semibold ${job.status === "Pending"
                              ? "text-blue-500"
                              : job.status === "Rejected"
                                ? "text-red-500"
                                : "text-green-500"
                              }`}
                          >
                            {job.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
      <Footer />
    </>
  );
};

export default Applications;
