const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Check if Google credentials are configured
const googleCredentialsConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

// Configure Passport Google OAuth Strategy only if credentials are available
if (googleCredentialsConfigured) {
  console.log('Google OAuth credentials found, configuring strategy');
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        scope: ['profile', 'email']
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, return the user
          return done(null, user);
        }

        // Check if user exists with the same email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
        user = await User.findOne({ email });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.authProvider = 'google';
          await user.save();
          return done(null, user);
        }

        // Create new user
        const username = profile.displayName.replace(/\s+/g, '') + profile.id.substring(0, 5);
        
        // Check if username already exists and make it unique if needed
        const existingUsername = await User.findOne({ username });
        const finalUsername = existingUsername ? `${username}${Date.now().toString().slice(-4)}` : username;

        const newUser = new User({
          username: finalUsername,
          email,
          googleId: profile.id,
          authProvider: 'google',
          profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          bio: `Hi, I'm ${profile.displayName}!`
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        console.error('Error in Google authentication:', err);
        return done(err, null);
      }
    }
  )
);

}

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
