import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewResponse {
    question: mongoose.Schema.Types.ObjectId; // References a Question
    answer: string | number; // Text, Yes/No, or Rating
}

export interface IReview extends Document {
    paper: mongoose.Schema.Types.ObjectId;
    reviewer: mongoose.Schema.Types.ObjectId;
    responses: IReviewResponse[]; // Array of answers to questions
    comments?: string; // Additional comments
    recommendation: 'publish' | 'publish_with_changes' | 'reject';
    created_at: Date;
}

const ReviewSchema: Schema = new Schema({
    paper: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    responses: [
        {
            question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
            answer: { type: Schema.Types.Mixed, required: true }, // Handles text, yes/no, and ratings
        },
    ],
    comments: { type: String },
    recommendation: {
        type: String,
        enum: ['publish', 'publish_with_changes', 'reject'],
        required: true,
    },
    created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IReview>('Review', ReviewSchema);