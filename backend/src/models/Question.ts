import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
    text: string;
    type: 'rating' | 'yes_no' | 'text';
    options?: {
        min?: number;
        max?: number;
        choices?: string[];
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
});

export default mongoose.model<IQuestion>('Question', QuestionSchema);