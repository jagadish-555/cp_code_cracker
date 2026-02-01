import express from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import {
  getContests,
  syncContests,
  addContestReminder,
  getUserReminders,
  removeContestReminder,
} from "./contest.controller.js";

const router = express.Router();

router.get("/", getContests);

router.post("/sync", verifyJWT, syncContests);
router.post("/reminder", verifyJWT, addContestReminder);
router.get("/reminders", verifyJWT, getUserReminders);
router.delete("/reminder/:reminderId", verifyJWT, removeContestReminder);

export default router;
