import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';
import { uploadFile } from '../config/cloudinary.js';

// ==========================================
// COURSE CONTROLLERS
// ==========================================

// @desc    Get all courses (can filter by category, level, instructor, published status)
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res, next) => {
  try {
    const { category, level, search, instructor, publishedOnly } = req.query;
    
    let query = {};
    
    // Default to published only for students, show all for admins/instructors if requested
    if (publishedOnly === 'true' || publishedOnly === undefined) {
      query.isPublished = true;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (level) {
      query.level = level;
    }
    
    if (instructor) {
      query.instructor = instructor;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar email')
      .populate({
        path: 'modules',
        options: { sort: { order: 1 } },
        populate: {
          path: 'lessons',
          options: { sort: { order: 1 } },
        },
      });

    if (!course) {
      res.status(404);
      throw new Error('Curso no encontrado');
    }

    res.json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
export const createCourse = async (req, res, next) => {
  try {
    const { title, subtitle, description, price, level, category } = req.body;

    let thumbnailUrl = undefined;
    if (req.file) {
      thumbnailUrl = await uploadFile(req.file, 'thumbnails');
    }

    const course = await Course.create({
      title,
      subtitle,
      description,
      price: price || 0,
      level: level || 'beginner',
      category: category || 'General',
      instructor: req.user._id,
      thumbnail: thumbnailUrl,
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
export const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Curso no encontrado');
    }

    // Verify ownership (unless Admin)
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No tiene autorización para editar este curso');
    }

    const { title, subtitle, description, price, level, category, isPublished } = req.body;
    
    course.title = title !== undefined ? title : course.title;
    course.subtitle = subtitle !== undefined ? subtitle : course.subtitle;
    course.description = description !== undefined ? description : course.description;
    course.price = price !== undefined ? price : course.price;
    course.level = level !== undefined ? level : course.level;
    course.category = category !== undefined ? category : course.category;
    course.isPublished = isPublished !== undefined ? isPublished : course.isPublished;

    if (req.file) {
      course.thumbnail = await uploadFile(req.file, 'thumbnails');
    }

    const updatedCourse = await course.save();
    
    // Fetch full course data back
    const fullCourse = await Course.findById(updatedCourse._id)
      .populate('instructor', 'name avatar')
      .populate({
        path: 'modules',
        populate: { path: 'lessons' }
      });

    res.json({ success: true, course: fullCourse });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Curso no encontrado');
    }

    // Verify ownership (unless Admin)
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No tiene autorización para eliminar este curso');
    }

    // Delete related modules and lessons
    const modules = await Module.find({ course: course._id });
    for (const mod of modules) {
      await Lesson.deleteMany({ module: mod._id });
    }
    await Module.deleteMany({ course: course._id });
    await course.deleteOne();

    res.json({ success: true, message: 'Curso eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// MODULE CONTROLLERS
// ==========================================

// @desc    Create a module inside a course
// @route   POST /api/courses/:courseId/modules
// @access  Private (Instructor/Admin)
export const createModule = async (req, res, next) => {
  try {
    const { title, order } = req.body;
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      res.status(404);
      throw new Error('Curso no encontrado');
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No autorizado');
    }

    const newModule = await Module.create({
      title,
      course: course._id,
      order: order || 0,
      lessons: [],
    });

    course.modules.push(newModule._id);
    await course.save();

    res.status(201).json({ success: true, module: newModule });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a module
// @route   PUT /api/courses/modules/:id
// @access  Private (Instructor/Admin)
export const updateModule = async (req, res, next) => {
  try {
    const { title, order } = req.body;
    const mod = await Module.findById(req.params.id).populate('course');

    if (!mod) {
      res.status(404);
      throw new Error('Módulo no encontrado');
    }

    // Verify ownership
    if (mod.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No autorizado');
    }

    mod.title = title !== undefined ? title : mod.title;
    mod.order = order !== undefined ? order : mod.order;
    await mod.save();

    res.json({ success: true, module: mod });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a module
// @route   DELETE /api/courses/modules/:id
// @access  Private (Instructor/Admin)
export const deleteModule = async (req, res, next) => {
  try {
    const mod = await Module.findById(req.params.id);

    if (!mod) {
      res.status(404);
      throw new Error('Módulo no encontrado');
    }

    const course = await Course.findById(mod.course);
    if (course) {
      // Verify ownership
      if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('No autorizado');
      }
      
      // Remove from course modules array
      course.modules = course.modules.filter((m) => m.toString() !== mod._id.toString());
      await course.save();
    }

    // Delete all lessons of this module
    await Lesson.deleteMany({ module: mod._id });
    await mod.deleteOne();

    res.json({ success: true, message: 'Módulo eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// LESSON CONTROLLERS
// ==========================================

// @desc    Create a lesson inside a module
// @route   POST /api/courses/modules/:moduleId/lessons
// @access  Private (Instructor/Admin)
export const createLesson = async (req, res, next) => {
  try {
    const { title, description, content, duration, order } = req.body;
    const mod = await Module.findById(req.params.moduleId).populate('course');

    if (!mod) {
      res.status(404);
      throw new Error('Módulo no encontrado');
    }

    // Verify ownership
    if (mod.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No autorizado');
    }

    const lesson = await Lesson.create({
      title,
      description,
      content,
      duration: duration || 0,
      order: order || 0,
      module: mod._id,
    });

    mod.lessons.push(lesson._id);
    await mod.save();

    res.status(201).json({ success: true, lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a lesson (and handles file/video upload)
// @route   PUT /api/courses/lessons/:id
// @access  Private (Instructor/Admin)
export const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate({
      path: 'module',
      populate: { path: 'course' }
    });

    if (!lesson) {
      res.status(404);
      throw new Error('Lección no encontrada');
    }

    // Verify ownership
    if (lesson.module.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No autorizado');
    }

    const { title, description, content, duration, order, videoUrl, pdfUrl } = req.body;

    lesson.title = title !== undefined ? title : lesson.title;
    lesson.description = description !== undefined ? description : lesson.description;
    lesson.content = content !== undefined ? content : lesson.content;
    lesson.duration = duration !== undefined ? duration : lesson.duration;
    lesson.order = order !== undefined ? order : lesson.order;
    
    // Can pass manual links or files
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (pdfUrl !== undefined) lesson.pdfUrl = pdfUrl;

    // Handle files if uploaded
    if (req.files) {
      if (req.files.video) {
        lesson.videoUrl = await uploadFile(req.files.video[0], 'videos');
      }
      if (req.files.pdf) {
        lesson.pdfUrl = await uploadFile(req.files.pdf[0], 'pdfs');
      }
    }

    await lesson.save();

    res.json({ success: true, lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/courses/lessons/:id
// @access  Private (Instructor/Admin)
export const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      res.status(404);
      throw new Error('Lección no encontrada');
    }

    const mod = await Module.findById(lesson.module);
    if (mod) {
      // Remove from module
      mod.lessons = mod.lessons.filter((l) => l.toString() !== lesson._id.toString());
      await mod.save();
    }

    await lesson.deleteOne();

    res.json({ success: true, message: 'Lección eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};
