// config/passport.config.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Author from "../models/Author.js";
import { generateToken } from "../utils/auth.js";

export const setupGoogleStrategy = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.BACKEND_HOST}:${process.env.PORT}${process.env.GOOGLE_CALLBACK_PATH}`,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let author = await Author.findOne({ googleId: profile.id });

                    if (!author) {
                        author = await Author.create({
                            firstName: profile._json.given_name,
                            lastName: profile._json.family_name,
                            email: profile._json.email,
                            avatar: profile._json.picture || null,
                            googleId: profile.id,
                        });
                    }

                    const jwt = generateToken(author);
                    done(null, { jwt });
                } catch (err) {
                    done(err, null);
                }
            }
        )
    );
};
