import mongoose, { Schema, Document } from 'mongoose';
import { IRole } from './Role';

export enum UserStatus {
    Pending = 'pending',
    Active = 'active',
    Suspended = 'suspended',
    Inactive = 'inactive'
}

export interface IUser extends Document {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    university: string;
    status: UserStatus;
    role: string; // Store only the role name
    created_at: Date;
    isVerified: boolean;
    verificationToken: string | null;
}

const UserSchema: Schema = new Schema(
  {
      first_name: { type: String, required: true },
      last_name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      university: { type: String, required: true },
      status: {
          type: String,
          enum: Object.values(UserStatus),
          default: UserStatus.Pending,
      },
      role: { type: String, required: true }, // Store only the role name
      created_at: { type: Date, default: Date.now },
      isVerified: { type: Boolean, default: false },
      verificationToken: { type: String, required: false },
  },
  { collection: 'users' }
);

// Middleware to validate and set role name from the Role model
UserSchema.pre<IUser>('save', async function (next) {
    const RoleModel = mongoose.model<IRole>('Role');
    const role = await RoleModel.findOne({ name: this.role });
    if (!role) {
        throw new Error(`Role "${this.role}" does not exist`);
    }
    next();
});

export default mongoose.model<IUser>('User', UserSchema);