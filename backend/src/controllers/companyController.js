import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

import generateToken from "../utils/generateToken.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";


export const registerCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Enter your name" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Enter your email" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Enter your password" });
    }

    if (!imageFile) {
      return res
        .status(400)
        .json({ success: false, message: "Upload your logo" });
    }

    const existingCompany = await Company.findOne({ email });

    if (existingCompany) {
      return res
        .status(409)
        .json({ success: false, message: "Company already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    const company = new Company({
      name,
      email,
      password: hashedPassword,
      image: imageUpload.secure_url,
    });

    await company.save();

    const token = await generateToken(company._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      companyData: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
      token,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const company = await Company.findOne({ email });

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, company.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    const token = await generateToken(company._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      companyData: company,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const fetchCompanyData = async (req, res) => {
  try {
    const company = req.companyData;

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company data fetched successfully",
      companyData: company,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch company data",
    });
  }
};

export const postJob = async (req, res) => {
  try {
    const { title, description, location, experienceLevel, salary, category, jobType, workArrangement, internshipType } = req.body;

    // Check if company is verified
    if (!req.companyData.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please complete onboarding to access job posting features.",
        requiresVerification: true,
      });
    }

    // Validate required fields
    if (!title || !description || !experienceLevel || !salary || !category || !jobType || !workArrangement) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Internship type required for Internship jobs
    if (jobType === "Internship" && !internshipType) {
      return res.status(400).json({
        success: false,
        message: "Please specify if the internship is paid or unpaid",
      });
    }

    // Location is required for Onsite and Hybrid, optional for Remote
    if (workArrangement !== "Remote" && !location) {
      return res.status(400).json({
        success: false,
        message: "Job location is required for Onsite and Hybrid roles",
      });
    }

    const companyId = req.companyData._id;

    const jobData = {
      title,
      description,
      location: workArrangement === "Remote" ? "Remote" : location,
      experienceLevel,
      salary,
      category,
      jobType,
      workArrangement,
      companyId,
      date: Date.now(),
    };

    // Only add internshipType if job is an internship
    if (jobType === "Internship") {
      jobData.internshipType = internshipType;
    }

    const job = new Job(jobData);
    await job.save();

    return res.status(201).json({
      success: true,
      message: "Job posted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Job posting failed",
    });
  }
};


export const getCompanyPostedAllJobs = async (req, res) => {
  try {
    const companyId = req.companyData._id;

    // Exclude soft-deleted jobs
    const jobs = await Job.find({ companyId, isDeleted: { $ne: true } });

    const jobsData = await Promise.all(
      jobs.map(async (job) => {
        const applicants = await JobApplication.find({ jobId: job._id });

        return { ...job.toObject(), applicants: applicants.length };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      jobData: jobsData,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Job fetching failed",
    });
  }
};

export const changeJobVisibility = async (req, res) => {
  try {
    const { id } = req.body;
    const companyId = req.companyData._id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const job = await Job.findOne({ _id: id, companyId });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Use findByIdAndUpdate to avoid validation issues with legacy data
    await Job.findByIdAndUpdate(
      id,
      { visible: !job.visible },
      { runValidators: false }
    );

    return res.status(200).json({
      success: true,
      message: "Visibility changed",
    });
  } catch (error) {
    console.error("Error changing job visibility:", error);
    return res.status(500).json({
      success: false,
      message: "Visibility change failed",
    });
  }
};

export const getCompanyJobApplicants = async (req, res) => {
  try {
    const companyId = req.companyData._id;

    const applicants = await JobApplication.find({ companyId })
      .populate("userId", "name image resume")
      .populate("jobId", "title location date status");

    return res.status(200).json({
      success: true,
      message: "Applicants fetched successfully",
      viewApplicationData: applicants,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applicants",
    });
  }
};

export const changeStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "Application ID and status are required",
      });
    }

    const updatedApplication = await JobApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({
        success: false,
        message: "Job application not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status changed successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to change status",
    });
  }
};

// Update company profile - Step 2 of onboarding
export const updateCompanyProfile = async (req, res) => {
  try {
    const companyId = req.companyData._id;
    const {
      industry,
      companySize,
      website,
      linkedIn,
      description,
      address,
      city,
      state,
      country,
      gstNumber,
      registrationNumber,
      contactPerson,
      contactPhone,
    } = req.body;

    // Validate required fields for onboarding
    if (!industry || !companySize || !city || !state || !contactPerson || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields: Industry, Company Size, City, State, Contact Person, Contact Phone",
      });
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      {
        industry,
        companySize,
        website: website || "",
        linkedIn: linkedIn || "",
        description: description || "",
        address: address || "",
        city,
        state,
        country: country || "India",
        gstNumber: gstNumber || "",
        registrationNumber: registrationNumber || "",
        contactPerson,
        contactPhone,
        onboardingComplete: true,
      },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company profile updated successfully! Your account is now pending verification.",
      companyData: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update company profile",
    });
  }
};

// Edit job
export const editJob = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyData._id;
    const { title, description, location, experienceLevel, salary, category, jobType, workArrangement, internshipType, visible } = req.body;

    // First verify the job exists and belongs to this company
    const existingJob = await Job.findOne({ _id: id, companyId });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you don't have permission to edit it",
      });
    }

    // Build update object
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (experienceLevel) updateData.experienceLevel = experienceLevel;
    if (salary) updateData.salary = Number(salary);
    if (category) updateData.category = category;
    if (jobType) updateData.jobType = jobType;
    if (workArrangement) updateData.workArrangement = workArrangement;
    if (visible !== undefined) updateData.visible = visible;

    // Handle location based on work arrangement
    if (workArrangement === "Remote") {
      updateData.location = "Remote";
    } else if (location) {
      updateData.location = location;
    }

    // Handle internship type
    if (jobType === "Internship" && internshipType) {
      updateData.internshipType = internshipType;
    } else if (jobType !== "Internship") {
      updateData.$unset = { internshipType: "" };
    }

    // Use findByIdAndUpdate to avoid validation issues with legacy data
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: false }
    );

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error editing job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job",
    });
  }
};

// Soft delete job
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyData._id;

    const job = await Job.findOne({ _id: id, companyId });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you don't have permission to delete it",
      });
    }

    // Soft delete using findByIdAndUpdate to avoid validation issues
    await Job.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        visible: false
      },
      { runValidators: false }
    );

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete job",
    });
  }
};

// Get applicant details for recruiter view
export const getApplicantDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyData._id;

    // Find the job application and verify it belongs to this company
    const application = await JobApplication.findById(id).populate("jobId", "companyId");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Verify this application is for a job posted by this company
    if (application.jobId.companyId.toString() !== companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this applicant",
      });
    }

    // Get full user details with resume parsed data
    const user = await User.findById(application.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found",
      });
    }

    return res.status(200).json({
      success: true,
      applicant: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        resume: user.resume,
        resumeParseScore: user.resumeParseScore,
        careerObjective: user.careerObjective,
        contactInfo: user.contactInfo,
        technicalSkills: user.technicalSkills,
        personalSkills: user.personalSkills,
        tools: user.tools,
        projectTypes: user.projectTypes,
        languages: user.languages,
        education: user.education,
        projects: user.projects,
        certifications: user.certifications,
        extraCurricular: user.extraCurricular,
        hobbies: user.hobbies,
        areasOfInterest: user.areasOfInterest,
      },
      application: {
        status: application.status,
        appliedDate: application.date,
      },
    });
  } catch (error) {
    console.error("Error fetching applicant detail:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applicant details",
    });
  }
};

// Get job applicants grouped by job
export const getJobApplicantsGrouped = async (req, res) => {
  try {
    const companyId = req.companyData._id;

    // Get all non-deleted jobs for this company
    const jobs = await Job.find({ companyId, isDeleted: { $ne: true } });

    // For each job, get the applicants
    const jobsWithApplicants = await Promise.all(
      jobs.map(async (job) => {
        const applicants = await JobApplication.find({ jobId: job._id })
          .populate("userId", "name image resume email")
          .sort({ date: -1 });

        return {
          _id: job._id,
          title: job.title,
          location: job.location,
          jobType: job.jobType,
          workArrangement: job.workArrangement,
          experienceLevel: job.experienceLevel,
          date: job.date,
          visible: job.visible,
          applicantCount: applicants.length,
          applicants: applicants.map((app) => ({
            _id: app._id,
            userId: app.userId,
            status: app.status,
            date: app.date,
          })),
        };
      })
    );

    // Sort by date (newest first) and filter to only jobs with applicants if needed
    const sortedJobs = jobsWithApplicants.sort((a, b) => b.date - a.date);

    return res.status(200).json({
      success: true,
      jobsWithApplicants: sortedJobs,
    });
  } catch (error) {
    console.error("Error fetching grouped applicants:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};
