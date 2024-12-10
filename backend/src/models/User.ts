import mongoose, { Schema, Document } from 'mongoose';
import {IRole} from "./Role";

export interface IUser extends Document {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    university: string;
    status: string;
    role: mongoose.Schema.Types.ObjectId | IRole;
    created_at: Date;
    isVerified: boolean;
    verificationToken: string | null;
}

const UserSchema: Schema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    university: { type: String, required: true },
    status: { type: String, default: 'active' },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },  // References Role schema
    created_at: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, required: false },
});

export default mongoose.model<IUser>('User', UserSchema);