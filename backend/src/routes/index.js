import { Router } from "express";

import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { appointmentsRouter } from "../modules/appointments/appointments.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { billingRouter } from "../modules/billing/billing.routes.js";
import { inventoryRouter } from "../modules/inventory/inventory.routes.js";
import { laboratoryRouter } from "../modules/laboratory/laboratory.routes.js";
import { opdRouter } from "../modules/opd/opd.routes.js";
import { patientsRouter } from "../modules/patients/patients.routes.js";
import { pharmacyRouter } from "../modules/pharmacy/pharmacy.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use(authenticate);
apiRouter.use("/patients", patientsRouter);
apiRouter.use("/appointments", appointmentsRouter);
apiRouter.use("/opd", opdRouter);
apiRouter.use("/lab", laboratoryRouter);
apiRouter.use("/billing", billingRouter);
apiRouter.use("/pharmacy", pharmacyRouter);
apiRouter.use("/inventory", inventoryRouter);
apiRouter.use("/users", usersRouter);

apiRouter.get("/system/overview", authorize(["admin", "doctor", "reception", "pharmacy", "accounts"]), (_req, res) => {
  res.json({
    hospital: "Shanti-Ratnam Healing With Happiness",
    phase: "Phase 6",
    modulesReady: ["auth", "rbac", "patients", "appointments", "opd", "lab", "billing", "pharmacy", "inventory"],
    status: "active"
  });
});

export { apiRouter };
