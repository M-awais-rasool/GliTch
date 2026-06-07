// Learn more: https://docs.expo.dev/guides/customizing-metro/

// IMPORTANT: GLITCH uses React Navigation directly (no expo-router). As of SDK
// 56, Expo's Metro resolver throws when it sees an `@react-navigation/*` import
// unless this flag is set. We set it here — at the very top, before
// `expo/metro-config` builds the resolver — so it applies no matter how Metro
// is started (npm scripts, bare `expo start`, Dev Tools reload, Android Studio).
// This is more robust than the env var in package.json scripts and, unlike a
// `.env` file, does not depend on Node >= 20.12's `util.parseEnv`.
// See: https://docs.expo.dev/router/migrate/sdk-55-to-56/
process.env.EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK = '1';

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
