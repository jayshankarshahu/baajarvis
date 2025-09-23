import mongoose from 'mongoose';

const OAuthProviderOptions = {
    google : "google"
}

const UserSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    enum: Object.values(OAuthProviderOptions)
  },
  providerUserId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/, // Basic email regex
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: true    
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    default: ""
  },
  profilePictureUrl: {
    type: String,
    default: null
  }
} , { timestamps: true } );


UserSchema.index({ provider: 1, providerUserId: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

const Users = mongoose.models.User || mongoose.model('User', UserSchema);
export {
    Users,
    OAuthProviderOptions
};