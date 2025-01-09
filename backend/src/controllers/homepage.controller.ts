import { Request, Response } from 'express';
import Conference, { ConferenceStatus } from '../models/Conference';
import Category from '../models/Category';
import User from '../models/User';

export const getHomepageData = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Fetch the ongoing conference
    const ongoingConference = await Conference.findOne({ status: ConferenceStatus.Ongoing}).select(
      'year location university date start_date end_date deadline_submission deadline_review'
    );

    // Fetch past conferences (completed)
    const pastConferences = await Conference.find({ status: ConferenceStatus.Completed })
      .select('year start_date end_date')
      .sort({ year: -1 });

    // Fetch active categories
    const activeCategories = await Category.find({ isActive: true })
      .select('name')
      .sort({name:1});

    // Fetch active reviewers
    const reviewers = await User.find({ role: 'reviewer' }).select('firstName lastName');

    res.status(200).json({
      ongoingConference,
      pastConferences,
      activeCategories,
      reviewers: reviewers.map((reviewer) => ({
        fullName: `${reviewer.first_name} ${reviewer.last_name}`,
      })),
    });
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    res.status(500).json({ message: 'Failed to fetch homepage data', error });
  }
};