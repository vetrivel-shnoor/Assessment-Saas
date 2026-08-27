import prisma from "../config/prisma.js";

export const findOrCreateGoogleUser = async (profile) => {
    try {
        let user = await prisma.users.findUnique({ where: { googleId: profile.sub || profile.id } });
        if (user) return user;

        if (profile.email) {
            user = await prisma.users.findUnique({ where: { email: profile.email } });
            if (user) {
                // Link account
                return await prisma.users.update({
                    where: { email: profile.email },
                    data: {
                        googleId: profile.sub || profile.id,
                        profilePicture: user.profilePicture || profile.picture
                    }
                });
            }
        }

        const newUserObj = {
            googleId: profile.sub || profile.id,
            email: profile.email || "no-email-" + (profile.sub || profile.id),
            firstName: profile.given_name || profile.name?.split(' ')[0] || "Google User",
            lastName: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || "",
            profilePicture: profile.picture || null,
        };

        return await prisma.users.create({
            data: newUserObj
        });
    } catch (error) {
        console.error("findOrCreateGoogleUser error:", error);
        throw error;
    }
};
