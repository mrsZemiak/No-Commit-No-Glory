import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewResponse {
    question: mongoose.Schema.Types.ObjectId; //References to Question model
    answer: string | number; //Text, Yes/No, or Rating
}

export interface IReview extends Document {
    paper: mongoose.Schema.Types.ObjectId;
    reviewer: mongoose.Schema.Types.ObjectId;
    responses: IReviewResponse[]; // array of answers to questions
    comments?: string; // additional comments
    recommendation: 'publish' | 'publish_with_changes' | 'reject' | 'no_recommendation'; //ADDED no recommendation in case the reviewer didn't pick one
    created_at: Date;
    isDraft: boolean; //ADDED THIS - check if it's a draft
}

const ReviewSchema: Schema = new Schema({
    paper: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    responses: [
        {
            question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
            answer: { type: Schema.Types.Mixed, required: false, default: null }, // handles text, yes/no, and ratings //CHANGED TO FALSE TO ALLOW FOR DRAFT SAVING
        },
    ],
    comments: { type: String },
    recommendation: {
        type: String,
        enum: ['publish', 'publish_with_changes', 'reject', 'no_recommendation'],
        required: true,
    },
    created_at: { type: Date, default: Date.now },
    isDraft: { type: Boolean, default: true }, //ADDED THIS FOR FUNCTIONALITY
},{ collection: 'reviews' });

export default mongoose.model<IReview>('Review', ReviewSchema);