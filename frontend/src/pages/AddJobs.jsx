import React, { useContext, useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { LoaderCircle, AlertTriangle } from "lucide-react";

// Indian States and UTs
const INDIAN_LOCATIONS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra & Nagar Haveli",
  "Daman & Diu",
  "Delhi (NCT)",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Temporary",
  "Freelance",
];

const WORK_ARRANGEMENTS = ["Onsite", "Remote", "Hybrid"];

const EXPERIENCE_LEVELS = [
  "Fresher",
  "0-1 Years",
  "1-3 Years",
  "3-5 Years",
  "5+ Years",
];

const INTERNSHIP_TYPES = ["Paid Internship", "Unpaid Internship"];

const AddJob = () => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Programming");
  const [location, setLocation] = useState("Delhi (NCT)");
  const [experienceLevel, setExperienceLevel] = useState("Fresher");
  const [salary, setSalary] = useState(null);
  const [jobType, setJobType] = useState("Full-time");
  const [workArrangement, setWorkArrangement] = useState("Onsite");
  const [internshipType, setInternshipType] = useState("Paid Internship");
  const [loading, setLoading] = useState(false);

  const { backendUrl, companyToken, companyData } = useContext(AppContext);

  const postJob = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title,
        description,
        category,
        location: workArrangement === "Remote" ? "Remote" : location,
        experienceLevel,
        salary,
        jobType,
        workArrangement,
      };

      // Add internship type only if job type is Internship
      if (jobType === "Internship") {
        payload.internshipType = internshipType;
      }

      const { data } = await axios.post(
        `${backendUrl}/company/post-job`,
        payload,
        {
          headers: { token: companyToken },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setTitle("");
        setDescription("");
        setCategory("Programming");
        setLocation("Delhi (NCT)");
        setExperienceLevel("Fresher");
        setSalary(null);
        setJobType("Full-time");
        setWorkArrangement("Onsite");
        setInternshipType("Paid Internship");

        if (quillRef.current) {
          quillRef.current.root.innerHTML = "";
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Write job description here...",
      });

      quillRef.current.on("text-change", () => {
        const html = editorRef.current.querySelector(".ql-editor").innerHTML;
        setDescription(html);
      });
    }
  }, []);

  useEffect(() => {
    document.title = "Superio - Job Portal | Dashboard";
  }, []);

  // Check if company is verified
  if (companyData && !companyData.isVerified) {
    return (
      <section className="mr-1 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Verification Required
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Please complete onboarding to access job posting features. Your company is currently pending verification.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Contact admin for verification approval.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mr-1 mb-6">
      <form onSubmit={postJob}>
        {/* Job Title */}
        <div className="mb-6">
          <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
            Job Title
          </label>
          <input
            type="text"
            placeholder="Enter job title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Job Description */}
        <div className="mb-6">
          <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
            Job Description
          </label>
          <div
            ref={editorRef}
            style={{
              minHeight: "150px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
            }}
          />
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Job Type */}
          <div>
            <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
              Job Type <span className="text-red-500">*</span>
            </label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Internship Type - Only shown when Internship is selected */}
          {jobType === "Internship" && (
            <div>
              <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
                Internship Type <span className="text-red-500">*</span>
              </label>
              <select
                value={internshipType}
                onChange={(e) => setInternshipType(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {INTERNSHIP_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          {/* Work Arrangement */}
          <div>
            <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
              Work Arrangement <span className="text-red-500">*</span>
            </label>
            <select
              value={workArrangement}
              onChange={(e) => setWorkArrangement(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {WORK_ARRANGEMENTS.map((arr) => (
                <option key={arr} value={arr}>{arr}</option>
              ))}
            </select>
          </div>

          {/* Job Category */}
          <div>
            <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
              Job Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Programming">Programming</option>
              <option value="Data Science">Data Science</option>
              <option value="Designing">Designing</option>
              <option value="Networking">Networking</option>
              <option value="Management">Management</option>
              <option value="Marketing">Marketing</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>
          </div>

          {/* Job Location - Conditional */}
          <div>
            <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
              Job Location {workArrangement !== "Remote" && <span className="text-red-500">*</span>}
            </label>
            {workArrangement === "Remote" ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Remote (No location required)
              </div>
            ) : (
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required={workArrangement !== "Remote"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {INDIAN_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            )}
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
              Experience Level <span className="text-red-500">*</span>
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Salary */}
          <div>
            <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
              Salary (CTC in LPA)
            </label>
            <input
              type="number"
              placeholder="Enter salary range in LPA"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={salary || ""}
              onChange={(e) => setSalary(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-8 font-semibold rounded ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
        >
          {loading ? (
            <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
          ) : (
            "Add Job"
          )}
        </button>
      </form>
    </section>
  );
};

export default AddJob;
