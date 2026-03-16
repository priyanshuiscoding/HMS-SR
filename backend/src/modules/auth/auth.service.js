import jwt from "jsonwebtoken";

import { demoUsers } from "../../config/constants.js";
import { env } from "../../config/env.js";

const refreshStore = new Map();
const resetOtpStore = new Map();

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.publicMessage = message;
  return error;
}

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpires }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      type: "refresh"
    },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpires }
  );
}

export function issueTokens({ email, password }) {
  const user = demoUsers.find(
    (entry) => entry.email.toLowerCase() === String(email).toLowerCase() && entry.password === password
  );

  if (!user) {
    throw createError("Invalid email or password.", 401);
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  refreshStore.set(refreshToken, user.email);

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user)
  };
}

export function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw createError("Refresh token is required.", 401);
  }

  if (!refreshStore.has(refreshToken)) {
    throw createError("Refresh token is not active.", 401);
  }

  const payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  const user = demoUsers.find((entry) => entry.email === payload.email);

  if (!user) {
    throw createError("User no longer exists.", 404);
  }

  return { accessToken: createAccessToken(user) };
}

export function logoutUser(refreshToken) {
  if (refreshToken) {
    refreshStore.delete(refreshToken);
  }
}

export function getCurrentUser(email) {
  const user = demoUsers.find((entry) => entry.email === email);

  if (!user) {
    throw createError("User not found.", 404);
  }

  return sanitizeUser(user);
}

export function requestPasswordReset(email) {
  const user = demoUsers.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());

  if (!user) {
    return { message: "If the account exists, an OTP reset flow has been initiated." };
  }

  const otp = "123456";
  resetOtpStore.set(user.email, otp);

  return {
    message: "OTP generated for foundation mode.",
    otp
  };
}

export function resetPassword({ email, otp, newPassword }) {
  const expectedOtp = resetOtpStore.get(email);

  if (!expectedOtp || expectedOtp !== otp) {
    throw createError("Invalid OTP.", 400);
  }

  const user = demoUsers.find((entry) => entry.email === email);

  if (!user) {
    throw createError("User not found.", 404);
  }

  user.password = newPassword;
  resetOtpStore.delete(email);

  return { message: "Password updated successfully." };
}

export function changePassword(email, payload) {
  const user = demoUsers.find((entry) => entry.email === email);

  if (!user) {
    throw createError("User not found.", 404);
  }

  if (user.password !== payload.currentPassword) {
    throw createError("Current password is incorrect.", 400);
  }

  user.password = payload.newPassword;
  return { message: "Password changed successfully." };
}
