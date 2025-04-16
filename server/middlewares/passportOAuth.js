import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
configDotenv();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["email", "profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { googleId: profile.id } });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: `${profile.name.givenName} ${profile.name.familyName}`,
            email: profile.emails[0].value,
            image: profile.photos[0].value.replace("=s96-c", "=s400-c"),
          });
        }

        const token = await new Promise((resolve, reject) => {
          jwt.sign(
            { id: user.user_id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: 1 * 24 * 60 * 60 * 1000,
            },
            (err, token) => {
              if (err)
                return reject(new ApiError("Error in signing token", 501));
              resolve(token);
            }
          );
        });

        return done(null, { token });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export const oAuthenticated = passport.authenticate("google", {
  scope: ["email", "profile"],
  prompt: "consent", // لإعادة طلب الكود عند كل طلب
});

export const oCallback = passport.authenticate("google", {
  session: false,
});
