/**
 * Centralized API Configuration
 * Single source of truth for the backend API base URL
 */
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://sih2026-skillsync-ps0044-production.up.railway.app/api/v1').trim();

// Normalize URL: Strip any trailing slashes to prevent double slashes (//) in endpoints
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');