import express from "express";
import {
    loginAdmin,
    getAllUsers,
    getUserResumeData,
    getCompanies,
    verifyCompany,
    getDashboardStats,
    reparseUserResume,
    getCompanyDetails,
} from "../controllers/adminController.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

// Public route - Admin login
router.post("/login", loginAdmin);

// Protected routes - Require admin authentication
router.get("/users", adminAuthMiddleware, getAllUsers);
router.get("/user/:id/resume", adminAuthMiddleware, getUserResumeData);
router.post("/user/:id/reparse", adminAuthMiddleware, reparseUserResume);
router.get("/companies", adminAuthMiddleware, getCompanies);
router.get("/company/:id", adminAuthMiddleware, getCompanyDetails);
router.post("/verify-company", adminAuthMiddleware, verifyCompany);
router.get("/stats", adminAuthMiddleware, getDashboardStats);

export default router;
