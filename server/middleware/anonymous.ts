import { createMiddleware } from "hono/factory";
import { getCookie, setCookie } from "hono/cookie";
import { randomUUID } from "node:crypto";
import type { Context } from "hono";

// ============================================
// Anonymous Access Middleware
// ============================================
// Provides rate limiting and token management for anonymous users

type AnonymousVariables = {
  anonymousToken?: string;
  clientIp?: string;
};

// In-memory rate limit store (can be extended to Redis later)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configuration
const RATE_LIMIT_MAX = 10; // 10 requests
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Token cookie name
const ANONYMOUS_TOKEN_COOKIE = "Anonymous-Token";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// ============================================
// Token Generation
// ============================================

/**
 * Generate a high-entropy UUID-based token
 */
export function generateAnonymousToken(): string {
  return randomUUID();
}

/**
 * Verify if a token is valid (basic format check)
 */
export function isValidTokenFormat(token: string): boolean {
  // UUID v4 format check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(token);
}

// ============================================
// Rate Limiting
// ============================================

/**
 * Get client IP from request headers
 */
function getClientIp(c: Context): string {
  // Check X-Forwarded-For header first (for proxied requests)
  const forwarded = c.req.header("X-Forwarded-For");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  // Check X-Real-IP header
  const realIp = c.req.header("X-Real-IP");
  if (realIp) {
    return realIp;
  }
  
  // Default fallback
  return "unknown";
}

/**
 * Check rate limit for a given IP
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  
  if (!entry || now > entry.resetTime) {
    // New window
    const resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(ip, { count: 1, resetTime });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime };
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }
  
  // Increment count
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetTime: entry.resetTime };
}

/**
 * Cleanup expired rate limit entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}

// ============================================
// Middleware
// ============================================

/**
 * Rate limit middleware - limits requests per IP
 */
export const rateLimitMiddleware = createMiddleware<{ Variables: AnonymousVariables }>(
  async (c, next) => {
    const clientIp = getClientIp(c);
    c.set("clientIp", clientIp);
    
    const result = checkRateLimit(clientIp);
    
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      return c.json(
        {
          success: false,
          message: "请求过于频繁，请稍后再试",
          retryAfter,
        },
        429,
        {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetTime),
        }
      );
    }
    
    // Add rate limit headers
    c.res.headers.set("X-RateLimit-Remaining", String(result.remaining));
    c.res.headers.set("X-RateLimit-Reset", String(result.resetTime));
    
    await next();
  }
);

/**
 * Anonymous token middleware - generates/validates anonymous tokens
 */
export const anonymousTokenMiddleware = createMiddleware<{ Variables: AnonymousVariables }>(
  async (c, next) => {
    // Try to get existing token from cookie
    let token = getCookie(c, ANONYMOUS_TOKEN_COOKIE);
    
    // Validate existing token
    if (token && !isValidTokenFormat(token)) {
      // Invalid token format, generate new one
      token = generateAnonymousToken();
    }
    
    // Generate new token if none exists
    if (!token) {
      token = generateAnonymousToken();
    }
    
    // Set token cookie
    setCookie(c, ANONYMOUS_TOKEN_COOKIE, token, {
      maxAge: TOKEN_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
    });
    
    // Set token in context for downstream use
    c.set("anonymousToken", token);
    
    await next();
  }
);

/**
 * Combined middleware - rate limit + anonymous token
 * Use this for routes that need both
 */
export const anonymousAccessMiddleware = createMiddleware<{ Variables: AnonymousVariables }>(
  async (c, next) => {
    // Apply rate limit first
    const clientIp = getClientIp(c);
    c.set("clientIp", clientIp);
    
    const rateLimitResult = checkRateLimit(clientIp);
    
    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      return c.json(
        {
          success: false,
          message: "请求过于频繁，请稍后再试",
          retryAfter,
        },
        429,
        {
          "Retry-After": String(retryAfter),
        }
      );
    }
    
    // Then handle token
    let token = getCookie(c, ANONYMOUS_TOKEN_COOKIE);
    
    if (!token || !isValidTokenFormat(token)) {
      token = generateAnonymousToken();
    }
    
    setCookie(c, ANONYMOUS_TOKEN_COOKIE, token, {
      maxAge: TOKEN_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
    });
    
    c.set("anonymousToken", token);
    
    await next();
  }
);

// ============================================
// Helper Functions
// ============================================

/**
 * Get the anonymous token from context
 */
export function getAnonymousToken(c: { get: (key: string) => unknown }): string | undefined {
  return c.get("anonymousToken") as string | undefined;
}

/**
 * Get the client IP from context
 */
export function getClientIpFromContext(c: { get: (key: string) => unknown }): string | undefined {
  return c.get("clientIp") as string | undefined;
}
