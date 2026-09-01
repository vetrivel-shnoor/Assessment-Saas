import prisma from "../config/prisma.js";
import argon2 from "argon2";
import { enqueueMedia } from "../services/mediaService.js";
import hotcache from "../utils/hotcache.js";

// --- Configuration: Country Digit Rules ---
const COUNTRY_RULES = {
  "+91": { country: "IN", digits: 10 },
  "+1": { country: "US", digits: 10 },
  "+44": { country: "UK", digits: 10 },
  "+61": { country: "AU", digits: 9 },
  "+81": { country: "JP", digits: 10 },
  "+49": { country: "DE", digits: 11 },
};

// --- Helper: Password Strength Validator ---
const isPasswordStrong = (password) => {
  const strongRegex = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
  );
  return strongRegex.test(password);
};

// --- 1. EXISTING: Personal Info Update ---
export const PersonalInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, countryCode, phone, password } = req.body;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updateData = {};

    if (fullName && fullName.trim().length > 0) {
      const parts = fullName.trim().split(" ");
      updateData.firstName = parts[0];
      updateData.lastName = parts.slice(1).join(" ");
    }

    if (countryCode && phone) {
      const countryRule = COUNTRY_RULES[countryCode];
      if (!countryRule) {
        return res.status(400).json({
          success: false,
          message: `Invalid or unsupported country code: ${countryCode}`,
        });
      }

      const cleanPhone = phone.toString().replace(/\D/g, "");
      if (cleanPhone.length !== countryRule.digits) {
        return res.status(400).json({
          success: false,
          message: `Invalid phone format. ${countryRule.country} numbers must be exactly ${countryRule.digits} digits.`,
        });
      }
      updateData.phone = `${countryCode} ${cleanPhone}`;
    }

    if (password && password.length > 0) {
      if (!isPasswordStrong(password)) {
        return res.status(400).json({
          success: false,
          message:
            "Password is too weak. Must contain 8+ characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
        });
      }
      updateData.password = await argon2.hash(password);
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });
    
    await hotcache.invalidateUserProfile(userId);
    
    // omit password from response
    const { password: _, ...userResponse } = updatedUser;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// --- 2. NEW: Profile Picture Upload ---
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    // Add Job to Queue
    // We pass "users" as the model and "profilePicture" as the field to update
    await enqueueMedia(req.file, req.user.id, "users", "profilePicture");

    res.status(200).json({
      success: true,
      message: "Profile picture upload started. Processing in background...",
    });
  } catch (error) {
    console.error("Profile Upload Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
