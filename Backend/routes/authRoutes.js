import express from "express";
import passport from "passport";
import { OAuth2Client } from "google-auth-library";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import { protect } from "../middleware/authMiddleware.js";
import { Login, Signup, Logout, Me, resetPassword, Config, CompleteOnboarding } from "../controllers/authControllers.js";
import { findOrCreateGoogleUser } from "../services/authService.js";
import hotcache from "../utils/hotcache.js";

const router = express.Router();

let client;
if (process.env.GOOGLE_CLIENT_ID) {
    client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
}

// ==============================================
// 1. MANUAL AUTH ROUTES
// ==============================================
router.post("/signup", Signup);
router.post("/login", Login);
router.get("/logout", Logout);
router.get("/me", protect(), Me);
router.post("/reset-password", resetPassword);
router.get("/config", Config);
router.post("/complete-onboarding", protect(), CompleteOnboarding);

// ==============================================
// 2. GOOGLE OAUTH ROUTES (Standard Redirect)
// ==============================================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // A. Trigger Route
    router.get(
        "/google",
        passport.authenticate("google", {
            session: false,
            scope: ["profile", "email"],
        })
    );

    // B. Callback Route
    router.get(
        "/google/callback",
        passport.authenticate("google", {
            session: false,
            failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`,
        }),
        (req, res) => {
            generateTokenAndSetCookie(res, req.user.id);
            const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
            res.redirect(`${clientUrl}/onboarding`);
        }
    );

    // ==============================================
    // 3. GOOGLE ONE TAP ROUTE (Popup/No-Redirect)
    // ==============================================
    router.post("/google/onetap", async (req, res) => {
        const { token } = req.body;

        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();

            const user = await findOrCreateGoogleUser(payload);
            generateTokenAndSetCookie(res, user.id);
            const fullUser = await hotcache.getUserProfile(user.id);
            const { permissions } = await hotcache.getUserPermissions(user.id);

            res.status(200).json({
                success: true,
                user: {
                    ...fullUser,
                    permissions
                },
                message: "Google One Tap Login Successful",
            });
        } catch (error) {
            console.error("One Tap Error:", error);
            res.status(401).json({ success: false, message: "Invalid Google Token" });
        }
    });
}

export default router;
