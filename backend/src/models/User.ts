import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    university: string;
    status: string;
    role: mongoose.Schema.Types.ObjectId;
    created_at: Date;
}

const UserSchema: Schema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    university: { type: String, required: true },
    status: { type: String, default: 'active' },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },  // References Role schema
    created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);