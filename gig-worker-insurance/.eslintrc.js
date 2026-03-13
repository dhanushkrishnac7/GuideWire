module.exports = {
    extends: ['expo', 'plugin:react-native/all'],
    plugins: ['react-native'],
    rules: {
        // ENFORCE STRICT UI CONSISTENCY
        // Throw an error if anyone tries to use inline styles or color literals
        'react-native/no-inline-styles': 'error',
        'react-native/no-color-literals': 'error',

        // Loosen these to speed up prototyping
        'react-native/no-raw-text': 'off',
        'react-native/split-platform-components': 'off',
        'react-native/no-unused-styles': 'warn'
    },
};
