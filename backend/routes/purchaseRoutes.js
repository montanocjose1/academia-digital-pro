import express from 'express';
import { checkout, getMyPurchases, getInvoice } from '../controllers/purchaseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkout', protect, checkout);
router.get('/my-purchases', protect, getMyPurchases);
router.get('/invoice/:id', protect, getInvoice);

export default router;
