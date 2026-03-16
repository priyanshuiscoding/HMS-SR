import {
  changePassword,
  getCurrentUser,
  issueTokens,
  logoutUser,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword
} from "./auth.service.js";

export function loginHandler(req, res, next) {
  try {
    const result = issueTokens(req.body);
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export function logoutHandler(req, res, next) {
  try {
    logoutUser(req.cookies.refreshToken);
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully." });
  } catch (error) {
    next(error);
  }
}

export function refreshHandler(req, res, next) {
  try {
    const result = refreshAccessToken(req.cookies.refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export function meHandler(req, res, next) {
  try {
    res.json({ user: getCurrentUser(req.user.email) });
  } catch (error) {
    next(error);
  }
}

export function forgotPasswordHandler(req, res, next) {
  try {
    res.json(requestPasswordReset(req.body.email));
  } catch (error) {
    next(error);
  }
}

export function resetPasswordHandler(req, res, next) {
  try {
    res.json(resetPassword(req.body));
  } catch (error) {
    next(error);
  }
}

export function changePasswordHandler(req, res, next) {
  try {
    res.json(changePassword(req.user.email, req.body));
  } catch (error) {
    next(error);
  }
}
