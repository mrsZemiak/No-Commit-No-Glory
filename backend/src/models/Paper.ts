import mongoose, { Schema, Document } from 'mongoose';

export interface IPaper extends Document {
    title: string;
    status: string;
    submission_date: Date;
    file_link: string;
    final_submission: boolean;
    user: mongoose.Schema.Types.ObjectId;
    category: mongoose.Schema.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}

const PaperSchema: Schema = new Schema({
    title: { type: String, required: true },
    status: { type: String, required: true },
    submission_date: { type: Date, required: true },
    file_link: { type: String, required: true },
    final_submission: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Student
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },  // References a global category
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export default mongoose.model<IPaper>('Paper', PaperSchema);