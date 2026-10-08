import React, { useState } from 'react';

// ==========================================
// 1. BUILT-IN VECTOR BRAND LOGOS (100% Crisp SVGs, 0 External Dependencies)
// ==========================================
const BRAND_SVGS = {
  coinbase: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#0052FF" />
      <circle cx="24" cy="24" r="13" fill="#ffffff" />
      <rect x="21" y="21" width="6" height="6" rx="1.5" fill="#0052FF" />
    </svg>
  ),
  snap: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#FFFC00" />
      <path d="M24 11C18.5 11 16 15 16 19.5C16 21 16.5 22.2 17.2 23C16.8 23.4 15.8 23.8 14.5 24C14 24.1 13.8 24.7 14.2 25C15.2 25.7 16.8 26 18 25.7C18.5 27.2 19.5 28.7 20.5 29.2C19 29.7 17 30.7 16.5 32.2C16.2 33 16.8 33.7 17.6 33.7C19.5 33.7 21.5 32.2 24 32.2C26.5 32.2 28.5 33.7 30.4 33.7C31.2 33.7 31.8 33 31.5 32.2C31 30.7 29 29.7 27.5 29.2C28.5 28.7 29.5 27.2 30 25.7C31.2 26 32.8 25.7 33.8 25C34.2 24.7 34 24.1 33.5 24C32.2 23.8 31.2 23.4 30.8 23C31.5 22.2 32 21 32 19.5C32 15 29.5 11 24 11Z" fill="#ffffff" stroke="#000000" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  grafana: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#1F232B" />
      <path d="M24 9C19 15 14 21 14 27C14 33.6 18.5 39 24 39C29.5 39 34 33.6 34 27C34 21 29 15 24 9Z" fill="#F46800" />
      <path d="M24 17C21 21 18 25 18 29C18 32.3 20.7 35 24 35C27.3 35 30 32.3 30 29C30 25 27 21 24 17Z" fill="#FF9900" />
      <circle cx="24" cy="29" r="3.5" fill="#ffffff" />
    </svg>
  ),
  anthropic: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#18181B" />
      <path d="M24 10L13 36H18.8L21 30.5H27L29.2 36H35L24 10ZM22.5 26L24 21.5L25.5 26H22.5Z" fill="#D97706" />
    </svg>
  ),
  datadog: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#632CA6" />
      <path d="M16 16C16 14 18 12 21 12H27C30 12 32 14 32 16V22C32 25 30 27 27 27H25V33C25 34.5 23.5 36 22 36C20.5 36 19 34.5 19 33V26C17 25.5 16 24 16 22V16Z" fill="#ffffff" />
      <circle cx="27" cy="18" r="2.2" fill="#632CA6" />
      <path d="M21 17L18 20" stroke="#632CA6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  databricks: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#1B1B1D" />
      <path d="M24 10L36 17L24 24L12 17L24 10Z" fill="#FF3621" />
      <path d="M12 21L24 28L36 21L36 25L24 32L12 25V21Z" fill="#FF3621" />
      <path d="M12 28L24 35L36 28L36 32L24 39L12 32V28Z" fill="#FF3621" />
    </svg>
  ),
  cloudflare: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M29.5 19C28.8 15.5 25.8 13 22 13C17.6 13 14 16.6 14 21C14 21.4 14 21.7 14.1 22.1C12.3 22.8 11 24.5 11 26.5C11 29 13 31 15.5 31H34.5C36.4 31 38 29.4 38 27.5C38 25.7 36.6 24.2 34.8 24C34.6 21.2 32.3 19 29.5 19Z" fill="#F38020" />
      <path d="M29.5 19C28.8 15.5 25.8 13 22 13C19.5 13 17.3 14.2 16 16.1C17.2 16.7 18.2 17.7 18.7 19C19.6 18.4 20.8 18 22 18C24.8 18 27 20.2 27 23H29.5C30.9 23 32 24.1 32 25.5C32 25.7 32 25.8 31.9 26H34.5C35.9 26 37 27.1 37 28.5C37 28.7 37 28.8 36.9 29C37.6 28.2 38 27.2 38 26C38 23.8 36.2 22 34 22C33.8 19.8 31.9 19 29.5 19Z" fill="#FAAE40" />
    </svg>
  ),
  snowflake: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#001529" />
      <path d="M24 10V38M12 17L36 31M12 31L36 17" stroke="#29B5E8" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 13L24 10L28 13M20 35L24 38L28 35" stroke="#29B5E8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 21L12 17L16 15M34 33L36 31L32 27" stroke="#29B5E8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 27L12 31L16 33M34 15L36 17L32 21" stroke="#29B5E8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  elastic: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#005571" />
      <circle cx="17" cy="24" r="5" fill="#FED10A" />
      <circle cx="31" cy="24" r="5" fill="#00BFB3" />
      <rect x="20" y="21.5" width="8" height="5" rx="2.5" fill="#F04E98" />
    </svg>
  ),
  crowdstrike: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#000000" />
      <path d="M12 32L24 12L36 32L28 28L24 20L20 28L12 32Z" fill="#E01E26" />
      <path d="M24 24L26 36H22L24 24Z" fill="#ffffff" />
    </svg>
  ),
  gitlab: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#292961" />
      <path d="M24 38L36 25.5L32 12L24 38Z" fill="#E24329" />
      <path d="M24 38L12 25.5L16 12L24 38Z" fill="#E24329" />
      <path d="M24 38L32 12H16L24 38Z" fill="#FC6D26" />
      <path d="M36 25.5L40 20C40.5 19 39.5 18 38.5 18.5L36 20.5V25.5Z" fill="#FCA326" />
      <path d="M12 25.5L8 20C7.5 19 8.5 18 9.5 18.5L12 20.5V25.5Z" fill="#FCA326" />
    </svg>
  ),
  deel: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#15357A" />
      <path d="M16 14H24C29.5 14 34 18.5 34 24C34 29.5 29.5 34 24 34H16V14Z" fill="#22C55E" />
      <path d="M21 19H24C26.8 19 29 21.2 29 24C29 26.8 26.8 29 24 29H21V19Z" fill="#15357A" />
    </svg>
  ),
  linear: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#5E6AD2" />
      <path d="M13 35L35 13M13 25L25 13M23 35L35 23" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  ramp: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#000000" />
      <path d="M13 34L25 14L35 34H27L25 24L19 34H13Z" fill="#E2F952" />
    </svg>
  ),
  canva: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#00C4CC" />
      <circle cx="24" cy="24" r="11" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeDasharray="50 15" />
    </svg>
  ),
  reddit: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#FF4500" />
      <ellipse cx="24" cy="25" rx="10" ry="7.5" fill="#ffffff" />
      <circle cx="20" cy="24" r="2" fill="#FF4500" />
      <circle cx="28" cy="24" r="2" fill="#FF4500" />
      <path d="M21 28C22.5 29.5 25.5 29.5 27 28" stroke="#FF4500" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="13" cy="24" r="2.5" fill="#ffffff" />
      <circle cx="35" cy="24" r="2.5" fill="#ffffff" />
    </svg>
  ),
  airbnb: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#FF5A5F" />
      <path d="M24 12C20.5 12 18 15 18 18C18 22.5 24 30 24 35C24 30 30 22.5 30 18C30 15 27.5 12 24 12ZM24 20C22.6 20 21.5 18.9 21.5 17.5C21.5 16.1 22.6 15 24 15C25.4 15 26.5 16.1 26.5 17.5C26.5 18.9 25.4 20 24 20Z" fill="#ffffff" />
    </svg>
  ),
  scale: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#000000" />
      <path d="M14 18H34V22H14V18ZM14 26H28V30H14V26Z" fill="#ffffff" />
      <circle cx="32" cy="28" r="2" fill="#D946EF" />
    </svg>
  ),
  affirm: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#004BFF" />
      <path d="M14 34C14 23 23 14 34 14V19C25.7 19 19 25.7 19 34H14Z" fill="#00D4B2" />
      <circle cx="28" cy="28" r="4.5" fill="#ffffff" />
    </svg>
  ),
  docusign: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#002D72" />
      <rect x="14" y="14" width="20" height="20" rx="3" fill="#FFD000" />
      <path d="M18 24L22 28L30 20" stroke="#002D72" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  sentry: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#362D59" />
      <path d="M24 10L36 34H29L24 23L19 34H12L24 10Z" fill="#FF3E6C" />
    </svg>
  ),
  discord: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#5865F2" />
      <path d="M32 16C29.5 15 27.5 14.5 25 14.5L24.5 15.5C27 16.2 28.5 17.2 30 18.5C26 16.5 22 16 18 18.5C19.5 17.2 21 16.2 23.5 15.5L23 14.5C20.5 14.5 18.5 15 16 16C12.5 21 11.5 26 12 31C14.5 33 17 33.5 19.5 33.5L20.5 32C19 31.5 18 30.5 17 29.5C17.5 29.8 18 30.2 18.5 30.5C22 32.5 26 32.5 29.5 30.5C30 30.2 30.5 29.8 31 29.5C30 30.5 29 31.5 27.5 32L28.5 33.5C31 33.5 33.5 33 36 31C36.5 26 35.5 21 32 16ZM18.5 27C17.4 27 16.5 25.9 16.5 24.5C16.5 23.1 17.4 22 18.5 22C19.6 22 20.5 23.1 20.5 24.5C20.5 25.9 19.6 27 18.5 27ZM29.5 27C28.4 27 27.5 25.9 27.5 24.5C27.5 23.1 28.4 22 29.5 22C30.6 22 31.5 23.1 31.5 24.5C31.5 25.9 30.6 27 29.5 27Z" fill="#ffffff" />
    </svg>
  ),
  slack: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#4A154B" />
      <rect x="14" y="21" width="9" height="4" rx="2" fill="#36C5F0" />
      <rect x="25" y="21" width="9" height="4" rx="2" fill="#2EB67D" />
      <rect x="21" y="14" width="4" height="9" rx="2" fill="#ECB22E" />
      <rect x="21" y="25" width="4" height="9" rx="2" fill="#E01E5A" />
    </svg>
  ),
  github: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#181717" />
      <path d="M24 11C16.8 11 11 16.8 11 24C11 29.8 14.7 34.6 20 36.4C20.6 36.5 20.9 36.1 20.9 35.8V33.6C17.3 34.4 16.5 32 16.5 32C15.9 30.5 15.1 30.1 15.1 30.1C13.9 29.3 15.2 29.3 15.2 29.3C16.5 29.4 17.2 30.6 17.2 30.6C18.4 32.6 20.3 32 21 31.7C21.1 30.8 21.5 30.2 21.9 29.8C19 29.5 16 28.4 16 23.4C16 22 16.5 20.8 17.3 19.9C17.2 19.6 16.7 18.3 17.4 16.5C17.4 16.5 18.5 16.1 21 17.8C22 17.5 23.1 17.4 24.1 17.4C25.1 17.4 26.2 17.5 27.2 17.8C29.7 16.1 30.8 16.5 30.8 16.5C31.5 18.3 31 19.6 30.9 19.9C31.7 20.8 32.2 22 32.2 23.4C32.2 28.4 29.2 29.5 26.3 29.8C26.8 30.2 27.2 31 27.2 32.2V35.8C27.2 36.1 27.4 36.5 28.1 36.4C33.3 34.6 37 29.8 37 24C37 16.8 31.2 11 24 11Z" fill="#ffffff" />
    </svg>
  ),
  palantir: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#0f172a" />
      <circle cx="24" cy="24" r="10" stroke="#ffffff" strokeWidth="2.5" />
      <path d="M24 6V10M24 38V42M6 24H10M38 24H42" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="24" r="4.5" fill="#ffffff" />
    </svg>
  ),
  supabase: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#1c1c1c" />
      <path d="M25.8 8.5L12 25.4H23.5L22.2 39.5L36 22.6H24.5L25.8 8.5Z" fill="#3ECF8E" />
    </svg>
  ),
  vercel: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#000000" />
      <path d="M24 12L36 33H12L24 12Z" fill="#ffffff" />
    </svg>
  ),
  runway: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#09090b" />
      <path d="M14 13H26C29.8 13 33 16.2 33 20C33 23.8 29.8 27 26 27H20V35H14V13Z" fill="#ffffff" />
      <path d="M24 27L33 35H25L19 27H24Z" fill="#ffffff" />
    </svg>
  ),
  miro: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#FFD02F" />
      <path d="M14 13L20 35L24 23L19 13H14Z" fill="#050038" />
      <path d="M22 13L28 35L32 23L27 13H22Z" fill="#050038" />
      <path d="M30 13L36 35H40L35 13H30Z" fill="#050038" />
      <path d="M9 13L15 35H11L7 13H9Z" fill="#050038" />
    </svg>
  ),
  intercom: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#1f8eed" />
      <rect x="14" y="16" width="3" height="16" rx="1.5" fill="#ffffff" />
      <rect x="19" y="12" width="3" height="24" rx="1.5" fill="#ffffff" />
      <rect x="24" y="14" width="3" height="20" rx="1.5" fill="#ffffff" />
      <rect x="29" y="12" width="3" height="24" rx="1.5" fill="#ffffff" />
      <rect x="34" y="16" width="3" height="16" rx="1.5" fill="#ffffff" />
    </svg>
  ),
  duolingo: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#58CC02" />
      <circle cx="19" cy="24" r="6" fill="#ffffff" />
      <circle cx="29" cy="24" r="6" fill="#ffffff" />
      <circle cx="19" cy="24" r="3" fill="#4B4B4B" />
      <circle cx="29" cy="24" r="3" fill="#4B4B4B" />
      <path d="M24 26L21.5 29.5H26.5L24 26Z" fill="#FF9600" />
    </svg>
  ),
  shopify: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#95BF47" />
      <path d="M28.3 15.5L25.4 17.5C25.4 17.5 24.3 14.5 22.8 14.5C21.4 14.5 20.5 15.5 20.5 16.8C20.5 19.4 27.6 21 27.6 27.1C27.6 31.7 23.9 34.5 19.5 34.5C15.5 34.5 13.2 32.2 13.2 32.2L14.4 29C14.4 29 16.5 31.2 19.3 31.2C21 31.2 22.3 30.1 22.3 28.5C22.3 25.4 15.5 24.5 15.5 18.2C15.5 13.8 18.8 11 22.8 11C26.1 11 28.3 15.5 28.3 15.5Z" fill="#ffffff" />
    </svg>
  ),
  cohere: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#FAF1EA" />
      <circle cx="19" cy="21" r="7.5" fill="#D1664C" />
      <circle cx="29" cy="28" r="8" fill="#39594C" />
      <circle cx="28" cy="18" r="5" fill="#E8B4A2" />
    </svg>
  ),
  notion: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M12 12L31 10.5C33 10.3 34 11.5 34 13.5V33.5C34 35.5 32.5 36.5 30.5 36.5L12 37.5C10 37.6 9 36.5 9 34.5V15C9 13 10 12 12 12Z" fill="#000000" />
      <path d="M16 16.5H20V31.5H16V16.5Z" fill="#ffffff" />
      <path d="M20 16.5L29 27.5V16.5H32V31.5H28L19 20.5V31.5" fill="#ffffff" />
    </svg>
  ),
  docker: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#0b132b" />
      <rect x="12" y="21" width="4" height="4" rx="0.5" fill="#2496ED" />
      <rect x="17" y="21" width="4" height="4" rx="0.5" fill="#2496ED" />
      <rect x="22" y="21" width="4" height="4" rx="0.5" fill="#2496ED" />
      <rect x="17" y="16" width="4" height="4" rx="0.5" fill="#2496ED" />
      <rect x="22" y="16" width="4" height="4" rx="0.5" fill="#2496ED" />
      <rect x="22" y="11" width="4" height="4" rx="0.5" fill="#2496ED" />
      <path d="M9 26C11 26 13 28 17 28C21 28 23 27 27 27C31 27 34 29 39 28C40 28 41 27.5 41 27C41 33 34 37 24 37C14 37 8 32 9 26Z" fill="#2496ED" />
    </svg>
  ),
  airtable: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M23 11L12 18V28L23 21V11Z" fill="#FCB400" />
      <path d="M25 11L36 18V28L25 21V11Z" fill="#18BFFF" />
      <path d="M12 30L23 24V37L12 30Z" fill="#F82B60" />
      <path d="M36 30L25 24V37L36 30Z" fill="#20C933" />
    </svg>
  ),
  okta: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#00297A" />
      <circle cx="24" cy="24" r="10.5" stroke="#007DC1" strokeWidth="4.5" fill="none" />
      <circle cx="24" cy="24" r="5" fill="#ffffff" />
    </svg>
  ),
  figma: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#1e1e1e" />
      <path d="M18 10H24V17H18C16.07 17 14.5 15.43 14.5 13.5C14.5 11.57 16.07 10 18 10Z" fill="#F24E1E" />
      <path d="M24 10H30C31.93 10 33.5 11.57 33.5 13.5C33.5 15.43 31.93 17 30 17H24V10Z" fill="#FF7262" />
      <path d="M18 17H24V24H18C16.07 24 14.5 22.43 14.5 20.5C14.5 18.57 16.07 17 18 17Z" fill="#A259FF" />
      <circle cx="28.75" cy="20.5" r="4.75" fill="#1ABCFE" />
      <path d="M18 24H24V28.75C24 30.68 22.43 32.25 20.5 32.25C18.57 32.25 17 30.68 17 28.75C17 26.82 18.57 24 18 24Z" fill="#0ACF83" />
    </svg>
  ),
  cursor: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#000000" />
      <path d="M24 10L36 17V31L24 38L12 31V17L24 10Z" fill="#18181b" stroke="#ffffff" strokeWidth="1.5" />
      <path d="M24 10V24L36 17" stroke="#ffffff" strokeWidth="1.5" />
      <path d="M24 24L12 17" stroke="#ffffff" strokeWidth="1.5" />
      <path d="M24 24V38" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  ),
  temporal: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#111827" />
      <circle cx="16" cy="24" r="5" fill="#00ffff" />
      <circle cx="32" cy="24" r="5" fill="#00ffff" />
      <path d="M16 24H32" stroke="#00ffff" strokeWidth="3" />
      <circle cx="24" cy="16" r="3.5" fill="#ffffff" />
      <circle cx="24" cy="32" r="3.5" fill="#ffffff" />
    </svg>
  ),
  twilio: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#F22F46" />
      <circle cx="19" cy="19" r="4" fill="#ffffff" />
      <circle cx="29" cy="19" r="4" fill="#ffffff" />
      <circle cx="19" cy="29" r="4" fill="#ffffff" />
      <circle cx="29" cy="29" r="4" fill="#ffffff" />
    </svg>
  ),
  mongodb: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#001E2B" />
      <path d="M24 8C24 8 16 16 16 26C16 33 21 38 24 40C27 38 32 33 32 26C32 16 24 8 24 8Z" fill="#00ED64" />
      <path d="M24 10V38C23.5 38 23 37.5 22 36C22 36 21 27 24 10Z" fill="#ffffff" opacity="0.4" />
    </svg>
  ),
  brex: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#000000" />
      <path d="M13 14H24C28.4 14 32 17.6 32 22C32 24.5 30.8 26.8 29 28.2C31.5 29.5 33 32.1 33 35C33 39.4 29.4 43 25 43H13V14Z" fill="#F03D24" />
      <path d="M19 19V24H23C24.4 24 25.5 22.9 25.5 21.5C25.5 20.1 24.4 19 23 19H19Z" fill="#000000" />
      <path d="M19 29V35H24C25.7 35 27 33.7 27 32C27 30.3 25.7 29 24 29H19Z" fill="#000000" />
    </svg>
  ),
  bret: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#000000" />
      <path d="M13 14H24C28.4 14 32 17.6 32 22C32 24.5 30.8 26.8 29 28.2C31.5 29.5 33 32.1 33 35C33 39.4 29.4 43 25 43H13V14Z" fill="#F03D24" />
      <path d="M19 19V24H23C24.4 24 25.5 22.9 25.5 21.5C25.5 20.1 24.4 19 23 19H19Z" fill="#000000" />
      <path d="M19 29V35H24C25.7 35 27 33.7 27 32C27 30.3 25.7 29 24 29H19Z" fill="#000000" />
    </svg>
  ),
  stripe: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#635BFF" />
      <path d="M21.5 19.5C21.5 17.8 23 17 24.8 17C27.2 17 29.2 17.8 30.8 18.8V13.8C28.8 13 26.8 12.5 24.5 12.5C18.8 12.5 15.2 15.5 15.2 20.2C15.2 27.5 25.2 26.2 25.2 29.8C25.2 31.8 23.2 32.5 21.2 32.5C18.2 32.5 15.8 31.2 14 29.8V35C16.2 36 18.8 36.5 21.5 36.5C27.5 36.5 31.5 33.5 31.5 28.5C31.5 20.8 21.5 22.2 21.5 19.5Z" fill="#ffffff" />
    </svg>
  ),
  openai: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#10A37F" />
      <circle cx="24" cy="24" r="11" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="6 3" fill="none" />
      <circle cx="24" cy="24" r="5" fill="#ffffff" />
    </svg>
  ),
  google: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M34 24.2C34 23.5 33.9 22.8 33.8 22.2H24V26.2H29.6C29.4 27.4 28.6 28.5 27.5 29.2V31.8H30.8C32.8 30 34 27.3 34 24.2Z" fill="#4285F4" />
      <path d="M24 34.5C26.8 34.5 29.2 33.5 30.8 31.8L27.5 29.2C26.6 29.8 25.4 30.2 24 30.2C21.3 30.2 19 28.4 18.2 25.9H14.8V28.6C16.5 32 20 34.5 24 34.5Z" fill="#34A853" />
      <path d="M18.2 25.9C18 25.2 17.8 24.6 17.8 24C17.8 23.4 18 22.8 18.2 22.1V19.4H14.8C14.1 20.8 13.8 22.3 13.8 24C13.8 25.7 14.1 27.2 14.8 28.6L18.2 25.9Z" fill="#FBBC05" />
      <path d="M24 17.8C25.5 17.8 26.9 18.3 27.9 19.3L30.9 16.3C29.1 14.7 26.8 13.5 24 13.5C20 13.5 16.5 16 14.8 19.4L18.2 22.1C19 19.6 21.3 17.8 24 17.8Z" fill="#EA4335" />
    </svg>
  ),
  apple: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#000000" />
      <path d="M28.5 10C27.5 11.2 26 12 24.5 11.8C24.3 10.3 25 8.9 26 8C27 7.1 28.6 6.5 29.8 6.5C30 8 29.3 9.4 28.5 10ZM31.8 24.8C31.8 21.2 34.8 19.5 35 19.3C33.3 16.9 30.8 16.5 29.9 16.5C27.8 16.3 25.7 17.8 24.6 17.8C23.5 17.8 21.8 16.5 20.1 16.5C17.8 16.5 15.7 17.8 14.5 19.9C12.1 24.1 13.9 30.4 16.2 33.7C17.3 35.3 18.6 37.1 20.3 37C22 36.9 22.6 35.9 24.6 35.9C26.6 35.9 27.1 37 28.9 37C30.7 37 31.8 35.4 32.9 33.8C34.2 31.9 34.7 30.1 34.8 30C34.6 29.9 31.8 28.8 31.8 24.8Z" fill="#ffffff" />
    </svg>
  ),
  microsoft: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
      <rect x="13" y="13" width="10" height="10" fill="#F25022" />
      <rect x="25" y="13" width="10" height="10" fill="#7FBA00" />
      <rect x="13" y="25" width="10" height="10" fill="#00A4EF" />
      <rect x="25" y="25" width="10" height="10" fill="#FFB900" />
    </svg>
  ),
  amazon: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#131921" />
      <path d="M19.5 22C19.5 19.5 21.5 18 24 18C26.5 18 28.5 19.5 28.5 22V28H26V26.5C25.2 27.5 24 28 22.5 28C20.5 28 19 26.8 19 24.8C19 22.8 20.8 21.8 23 21.8L26 21.8V21.5C26 20.2 25 19.5 23.8 19.5C22.6 19.5 21.8 20 21.5 21L19.5 22ZM26 23.5L23.5 23.5C22.2 23.5 21.5 24 21.5 24.8C21.5 25.5 22.2 26 23.2 26C24.5 26 25.8 25.2 26 24V23.5Z" fill="#ffffff" />
      <path d="M12 32C17 35.5 26 36.5 34 32" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M31.5 30L34.5 32L32 34.5" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  netflix: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="#000000" />
      <path d="M16 10H20V38H16V10Z" fill="#E50914" />
      <path d="M28 10H32V38H28V10Z" fill="#E50914" />
      <path d="M16 10L32 38H28L16 10Z" fill="#B81D24" />
    </svg>
  ),
  spotify: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} rx={10} fill="#1DB954" />
      <path d="M32.5 20.5C25.5 16.5 16 16 11 17.5" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 25C24 21.5 16 21 12 22.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M27.5 29.5C22.5 26.5 16 26 13 27.2" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  posthog: (size) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} rx={10} fill="#1d1f27" />
      <path d="M12 24C12 17.3726 17.3726 12 24 12C30.6274 12 36 17.3726 36 24C36 30.6274 30.6274 36 24 36H12V24Z" fill="#F54E00" />
      <circle cx="20" cy="22" r="2.5" fill="#ffffff" />
      <circle cx="28" cy="22" r="2.5" fill="#ffffff" />
      <path d="M19 28C20.5 30 23.5 30 25 28" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
};

// ==========================================
// 2. BRAND COLOR PALETTES FOR DYNAMIC AVATARS
// ==========================================
const COMPANY_COLORS = {
  amazon: { bg: '#fff7ed', text: '#ea580c', letter: 'A' },
  airbnb: { bg: '#fef2f2', text: '#ef4444', letter: 'A' },
  google: { bg: '#eff6ff', text: '#2563eb', letter: 'G' },
  netflix: { bg: '#fef2f2', text: '#dc2626', letter: 'N' },
  microsoft: { bg: '#f0fdf4', text: '#16a34a', letter: 'M' },
  apple: { bg: '#f8fafc', text: '#0f172a', letter: 'A' },
  stripe: { bg: '#eef2ff', text: '#4f46e5', letter: 'S' },
  openai: { bg: '#ecfdf5', text: '#059669', letter: 'O' },
  anthropic: { bg: '#fdf2f8', text: '#db2777', letter: 'A' },
  figma: { bg: '#ffffff', text: '#000000', letter: 'F' },
  vercel: { bg: '#000000', text: '#ffffff', letter: 'V' },
  spotify: { bg: '#ecfdf5', text: '#10b981', letter: 'S' },
  databricks: { bg: '#fef2f2', text: '#ef4444', letter: 'D' },
  cursor: { bg: '#000000', text: '#ffffff', letter: 'C' },
  bret: { bg: '#000000', text: '#f03d24', letter: 'B' },
  brex: { bg: '#000000', text: '#f03d24', letter: 'B' },
  palantir: { bg: '#0f172a', text: '#ffffff', letter: 'P' },
  miro: { bg: '#ffd02f', text: '#050038', letter: 'M' },
  runway: { bg: '#000000', text: '#ffffff', letter: 'R' },
  supabase: { bg: '#1c1c1c', text: '#3ecf8e', letter: 'S' },
  duolingo: { bg: '#58cc02', text: '#ffffff', letter: 'D' },
  temporal: { bg: '#111827', text: '#00ffff', letter: 'T' },
  intercom: { bg: '#1f8eed', text: '#ffffff', letter: 'I' },
  cohere: { bg: '#39594c', text: '#ffffff', letter: 'C' },
  twilio: { bg: '#f22f46', text: '#ffffff', letter: 'T' },
  notion: { bg: '#000000', text: '#ffffff', letter: 'N' },
  airtable: { bg: '#ffffff', text: '#18bfff', letter: 'A' },
  mongodb: { bg: '#001e2b', text: '#00ed64', letter: 'M' },
  docker: { bg: '#0b132b', text: '#2496ed', letter: 'D' },
  okta: { bg: '#00297a', text: '#ffffff', letter: 'O' },
  posthog: { bg: '#1d1f27', text: '#f54e00', letter: 'P' },
  coinbase: { bg: '#eef4ff', text: '#0052ff', letter: 'C' },
  snap: { bg: '#fffee0', text: '#000000', letter: 'S' },
  grafana: { bg: '#fff7ed', text: '#f46800', letter: 'G' },
  datadog: { bg: '#f5f3ff', text: '#632ca6', letter: 'D' },
  cloudflare: { bg: '#fff7ed', text: '#f38020', letter: 'C' },
  snowflake: { bg: '#f0f9ff', text: '#29b5e8', letter: 'S' },
  elastic: { bg: '#f0fdfa', text: '#005571', letter: 'E' },
  crowdstrike: { bg: '#fef2f2', text: '#e01e26', letter: 'C' },
  gitlab: { bg: '#fff7ed', text: '#fc6d26', letter: 'G' },
  deel: { bg: '#eff6ff', text: '#15357a', letter: 'D' },
  linear: { bg: '#eef2ff', text: '#5e6ad2', letter: 'L' },
  ramp: { bg: '#000000', text: '#e2f952', letter: 'R' },
  canva: { bg: '#ecfeff', text: '#00c4cc', letter: 'C' },
  reddit: { bg: '#fff7ed', text: '#ff4500', letter: 'R' },
  scale: { bg: '#000000', text: '#d946ef', letter: 'S' },
  affirm: { bg: '#eff6ff', text: '#004bff', letter: 'A' },
  docusign: { bg: '#eff6ff', text: '#002d72', letter: 'D' },
  sentry: { bg: '#faf5ff', text: '#ff3e6c', letter: 'S' },
  discord: { bg: '#eef2ff', text: '#5865f2', letter: 'D' },
  slack: { bg: '#fdf4ff', text: '#4a154b', letter: 'S' },
  github: { bg: '#181717', text: '#ffffff', letter: 'G' }
};

/** Normalizes company key string for matching */
export function getCompanyKey(name) {
  if (!name) return '';
  const lower = String(name).toLowerCase().trim();
  if (lower.includes('coinbase')) return 'coinbase';
  if (lower.includes('snap') || lower.includes('snapchat')) return 'snap';
  if (lower.includes('grafana')) return 'grafana';
  if (lower.includes('anthropic') || lower.includes('claude')) return 'anthropic';
  if (lower.includes('datadog')) return 'datadog';
  if (lower.includes('databricks')) return 'databricks';
  if (lower.includes('cloudflare')) return 'cloudflare';
  if (lower.includes('snowflake')) return 'snowflake';
  if (lower.includes('elastic') || lower.includes('elasticsearch')) return 'elastic';
  if (lower.includes('crowdstrike')) return 'crowdstrike';
  if (lower.includes('gitlab')) return 'gitlab';
  if (lower.includes('deel')) return 'deel';
  if (lower.includes('linear')) return 'linear';
  if (lower.includes('ramp')) return 'ramp';
  if (lower.includes('canva')) return 'canva';
  if (lower.includes('reddit')) return 'reddit';
  if (lower.includes('airbnb')) return 'airbnb';
  if (lower.includes('scale ai') || lower === 'scale') return 'scale';
  if (lower.includes('affirm')) return 'affirm';
  if (lower.includes('docusign')) return 'docusign';
  if (lower.includes('sentry')) return 'sentry';
  if (lower.includes('discord')) return 'discord';
  if (lower.includes('slack')) return 'slack';
  if (lower.includes('github')) return 'github';
  if (lower.includes('posthog')) return 'posthog';
  if (lower.includes('palantir')) return 'palantir';
  if (lower.includes('supabase')) return 'supabase';
  if (lower.includes('vercel')) return 'vercel';
  if (lower.includes('runway')) return 'runway';
  if (lower.includes('miro')) return 'miro';
  if (lower.includes('intercom')) return 'intercom';
  if (lower.includes('duolingo')) return 'duolingo';
  if (lower.includes('cohere')) return 'cohere';
  if (lower.includes('notion')) return 'notion';
  if (lower.includes('docker')) return 'docker';
  if (lower.includes('airtable')) return 'airtable';
  if (lower.includes('okta') || lower.includes('our team')) return 'okta';
  if (lower.includes('figma')) return 'figma';
  if (lower.includes('cursor') || lower.includes('anysphere')) return 'cursor';
  if (lower.includes('temporal')) return 'temporal';
  if (lower.includes('twilio')) return 'twilio';
  if (lower.includes('mongo')) return 'mongodb';
  if (lower.includes('brex') || lower.includes('bret')) return 'brex';
  if (lower.includes('stripe')) return 'stripe';
  if (lower.includes('openai')) return 'openai';
  if (lower.includes('google') || lower.includes('alphabet')) return 'google';
  if (lower.includes('apple')) return 'apple';
  if (lower.includes('microsoft')) return 'microsoft';
  if (lower.includes('amazon') || lower.includes('aws')) return 'amazon';
  if (lower.includes('netflix')) return 'netflix';
  if (lower.includes('spotify')) return 'spotify';
  if (lower.includes('shopify')) return 'shopify';
  return lower.replace(/[^a-z0-9]/g, '');
}

/** Resolve a logo URL from any of the shapes the app receives (API or static data). */
export function resolveLogoUrl(source) {
  if (!source) return null;
  const compName = typeof source === 'string' ? source : (source.company || source.name || '');
  const key = getCompanyKey(compName);

  if (typeof source === 'object' && (source.company_logo || source.logoUrl || source.companyLogo)) {
    return source.company_logo || source.logoUrl || source.companyLogo;
  }

  // Smart CDN favicon fallback for long-tail companies
  const cleanSlug = compName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanSlug) {
    return `https://www.google.com/s2/favicons?domain=${cleanSlug}.com&sz=128`;
  }

  return null;
}

export function letterAvatar(name) {
  const key = getCompanyKey(name);
  if (COMPANY_COLORS[key]) return COMPANY_COLORS[key];
  
  // Dynamic harmonious gradient letter avatar
  const colors = [
    { bg: '#fee2e2', text: '#b91c1c' },
    { bg: '#fef3c7', text: '#b45309' },
    { bg: '#dcfce7', text: '#15803d' },
    { bg: '#e0e7ff', text: '#4338ca' },
    { bg: '#f3e8ff', text: '#7e22ce' },
    { bg: '#ffe4e6', text: '#be123c' },
    { bg: '#ccfbf1', text: '#0f766e' }
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = (name.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  }
  const color = colors[Math.abs(hash) % colors.length];
  return { ...color, letter: (name || 'C').charAt(0).toUpperCase() };
}

/**
 * High-performance CompanyLogo component:
 * 1. Always checks the high-fidelity SVG icon library for immediate, crisp rendering.
 * 2. Falls back to external image URL or domain icon if provided.
 * 3. Gracefully falls back to stylized letter avatar on failure.
 */
export default function CompanyLogo({ src, logoUrl, name, company, size = 38, radius = 8, style }) {
  const [failed, setFailed] = useState(false);
  const compName = name || company || '';
  const compKey = getCompanyKey(compName);

  // If a built-in crisp SVG is available for this company, render it directly for guaranteed 100% display!
  if (compKey && BRAND_SVGS[compKey]) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          ...style
        }}
      >
        {BRAND_SVGS[compKey](size)}
      </div>
    );
  }

  const initialSrc = src || logoUrl || resolveLogoUrl(compName);

  const box = {
    width: size,
    height: size,
    borderRadius: radius,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...style
  };

  if (initialSrc && !failed) {
    return (
      <img
        src={initialSrc}
        alt={compName ? `${compName} logo` : 'Company logo'}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{
          ...box,
          objectFit: 'contain',
          background: '#ffffff',
          padding: size > 24 ? '3px' : '1px',
          border: '1px solid rgba(0,0,0,0.08)'
        }}
      />
    );
  }

  const avatar = letterAvatar(compName);
  return (
    <div
      style={{
        ...box,
        background: avatar.bg,
        color: avatar.text,
        fontWeight: 800,
        fontSize: Math.max(10, Math.round(size * 0.42)),
        border: '1px solid rgba(0,0,0,0.06)'
      }}
    >
      {avatar.letter}
    </div>
  );
}
