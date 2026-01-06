import express from "express";
import {
  registerUser,
  loginUser,
  fetchUserData,
  applyJob,
  getUserAppliedJobs,
  uploadResume,
  updateJobPreferences,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  updateProfile,
} from "../controllers/userController.js";
import upload from "../utils/upload.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

router.post("/register-user", upload.single("image"), registerUser);
router.post("/login-user", loginUser);
router.get("/user-data", userAuthMiddleware, fetchUserData);
router.post("/apply-job", userAuthMiddleware, applyJob);
router.post("/get-user-applications", userAuthMiddleware, getUserAppliedJobs);
router.post(
  "/upload-resume",
  userAuthMiddleware,
  upload.single("resume"),
  uploadResume
);

// Job Preferences and Notifications
router.post("/update-job-preferences", userAuthMiddleware, updateJobPreferences);
router.get("/notifications", userAuthMiddleware, getNotifications);
router.post("/notifications/:notificationId/read", userAuthMiddleware, markNotificationRead);
router.delete("/notifications/:notificationId", userAuthMiddleware, deleteNotification);

// Profile Update
router.post("/update-profile", userAuthMiddleware, updateProfile);

export default router;

