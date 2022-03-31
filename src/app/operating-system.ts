export enum OperatingSystem {
  Windows = 'Windows',
  MacOS = 'MacOS',
  Linux = 'Linux',
  UNIX = 'UNIX',
  Unknown = 'Unknown',
}

export const UserAgentToOSMap = new Map<string, OperatingSystem>([
  ['Win', OperatingSystem.Windows],
  ['Mac', OperatingSystem.MacOS],
  ['Linux', OperatingSystem.Linux],
  ['X11', OperatingSystem.UNIX],
]);

export const getUserOS = (): OperatingSystem => {
  const userAgent = navigator.userAgent.trim().toLowerCase();

  for (const [key, system] of UserAgentToOSMap.entries()) {
    if (userAgent.includes(key.trim().toLowerCase())) {
      return system;
    }
  }

  return OperatingSystem.Unknown;
};

export const isOSWindows = (): boolean =>
  getUserOS() === OperatingSystem.Windows;
export const isOSMacOS = (): boolean => getUserOS() === OperatingSystem.MacOS;
export const isOSLinux = (): boolean => getUserOS() === OperatingSystem.Linux;
export const isOSUnix = (): boolean => getUserOS() === OperatingSystem.UNIX;
export const isOSUnknown = (): boolean =>
  getUserOS() === OperatingSystem.Unknown;
