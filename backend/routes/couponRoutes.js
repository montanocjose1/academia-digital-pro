import express from 'express';
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  validateCouponCode,
} from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin'), getCoupons)
  .post(protect, authorize('admin'), createCoupon);

router.delete('/:id', protect, authorize('admin'), deleteCoupon);
router.get('/validate/:code', protect, validateCouponCode);

export default router;
