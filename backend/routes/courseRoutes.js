import express from 'express';
import multer from 'multer';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer in-memory storage setup
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max size (especially for videos)
  },
});

// Course Routes
router
  .route('/')
  .get(getCourses)
  .post(protect, authorize('instructor', 'admin'), upload.single('thumbnail'), createCourse);

router
  .route('/:id')
  .get(getCourseById)
  .put(protect, authorize('instructor', 'admin'), upload.single('thumbnail'), updateCourse)
  .delete(protect, authorize('instructor', 'admin'), deleteCourse);

// Module Routes
router.post('/:courseId/modules', protect, authorize('instructor', 'admin'), createModule);
router.put('/modules/:id', protect, authorize('instructor', 'admin'), updateModule);
router.delete('/modules/:id', protect, authorize('instructor', 'admin'), deleteModule);

// Lesson Routes
router.post('/modules/:moduleId/lessons', protect, authorize('instructor', 'admin'), createLesson);
router.put(
  '/lessons/:id',
  protect,
  authorize('instructor', 'admin'),
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ]),
  updateLesson
);
router.delete('/lessons/:id', protect, authorize('instructor', 'admin'), deleteLesson);

export default router;
