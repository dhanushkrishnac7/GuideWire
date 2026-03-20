export const theme = {
  colors: {
    background: '#F0F2F5', // The light grayish blue from screenshot
    primary: '#4B28E5',
    primaryLight: '#6B42FF',
    primaryDark: '#2D0A8F',
    successGreen: '#4CD964',
    successPillBg: '#A5F3A5', // The bright lime green early on
    textMain: '#1A1A1A',
    textMuted: '#6B7280',
    cardWhite: '#FFFFFF',
    scannerGradientStart: '#3A1CD9',
    scannerGradientEnd: '#1C0D99',
    folderGradientStart: '#EAE6FF',
    folderGradientEnd: '#F9F8FF',
    borderLight: '#F0F1F5',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  borderRadius: {
    s: 8,
    m: 16,
    l: 24,
    round: 999,
  },
  typography: {
    header: {
      fontSize: 20,
      fontWeight: '800' as const,
      color: '#1A1A1A',
    },
    title: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: '#1A1A1A',
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 13,
      fontWeight: '400' as const,
    },
    small: {
      fontSize: 11,
      fontWeight: '500' as const,
    }
  },
};
