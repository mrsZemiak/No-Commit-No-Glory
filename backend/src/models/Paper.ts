import mongoose, { Schema, Document } from 'mongoose';

export interface IPaper extends Document {
    title: string;
    status: string;
    submission_date: Date;
    file_link: string;
    final_submission: boolean;
    user: mongoose.Schema.Types.ObjectId;
    category: mongoose.Schema.Types.ObjectId;
    conference: mongoose.Schema.Types.ObjectId;
    abstract: string;
    keywords: string[];
    authors: { firstName: string; lastName: string }[];
    created_at: Date;
    updated_at: Date;
}

const PaperSchema: Schema = new Schema({
    title: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['draft', 'submitted', 'under review', 'accepted', 'rejected'], // Aligning with CMS rules
    },
    submission_date: { type: Date, required: true },
    file_link: { type: String, required: true },
    final_submission: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Student
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },  // References a global category
    conference: { type: mongoose.Schema.Types.ObjectId, ref: 'Conference', required: true }, // Link to associated conference
    abstract: { type: String, required: true }, // Abstract field
    keywords: { type: [String], required: true }, // Array of keywords
    authors: [{
        firstName: { type: String, required: true },
        lastName: { type: String, required: true }
    }], // Authors details
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export default mongoose.model<IPaper>('Paper', PaperSchema);