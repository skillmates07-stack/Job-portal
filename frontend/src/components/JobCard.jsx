import React from "react";
import moment from "moment";
import kConverter from "k-convert";
import { assets } from "../assets/assets";
import { MapPin, Clock, User, Briefcase, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  // Color mapping for work arrangements
  const getWorkArrangementStyle = (arrangement) => {
    switch (arrangement) {
      case "Remote": return "bg-green-100 text-green-700";
      case "Hybrid": return "bg-purple-100 text-purple-700";
      case "Onsite": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      key={job._id}
      onClick={() => {
        navigate(`/apply-job/${job._id}`);
        scrollTo(0, 0);
      }}
      className="flex gap-4 rounded-lg border border-gray-200 p-5 hover:shadow transition cursor-pointer"
    >
      <img
        className="w-[50px] h-[50px] object-contain"
        src={job.companyId?.image || assets.company_icon}
        alt={`${job.companyId?.name || "Company"} Logo`}
      />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-xl text-gray-700 font-semibold">
            {job.title}
          </h1>
          {job.jobType && (
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
              {job.jobType}
            </span>
          )}
          {job.workArrangement && (
            <span className={`text-xs px-2 py-1 rounded-full ${getWorkArrangementStyle(job.workArrangement)}`}>
              {job.workArrangement}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-gray-600 mt-3">
          <div className="flex items-center gap-2">
            <img src={assets.suitcase_icon} alt="Company" />
            <span>{job.companyId?.name || "Unknown Company"}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={20} />
            <span>{job.experienceLevel || job.level || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={19} />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={19} />
            <span>{moment(job.date).fromNow()}</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={assets.money_icon} alt="Salary" />
            <span>
              CTC:{" "}
              {job.salary ? kConverter.convertTo(job.salary) : "Not disclosed"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
