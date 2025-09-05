import { ApiError, asyncHandler } from "../utils/index.js";
import { safeLogger } from "../config/logger.js";
import * as jose from "jose";
import { env } from "../config/env.js";
const JWKS = jose.createRemoteJWKSet(
  new URL("http://localhost:3001/api/v1/jwks/.well-known/jwks.json"),
  {
    cacheMaxAge: 1000 * 60 * 60 * 24,
  }
);

function extractToken(req) {
  const authHeader = req.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

async function verifyToken(token) {
  try {
    const { payload } = await jose.jwtVerify(token, JWKS, {
      algorithms: ["RS256"],
    });
    return payload;
  } catch (error) {
    safeLogger.error("Token verification failed in middleware", {
      error: error.message,
      tokenLength: token?.length,
    });
    throw new ApiError(401, error.message);
  }
}

/**
 * JWT Authentication Middleware
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw new ApiError(401, "Access token required");
  }

  try {
    const decoded = await verifyToken(token);

    let user = { id: decoded.userId, role: decoded.role, isActive: true };

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (!user?.isActive) {
      throw new ApiError(401, "User account is deactivated");
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, "Invalid or expired token sss"));
    }
  }
});

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      safeLogger.warn("Role access denied", {
        userId: req.user.id,
        userRole,
        requiredRoles: roles,
        path: req.path,
      });

      return next(new ApiError(403, "Insufficient permissions"));
    }

    next();
  };
};
