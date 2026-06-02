import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'academiadigitalprosupersecretkey123!', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('El usuario ya existe con este correo electrónico');
    }

    // Role safety logic: do not let anyone register as admin directly unless they are the first user
    let finalRole = role || 'student';
    if (finalRole === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount > 0) {
        return res.status(403).json({
          success: false,
          message: 'No está permitido registrarse como administrador directamente.',
        });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
    });

    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Datos de usuario no válidos');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email and select password field (which is set to select: false)
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Correo o contraseña incorrectos');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile (Current logged in user)
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('enrolledCourses');

    if (user) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        enrolledCourses: user.enrolledCourses,
      });
    } else {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.avatar) {
        user.avatar = req.body.avatar;
      }
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Mock password recovery
// @route   POST /api/auth/recover
// @access  Public
export const recoverPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('No existe una cuenta registrada con este correo');
    }

    res.json({
      success: true,
      message: 'Se ha enviado un enlace de recuperación a su correo electrónico.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle lesson completion state
// @route   POST /api/auth/lessons/toggle-complete
// @access  Private
export const toggleLessonComplete = async (req, res, next) => {
  try {
    const { lessonId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }

    const index = user.completedLessons.indexOf(lessonId);
    if (index > -1) {
      user.completedLessons.splice(index, 1);
    } else {
      user.completedLessons.push(lessonId);
    }

    await user.save();

    res.json({
      success: true,
      completedLessons: user.completedLessons,
    });
  } catch (error) {
    next(error);
  }
};
