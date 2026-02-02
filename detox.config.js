/** @type {import('detox/types').DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'detox.test.config.js',
    },
    jest: {
      setupTimeout: 300000,
      teardownTimeout: 30000,
    },
  },

  apps: {
    'ios.debug': {
      type: 'ios.app',
      build:
        'xcodebuild -workspace ios/Sai_App.xcworkspace -scheme Sai_App -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      binaryPath:
        'ios/build/Build/Products/Debug-iphonesimulator/Sai_App.app',
    },

    'android.debug': {
      type: 'android.apk',

      // 🔥 CRITICAL FIX
      build:
        'cd android && gradlew.bat assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..',

      binaryPath:
        'android/app/build/outputs/apk/debug/app-debug.apk',

      // 🔥 REQUIRED FOR DETOX
      testBinaryPath:
        'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
    },
  },

  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15',
      },
    },

    'android.emulator': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_6',
      },
    },
  },

  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },

    'android.emulator.debug': {
      device: 'android.emulator',
      app: 'android.debug',
    },
  },
};
