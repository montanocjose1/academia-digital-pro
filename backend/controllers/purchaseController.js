import Purchase from '../models/Purchase.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';

// Helper to generate Invoice Number
const generateInvoiceNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `FAC-${datePart}-${randomPart}`;
};

// @desc    Checkout / Purchase courses in cart
// @route   POST /api/purchases/checkout
// @access  Private
export const checkout = async (req, res, next) => {
  try {
    const { courseIds, couponCode } = req.body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      res.status(400);
      throw new Error('El carrito de compras está vacío');
    }

    // Retrieve courses from DB
    const courses = await Course.find({ _id: { $in: courseIds } });
    if (courses.length !== courseIds.length) {
      res.status(400);
      throw new Error('Uno o más cursos en el carrito no son válidos');
    }

    // Get current user
    const user = await User.findById(req.user._id);

    // Filter out courses that the user is already enrolled in
    const newCoursesToEnroll = courses.filter(
      (course) => !user.enrolledCourses.includes(course._id)
    );

    if (newCoursesToEnroll.length === 0) {
      res.status(400);
      throw new Error('Ya estás inscrito en todos los cursos del carrito');
    }

    // Calculate subtotal
    const subtotal = courses.reduce((sum, course) => sum + course.price, 0);
    let discount = 0;
    let finalTotal = subtotal;

    // Check and validate coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      
      if (!coupon || !coupon.isValid()) {
        res.status(400);
        throw new Error('El cupón de descuento no es válido o ha expirado');
      }

      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.value) / 100;
      } else if (coupon.discountType === 'fixed') {
        discount = coupon.value;
      }

      // Ensure discount is not greater than the subtotal
      discount = Math.min(discount, subtotal);
      finalTotal = subtotal - discount;

      // Update coupon usage count
      coupon.usesCount += 1;
      await coupon.save();
    }

    // Emulate payment processing
    // In a real app, this is where Stripe or PayPal SDK is initialized. Here we complete the transaction directly.
    const invoiceNumber = generateInvoiceNumber();

    const purchase = await Purchase.create({
      student: req.user._id,
      courses: newCoursesToEnroll.map((c) => c._id),
      totalAmount: finalTotal,
      discountAmount: discount,
      couponApplied: couponCode ? couponCode.toUpperCase() : undefined,
      paymentStatus: 'completed',
      invoiceNumber,
    });

    // Enroll student in new courses
    newCoursesToEnroll.forEach((course) => {
      user.enrolledCourses.push(course._id);
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Compra completada con éxito. Ya estás inscrito en los cursos.',
      purchase,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user purchase history
// @route   GET /api/purchases/my-purchases
// @access  Private
export const getMyPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find({ student: req.user._id })
      .populate('courses', 'title price thumbnail')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: purchases.length, purchases });
  } catch (error) {
    next(error);
  }
};

// @desc    Get purchase invoice details
// @route   GET /api/purchases/invoice/:id
// @access  Private
export const getInvoice = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('student', 'name email')
      .populate('courses', 'title price');

    if (!purchase) {
      res.status(404);
      throw new Error('Factura no encontrada');
    }

    // Only allow the student who purchased it, or an admin to access the invoice
    if (purchase.student._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('No autorizado para ver esta factura');
    }

    res.json({ success: true, invoice: purchase });
  } catch (error) {
    next(error);
  }
};
