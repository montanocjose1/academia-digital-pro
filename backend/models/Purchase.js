import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'El monto total no puede ser negativo'],
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponApplied: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'completed',
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

import { getModel } from './dbHelper.js';
const Purchase = getModel('Purchase', purchaseSchema);
export default Purchase;
