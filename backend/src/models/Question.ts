import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  text: string;
  type: 'rating' | 'yes_no' | 'text';
  options: {
    min: { type: Number, default: 1 },
    max: { type: Number, default: 6 },
    choices: string[];
  };
  category?: string; // E.g., "Content", "Format"
}

const QuestionSchema: Schema = new Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['rating', 'yes_no', 'text'], required: true },
  options: {
    min: { type: Number },
    max: { type: Number },
    choices: [{ type: String }],
  },
  category: { type: String },
}, { collection: 'questions' });

export default mongoose.model<IQuestion>('Question', QuestionSchema);