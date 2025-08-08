import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  const RNScreens = require('react-native-screens/mock');
  return RNScreens;
});

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Marker: View,
    Callout: View,
  };
});

// Mock @stripe/stripe-react-native
jest.mock('@stripe/stripe-react-native', () => ({
  StripeProvider: ({ children }) => children,
  CardField: () => null,
  useStripe: () => ({
    createToken: jest.fn(),
    confirmPayment: jest.fn(),
    createPaymentMethod: jest.fn(),
  }),
  useConfirmPayment: () => ({
    confirmPayment: jest.fn(),
    loading: false,
  }),
}));

// Mock react-native-push-notification
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  onRegister: jest.fn(),
  onNotification: jest.fn(),
  onAction: jest.fn(),
  onRegistrationError: jest.fn(),
  requestPermissions: jest.fn(),
  subscribeToTopic: jest.fn(),
  unsubscribeFromTopic: jest.fn(),
  clearAllNotifications: jest.fn(),
  getScheduledLocalNotifications: jest.fn(),
  getDeliveredNotifications: jest.fn(),
  getInitialNotification: jest.fn(),
  getBadgeCount: jest.fn(),
  setBadgeCount: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  cancelLocalNotifications: jest.fn(),
  scheduleLocalNotification: jest.fn(),
  localNotification: jest.fn(),
  localNotificationSchedule: jest.fn(),
  channelExists: jest.fn(),
  createChannel: jest.fn(),
  channelBlocked: jest.fn(),
  deleteChannel: jest.fn(),
  getChannels: jest.fn(),
  getChannel: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  removeAllDeliveredNotifications: jest.fn(),
  removeDeliveredNotifications: jest.fn(),
}));

// Mock @react-native-community/geolocation
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  requestAuthorization: jest.fn(),
  setRNConfiguration: jest.fn(),
}));

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(() => Promise.resolve('unique-id')),
  getSystemName: jest.fn(() => 'iOS'),
  getSystemVersion: jest.fn(() => '15.0'),
  getVersion: jest.fn(() => '1.0.0'),
  getBuildNumber: jest.fn(() => '1'),
  getBundleId: jest.fn(() => 'com.vitefait.app'),
  isTablet: jest.fn(() => false),
  isLocationEnabled: jest.fn(() => Promise.resolve(true)),
  getCarrier: jest.fn(() => Promise.resolve('Carrier')),
  getTotalMemory: jest.fn(() => Promise.resolve(8589934592)),
  getUsedMemory: jest.fn(() => Promise.resolve(4294967296)),
  getFreeDiskStorage: jest.fn(() => Promise.resolve(1073741824)),
  getTotalDiskCapacity: jest.fn(() => Promise.resolve(10737418240)),
}));

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(() => Promise.resolve()),
  getInternetCredentials: jest.fn(() => Promise.resolve({ username: 'test', password: 'token' })),
  resetInternetCredentials: jest.fn(() => Promise.resolve()),
  getAllInternetCredentials: jest.fn(() => Promise.resolve([])),
  setGenericPassword: jest.fn(() => Promise.resolve()),
  getGenericPassword: jest.fn(() => Promise.resolve({ username: 'test', password: 'token' })),
  resetGenericPassword: jest.fn(() => Promise.resolve()),
  canImplyAuthentication: jest.fn(() => Promise.resolve(false)),
  getSupportedBiometryType: jest.fn(() => Promise.resolve(null)),
  getSecurityLevel: jest.fn(() => Promise.resolve('SECURE_SOFTWARE')),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, type: 'wifi' })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    close: jest.fn(),
  })),
}));

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// Mock react-native-camera
jest.mock('react-native-camera', () => ({
  RNCamera: 'RNCamera',
  Constants: {
    Type: {
      back: 'back',
      front: 'front',
    },
    FlashMode: {
      on: 'on',
      off: 'off',
      auto: 'auto',
      torch: 'torch',
    },
    AutoFocus: {
      on: 'on',
      off: 'off',
    },
    WhiteBalance: {
      auto: 'auto',
      sunny: 'sunny',
      cloudy: 'cloudy',
      shadow: 'shadow',
      fluorescent: 'fluorescent',
      incandescent: 'incandescent',
    },
    VideoQuality: {
      '288p': '288p',
      '480p': '480p',
      '720p': '720p',
      '1080p': '1080p',
      '2160p': '2160p',
    },
    VideoCodec: {
      H264: 'H264',
      HEVC: 'HEVC',
      JPEG: 'JPEG',
      AppleProRes422: 'AppleProRes422',
      AppleProRes4444: 'AppleProRes4444',
    },
  },
}));

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {
      LOCATION_ALWAYS: 'ios.permission.LOCATION_ALWAYS',
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
      NOTIFICATIONS: 'ios.permission.NOTIFICATIONS',
    },
    ANDROID: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
    },
  },
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    LIMITED: 'limited',
    GRANTED: 'granted',
    BLOCKED: 'blocked',
  },
  request: jest.fn(() => Promise.resolve('granted')),
  check: jest.fn(() => Promise.resolve('granted')),
  requestMultiple: jest.fn(() => Promise.resolve({})),
  checkMultiple: jest.fn(() => Promise.resolve({})),
}));

// Mock react-native-splash-screen
jest.mock('react-native-splash-screen', () => ({
  hide: jest.fn(),
  show: jest.fn(),
}));

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock react-native-modal
jest.mock('react-native-modal', () => 'Modal');

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return {
    Provider: ({ children }) => children,
    Button: ({ onPress, children, ...props }) => (
      <TouchableOpacity onPress={onPress} {...props}>
        <Text>{children}</Text>
      </TouchableOpacity>
    ),
    TextInput: ({ value, onChangeText, ...props }) => (
      <View>
        <Text>{value}</Text>
      </View>
    ),
    Card: ({ children, ...props }) => <View {...props}>{children}</View>,
    Title: ({ children, ...props }) => <Text {...props}>{children}</Text>,
    Paragraph: ({ children, ...props }) => <Text {...props}>{children}</Text>,
    ActivityIndicator: ({ ...props }) => <View {...props} />,
    Avatar: {
      Text: ({ children, ...props }) => <View {...props}><Text>{children}</Text></View>,
      Image: ({ ...props }) => <View {...props} />,
    },
    Chip: ({ children, ...props }) => <View {...props}><Text>{children}</Text></View>,
    SegmentedButtons: ({ value, onValueChange, buttons, ...props }) => (
      <View {...props}>
        {buttons.map((button, index) => (
          <TouchableOpacity key={index} onPress={() => onValueChange(button.value)}>
            <Text>{button.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    ),
  };
});

// Mock react-native-elements
jest.mock('react-native-elements', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return {
    Button: ({ onPress, title, ...props }) => (
      <TouchableOpacity onPress={onPress} {...props}>
        <Text>{title}</Text>
      </TouchableOpacity>
    ),
    Input: ({ value, onChangeText, ...props }) => (
      <View>
        <Text>{value}</Text>
      </View>
    ),
    Card: ({ children, ...props }) => <View {...props}>{children}</View>,
    Text: ({ children, ...props }) => <Text {...props}>{children}</Text>,
  };
});

// Mock react-native-skeleton-placeholder
jest.mock('react-native-skeleton-placeholder', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    default: ({ children, ...props }) => <View {...props}>{children}</View>,
  };
});

// Mock react-native-fast-image
jest.mock('react-native-fast-image', () => 'FastImage');

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    Svg: View,
    Path: View,
    Circle: View,
    Rect: View,
    G: View,
    Defs: View,
    LinearGradient: View,
    Stop: View,
  };
});

// Mock react-native-svg-transformer
jest.mock('react-native-svg-transformer', () => ({}));

// Global fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
); 