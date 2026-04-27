import mongoose from 'mongoose';

const JournalSchema = new mongoose.Schema({
  text: String,
  userId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Journal = mongoose.model('Journal', JournalSchema);