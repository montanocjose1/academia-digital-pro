import User from '../models/User.js';
import Course from '../models/Course.js';
import Purchase from '../models/Purchase.js';

// @desc    Get Admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin/Instructor)
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalCourses = await Course.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });

    // Aggregate total revenue
    const revenueStats = await Purchase.aggregate([
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalSales : 0;

    // Get monthly sales data for graphics
    const monthlySales = await Purchase.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          amount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top selling courses
    const purchases = await Purchase.find().populate('courses');
    const courseSalesMap = {};
    purchases.forEach((p) => {
      p.courses.forEach((c) => {
        if (c) {
          if (!courseSalesMap[c._id]) {
            courseSalesMap[c._id] = {
              title: c.title,
              price: c.price,
              salesCount: 0,
              revenue: 0,
            };
          }
          courseSalesMap[c._id].salesCount += 1;
          courseSalesMap[c._id].revenue += c.price;
        }
      });
    });

    const popularCourses = Object.values(courseSalesMap)
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalCourses,
        totalStudents,
        totalInstructors,
        totalRevenue,
        monthlySales,
        popularCourses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'instructor', 'admin'].includes(role)) {
      res.status(400);
      throw new Error('Rol no válido');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }

    // Do not demote yourself
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('No puedes cambiar tu propio rol');
    }

    user.role = role;
    await user.save();

    res.json({ success: true, message: `Rol actualizado a ${role} con éxito`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('Usuario no encontrado');
    }

    // Cannot delete yourself
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('No puedes eliminar tu propia cuenta');
    }

    await user.deleteOne();
    res.json({ success: true, message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

// @desc    Download CSV sales report
// @route   GET /api/admin/reports/sales
// @access  Private (Admin)
export const downloadSalesReport = async (req, res, next) => {
  try {
    const purchases = await Purchase.find()
      .populate('student', 'name email')
      .populate('courses', 'title')
      .sort({ createdAt: -1 });

    let csvContent = 'ID Factura,Fecha,Estudiante,Correo,Cursos,Monto Total,Descuento,Cupon\n';

    purchases.forEach((p) => {
      const idFactura = p.invoiceNumber;
      const date = new Date(p.createdAt).toLocaleDateString();
      const studentName = p.student ? p.student.name.replace(/,/g, ' ') : 'N/A';
      const studentEmail = p.student ? p.student.email : 'N/A';
      const courseTitles = p.courses.map((c) => c ? c.title.replace(/,/g, ' ') : 'N/A').join(' | ');
      const total = p.totalAmount;
      const discount = p.discountAmount;
      const coupon = p.couponApplied || 'Ninguno';

      csvContent += `"${idFactura}","${date}","${studentName}","${studentEmail}","${courseTitles}",${total},${discount},"${coupon}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Ventas_AcademiaPro.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
