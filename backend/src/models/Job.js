import mongoose from "mongoose";

const jobSchema = mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String }, // Made optional for Remote jobs
  // Legacy field - keep for backward compatibility
  level: { type: String },
  // New experience level field
  experienceLevel: {
    type: String,
    enum: ["Fresher", "0-1 Years", "1-3 Years", "3-5 Years", "5+ Years"]
  },
  description: { type: String, required: true },
  salary: { type: Number, required: true },
  category: { type: String, required: true },
  jobType: {
    type: String,
    enum: ["Full-time", "Part-time", "Internship", "Contract", "Temporary", "Freelance"],
    default: "Full-time"
  },
  workArrangement: {
    type: String,
    enum: ["Onsite", "Remote", "Hybrid"],
    default: "Onsite"
  },
  internshipType: {
    type: String,
    enum: ["Paid Internship", "Unpaid Internship"]
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  date: { type: Number, required: true },
  visible: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }, // Soft delete
  deletedAt: { type: Date }, // When deleted
});

const Job = mongoose.model("Job", jobSchema);

export default Job;
