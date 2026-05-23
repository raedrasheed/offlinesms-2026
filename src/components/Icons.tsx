import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/theme';

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Small icon glyphs used in list rows and headers. All drawn from
 * scratch as simple SVG paths so we don't ship any third-party icon
 * assets. Sized to look right at 12–16px next to body text.
 */

export const PinIcon: React.FC<IconProps> = ({ size = 12, color = colors.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M14 4l6 6-2.5 1-3.5 3.5 1.5 5L13 21l-4-4-5 5 1-6-4-4 4.5-1L9 7.5 11 5l3-1z"
      fill={color}
      transform="rotate(45 12 12)"
    />
  </Svg>
);

export const MuteIcon: React.FC<IconProps> = ({ size = 12, color = colors.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    {/* Speaker */}
    <Path
      d="M3 9v6h4l5 5V4L7 9H3z"
      fill={color}
    />
    {/* Slash */}
    <Path
      d="M16 6l6 12"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

export const ArchiveIcon: React.FC<IconProps> = ({ size = 14, color = colors.textMuted }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    {/* Box top */}
    <Path d="M3 5h18v3H3z" fill={color} />
    {/* Box body with cut-out for handle */}
    <Path
      d="M4 10h16v9c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-9zm5 2v2h6v-2H9z"
      fill={color}
    />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 12, color = colors.tickSent }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 12l5 5 9-11" stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/** Double tick used for delivered / read message status. */
export const DoubleCheckIcon: React.FC<IconProps> = ({ size = 14, color = colors.tickRead }) => (
  <Svg width={size} height={size} viewBox="0 0 28 24">
    <Path d="M2 12l5 5 9-11" stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M11 17l1.5 1.5L22 7" stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 22, color = colors.textPrimary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={2} />
    <Path d="M16.5 16.5L21 21" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export const CameraIcon: React.FC<IconProps> = ({ size = 22, color = colors.textPrimary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={13} r={3.4} stroke={color} strokeWidth={2} />
  </Svg>
);

export const ComposeIcon: React.FC<IconProps> = ({ size = 24, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 20h4L19 9l-4-4L4 16v4z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    <Path d="M14 6l4 4" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
