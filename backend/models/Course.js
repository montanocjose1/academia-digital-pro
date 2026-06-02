import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del curso es obligatorio'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción del curso es obligatoria'],
    },
    thumbnail: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      default: 0,
      min: [0, 'El precio no puede ser negativo'],
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    category: {
      type: String,
      default: 'Desarrollo Web',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 5,
      min: [1, 'Calificación mínima es 1'],
      max: [5, 'Calificación máxima es 5'],
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

import { getModel } from './dbHelper.js';
const Course = getModel('Course', courseSchema);
export default Course;
