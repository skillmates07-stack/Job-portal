import express from "express";
import {
  fetchCompanyData,
  loginCompany,
  postJob,
  registerCompany,
  getCompanyPostedAllJobs,
  changeJobVisibility,
  getCompanyJobApplicants,
  changeStatus,
  updateCompanyProfile,
  editJob,
  deleteJob,
  getApplicantDetail,
  getJobApplicantsGrouped,
} from "../controllers/companyController.js";
import upload from "../utils/upload.js";
import companyAuthMiddleware from "../middlewares/companyAuthMiddleware.js";

const router = express.Router();

router.post("/register-company", upload.single("image"), registerCompany);
router.post("/login-company", loginCompany);
router.get("/company-data", companyAuthMiddleware, fetchCompanyData);
router.post("/post-job", companyAuthMiddleware, postJob);
router.get(
  "/company/posted-jobs",
  companyAuthMiddleware,
  getCompanyPostedAllJobs
);
router.post("/change-visiblity", companyAuthMiddleware, changeJobVisibility);
router.post(
  "/view-applications",
  companyAuthMiddleware,
  getCompanyJobApplicants
);
router.post("/change-status", companyAuthMiddleware, changeStatus);
router.post("/update-profile", companyAuthMiddleware, updateCompanyProfile);

// New routes for job management
router.put("/edit-job/:id", companyAuthMiddleware, editJob);
router.delete("/delete-job/:id", companyAuthMiddleware, deleteJob);

// Applicant routes
router.get("/applicant/:id", companyAuthMiddleware, getApplicantDetail);
router.get("/applications-grouped", companyAuthMiddleware, getJobApplicantsGrouped);

export default router;

