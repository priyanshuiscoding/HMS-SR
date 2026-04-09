import {
  cancelAppointment,
  createAppointment,
  getAppointmentById,
  getAppointmentMasters,
  getAvailableSlots,
  getTodayAppointments,
  listAppointments,
  updateAppointment
} from "./appointments.service.js";

export function listAppointmentsHandler(req, res, next) {
  try {
    res.json({ items: listAppointments(req.query) });
  } catch (error) {
    next(error);
  }
}

export async function createAppointmentHandler(req, res, next) {
  try {
    const item = await createAppointment(req.body, req.user.sub);
    res.status(201).json({ item, message: "Appointment booked successfully." });
  } catch (error) {
    next(error);
  }
}

export function getAppointmentHandler(req, res, next) {
  try {
    res.json({ item: getAppointmentById(req.params.id) });
  } catch (error) {
    next(error);
  }
}

export async function updateAppointmentHandler(req, res, next) {
  try {
    res.json({ item: await updateAppointment(req.params.id, req.body), message: "Appointment updated successfully." });
  } catch (error) {
    next(error);
  }
}

export async function cancelAppointmentHandler(req, res, next) {
  try {
    res.json({ item: await cancelAppointment(req.params.id), message: "Appointment cancelled successfully." });
  } catch (error) {
    next(error);
  }
}

export function todayAppointmentsHandler(_req, res, next) {
  try {
    res.json({ items: getTodayAppointments() });
  } catch (error) {
    next(error);
  }
}

export function availableSlotsHandler(req, res, next) {
  try {
    res.json({ items: getAvailableSlots(req.query.date, req.query.doctorId) });
  } catch (error) {
    next(error);
  }
}

export function appointmentMastersHandler(_req, res, next) {
  try {
    res.json(getAppointmentMasters());
  } catch (error) {
    next(error);
  }
}
