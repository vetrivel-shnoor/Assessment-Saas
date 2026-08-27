import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma.js";

export default (passport) => {
    // Only initialize if environment variables are present
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return;
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const googlePhoto = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

                    let user = await prisma.users.findUnique({ where: { googleId: profile.id } });
                    if (user) {
                        return done(null, user);
                    }

                    if (profile.emails && profile.emails.length > 0) {
                        user = await prisma.users.findUnique({ where: { email: profile.emails[0].value } });
                        if (user) {
                            user = await prisma.users.update({
                                where: { email: profile.emails[0].value },
                                data: {
                                    googleId: profile.id,
                                    profilePicture: user.profilePicture || googlePhoto,
                                }
                            });
                            return done(null, user);
                        }
                    }

                    const newUserObj = {
                        googleId: profile.id,
                        email: profile.emails && profile.emails[0] ? profile.emails[0].value : "no-email-" + profile.id,
                        firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || "Google User",
                        lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || "",
                        profilePicture: googlePhoto,
                    };

                    const newUser = await prisma.users.create({ data: newUserObj });
                    return done(null, newUser);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
};
