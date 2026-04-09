import {
  assignBed,
  createRoom,
  dischargeBed,
  getRoomDetails,
  getRoomMasters,
  getRoomsAvailability,
  listRooms
} from "./rooms.service.js";

export function roomMastersHandler(_req, res, next) {
  try {
    res.json(getRoomMasters());
  } catch (error) {
    next(error);
  }
}

export function listRoomsHandler(req, res, next) {
  try {
    res.json({ items: listRooms(req.query) });
  } catch (error) {
    next(error);
  }
}

export function roomAvailabilityHandler(_req, res, next) {
  try {
    res.json(getRoomsAvailability());
  } catch (error) {
    next(error);
  }
}

export function roomDetailsHandler(req, res, next) {
  try {
    res.json(getRoomDetails(req.params.id));
  } catch (error) {
    next(error);
  }
}

export function createRoomHandler(req, res, next) {
  try {
    res.status(201).json({ ...createRoom(req.body), message: "Room created successfully." });
  } catch (error) {
    next(error);
  }
}

export function assignBedHandler(req, res, next) {
  try {
    res.status(201).json({
      ...assignBed(req.params.roomId, req.params.bedId, { ...req.body, assignedBy: req.user.sub }),
      message: "Bed assigned successfully."
    });
  } catch (error) {
    next(error);
  }
}

export function dischargeBedHandler(req, res, next) {
  try {
    res.json({
      ...dischargeBed(req.params.roomId, req.params.bedId, req.body),
      message: "Bed discharged successfully."
    });
  } catch (error) {
    next(error);
  }
}
