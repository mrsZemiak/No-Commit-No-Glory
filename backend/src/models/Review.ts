import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    rating: number;
    comments: string;
    recommendation: string;
    paper: mongoose.Schema.Types.ObjectId;
    reviewer: mongoose.Schema.Types.ObjectId;
    reviewed_at: Date;
    updated_at: Date;
}

const ReviewSchema: Schema = new Schema({
    rating: { type: Array, required: true },
    comments: { type: String, required: true },
    recommendation: { type: String, required: true },
    paper: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper', required: true },  // Links to the Paper
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reviewer user
    reviewed_at: { type: Date, default: Date.now },
    updated_at: { type: Date }
});

export default mongoose.model<IReview>('Review', ReviewSchema);