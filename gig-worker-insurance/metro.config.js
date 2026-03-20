// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable package.json "exports" field resolution so that packages
// like @google/generative-ai (which use modern "exports" maps) work correctly.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
