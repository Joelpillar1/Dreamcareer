import React, { useState, useEffect } from 'react';

// ==========================================
// 1. BUILT-IN VECTOR BRAND LOGOS (100% Reliable SVG Icons)
// ==========================================
const BRAND_SVGS = {
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
  posthog: { bg: '#1d1f27', text: '#f54e00', letter: 'P' }
};

/** Normalizes company key string for matching */
function getCompanyKey(name) {
  if (!name) return '';
  const lower = String(name).toLowerCase().trim();
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
  return lower;
}

/** Resolve a logo URL from any of the shapes the app receives (API or static data). */
export function resolveLogoUrl(source) {
  if (!source) return null;
  if (typeof source === 'string') {
    const key = getCompanyKey(source);
    if (key && BRAND_SVGS[key]) {
      return `/${key}-logo.png`;
    }
    return source;
  }
  const compName = source.company || source.name || '';
  const key = getCompanyKey(compName);
  if (key && BRAND_SVGS[key]) {
    return `/${key}-logo.png`;
  }
  return source.company_logo || source.logoUrl || source.companyLogo || null;
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
 * 2. Falls back to external image URL if provided.
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
