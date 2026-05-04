export const colors = {
  white: '#FFFFFF',
  ivory: '#FBFAF7',
  porcelain: '#F5F1EA',
  champagne: '#E8D8B8',
  gold: '#BFA46A',
  goldDeep: '#9F8247',
  emerald: '#0F3D33',
  emeraldSoft: '#EAF2EF',
  ink: '#1B1B1B',
  charcoal: '#3B3B3B',
  muted: '#8A8175',
  border: '#E9E2D8',
  danger: '#B95B5B',
};

export const typography = {
  serif: 'Georgia',
  sans: 'System',
};

export const radii = {
  sm: 12,
  md: 14,
  lg: 16,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const shadows = {
  soft: {
    shadowColor: '#1B1B1B',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  subtle: {
    shadowColor: '#1B1B1B',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
};

export const luxuryHeader = {
  backgroundColor: colors.white,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
  paddingHorizontal: spacing.lg,
  paddingTop: 54,
  paddingBottom: spacing.md,
};

export const luxuryInput = {
  backgroundColor: colors.white,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.sm,
  paddingVertical: 14,
  paddingHorizontal: spacing.md,
  color: colors.ink,
  fontSize: 14,
};

export const luxuryButtonText = {
  color: colors.white,
  fontWeight: '800',
  fontSize: 14,
  letterSpacing: 0.4,
};
