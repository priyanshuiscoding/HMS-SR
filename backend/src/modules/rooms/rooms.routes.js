import { Router } from "express";

import { authorize } from "../../middleware/rbac.js";
import {
  assignBedHandler,
  createRoomHandler,
  dischargeBedHandler,
  roomAvailabilityHandler,
  roomDetailsHandler,
  roomMastersHandler,
  listRoomsHandler
} from "./rooms.controller.js";

const roomsRouter = Router();

roomsRouter.get("/masters", authorize(["admin", "doctor", "reception", "accounts", "nursing"]), roomMastersHandler);
roomsRouter.get("/availability", authorize(["admin", "doctor", "reception", "accounts", "nursing"]), roomAvailabilityHandler);
roomsRouter.get("/", authorize(["admin", "doctor", "reception", "accounts", "nursing"]), listRoomsHandler);
roomsRouter.get("/:id", authorize(["admin", "doctor", "reception", "accounts", "nursing"]), roomDetailsHandler);
roomsRouter.post("/", authorize(["admin", "accounts"]), createRoomHandler);
roomsRouter.post("/:roomId/beds/:bedId/assign", authorize(["admin", "doctor", "reception", "nursing"]), assignBedHandler);
roomsRouter.post("/:roomId/beds/:bedId/discharge", authorize(["admin", "doctor", "reception", "nursing"]), dischargeBedHandler);

export { roomsRouter };
