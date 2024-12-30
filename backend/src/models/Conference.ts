import mongoose, { Schema, Document } from 'mongoose';

export enum ConferenceStatus {
    Upcoming = 'upcoming',
    Ongoing = 'ongoing',
    Completed = 'completed',
    Canceled = 'canceled'
}

export interface IConference extends Document {
    year: number;
    location: string;
    university: string;
    date: Date;
    status: ConferenceStatus;
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
                //Validate that the year is a four-digit number between 2010 and the current year
                const currentYear = new Date().getFullYear();
                return value >= 2010 && value <= currentYear + 5;  //Allows years up to 5 years into the future
            },
            message: 'Year must be a valid four-digit year.'
        }
    },
    location: { type: String, required: true },
    university: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
        type: String,
        enum: Object.values(ConferenceStatus),
        default: ConferenceStatus.Upcoming
    },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],  //Reusing global categories
    deadline_submission: { type: Date, required: true },
    deadline_review: { type: Date, required: true },
    created_at: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User',required: true }  //Admin who created the conference
});

export default mongoose.model<IConference>('Conference', ConferenceSchema);