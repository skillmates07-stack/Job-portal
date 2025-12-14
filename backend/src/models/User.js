import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  resume: { type: String, default: "" },

  // ===== EXTRACTED RESUME DATA =====

  // Contact Information
  contactInfo: {
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    dob: { type: String, default: "" },
  },

  // Career Objective
  careerObjective: { type: String, default: "" },

  // Technical Skills
  technicalSkills: [{ type: String }],

  // Tools and Technologies
  tools: [{ type: String }],

  // Personal/Soft Skills
  personalSkills: [{ type: String }],

  // Education Background
  education: [{
    degree: { type: String },
    institution: { type: String },
    year: { type: String },
    grade: { type: String }, // CGPA or percentage
    field: { type: String },
  }],

  // Projects with detailed information
  projects: [{
    name: { type: String },
    duration: { type: String },
    role: { type: String },
    tools: [{ type: String }],
    description: { type: String },
    category: { type: String }, // e.g., Web Development, IoT, AI/ML
  }],

  // Work Experience
  experience: {
    years: { type: Number, default: 0 },
    internships: { type: Number, default: 0 },
    description: { type: String, default: "" },
    positions: [{
      title: { type: String },
      company: { type: String },
      duration: { type: String },
      description: { type: String },
    }],
  },

  // Languages Known
  languages: [{
    language: { type: String },
    proficiency: { type: String }, // e.g., R,W,S (Read, Write, Speak)
  }],

  // Certifications
  certifications: [{
    name: { type: String },
    issuer: { type: String },
    date: { type: String },
  }],

  // Extra-Curricular Activities
  extraCurricular: [{
    activity: { type: String },
    achievement: { type: String },
  }],

  // Co-Curricular Activities / Achievements
  achievements: [{
    title: { type: String },
    description: { type: String },
    year: { type: String },
  }],

  // Areas of Interest
  areasOfInterest: [{ type: String }],

  // Hobbies
  hobbies: [{ type: String }],

  // Project Types (categorized)
  projectTypes: [{ type: String }], // e.g., AI/ML, Full-Stack, IoT, UI/UX

  // Expected CTC
  expectedCTC: { type: Number, default: 0 },

  // Resume parsing metadata
  resumeExtractedAt: { type: Date },
  resumeParseScore: { type: Number, default: 0 }, // Confidence score 0-100
});

const User = mongoose.model("User", userSchema);

export default User;

