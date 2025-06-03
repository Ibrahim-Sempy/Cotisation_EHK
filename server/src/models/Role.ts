import mongoose from 'mongoose';

export interface IRole extends mongoose.Document {
    name: string;
    description: string;
    permissions: string[];
}

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    permissions: [{
        type: String,
        required: true
    }]
});

export const Role = mongoose.model<IRole>('Role', roleSchema); 