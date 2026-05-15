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

export function domainColors(domain: Domain) {
  return Colors[domain];
}
