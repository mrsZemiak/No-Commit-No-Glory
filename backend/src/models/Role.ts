import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  permissions: any;
  ui_components: any;
}

const RoleSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  permissions: { type: Array, required: true },
  ui_components: { type: Array, required: true }
}, { collection: 'roles' });

export default mongoose.model<IRole>('Role', RoleSchema);