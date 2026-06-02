import express from 'express';
import {
  generateCertificate,
  getMyCertificates,
  verifyCertificate,
} from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getMyCertificates).post(protect, generateCertificate);
router.get('/verify/:hash', verifyCertificate);

export default router;
