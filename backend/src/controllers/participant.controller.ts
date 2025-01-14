import { Response } from 'express';
import Paper, { PaperStatus } from '../models/Paper'
import { AuthRequest } from '../middleware/authenticateToken'
import Category from '../models/Category'
import Conference from '../models/Conference'

export const submitPaper = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Neautorizované. Používateľ nie je prihlásený.' });
            return;
        }

        const { title, abstract, keywords, category, conference, authors, final_version} = req.body;

        // Check if conference exists and is ongoing
        const selectedConference = await Conference.findById(conference);
        if (!selectedConference || selectedConference.status !== "Aktuálna") {
            res.status(400).json({ message: "Konferencia neexistuje alebo nie je aktuálna." });
            return;
        }

        const currentDate = new Date();

        // Check if submission deadline is valid
        if (selectedConference.deadline_submission < currentDate) {
            res.status(400).json({ message: "Deadline na odoslanie prác pre túto konferenciu už vypršal." });
            return;
        }

        // Ensure a file was uploaded
        if (!req.file) {
            res.status(400).json({ message: 'Chýba súbor na odoslanie.' });
            return;
        }

        // Set file link based on uploaded file path
        const file_link = req.file.path;

        // Set status based on final_submission flag
        const status = final_version ? PaperStatus.Submitted : PaperStatus.Draft;

        // Prevent creating new papers if the deadline has passed
        if (status === PaperStatus.Submitted && !final_version) {
            res.status(400).json({ message: "Nie je možné vytvoriť novú prácu po skončení termínu odovzdania." });
            return;
        }

        // Create the paper document
        const paper = new Paper({
            title,
            abstract,
            keywords,
            category,
            conference,
            authors,
            file_link,
            submission_date: new Date(),
            status,
            user: userId,
            final_version: !!final_version,
        });

        const savedPaper = await paper.save();

        res.status(201).json({
            message: final_version ? 'Práca bola úspešne odoslaná' : 'Práca bola uložená ako koncept',
            paper: savedPaper,
        });
    } catch (error) {
        console.error('Error submitting paper:', error);
        res.status(500).json({ message: 'Nepodarilo sa odoslať prácu', error });
    }
};

//View all papers submitted by the user
export const viewMyPapers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId; // Extract user ID from AuthRequest
        if (!userId) {
            res.status(401).json({ message: 'Neautorizované. Používateľ nie je prihlásený.' });
            return;
        }

        // Find papers belonging to the user
        const papers = await Paper.find({ user: userId }).sort({ created_at: -1 }); // Sort by most recent
        res.status(200).json(papers);
    } catch (error) {
        console.error('Error fetching user papers:', error);
        res.status(500).json({ message: 'Nepodarilo sa načítať práce', error });
    }
};

// Participant: Get a specific paper by its ID
export const getPaperById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { paperId } = req.params;

        const paper = await Paper.findById(paperId)
          .populate('category', 'name')
          .populate('conference', 'year location date');

        res.status(200).json(paper);
    } catch (error) {
        res.status(500).json({ message: 'Nepodarilo sa načítať prácu', error });
    }
};

// Edit an existing paper
export const editPaper = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { paperId } = req.params;
        const updates = req.body;

        // Check if the paper exists and belongs to the user
        const paper = await Paper.findOne({ _id: paperId, user: userId });
        if (!paper) {
            res.status(404).json({ message: 'Práca nebola nájdená alebo nemáte oprávnenie na jej úpravu.' });
            return;
        }

        // Prevent editing status, user, or final_submission directly
        delete updates.status;
        delete updates.user;

        // Update the paper
        Object.assign(paper, updates);
        const updatedPaper = await paper.save();

        res.status(200).json({
            message: 'Práca bola úspešne aktualizovaná',
            paper: updatedPaper,
        });
    } catch (error) {
        console.error('Error editing paper:', error);
        res.status(500).json({ message: 'Prácu sa nepodarilo aktualizovať', error });
    }
};

// Get Conferences (only with status "Aktuálna")
export const getConferences = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const currentDate = new Date();

        // Fetch conferences with status "Aktuálna" (active)
        const conferences = await Conference.find({
            status: "Aktuálna",
            date: { $gte: currentDate },
        }).select("year date location");

        res.status(200).json(conferences);
    } catch (error) {
        console.error("Error fetching conferences:", error);
        res.status(500).json({ message: "Nepodarilo sa načítať konferencie", error });
    }
};

// Get Categories (only active)
export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Fetch categories with isActive flag
        const categories = await Category.find({ isActive: true }).select("name");

        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Nepodarilo sa načítať sekcie", error });
    }
};
