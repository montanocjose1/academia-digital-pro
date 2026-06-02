import crypto from 'crypto';
import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Generate Certificate after completing course
// @route   POST /api/certificates
// @access  Private
export const generateCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId).populate({
      path: 'modules',
      populate: { path: 'lessons' },
    });

    if (!course) {
      res.status(404);
      throw new Error('Curso no encontrado');
    }

    // Verify enrollment
    const user = await User.findById(req.user._id);
    if (!user.enrolledCourses.includes(courseId)) {
      res.status(403);
      throw new Error('No estás inscrito en este curso');
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      student: req.user._id,
      course: courseId,
    }).populate('course', 'title').populate('student', 'name');

    if (existingCertificate) {
      return res.status(200).json({
        success: true,
        message: 'Certificado obtenido con éxito',
        certificate: existingCertificate,
      });
    }

    // Generate unique verification hash
    const certificateHash = crypto.randomBytes(12).toString('hex').toUpperCase();

    const certificate = await Certificate.create({
      student: req.user._id,
      course: courseId,
      certificateHash,
    });

    const populatedCertificate = await Certificate.findById(certificate._id)
      .populate('course', 'title')
      .populate('student', 'name');

    res.status(201).json({
      success: true,
      message: '¡Felicitaciones! Certificado generado con éxito.',
      certificate: populatedCertificate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user certificates
// @route   GET /api/certificates
// @access  Private
export const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('course', 'title thumbnail level')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: certificates.length, certificates });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify certificate by hash (Public endpoint)
// @route   GET /api/certificates/verify/:hash
// @access  Public
export const verifyCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({
      certificateHash: req.params.hash,
    })
      .populate('student', 'name')
      .populate('course', 'title description level instructor')
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' },
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificado no válido o no encontrado en nuestros registros',
      });
    }

    res.json({
      success: true,
      isValid: true,
      certificate,
    });
  } catch (error) {
    next(error);
  }
};
