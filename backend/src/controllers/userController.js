import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import Notification from "../models/Notification.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    if (!name) {
      return res.json({ success: false, message: "Enter your name" });
    }

    if (!email) {
      return res.json({ success: false, message: "Enter your email" });
    }

    if (!password) {
      return res.json({ success: false, message: "Enter your password" });
    }

    if (!imageFile) {
      return res.json({ success: false, message: "Upload your image" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const imageUploadUrl = await cloudinary.uploader.upload(imageFile.path);

    const user = await User({
      name,
      email,
      password: hashedPassword,
      image: imageUploadUrl.secure_url,
    });

    await user.save();

    const token = await generateToken(user._id);

    return res.json({
      success: true,
      message: "Registration successful",
      userData: user,
      token,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: "Registration failed",
    });
  }
};
export const loginUser = async (req, res) => {
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

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    const token = await generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      userData: user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const fetchUserData = async (req, res) => {
  try {
    const userData = req.userData;

    return res.status(200).json({
      success: true,
      message: "user data fetched successfully",
      userData,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: "user data fetched failed",
      userData,
    });
  }
};

export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.userData._id;

    if (!userId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Job ID are required",
      });
    }

    const isAlreadyApplied = await JobApplication.findOne({ userId, jobId });

    if (isAlreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const jobData = await Job.findById(jobId);

    if (!jobData) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const jobApplication = new JobApplication({
      jobId,
      userId,
      companyId: jobData.companyId,
      date: new Date(),
    });

    await jobApplication.save();

    return res.status(201).json({
      success: true,
      message: "Job applied successfully",
      jobApplication,
    });
  } catch (error) {
    console.error("Job application error:", error);

    return res.status(500).json({
      success: false,
      message: "Job application failed",
    });
  }
};

export const getUserAppliedJobs = async (req, res) => {
  try {
    const userId = req.userData._id;

    const application = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title location date status");

    return res.status(200).json({
      success: true,
      message: "Jobs application fetched successfully",
      jobApplications: application,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs application",
    });
  }
};

export const uploadResume = async (req, res) => {
  try {
    const userId = req.userData._id;
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Upload resume to Cloudinary
    const uploadedResumeUrl = await cloudinary.uploader.upload(resumeFile.path, {
      resource_type: "auto",
    });
    userData.resume = uploadedResumeUrl.secure_url;

    // Try to extract text from PDF and parse resume data
    try {
      const fs = await import("fs");
      const pdfParse = (await import("pdf-parse")).default;
      const { parseResume } = await import("../utils/resumeParser.js");
      const { parseResumeWithAI } = await import("../utils/aiResumeParser.js");

      const pdfBuffer = fs.readFileSync(resumeFile.path);
      const pdfData = await pdfParse(pdfBuffer);
      const resumeText = pdfData.text;

      if (resumeText) {
        let extractedData;
        let usedAI = false;

        // Try AI parsing first if API key is available
        if (process.env.GEMINI_API_KEY) {
          console.log("🤖 Auto-parsing resume with AI...");
          const aiResult = await parseResumeWithAI(resumeText);

          if (aiResult.success) {
            usedAI = true;
            const aiData = aiResult.data;

            // Map AI response to user model structure
            extractedData = {
              contactInfo: aiData.contact || {},
              careerObjective: aiData.careerObjective || "",
              technicalSkills: aiData.technicalSkills || [],
              tools: aiData.tools || [],
              personalSkills: aiData.softSkills || [],
              education: (aiData.education || []).map(edu => ({
                degree: edu.degree || "",
                field: edu.field || "",
                institution: edu.institution || "",
                year: edu.graduationYear || "",
                grade: edu.cgpa || ""
              })),
              // Work experience - mapped to User model structure
              experience: {
                years: (aiData.experience || []).length,
                internships: 0,
                description: "",
                positions: (aiData.experience || []).map(exp => ({
                  title: exp.title || "",
                  company: exp.company || "",
                  duration: exp.duration || "",
                  description: (exp.responsibilities || []).join("; ")
                }))
              },
              projects: (aiData.projects || []).map(proj => ({
                name: proj.name || "",
                duration: proj.duration || "",
                role: proj.role || "",
                tools: proj.tools || [],
                description: proj.description || "",
                category: "Web Development"
              })),
              languages: (aiData.languages || []).map(lang => ({
                language: lang.language || lang,
                proficiency: lang.proficiency || ""
              })),
              certifications: (aiData.certifications || []).map(cert => ({
                name: cert.name || cert,
                issuer: cert.issuer || "",
                date: cert.year || cert.date || ""
              })),
              extraCurricular: aiData.extraCurricular || [],
              areasOfInterest: aiData.areasOfInterest || [],
              hobbies: aiData.hobbies || [],
              projectTypes: ["Web Development"],
              resumeParseScore: aiResult.parseScore
            };
            console.log("✅ AI parsing successful, score:", aiResult.parseScore, "Experience:", extractedData.experience?.positions?.length || 0);
          } else {
            console.log("AI parsing failed, falling back to regex:", aiResult.error);
          }
        }

        // Fallback to regex parsing
        if (!usedAI) {
          console.log("Using regex-based parsing...");
          extractedData = parseResume(resumeText);
        }

        // Save all extracted data to user profile
        userData.contactInfo = extractedData.contactInfo;
        userData.careerObjective = extractedData.careerObjective;
        userData.technicalSkills = extractedData.technicalSkills;
        userData.tools = extractedData.tools;
        userData.personalSkills = extractedData.personalSkills;
        userData.education = extractedData.education;
        userData.experience = extractedData.experience || {};
        userData.projects = extractedData.projects;
        userData.languages = extractedData.languages;
        userData.certifications = extractedData.certifications;
        userData.extraCurricular = extractedData.extraCurricular;
        userData.areasOfInterest = extractedData.areasOfInterest;
        userData.hobbies = extractedData.hobbies;
        userData.projectTypes = extractedData.projectTypes;
        userData.resumeExtractedAt = new Date();
        userData.resumeParseScore = extractedData.resumeParseScore;

        console.log("Resume auto-parsed successfully:", {
          method: usedAI ? "AI" : "Regex",
          technicalSkills: extractedData.technicalSkills?.length || 0,
          tools: extractedData.tools?.length || 0,
          projects: extractedData.projects?.length || 0,
          education: extractedData.education?.length || 0,
          parseScore: extractedData.resumeParseScore,
        });
      }
    } catch (parseError) {
      console.error("Resume parsing error (non-critical):", parseError.message);
      // Continue even if parsing fails - resume is still uploaded
    }

    await userData.save();

    return res.status(200).json({
      success: true,
      message: "Resume uploaded and parsed successfully",
      resumeUrl: userData.resume,
      extractedData: {
        contactInfo: userData.contactInfo,
        careerObjective: userData.careerObjective,
        technicalSkills: userData.technicalSkills,
        tools: userData.tools,
        personalSkills: userData.personalSkills,
        education: userData.education,
        projects: userData.projects,
        languages: userData.languages,
        certifications: userData.certifications,
        projectTypes: userData.projectTypes,
        resumeParseScore: userData.resumeParseScore,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload resume",
    });
  }
};

/**
 * Update user's job preferences for matchmaking
 */
export const updateJobPreferences = async (req, res) => {
  try {
    const userId = req.userData._id;
    const { categories, jobTypes, workModes, locations, minSalary, notifications } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        jobPreferences: {
          categories: categories || [],
          jobTypes: jobTypes || [],
          workModes: workModes || [],
          locations: locations || [],
          minSalary: minSalary || 0,
          notifications: notifications !== false
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      message: "Job preferences updated successfully",
      jobPreferences: user.jobPreferences
    });
  } catch (error) {
    console.error("Update job preferences error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job preferences"
    });
  }
};

/**
 * Get user's notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.userData._id;
    const { limit = 20, unreadOnly = false } = req.query;

    const query = { userId };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("jobId", "title companyId location");

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications"
    });
  }
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.userData._id;
    const { notificationId } = req.params;

    if (notificationId === "all") {
      // Mark all as read
      await Notification.updateMany({ userId }, { isRead: true });
      return res.json({ success: true, message: "All notifications marked as read" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification"
    });
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.userData._id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification"
    });
  }
};

/**
 * Update user profile - allows editing all profile fields
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userData._id;
    const {
      // Basic Info
      name,
      headline,
      contactInfo,

      // About
      careerObjective,

      // Skills
      technicalSkills,
      tools,
      personalSkills,

      // Experience
      experience,

      // Education
      education,

      // Projects
      projects,

      // Salary & Availability
      currentCTC,
      expectedCTC,
      noticePeriod,

      // Languages & Others
      languages,
      certifications,
      hobbies,
      areasOfInterest,
    } = req.body;

    // Build update object dynamically (only include provided fields)
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (headline !== undefined) updateData.headline = headline;
    if (contactInfo !== undefined) updateData.contactInfo = contactInfo;
    if (careerObjective !== undefined) updateData.careerObjective = careerObjective;
    if (technicalSkills !== undefined) updateData.technicalSkills = technicalSkills;
    if (tools !== undefined) updateData.tools = tools;
    if (personalSkills !== undefined) updateData.personalSkills = personalSkills;
    if (experience !== undefined) updateData.experience = experience;
    if (education !== undefined) updateData.education = education;
    if (projects !== undefined) updateData.projects = projects;
    if (currentCTC !== undefined) updateData.currentCTC = currentCTC;
    if (expectedCTC !== undefined) updateData.expectedCTC = expectedCTC;
    if (noticePeriod !== undefined) updateData.noticePeriod = noticePeriod;
    if (languages !== undefined) updateData.languages = languages;
    if (certifications !== undefined) updateData.certifications = certifications;
    if (hobbies !== undefined) updateData.hobbies = hobbies;
    if (areasOfInterest !== undefined) updateData.areasOfInterest = areasOfInterest;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      userData: user
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};
