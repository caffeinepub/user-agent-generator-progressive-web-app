// User Agent Generator Logic
// Generates realistic user-agent strings based on device type, platform, country, and version type
// Now supports dynamic browser version data from StatCounter, APKMirror, and Browser-Update.org

import type { BrowserVersionData } from '@/hooks/useQueries';

interface BrowserVersion {
  chrome: string;
  safari: string;
  firefox: string;
  edge: string;
}

interface OSVersion {
  android: string;
  ios: string;
  windows: string;
  mac: string;
  linux: string;
}

interface AppVersion {
  facebook: string;
  instagram: string;
}

export interface UserAgentData {
  userAgent: string;
  deviceModel: string;
  browserName: string;
  browserVersion: string;
  osVersion: string;
  releaseYear: string;
  // Extended metadata
  hardwareVendor: string;
  hardwareModel: string;
  hardwareName: string;
  platformVendor: string;
  platformName: string;
  platformVersion: string;
  browserVendor: string;
  hardwareFamily: string;
  oem: string;
  hardwareModelVariants: string;
}

// Default browser versions (fallback for 2026)
const defaultBrowserVersions: BrowserVersion = {
  chrome: '142.0.0.0',
  safari: '19.2',
  firefox: '145.0',
  edge: '142.0.0.0',
};

// Latest app versions (fallback for 2026)
const defaultAppVersions: AppVersion = {
  facebook: '450.0.0.0.0',
  instagram: '315.0.0.0.0',
};

// Latest OS versions (2026)
const latestOSVersions: OSVersion = {
  android: '16',
  ios: '19.2.1',
  windows: '11.0',
  mac: '16_2_1',
  linux: 'x86_64',
};

// Device models for latest versions (2026)
const latestDeviceModels = {
  samsung: [
    'SM-S938B',
    'SM-S936B',
    'SM-S931B', // Galaxy S26 series
    'SM-S928B',
    'SM-S926B',
    'SM-S921B', // Galaxy S25 series
    'SM-A566B',
    'SM-A556B',
    'SM-A546B', // Galaxy A series
    'SM-F966B',
    'SM-F956B',
    'SM-F946B', // Galaxy Z Fold series
  ],
  iphone: [
    'iPhone18,2',
    'iPhone18,1', // iPhone 17 Pro
    'iPhone17,4',
    'iPhone17,3', // iPhone 17
    'iPhone16,2',
    'iPhone16,1', // iPhone 16 Pro
    'iPhone17,5', // iPhone Air (special model)
  ],
  ipad: [
    'iPad16,6',
    'iPad16,5', // iPad Pro (2026)
    'iPad15,19',
    'iPad15,18', // iPad Air (2026)
    'iPad14,11',
    'iPad14,10', // iPad (2026)
  ],
  pixel: [
    'Pixel 11 Pro',
    'Pixel 11',
    'Pixel 10 Pro',
    'Pixel 10',
    'Pixel 9a',
    'Pixel 9 Pro',
  ],
};

// Device model display names
const deviceModelNames: Record<string, Record<string, string>> = {
  samsung: {
    'SM-S938B': 'Samsung Galaxy S26 Ultra',
    'SM-S936B': 'Samsung Galaxy S26+',
    'SM-S931B': 'Samsung Galaxy S26',
    'SM-S928B': 'Samsung Galaxy S25 Ultra',
    'SM-S926B': 'Samsung Galaxy S25+',
    'SM-S921B': 'Samsung Galaxy S25',
    'SM-A566B': 'Samsung Galaxy A56',
    'SM-A556B': 'Samsung Galaxy A55',
    'SM-A546B': 'Samsung Galaxy A54',
    'SM-F966B': 'Samsung Galaxy Z Fold 6',
    'SM-F956B': 'Samsung Galaxy Z Fold 5',
    'SM-F946B': 'Samsung Galaxy Z Fold 4',
  },
  iphone: {
    'iPhone18,2': 'iPhone 17 Pro Max',
    'iPhone18,1': 'iPhone 17 Pro',
    'iPhone17,4': 'iPhone 17 Plus',
    'iPhone17,3': 'iPhone 17',
    'iPhone16,2': 'iPhone 16 Pro Max',
    'iPhone16,1': 'iPhone 16 Pro',
    'iPhone17,5': 'Apple iPhone Air',
  },
  ipad: {
    'iPad16,6': 'iPad Pro 12.9" (2026)',
    'iPad16,5': 'iPad Pro 11" (2026)',
    'iPad15,19': 'iPad Air (2026)',
    'iPad15,18': 'iPad Air 11" (2026)',
    'iPad14,11': 'iPad (2026)',
    'iPad14,10': 'iPad 10th Gen',
  },
  pixel: {
    'Pixel 11 Pro': 'Google Pixel 11 Pro',
    'Pixel 11': 'Google Pixel 11',
    'Pixel 10 Pro': 'Google Pixel 10 Pro',
    'Pixel 10': 'Google Pixel 10',
    'Pixel 9a': 'Google Pixel 9a',
    'Pixel 9 Pro': 'Google Pixel 9 Pro',
  },
};

// Hardware model variants
const hardwareVariants: Record<string, Record<string, string>> = {
  samsung: {
    'SM-S938B': 'SM-S938B, SM-S938U, SM-S938N',
    'SM-S936B': 'SM-S936B, SM-S936U, SM-S936N',
    'SM-S931B': 'SM-S931B, SM-S931U, SM-S931N',
    'SM-S928B': 'SM-S928B, SM-S928U, SM-S928N',
    'SM-S926B': 'SM-S926B, SM-S926U, SM-S926N',
    'SM-S921B': 'SM-S921B, SM-S921U, SM-S921N',
    'SM-A566B': 'SM-A566B, SM-A566F',
    'SM-A556B': 'SM-A556B, SM-A556E',
    'SM-A546B': 'SM-A546B, SM-A546E',
    'SM-F966B': 'SM-F966B, SM-F966U, SM-F966N',
    'SM-F956B': 'SM-F956B, SM-F956U, SM-F956N',
    'SM-F946B': 'SM-F946B, SM-F946U, SM-F946N',
  },
  iphone: {
    'iPhone18,2': 'A3101, A3102, A3103',
    'iPhone18,1': 'A3098, A3099, A3100',
    'iPhone17,4': 'A3095, A3096, A3097',
    'iPhone17,3': 'A3092, A3093, A3094',
    'iPhone16,2': 'A3089, A3090, A3091',
    'iPhone16,1': 'A3086, A3087, A3088',
    'iPhone17,5': 'A3104, A3105, A3106',
  },
  ipad: {
    'iPad16,6': 'A2999, A3000, A3001',
    'iPad16,5': 'A2996, A2997, A2998',
    'iPad15,19': 'A2993, A2994, A2995',
    'iPad15,18': 'A2990, A2991, A2992',
    'iPad14,11': 'A2987, A2988, A2989',
    'iPad14,10': 'A2984, A2985, A2986',
  },
  pixel: {
    'Pixel 11 Pro': 'G9PQD, G0B96',
    'Pixel 11': 'G8V0U, G3S9B',
    'Pixel 10 Pro': 'G1MNW, GE9DP',
    'Pixel 10': 'G03Z5, G82U8',
    'Pixel 9a': 'G6GPR, G4S1M',
    'Pixel 9 Pro': 'G1AZG, G5307',
  },
};

// Locale mappings
const localeMap: Record<string, string> = {
  US: 'en-US',
  UK: 'en-GB',
  BD: 'bn-BD',
  IN: 'en-IN',
  CA: 'en-CA',
  AU: 'en-AU',
  DE: 'de-DE',
  FR: 'fr-FR',
  JP: 'ja-JP',
  CN: 'zh-CN',
  BR: 'pt-BR',
  MX: 'es-MX',
};

// Merge dynamic browser version data with defaults
function getBrowserVersions(dynamicData?: BrowserVersionData | null): BrowserVersion {
  if (!dynamicData) {
    return defaultBrowserVersions;
  }
  
  return {
    chrome: dynamicData.chrome || defaultBrowserVersions.chrome,
    safari: dynamicData.safari || defaultBrowserVersions.safari,
    firefox: dynamicData.firefox || defaultBrowserVersions.firefox,
    edge: dynamicData.edge || defaultBrowserVersions.edge,
  };
}

// Get app versions with APKMirror priority
function getAppVersions(dynamicData?: BrowserVersionData | null): AppVersion {
  if (!dynamicData) {
    return defaultAppVersions;
  }
  
  return {
    facebook: dynamicData.facebook || defaultAppVersions.facebook,
    instagram: dynamicData.instagram || defaultAppVersions.instagram,
  };
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomVersion(base: string, variation: number = 5): string {
  const parts = base.split('.');
  const minor = parseInt(parts[parts.length - 1]) + Math.floor(Math.random() * variation);
  parts[parts.length - 1] = minor.toString();
  return parts.join('.');
}

function getDeviceModelName(deviceType: string, model: string): string {
  const names = deviceModelNames[deviceType];
  return names?.[model] || model;
}

function getHardwareVendor(deviceType: string): string {
  switch (deviceType) {
    case 'samsung':
      return 'Samsung';
    case 'iphone':
    case 'ipad':
      return 'Apple';
    case 'pixel':
      return 'Google';
    case 'windows':
      return 'Microsoft';
    default:
      return 'Unknown';
  }
}

function getHardwareFamily(deviceType: string): string {
  switch (deviceType) {
    case 'samsung':
      return 'Galaxy';
    case 'iphone':
      return 'iPhone';
    case 'ipad':
      return 'iPad';
    case 'pixel':
      return 'Pixel';
    case 'windows':
      return 'PC';
    default:
      return 'Unknown';
  }
}

function getPlatformVendor(deviceType: string): string {
  if (deviceType === 'iphone' || deviceType === 'ipad') {
    return 'Apple';
  } else if (deviceType === 'windows') {
    return 'Microsoft';
  } else {
    return 'Google';
  }
}

function getPlatformName(deviceType: string): string {
  if (deviceType === 'iphone' || deviceType === 'ipad') {
    return 'iOS';
  } else if (deviceType === 'windows') {
    return 'Windows';
  } else {
    return 'Android';
  }
}

function getBrowserVendor(platformType: string, deviceType: string): string {
  if (platformType === 'facebook' || platformType === 'instagram') {
    return 'Meta';
  } else if (deviceType === 'iphone' || deviceType === 'ipad') {
    return 'Apple';
  } else if (deviceType === 'windows' || deviceType === 'pixel' || deviceType === 'samsung') {
    return 'Google';
  }
  return 'Unknown';
}

function getHardwareVariants(deviceType: string, model: string): string {
  const variants = hardwareVariants[deviceType];
  return variants?.[model] || model;
}

function generateFacebookUA(device: string, country: string, browserVersions: BrowserVersion, appVersions: AppVersion): UserAgentData {
  const models = latestDeviceModels[device as keyof typeof latestDeviceModels] || latestDeviceModels.samsung;
  const model = getRandomItem(models);
  const locale = localeMap[country] || 'en-US';

  let userAgent: string;
  let osVersion: string;
  let deviceModel: string;
  let platformVersion: string;

  if (device === 'iphone' || device === 'ipad') {
    const iosVersion = latestOSVersions.ios;
    const fbVersion = getRandomVersion(appVersions.facebook, 10);
    const deviceType = device === 'ipad' ? 'iPad' : 'iPhone';
    osVersion = `iOS ${iosVersion}`;
    platformVersion = iosVersion;
    deviceModel = getDeviceModelName(device, model);

    userAgent = `Mozilla/5.0 (${deviceType}; CPU ${deviceType} OS ${iosVersion.replace(
      /\./g,
      '_'
    )} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/${fbVersion};FBBV/${Math.floor(
      Math.random() * 100000000
    )};FBDV/${model};FBMD/${deviceType};FBSN/iOS;FBSV/${iosVersion};FBSS/3;FBID/phone;FBLC/${locale};FBOP/5]`;
  } else {
    const androidVersion = latestOSVersions.android;
    const fbVersion = getRandomVersion(appVersions.facebook, 10);
    const chromeVersion = getRandomVersion(browserVersions.chrome);
    osVersion = `Android ${androidVersion}`;
    platformVersion = androidVersion;
    deviceModel = getDeviceModelName(device, model);

    userAgent = `Mozilla/5.0 (Linux; Android ${androidVersion}; ${model} Build/TP1A.${
      220624 + Math.floor(Math.random() * 10000)
    }.${Math.floor(Math.random() * 100).toString().padStart(3, '0')}) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/${chromeVersion} Mobile Safari/537.36 [FBAN/FB4A;FBAV/${fbVersion};FBBV/${Math.floor(
      Math.random() * 100000000
    )};FBDM/{density=3.0,width=1080,height=2340};FBLC/${locale};FBRV/${Math.floor(
      Math.random() * 100000000
    )};FBCR/;FBMF/${device === 'samsung' ? 'samsung' : 'Google'};FBBD/${
      device === 'samsung' ? 'samsung' : 'google'
    };FBPN/com.facebook.katana;FBDV/${model};FBSV/${androidVersion};FBOP/1;FBCA/arm64-v8a:;]`;
  }

  const fbVersion = getRandomVersion(appVersions.facebook, 10);

  return {
    userAgent,
    deviceModel,
    browserName: 'Facebook',
    browserVersion: fbVersion,
    osVersion,
    releaseYear: '2026',
    hardwareVendor: getHardwareVendor(device),
    hardwareModel: model,
    hardwareName: deviceModel,
    platformVendor: getPlatformVendor(device),
    platformName: getPlatformName(device),
    platformVersion: platformVersion,
    browserVendor: 'Meta',
    hardwareFamily: getHardwareFamily(device),
    oem: getHardwareVendor(device),
    hardwareModelVariants: getHardwareVariants(device, model),
  };
}

function generateInstagramUA(device: string, country: string, browserVersions: BrowserVersion, appVersions: AppVersion): UserAgentData {
  const models = latestDeviceModels[device as keyof typeof latestDeviceModels] || latestDeviceModels.samsung;
  const model = getRandomItem(models);
  const locale = localeMap[country] || 'en-US';

  let userAgent: string;
  let osVersion: string;
  let deviceModel: string;
  let platformVersion: string;

  if (device === 'iphone' || device === 'ipad') {
    const iosVersion = latestOSVersions.ios;
    const igVersion = getRandomVersion(appVersions.instagram, 10);
    const deviceType = device === 'ipad' ? 'iPad' : 'iPhone';
    osVersion = `iOS ${iosVersion}`;
    platformVersion = iosVersion;
    deviceModel = getDeviceModelName(device, model);

    userAgent = `Instagram ${igVersion} (${deviceType}; CPU ${deviceType} OS ${iosVersion.replace(
      /\./g,
      '_'
    )} like Mac OS X; ${locale}; ${Math.floor(Math.random() * 100000000)}) AppleWebKit/420+ (KHTML, like Gecko) Mobile/${model}`;
  } else {
    const androidVersion = latestOSVersions.android;
    const igVersion = getRandomVersion(appVersions.instagram, 10);
    osVersion = `Android ${androidVersion}`;
    platformVersion = androidVersion;
    deviceModel = getDeviceModelName(device, model);

    const dpi = 480 + Math.floor(Math.random() * 200);
    const width = 1080;
    const height = 2340 + Math.floor(Math.random() * 500);

    userAgent = `Instagram ${igVersion} Android (${androidVersion}/${
      30 + Math.floor(Math.random() * 5)
    }; ${dpi}dpi; ${width}x${height}; ${device === 'samsung' ? 'samsung' : 'Google'}; ${model}; ${model.toLowerCase()}; qcom; ${locale}; ${Math.floor(
      Math.random() * 1000000000
    )})`;
  }

  const igVersion = getRandomVersion(appVersions.instagram, 10);

  return {
    userAgent,
    deviceModel,
    browserName: 'Instagram',
    browserVersion: igVersion,
    osVersion,
    releaseYear: '2026',
    hardwareVendor: getHardwareVendor(device),
    hardwareModel: model,
    hardwareName: deviceModel,
    platformVendor: getPlatformVendor(device),
    platformName: getPlatformName(device),
    platformVersion: platformVersion,
    browserVendor: 'Meta',
    hardwareFamily: getHardwareFamily(device),
    oem: getHardwareVendor(device),
    hardwareModelVariants: getHardwareVariants(device, model),
  };
}

function generateGeneralUA(device: string, country: string, browserVersions: BrowserVersion): UserAgentData {
  const locale = localeMap[country] || 'en-US';

  if (device === 'windows') {
    const chromeVersion = getRandomVersion(browserVersions.chrome);
    const windowsVersion = latestOSVersions.windows;
    const build = 22631 + Math.floor(Math.random() * 100);

    const userAgent = `Mozilla/5.0 (Windows NT ${windowsVersion}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;

    return {
      userAgent,
      deviceModel: 'Windows 11 PC',
      browserName: 'Chrome',
      browserVersion: chromeVersion,
      osVersion: 'Windows 11',
      releaseYear: '2026',
      hardwareVendor: 'Microsoft',
      hardwareModel: 'PC',
      hardwareName: 'Windows 11 PC',
      platformVendor: 'Microsoft',
      platformName: 'Windows',
      platformVersion: windowsVersion,
      browserVendor: 'Google',
      hardwareFamily: 'PC',
      oem: 'Microsoft',
      hardwareModelVariants: 'Desktop, Laptop, Workstation',
    };
  }

  // For mobile devices, generate standard browser user-agents
  const models = latestDeviceModels[device as keyof typeof latestDeviceModels] || latestDeviceModels.samsung;
  const model = getRandomItem(models);

  if (device === 'iphone' || device === 'ipad') {
    const iosVersion = latestOSVersions.ios;
    const safariVersion = browserVersions.safari;
    const deviceType = device === 'ipad' ? 'iPad' : 'iPhone';
    const deviceModel = getDeviceModelName(device, model);

    const userAgent = `Mozilla/5.0 (${deviceType}; CPU ${deviceType} OS ${iosVersion.replace(
      /\./g,
      '_'
    )} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${safariVersion} Mobile/15E148 Safari/604.1`;

    return {
      userAgent,
      deviceModel,
      browserName: 'Safari',
      browserVersion: safariVersion,
      osVersion: `iOS ${iosVersion}`,
      releaseYear: '2026',
      hardwareVendor: 'Apple',
      hardwareModel: model,
      hardwareName: deviceModel,
      platformVendor: 'Apple',
      platformName: 'iOS',
      platformVersion: iosVersion,
      browserVendor: 'Apple',
      hardwareFamily: getHardwareFamily(device),
      oem: 'Apple',
      hardwareModelVariants: getHardwareVariants(device, model),
    };
  } else {
    const androidVersion = latestOSVersions.android;
    const chromeVersion = getRandomVersion(browserVersions.chrome);
    const buildNumber = `${model}.${Math.floor(Math.random() * 1000000)}`;
    const deviceModel = getDeviceModelName(device, model);

    const userAgent = `Mozilla/5.0 (Linux; Android ${androidVersion}; ${model} Build/${buildNumber}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Mobile Safari/537.36`;

    return {
      userAgent,
      deviceModel,
      browserName: 'Chrome',
      browserVersion: chromeVersion,
      osVersion: `Android ${androidVersion}`,
      releaseYear: '2026',
      hardwareVendor: getHardwareVendor(device),
      hardwareModel: model,
      hardwareName: deviceModel,
      platformVendor: 'Google',
      platformName: 'Android',
      platformVersion: androidVersion,
      browserVendor: 'Google',
      hardwareFamily: getHardwareFamily(device),
      oem: getHardwareVendor(device),
      hardwareModelVariants: getHardwareVariants(device, model),
    };
  }
}

function generateSingleUserAgent(
  deviceType: string,
  platformType: string,
  country: string,
  browserVersions: BrowserVersion,
  appVersions: AppVersion
): UserAgentData {
  switch (platformType) {
    case 'facebook':
      return generateFacebookUA(deviceType, country, browserVersions, appVersions);

    case 'instagram':
      return generateInstagramUA(deviceType, country, browserVersions, appVersions);

    case 'general':
    default:
      return generateGeneralUA(deviceType, country, browserVersions);
  }
}

export function generateUserAgents(
  deviceType: string,
  platformType: string,
  country: string,
  count: number = 25,
  dynamicVersionData?: BrowserVersionData | null
): UserAgentData[] {
  const browserVersions = getBrowserVersions(dynamicVersionData);
  const appVersions = getAppVersions(dynamicVersionData);
  const userAgents: UserAgentData[] = [];
  const uniqueAgents = new Set<string>();

  // Generate unique user agents
  let attempts = 0;
  const maxAttempts = count * 3; // Prevent infinite loop

  while (userAgents.length < count && attempts < maxAttempts) {
    const uaData = generateSingleUserAgent(deviceType, platformType, country, browserVersions, appVersions);
    if (!uniqueAgents.has(uaData.userAgent)) {
      uniqueAgents.add(uaData.userAgent);
      userAgents.push(uaData);
    }
    attempts++;
  }

  return userAgents;
}

// Export single generator for backward compatibility
export function generateUserAgent(deviceType: string, country: string): string {
  const browserVersions = getBrowserVersions(null);
  const appVersions = getAppVersions(null);
  return generateSingleUserAgent(deviceType, 'general', country, browserVersions, appVersions).userAgent;
}
