import { createRemoteJWKSet, jwtVerify } from "jose";
import { ApiError } from "../utils/index.js";
import { asyncHandler } from "../utils/index.js";
import { safeLogger } from "../utils/index.js";
import env from "../config/index.js";

const JWKS = createRemoteJWKSet(new URL(env.auth.jwksUrl), {
  cacheMaxAge: env.auth.maxCacheAge,
  cooldownDuration: env.auth.cooldownDuration,
});

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw new ApiError(401, "Access token required");
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: env.auth.issuer,
      algorithms: ["RS256"],
      audience: env.auth.audience,
    });

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      type: payload.type,
      permissions: payload.permissions || [],
    };

    safeLogger.debug("JWT verified successfully", {
      userId: req.user.id,
      role: req.user.role,
      correlationId: req.correlationId,
    });

    next();
  } catch (error) {
    safeLogger.warn("JWT verification failed", {
      error: error.message,
      correlationId: req.correlationId,
    });

    if (error.code === "ERR_JWK_INVALID") {
      throw new ApiError(401, "Invalid token signature");
    } else if (error.code === "ERR_JWT_EXPIRED") {
      throw new ApiError(401, "Token expired");
    } else {
      throw new ApiError(401, "Invalid token");
    }
  }
});

export const requireRole = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const userRole = req.user.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      safeLogger.warn("Role access denied", {
        userId: req.user.id,
        userRole,
        allowedRoles,
        path: req.path,
        correlationId: req.correlationId,
      });

      throw new ApiError(403, "Insufficient permissions");
    }

    next();
  });
};
