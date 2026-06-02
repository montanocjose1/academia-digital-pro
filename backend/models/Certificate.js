import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    certificateHash: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique student-course combo for certificate
certificateSchema.index({ student: 1, course: 1 }, { unique: true });

import { getModel } from './dbHelper.js';
const Certificate = getModel('Certificate', certificateSchema);
export default Certificate;
