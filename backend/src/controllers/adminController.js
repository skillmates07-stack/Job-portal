import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";
import axios from "axios";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { parseResume } from "../utils/resumeParser.js";
import { parseResumeWithAI, categorizeProject } from "../utils/aiResumeParser.js";
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

        // Filter by skills (case-insensitive partial match across technicalSkills, tools, and personalSkills)
        if (skills) {
            const skillsArray = skills.split(",").map(s => s.trim()).filter(s => s);
            const skillRegexes = skillsArray.map(s => new RegExp(s, "i"));
            query.$or = [
                { technicalSkills: { $in: skillRegexes } },
                { tools: { $in: skillRegexes } },
                { personalSkills: { $in: skillRegexes } }
            ];
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

        // Filter by project type (supports multiple types comma-separated)
        if (projectType) {
            const projectTypes = projectType.split(",").map(p => p.trim()).filter(p => p);
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
    console.log("🔄 REPARSE CALLED! User ID:", req.params.id);
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

        let extractedData;
        let usedAI = false;

        console.log("===== ENTERING AI PARSING SECTION =====");
        console.log("🔑 GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);

        // Try AI-powered parsing first
        if (process.env.GEMINI_API_KEY) {
            console.log("Attempting AI-powered resume parsing...");
            const aiResult = await parseResumeWithAI(resumeText);

            if (aiResult.success) {
                usedAI = true;
                const aiData = aiResult.data;

                // Map AI response to existing user model structure
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
                        grade: edu.cgpa || ""  // Maps AI's cgpa to model's grade field
                    })),
                    // Work experience - mapped to User model's experience structure
                    experience: {
                        years: (aiData.experience || []).length, // rough estimate
                        internships: 0,
                        description: "",
                        positions: (aiData.experience || []).map(exp => ({
                            title: exp.title || "",
                            company: exp.company || "",
                            duration: exp.duration || "",
                            description: (exp.responsibilities || []).join("; ")
                        }))
                    },
                    // Deduplicate projects by name
                    projects: [...new Map((aiData.projects || []).map(proj => [
                        proj.name?.toLowerCase().trim(),
                        {
                            name: proj.name || "",
                            duration: proj.duration || "",
                            role: proj.role || "",
                            tools: proj.tools || [],
                            description: proj.description || "",
                            category: categorizeProject(proj)
                        }
                    ])).values()],
                    languages: (aiData.languages || []).map(lang => ({
                        language: lang.language || lang,
                        proficiency: lang.proficiency || ""
                    })),
                    certifications: (aiData.certifications || []).map(cert => ({
                        name: cert.name || cert,
                        issuer: cert.issuer || "",
                        date: cert.year || cert.date || ""
                    })),
                    extraCurricular: (aiData.extraCurricular || []).map(ec => ({
                        activity: ec.activity || ec,
                        achievement: ec.achievement || ""
                    })),
                    // Map coCurricular to achievements field in model
                    achievements: (aiData.coCurricular || []).map(co => ({
                        title: co.activity || co,
                        description: co.description || "",
                        year: ""
                    })),
                    areasOfInterest: aiData.areasOfInterest || [],
                    hobbies: aiData.hobbies || [],
                    projectTypes: [...new Set((aiData.projects || []).map(p => categorizeProject(p)))],
                    resumeParseScore: aiResult.parseScore
                };

                console.log("AI parsing successful! Score:", aiResult.parseScore, "Experience:", extractedData.experience?.length || 0);
            } else {
                console.log("AI parsing failed, falling back to regex:", aiResult.error);
            }
        }

        // Fallback to regex-based parsing
        if (!usedAI) {
            console.log("Using regex-based parsing...");
            extractedData = parseResume(resumeText);
        }

        // Save all extracted data to user profile
        user.contactInfo = extractedData.contactInfo;
        user.careerObjective = extractedData.careerObjective;
        user.technicalSkills = extractedData.technicalSkills;
        user.tools = extractedData.tools;
        user.personalSkills = extractedData.personalSkills;
        user.education = extractedData.education;
        user.experience = extractedData.experience || [];
        user.projects = extractedData.projects;
        user.languages = extractedData.languages;
        user.certifications = extractedData.certifications;
        user.extraCurricular = extractedData.extraCurricular;
        user.achievements = extractedData.achievements || [];
        user.areasOfInterest = extractedData.areasOfInterest;
        user.hobbies = extractedData.hobbies;
        user.projectTypes = extractedData.projectTypes;
        user.resumeExtractedAt = new Date();
        user.resumeParseScore = extractedData.resumeParseScore;
        // Note: user.name is NOT updated from resume - it stays as registered name
        // The parsed name from resume is available in user.contactInfo.name for reference

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

