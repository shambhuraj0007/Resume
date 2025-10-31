import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserSettings {
  displayName: string;
  defaultTemplate: 'modern' | 'professional' | 'minimal' | 'creative';
}

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  emailVerified?: Date | null;
  settings: IUserSettings;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: String,
    emailVerified: {
      type: Date,
      default: null,
    },
    settings: {
      displayName: {
        type: String,
        default: '',
      },
      defaultTemplate: {
        type: String,
        enum: ['modern', 'professional', 'minimal', 'creative'],
        default: 'modern',
      },
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
