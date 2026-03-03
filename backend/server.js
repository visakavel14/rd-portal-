import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import { initGridFS } from "./config/gridfs.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ FIXED SESSION - Uses your MONGODB_URI directly
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({        
    mongoUrl: process.env.MONGODB_URI,  // ✅ Direct DB connection
    collectionName: 'sessions'
  }),
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(passport.initialize());
// Use JWT for auth; disable passport sessions to avoid session errors

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0]?.value?.toLowerCase?.() || "";
    const allowedDomains = ["@student.tce.edu", "@tce.edu"];
    const isAllowedDomain = allowedDomains.some((domain) => email.endsWith(domain));
    if (!isAllowedDomain) {
      return done(null, false);
    }
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        role: 'user',
        department: '',
        designation: ''
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Auth Routes
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login`, session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET || "fallback");
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.redirect(`${process.env.FRONTEND_URL}/profile`);
  }
);

app.get('/auth/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback");
    User.findById(decoded.id).select("name email department designation role username").then((user) => {
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({
        token,
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        department: user.department,
        designation: user.designation,
        username: user.username
      });
    }).catch(() => {
      return res.status(500).json({ message: "Server error" });
    });
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

app.post('/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('connect.sid');
  res.json({ message: 'Logged out' });
});

app.post('/auth/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, role: 'admin' });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "fallback");
    res.cookie('token', token, { httpOnly: true, secure: false });
    res.json({ token, role: user.role, id: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Your existing routes
import authRoutes from "./routes/auth.js";
import scholarRoutes from "./routes/scholars.js";
import proposalRoutes from "./routes/proposals.js";
import iprRoutes from "./routes/ipr.js";
import publicationRoutes from "./routes/publication.js";
import adminRoutes from "./routes/admin.js";
import fileRoutes from "./routes/files.js";
import userRoutes from "./routes/users.js";

app.use("/api/auth", authRoutes);
app.use("/api/phdScholars", scholarRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/ipr", iprRoutes);
app.use("/api/publications", publicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/users", userRoutes);

// Database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    initGridFS(mongoose.connection);
  })
  .catch((err) => console.error("❌ MongoDB error:", err));

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;

