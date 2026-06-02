import Coupon from '../models/Coupon.js';

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private (Admin)
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private (Admin)
export const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, value, expiresAt, isActive, maxUses } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      res.status(400);
      throw new Error('Ya existe un cupón con este código');
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      value,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isActive: isActive !== undefined ? isActive : true,
      maxUses: maxUses !== undefined ? maxUses : null,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      res.status(404);
      throw new Error('Cupón no encontrado');
    }

    await coupon.deleteOne();
    res.json({ success: true, message: 'Cupón eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate coupon code
// @route   GET /api/coupons/validate/:code
// @access  Private
export const validateCouponCode = async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();
    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Cupón no encontrado' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ success: false, message: 'El cupón no es válido o ha expirado' });
    }

    res.json({
      success: true,
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
    });
  } catch (error) {
    next(error);
  }
};
