import mongoose, { Schema, Document } from 'mongoose';

export interface IConference extends Document {
    year: number;
    start_date: Date;
    end_date: Date;
    categories: mongoose.Schema.Types.ObjectId[]; // Array of categories
    deadline_submission: Date;
    deadline_review: Date;
    created_at: Date;
    user: mongoose.Schema.Types.ObjectId;
}

const ConferenceSchema: Schema = new Schema({
    year: { type: Number, required: true,
        validate: {
            validator: (value: number) => {
                // Validate that the year is a four-digit number between 2010 and the current year
                const currentYear = new Date().getFullYear();
                return value >= 2010 && value <= currentYear + 5;  // Allows years up to 5 years into the future
            },
            message: 'Year must be a valid four-digit year.'
        }},
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],  // Reusing global categories
    deadline_submission: { type: Date, required: true },
    deadline_review: { type: Date, required: true },
    created_at: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  // Admin who created the conference
});

export default mongoose.model<IConference>('Conference', ConferenceSchema);