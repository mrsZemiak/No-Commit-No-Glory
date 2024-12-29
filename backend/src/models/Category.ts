import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    status: string;
}

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    status: { type: String }
}, { collection: 'categories' });

export default mongoose.model<ICategory>('Category', CategorySchema);