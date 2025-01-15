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
  recommendation: 'Publikovať' | 'Publikovať_so_zmenami' | 'Odmietnuť';
  created_at: Date;
}

const ReviewSchema: Schema = new Schema({
  paper: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responses: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
      answer: { type: Schema.Types.Mixed, required: true }, // handles text, yes/no, and ratings
    },
  ],
  comments: { type: String },
  recommendation: {
    type: String,
    enum: ['Publikovať', 'Publikovať_so_zmenami', 'Odmietnuť'],
    required: true,
  },
  created_at: { type: Date, default: Date.now },
},{ collection: 'reviews' });

export default mongoose.model<IReview>('Review', ReviewSchema);