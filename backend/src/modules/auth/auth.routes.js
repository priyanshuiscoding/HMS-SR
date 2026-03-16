import { Router } from "express";

import { authenticate } from "../../middleware/auth.js";
import {
  changePasswordHandler,
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  resetPasswordHandler
} from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/login", loginHandler);
authRouter.post("/logout", logoutHandler);
authRouter.post("/refresh", refreshHandler);
authRouter.post("/forgot-password", forgotPasswordHandler);
authRouter.post("/reset-password", resetPasswordHandler);
authRouter.put("/change-password", authenticate, changePasswordHandler);
authRouter.get("/me", authenticate, meHandler);

export { authRouter };
