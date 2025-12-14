import mongoose from "mongoose";

const companySchema = mongoose.Schema({
  // Basic Info (Step 1 - Signup)
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },

  // Company Details (Step 2 - Onboarding)
  industry: { type: String },
  companySize: { type: String }, // 1-10, 11-50, 51-200, 201-500, 500+
  website: { type: String },
  linkedIn: { type: String },
  description: { type: String },

  // Location
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String, default: "India" },

  // Verification Documents (Optional)
  gstNumber: { type: String },
  registrationNumber: { type: String }, // CIN or Company Registration

  // Contact Person
  contactPerson: { type: String },
  contactPhone: { type: String },

  // Onboarding Status
  onboardingComplete: { type: Boolean, default: false },

  // Verification Status
  isVerified: { type: Boolean, default: false },
  verificationDate: { type: Date },
  verificationNote: { type: String }, // Admin notes or rejection reason

  createdAt: { type: Date, default: Date.now },
});

const Company = mongoose.model("Company", companySchema);

export default Company;
