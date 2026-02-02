module.exports = {
  preset: 'react-native',

  testMatch: ['<rootDir>/e2e/**/*.test.js'],

  testEnvironment: 'detox/runners/jest/testEnvironment',

  setupFilesAfterEnv: ['<rootDir>/e2e/setup.js'],

  testTimeout: 120000,

  // 🔒 VERY IMPORTANT FOR WINDOWS + ANDROID
  maxWorkers: 1,

  verbose: true,

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};


