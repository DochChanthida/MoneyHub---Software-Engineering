const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const userServices = require('../services/userServices');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if the user already exists in the database or create a new one
                const user = await userServices.findOrCreateUser({
                    googleId: profile.id,
                    email: profile.emails[0]?.value,
                    firstName: profile.name?.givenName || 'Unknown',
                    lastName: profile.name?.familyName || 'Unknown'
                });

                // Generate a JWT token for the authenticated user
                const token = jwt.sign(
                    { id: user.id, email: user.email, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' } // Token expiration time
                );

                // Pass the token and user to the callback
                return done(null, { user, token });
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

module.exports = passport;
