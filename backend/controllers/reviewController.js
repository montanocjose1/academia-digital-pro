import Review from '../models/Review.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Helper to recalculate course rating
const updateCourseRating = async (courseId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { course: courseId } },
      {
        $group: {
          _id: '$course',
          rating: { $avg: '$rating' },
          ratingsCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Course.findByIdAndUpdate(courseId, {
        rating: Math.round(stats[0].rating * 10) / 10, // Keep 1 decimal place
        ratingsCount: stats[0].ratingsCount,
      });
    } else {
      await Course.findByIdAndUpdate(courseId, {
        rating: 5,
        ratingsCount: 0,
      });
    }
  } catch (error) {
    console.error('Error updating course rating:', error);
  }
};

// @desc    Get all reviews for a course
// @route   GET /api/reviews/course/:courseId
// @access  Public
export const getCourseReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('student', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Submit a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    const { courseId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400);
      throw new Error('La calificación debe estar entre 1 y 5 estrellas');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Curso no encontrado');
    }

    // Verify enrollment
    const user = await User.findById(req.user._id);
    if (!user.enrolledCourses.includes(courseId)) {
      res.status(403);
      throw new Error('Solo puedes calificar cursos en los que estás inscrito');
    }

    // Check if review already exists
    const reviewExists = await Review.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (reviewExists) {
      res.status(400);
      throw new Error('Ya has calificado este curso');
    }

    const review = await Review.create({
      student: req.user._id,
      course: courseId,
      rating,
      comment,
    });

    // Update aggregate ratings on Course
    await updateCourseRating(courseId);

    const populatedReview = await Review.findById(review._id).populate('student', 'name avatar');

    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    next(error);
  }
};
