module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  configurations: {
    'ios.sim.debug': {
      type: 'ios.simulator',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/ViteFait.app',
      build: 'xcodebuild -workspace ios/ViteFait.xcworkspace -scheme ViteFait -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      device: {
        type: 'iPhone 14',
      },
    },
    'ios.sim.release': {
      type: 'ios.simulator',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/ViteFait.app',
      build: 'xcodebuild -workspace ios/ViteFait.xcworkspace -scheme ViteFait -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
      device: {
        type: 'iPhone 14',
      },
    },
    'android.emu.debug': {
      type: 'android.emulator',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..',
      device: {
        avdName: 'Pixel_4_API_30',
      },
    },
    'android.emu.release': {
      type: 'android.emulator',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release && cd ..',
      device: {
        avdName: 'Pixel_4_API_30',
      },
    },
  },
};

```

```
