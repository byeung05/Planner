import { Domain } from './types';

export const Colors = {
  sleep: {
    bg: '#EAE4FF',
    accent: '#7B6FD4',
    border: '#C5BEFF',
    text: '#4A3FA8',
  },
  study: {
    bg: '#FFE8E3',
    accent: '#E05A42',
    border: '#FFBCB4',
    text: '#B83A26',
  },
  schedule: {
    bg: '#FFF4D6',
    accent: '#D4900A',
    border: '#FFD97A',
    text: '#8A5E00',
  },
  surface: '#FFFFFF',
  bg: '#F2F2F8',
  border: '#E4E4F0',
  text: '#1A1A2E',
  sub: '#7878A0',
  nowLine: '#FF5C5C',
} as const;

// Dark theme used on Today screen (matches Structured aesthetic)
export const Dark = {
  bg:       '#141414',
  surface:  '#1E1E1E',
  block:    '#242424',
  blockDrag:'#2E2E2E',
  border:   '#2A2A2A',
  spine:    '#2E2E2E',
  text:     '#FFFFFF',
  sub:      '#666666',
  subLight: '#999999',
  accent:   '#E8604C',   // coral — only accent color
  accentBg: 'rgba(232,96,76,0.15)',
  nowLine:  '#E8604C',
} as const;

export function domainColors(domain: Domain) {
  return Colors[domain];
}

// Domain accent colors mapped to dark theme
export const DomainDark = {
  sleep:    { icon: '#9B8FE0', dot: '#7B6FD4' },
  study:    { icon: '#E8604C', dot: '#E8604C' },
  schedule: { icon: '#F5A623', dot: '#D4900A' },
} as const;
