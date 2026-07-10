// src/utils/cookieHelper.js

/**
 * Set a cookie with security flags
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration
 */
export function setCookie(name, value, days = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  // Security flags for better protection
  // Note: HttpOnly cannot be set from JavaScript (only server)
  const isProduction = import.meta.env.PROD;
  const secureFlag = isProduction ? ';Secure' : '';
  const sameSiteFlag = ';SameSite=Lax'; // Use Lax for better UX
  
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/${secureFlag}${sameSiteFlag}`;
}

/**
 * Get a cookie value
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Delete a cookie
 * @param {string} name - Cookie name
 */
export function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
}

/**
 * Check if a cookie exists
 * @param {string} name - Cookie name
 * @returns {boolean} - True if cookie exists
 */
export function hasCookie(name) {
  return getCookie(name) !== null;
}

/**
 * Get all cookies as an object
 * @returns {Object} - All cookies
 */
export function getAllCookies() {
  const cookies = {};
  document.cookie.split('; ').forEach(cookie => {
    const [key, value] = cookie.split('=');
    if (key) {
      cookies[key] = decodeURIComponent(value);
    }
  });
  return cookies;
}