import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";
import axios from "axios";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { parseResume } from "../utils/resumeParser.js";
import { extractTextWithOCR, isTextExtractionFailed } from "../utils/ocrExtractor.js";

// Admin login with fixed credentials from environment
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            console.error("ADMIN_PASSWORD not set in environment");
            return res.status(500).json({
                success: false,
                message: "Admin configuration error",
            });
        }

        if (email !== adminEmail) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials",
            });
        }

        // Compare password (plain text or hashed based on env setup)
        const isPasswordValid = password === adminPassword;

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials",
            });
        }

        // Generate admin token with role
        const token = jwt.sign(
            { email: adminEmail, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            message: "Admin login successful",
            adminData: { email: adminEmail, name: "Admin" },
            token,
        });
    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({
            success: false,
            message: "Admin login failed",
        });
    }
};

// Get all users with their resume data
export const getAllUsers = async (req, res) => {
    try {
        const { skills, minExperience, maxExperience, minCTC, maxCTC, projectType } = req.query;

        let query = {};

        // Filter by skills (case-insensitive partial match)
        if (skills) {
            const skillsArray = skills.split(",").map(s => s.trim());
            query.skills = { $in: skillsArray.map(s => new RegExp(s, "i")) };
        }

        // Filter by experience years
        if (minExperience || maxExperience) {
            query["experience.years"] = {};
            if (minExperience) query["experience.years"].$gte = parseInt(minExperience);
            if (maxExperience) query["experience.years"].$lte = parseInt(maxExperience);
        }

        // Filter by expected CTC
        if (minCTC || maxCTC) {
            query.expectedCTC = {};
            if (minCTC) query.expectedCTC.$gte = parseInt(minCTC);
            if (maxCTC) query.expectedCTC.$lte = parseInt(maxCTC);
        }

        // Filter by project type
        if (projectType) {
            const projectTypes = projectType.split(",").map(p => p.trim());
            query.projectTypes = { $in: projectTypes.map(p => new RegExp(p, "i")) };
        }

        const users = await User.find(query).select("-password").sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users,
            count: users.length,
        });
    } catch (error) {
        console.error("Fetch users error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
};

// Get detailed resume data for a specific user
export const getUserResumeData = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User resume data fetched successfully",
            userData: user,
        });
    } catch (error) {
        console.error("Fetch user resume error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user resume data",
        });
    }
};

// Get all companies with verification status
export const getCompanies = async (req, res) => {
    try {
        const { verified } = req.query;

        let query = {};
        if (verified !== undefined) {
            query.isVerified = verified === "true";
        }

        const companies = await Company.find(query).select("-password").sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Companies fetched successfully",
            companies,
            count: companies.length,
        });
    } catch (error) {
        console.error("Fetch companies error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch companies",
        });
    }
};

// Verify a company for job posting
export const verifyCompany = async (req, res) => {
    try {
        const { companyId, isVerified } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: "Company ID is required",
            });
        }

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        company.isVerified = isVerified !== false; // Default to true if not specified
        company.verificationDate = company.isVerified ? new Date() : null;

        await company.save();

        return res.status(200).json({
            success: true,
            message: company.isVerified
                ? "Company verified successfully"
                : "Company verification revoked",
            companyData: {
                _id: company._id,
                name: company.name,
                email: company.email,
                isVerified: company.isVerified,
                verificationDate: company.verificationDate,
            },
        });
    } catch (error) {
        console.error("Verify company error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify company",
        });
    }
};

// Get dashboard stats for admin
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const usersWithResume = await User.countDocuments({ resume: { $ne: "" } });
        const totalCompanies = await Company.countDocuments();
        const verifiedCompanies = await Company.countDocuments({ isVerified: true });

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                usersWithResume,
                totalCompanies,
                verifiedCompanies,
                pendingVerification: totalCompanies - verifiedCompanies,
            },
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard stats",
        });
    }
};

// Get single company details for admin view
export const getCompanyDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await Company.findById(id).select("-password");

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        return res.status(200).json({
            success: true,
            company,
        });
    } catch (error) {
        console.error("Get company details error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch company details",
        });
    }
};

// Re-parse existing user resume to extract data
export const reparseUserResume = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.resume) {
            return res.status(400).json({
                success: false,
                message: "User has no resume uploaded",
            });
        }

        // Download PDF buffer from Cloudinary URL using native fetch (more reliable)
        console.log("Downloading PDF from:", user.resume);

        let pdfBuffer;
        try {
            const response = await fetch(user.resume);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            pdfBuffer = Buffer.from(arrayBuffer);
            console.log("PDF downloaded successfully, size:", pdfBuffer.length);
        } catch (downloadError) {
            console.error("PDF download error:", downloadError);
            return res.status(500).json({
                success: false,
                message: "Failed to download resume PDF: " + downloadError.message,
            });
        }

        let resumeText = "";
        let usedOCR = false;

        // First try normal PDF text extraction
        try {
            const pdfData = await pdfParse(pdfBuffer);
            resumeText = pdfData.text || "";
            console.log("PDF text extraction - length:", resumeText.length);
        } catch (parseError) {
            console.log("PDF parse failed, will try OCR:", parseError.message);
        }

        // If text extraction failed or got too little text, try OCR
        if (isTextExtractionFailed(resumeText)) {
            console.log("Text extraction insufficient, attempting OCR...");
            try {
                resumeText = await extractTextWithOCR(pdfBuffer);
                usedOCR = true;
                console.log("OCR extraction - length:", resumeText.length);
            } catch (ocrError) {
                console.error("OCR extraction also failed:", ocrError.message);
            }
        }

        if (isTextExtractionFailed(resumeText)) {
            return res.status(400).json({
                success: false,
                message: "Could not extract text from resume. This appears to be an image-based/scanned PDF. Please ask the user to upload a text-based PDF (created in Word, Google Docs, or similar).",
            });
        }

        console.log(`Resume text extracted ${usedOCR ? "(via OCR)" : "(via pdf-parse)"}, length:`, resumeText.length);

        const extractedData = parseResume(resumeText);

        // Save all extracted data to user profile
        user.contactInfo = extractedData.contactInfo;
        user.careerObjective = extractedData.careerObjective;
        user.technicalSkills = extractedData.technicalSkills;
        user.tools = extractedData.tools;
        user.personalSkills = extractedData.personalSkills;
        user.education = extractedData.education;
        user.projects = extractedData.projects;
        user.languages = extractedData.languages;
        user.certifications = extractedData.certifications;
        user.extraCurricular = extractedData.extraCurricular;
        user.areasOfInterest = extractedData.areasOfInterest;
        user.hobbies = extractedData.hobbies;
        user.projectTypes = extractedData.projectTypes;
        user.resumeExtractedAt = new Date();
        user.resumeParseScore = extractedData.resumeParseScore;

        await user.save();

        console.log("Resume re-parsed successfully for user:", user.name, {
            technicalSkills: extractedData.technicalSkills?.length || 0,
            tools: extractedData.tools?.length || 0,
            projects: extractedData.projects?.length || 0,
            parseScore: extractedData.resumeParseScore,
        });

        return res.status(200).json({
            success: true,
            message: "Resume re-parsed successfully",
            userData: {
                _id: user._id,
                name: user.name,
                email: user.email,
                technicalSkills: user.technicalSkills,
                tools: user.tools,
                projects: user.projects,
                education: user.education,
                resumeParseScore: user.resumeParseScore,
            },
        });
    } catch (error) {
        console.error("Re-parse resume error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to re-parse resume: " + error.message,
        });
    }
};

