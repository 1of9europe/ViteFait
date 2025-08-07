// Déclarations de types pour React Native
declare global {
  const __DEV__: boolean;
  const console: {
    log: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    info: (...args: any[]) => void;
  };
}

export {}; 