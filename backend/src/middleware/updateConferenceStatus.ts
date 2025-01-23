import { Request, Response, NextFunction } from "express";
import Conference, { ConferenceStatus } from "../models/Conference";

// Core logic for updating conference statuses
export const updateConferenceStatus = async (): Promise<void> => {
  const now = new Date();

  // Update conferences to Ongoing
  await Conference.updateMany(
    {
      start_date: { $lte: now },
      end_date: { $gte: now },
      status: { $ne: ConferenceStatus.Ongoing },
    },
    { $set: { status: ConferenceStatus.Ongoing } },
  );

  // Update conferences to Completed
  await Conference.updateMany(
    { end_date: { $lt: now }, status: { $ne: ConferenceStatus.Completed } },
    { $set: { status: ConferenceStatus.Completed } },
  );
};

// Middleware wrapper
export const updateConferenceStatusMiddleware = async (
  _req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await updateConferenceStatus();
    next();
  } catch (error) {
    console.error("Error updating conference statuses:", error);
    _res
      .status(500)
      .json({ message: "Chyba pri aktualizovaní stavu konferencie", error });
  }
};
