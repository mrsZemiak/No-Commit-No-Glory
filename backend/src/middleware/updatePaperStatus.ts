import Conference, { ConferenceStatus } from '../models/Conference'
import { NextFunction, Request, Response } from 'express'
import Paper, { PaperStatus } from '../models/Paper'

export const updatePaperStatus = async (): Promise<void> => {
  const currentDate = new Date();

  // Get all ongoing conferences
  const ongoingConferences = await Conference.find({ status: "Aktuálna" });

  for (const conference of ongoingConferences) {
    if (conference.deadline_submission < currentDate) {
      // Update papers to Submitted after the deadline
      await Paper.updateMany(
        { conference: conference._id, status: PaperStatus.Draft },
        { $set: { status: PaperStatus.Submitted } }
      );
    }
  }

  // Enable resubmissions for works marked "Prijaté_so_zmenami"
  await Paper.updateMany(
    { status: PaperStatus.AcceptedWithChanges },
    { $set: { resubmission_allowed: true } }
  );


}
// Middleware wrapper
export const updatePaperStatusMiddleware = async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    await updatePaperStatus();
    next();
  } catch (error) {
    console.error('Error updating conference statuses:', error);
    _res.status(500).json({ message: 'Chyba pri aktualizovaní stavu konferencie', error });
  }
};
