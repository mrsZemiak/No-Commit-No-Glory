import mongoose, { Schema, Document } from 'mongoose';

export enum PaperStatus {
    Draft = 'draft',
    Submitted = 'submitted',
    UnderReview = 'under review',
    Accepted = 'accepted',
    Rejected = 'rejected',
    AcceptedWithChanges = 'accepted with changes', //Added new status
}

export interface IPaper extends Document {
    title: string;
    status: PaperStatus;
    submission_date: Date;
    file_link: string;
    final_submission: boolean;
    user: mongoose.Schema.Types.ObjectId;
    category: mongoose.Schema.Types.ObjectId;
    conference: mongoose.Schema.Types.ObjectId;
    abstract: string;
    keywords: string[];
    authors: { firstName: string; lastName: string }[];
    reviewer?: mongoose.Schema.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}

const PaperSchema: Schema = new Schema({
    title: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: Object.values(PaperStatus),
        default: PaperStatus.Draft,
    },
    submission_date: { type: Date, required: true },
    file_link: { type: String, required: true },
    final_submission: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    conference: { type: mongoose.Schema.Types.ObjectId, ref: 'Conference', required: true },
    abstract: { type: String, required: true },
    keywords: { type: [String], required: true },
    authors: [{
        firstName: { type: String, required: true },
        lastName: { type: String, required: true }
    }],
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Assigned by admin
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export default mongoose.model<IPaper>('Paper', PaperSchema);