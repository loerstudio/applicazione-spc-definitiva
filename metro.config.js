const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// FORZA NATIVE - NO WEB BULLSHIT
config.resolver.resolverMainFields = ['react-native', 'main'];
config.resolver.platforms = ['ios', 'android', 'native'];

// Rimuovi web platforms completamente
config.transformer = {
  ...config.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

module.exports = config;