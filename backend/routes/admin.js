// routes/admin.js

import express from "express";
import mongoose from "mongoose";
import { gridFSBucket } from "../config/gridfs.js";
const router = express.Router();

import { auth, isAdmin } from "../middleware/auth.js";

// Models
import Publication from "../models/Publication.js";
import IPR from "../models/IPR.js";
import ProjectProposal from "../models/Proposals.js";
import PhdScholar from "../models/Scholar.js";
import User from "../models/User.js";

/* =====================================================
   📌 ADMIN DASHBOARD
===================================================== */
router.get("/dashboard", auth, isAdmin, async (req, res) => {
  try {
    // -------- TOTAL COUNTS --------
    const [publications, iprs, proposals, scholars] = await Promise.all([
      Publication.countDocuments(),
      IPR.countDocuments(),
      ProjectProposal.countDocuments(),
      PhdScholar.countDocuments(),
    ]);

    // -------- RECENT 30 DAYS --------
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      recentPublications,
      recentIPRs,
      recentProposals,
      recentScholars,
    ] = await Promise.all([
      Publication.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      IPR.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      ProjectProposal.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      PhdScholar.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    // -------- WEEKLY DATA (LAST 8 WEEKS) --------
    const weeklyData = [];

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - i * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const [pubs, iprCount, props, schols] = await Promise.all([
        Publication.countDocuments({
          createdAt: { $gte: weekStart, $lt: weekEnd },
        }),
        IPR.countDocuments({
          createdAt: { $gte: weekStart, $lt: weekEnd },
        }),
        ProjectProposal.countDocuments({
          createdAt: { $gte: weekStart, $lt: weekEnd },
        }),
        PhdScholar.countDocuments({
          createdAt: { $gte: weekStart, $lt: weekEnd },
        }),
      ]);

      weeklyData.push({
        week: `Week ${8 - i}`,
        publications: pubs,
        iprs: iprCount,
        proposals: props,
        scholars: schols,
      });
    }

    // -------- USER ACTIVITY (LAST 6 MONTHS) --------
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const allUsers = await User.find().select("_id");

    const activeUsersInPublications = await Publication.distinct("userId", {
      createdAt: { $gte: sixMonthsAgo },
      userId: { $ne: null },
    });

    const activeUsersInIPR = await IPR.distinct("userId", {
      createdAt: { $gte: sixMonthsAgo },
      userId: { $ne: null },
    });

    const activeUsersInProposals = await ProjectProposal.distinct("userId", {
      createdAt: { $gte: sixMonthsAgo },
      userId: { $ne: null },
    });

    const activeUsersInScholars = await PhdScholar.distinct("userId", {
      createdAt: { $gte: sixMonthsAgo },
      userId: { $ne: null },
    });

    const activeSet = new Set([
      ...activeUsersInPublications,
      ...activeUsersInIPR,
      ...activeUsersInProposals,
      ...activeUsersInScholars,
    ]);

    const inactiveCount = allUsers.length - activeSet.size;

    // -------- RESPONSE --------
    res.json({
      totals: {
        publications,
        iprs,
        proposals,
        scholars,
      },
      recent: {
        publications: recentPublications,
        iprs: recentIPRs,
        proposals: recentProposals,
        scholars: recentScholars,
      },
      weeklyData,
      inactivitySummary: {
        totalUsers: allUsers.length,
        activeUsers: activeSet.size,
        usersWithNoRecentActivity: inactiveCount,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   📌 GET ALL DATA FOR A SPECIFIC USER
===================================================== */
router.get("/user/:userId", auth, isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    const [publications, iprs, proposals, scholars] = await Promise.all([
      Publication.find({ userId }).populate("userId", "name email"),
      IPR.find({ userId }).populate("userId", "name email"),
      ProjectProposal.find({ userId }).populate("userId", "name email"),
      PhdScholar.find({ userId }).populate("userId", "name email"),
    ]);

    res.json({
      publications,
      iprs,
      proposals,
      scholars,
    });
  } catch (error) {
    console.error("Get user data error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   📌 ADMIN-ONLY PROOF VIEWING (GRIDFS STREAM)
===================================================== */
router.get("/proof/:fileId", auth, isAdmin, (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);

    res.set("Content-Type", "application/octet-stream");
    gridfsBucket.openDownloadStream(fileId).pipe(res);
  } catch (error) {
    console.error("Proof streaming error:", error);
    res.status(400).json({ message: "Invalid file ID" });
  }
});

/* =====================================================
   EXPORT ROUTER
===================================================== */
export default router;
