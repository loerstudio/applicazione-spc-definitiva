const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true,
});

// Add more resolver options for stability
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Optimize for Replit
config.server = {
  ...config.server,
  port: 8081,
  rewriteRequestUrl: (url) => {
    // Remove the .html extension if present
    if (url.endsWith('.html')) {
      return url.slice(0, -5);
    }
    return url;
  }
};

module.exports = config;