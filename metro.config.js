const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    stream: require.resolve('readable-stream'),
    http: require.resolve('@tradle/react-native-http'),
    https: require.resolve('@tradle/react-native-http'),
    url: require.resolve('react-native-url-polyfill'),
    util: require.resolve('util/'),
    buffer: require.resolve('buffer/'),
    process: require.resolve('process/browser'),
    crypto: require.resolve('react-native-crypto'),
    ws: require.resolve('react-native-websocket'),
    net: require.resolve('react-native-websocket'),
    tls: require.resolve('react-native-websocket'),
    'react-native-randombytes': require.resolve('react-native-randombytes'),
    zlib: require.resolve('pako'),
};

// Ajout de la configuration pour les modules externes
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];
config.resolver.assetExts = [...config.resolver.assetExts, 'db'];

module.exports = config; 