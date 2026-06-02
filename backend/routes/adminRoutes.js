import express from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
  downloadSalesReport,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('instructor', 'admin'), getDashboardStats);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.get('/reports/sales', protect, authorize('admin'), downloadSalesReport);

export default router;
