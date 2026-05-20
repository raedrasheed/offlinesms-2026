import React from 'react';
import Svg, { Path } from 'react-native-svg';
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
