import express from 'express';
import { getCourseReviews, createReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/course/:courseId', getCourseReviews);
router.post('/', protect, createReview);

export default router;
