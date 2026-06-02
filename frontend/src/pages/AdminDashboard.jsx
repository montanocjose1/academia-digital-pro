import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../components/Course/CourseCard';
import {
  LayoutDashboard,
  BookOpen,
  DollarSign,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit,
  Download,
  Ticket,
  UserCheck,
  Video,
  FileText,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // Editor states (Modals or Forms)
  const [editingCourse, setEditingCourse] = useState(null); // Course currently being edited
  const [showCourseForm, setShowCourseForm] = useState(false); // Creating new course

  // Course Form inputs
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSubtitle, setCourseSubtitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [courseLevel, setCourseLevel] = useState('beginner');
  const [courseCategory, setCourseCategory] = useState('Desarrollo Web');
  const [courseThumbnailFile, setCourseThumbnailFile] = useState(null);
  const [isPublished, setIsPublished] = useState(false);

  // Module Editor inputs
  const [moduleTitle, setModuleTitle] = useState('');
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState(null);

  // Lesson Editor inputs
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonDuration, setLessonDuration] = useState(10);
  const [lessonVideoFile, setLessonVideoFile] = useState(null);
  const [lessonPdfFile, setLessonPdfFile] = useState(null);

  // Coupon Form inputs
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState('percentage');
  const [couponValue, setCouponValue] = useState(10);
  const [couponMaxUses, setCouponMaxUses] = useState('');

  // Fetch metrics data
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  // Fetch courses list (all for Admin, own for Instructor)
  const fetchCourses = async () => {
    try {
      const instructorParam = user?.role === 'instructor' ? `&instructor=${user._id}` : '';
      const res = await fetch(`${API_URL}/courses?publishedOnly=false${instructorParam}`);
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  // Fetch sales purchases list
  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('token');
      // Enpoint only accessible for Admin
      if (!isAdmin) return;
      
      const res = await fetch(`${API_URL}/admin/reports/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Purchases parsed from raw CSV, or let's call a custom endpoint for purchases history if needed
      // Actually we populated seed purchases. Let's make a call to fetch purchases
      const purchasesRes = await fetch(`${API_URL}/purchases/my-purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // In a real app we fetch all admin sales, let's emultate this or mock it by calling getMyPurchases
      // since the admin is demo, we show sales. To make it extremely functional, let's fetch all purchases
      // by calling a mock helper or fetching. We populated purchases in seed, let's mock query them!
      const allPurchasesRes = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // We can also fetch the sales CSV and parse it, or we can just mock fetch them from local mockDb if useMock is true.
      // Let's implement fetch for users and coupons:
    } catch (err) {}
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchCoupons = async () => {
    if (!isAdmin) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchCourses(),
      fetchUsers(),
      fetchCoupons(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  // Handle download reports
  const handleDownloadReport = () => {
    const token = localStorage.getItem('token');
    window.open(`${API_URL}/admin/reports/sales?token=${token}`, '_blank');
  };

  // ==========================================
  // COURSE OPERATIONS
  // ==========================================
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Multipart form data
    const formData = new FormData();
    formData.append('title', courseTitle);
    formData.append('subtitle', courseSubtitle);
    formData.append('description', courseDescription);
    formData.append('price', coursePrice);
    formData.append('level', courseLevel);
    formData.append('category', courseCategory);
    if (courseThumbnailFile) {
      formData.append('thumbnail', courseThumbnailFile);
    }

    try {
      let res;
      if (editingCourse) {
        formData.append('isPublished', isPublished);
        res = await fetch(`${API_URL}/courses/${editingCourse._id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        res = await fetch(`${API_URL}/courses`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      const data = await res.json();
      if (data.success) {
        // Reset forms
        setCourseTitle('');
        setCourseSubtitle('');
        setCourseDescription('');
        setCoursePrice(0);
        setCourseThumbnailFile(null);
        setShowCourseForm(false);
        setEditingCourse(null);
        
        // Refresh catalog list
        fetchCourses();
      }
    } catch (err) {
      console.error('Error saving course:', err);
    }
  };

  const startEditCourse = (course) => {
    setEditingCourse(course);
    setCourseTitle(course.title);
    setCourseSubtitle(course.subtitle || '');
    setCourseDescription(course.description);
    setCoursePrice(course.price);
    setCourseLevel(course.level);
    setCourseCategory(course.category);
    setIsPublished(course.isPublished);
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('¿Está seguro de eliminar este curso, incluyendo todos sus módulos y lecciones?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchCourses();
      }
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  // ==========================================
  // MODULES & LESSONS OPERATIONS
  // ==========================================
  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/courses/${editingCourse._id}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: moduleTitle, order: editingCourse.modules?.length + 1 }),
      });
      const data = await res.json();
      if (data.success) {
        setModuleTitle('');
        // Re-fetch active edited course
        const refreshRes = await fetch(`${API_URL}/courses/${editingCourse._id}`);
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setEditingCourse(refreshData.course);
        }
      }
    } catch (err) {
      console.error('Error creating module:', err);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('¿Eliminar este módulo junto con sus lecciones?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/courses/modules/${moduleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Refresh active editing course details
        const refreshRes = await fetch(`${API_URL}/courses/${editingCourse._id}`);
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setEditingCourse(refreshData.course);
        }
      }
    } catch (err) {
      console.error('Error deleting module:', err);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!lessonTitle || !selectedModuleForLesson) return;
    const token = localStorage.getItem('token');

    try {
      // Step 1: Create lesson empty details
      const res = await fetch(`${API_URL}/courses/modules/${selectedModuleForLesson._id}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: lessonTitle,
          description: lessonDescription,
          content: lessonContent,
          duration: lessonDuration,
          order: selectedModuleForLesson.lessons?.length + 1,
        }),
      });
      const data = await res.json();

      if (data.success && (lessonVideoFile || lessonPdfFile)) {
        // Step 2: Upload files if attached
        const formData = new FormData();
        if (lessonVideoFile) formData.append('video', lessonVideoFile);
        if (lessonPdfFile) formData.append('pdf', lessonPdfFile);

        await fetch(`${API_URL}/courses/lessons/${data.lesson._id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      // Reset lesson inputs
      setLessonTitle('');
      setLessonDescription('');
      setLessonContent('');
      setLessonDuration(10);
      setLessonVideoFile(null);
      setLessonPdfFile(null);
      setSelectedModuleForLesson(null);

      // Refresh editing course
      const refreshRes = await fetch(`${API_URL}/courses/${editingCourse._id}`);
      const refreshData = await refreshRes.json();
      if (refreshData.success) {
        setEditingCourse(refreshData.course);
      }
    } catch (err) {
      console.error('Error creating lesson:', err);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('¿Eliminar esta lección permanentemente?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/courses/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Refresh editing course details
        const refreshRes = await fetch(`${API_URL}/courses/${editingCourse._id}`);
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setEditingCourse(refreshData.course);
        }
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
    }
  };

  // ==========================================
  // USERS OPERATIONS
  // ==========================================
  const handleUpdateRole = async (userId, role) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Eliminar la cuenta de este usuario?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  // ==========================================
  // COUPONS OPERATIONS
  // ==========================================
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode,
          discountType: couponType,
          value: couponValue,
          maxUses: couponMaxUses ? parseInt(couponMaxUses) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponCode('');
        setCouponValue(10);
        setCouponMaxUses('');
        fetchCoupons();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error creating coupon:', err);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('¿Eliminar este cupón de descuento?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/coupons/${couponId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchCoupons();
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-900 border-t-indigo-500 animate-spin"></div>
        <p className="text-slate-500 text-sm">Cargando panel de control...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-8">
      
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display font-extrabold text-3xl text-white">Panel de Administración</h1>
          <p className="text-slate-400 text-xs md:text-sm">
            Gestiona usuarios, publica temarios de cursos, edita lecciones y descarga reportes de ventas.
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap border-b border-slate-900 gap-1 pb-px">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-display text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'stats' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <LayoutDashboard className="w-4.5 h-4.5" />
          <span>Métricas</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-display text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'courses' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <BookOpen className="w-4.5 h-4.5" />
          <span>Gestión Cursos</span>
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-display text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              <span>Usuarios</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-display text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'coupons' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Ticket className="w-4.5 h-4.5" />
              <span>Cupones</span>
            </button>
          </>
        )}
      </div>

      {/* Tabs panels */}
      <div className="space-y-6">
        
        {/* ==========================================
            METRIC PANEL
           ========================================== */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI Counts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4 border border-slate-900 shadow-lg">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/25">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ingresos Totales</span>
                  <h3 className="font-display font-extrabold text-2xl text-white">${stats.totalRevenue?.toFixed(2)} USD</h3>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4 border border-slate-900 shadow-lg">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/25">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estudiantes Activos</span>
                  <h3 className="font-display font-extrabold text-2xl text-white">{stats.totalStudents}</h3>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4 border border-slate-900 shadow-lg">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/25">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cursos Publicados</span>
                  <h3 className="font-display font-extrabold text-2xl text-white">{stats.totalCourses}</h3>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4 border border-slate-900 shadow-lg">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/25">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Instructores</span>
                  <h3 className="font-display font-extrabold text-2xl text-white">{stats.totalInstructors}</h3>
                </div>
              </div>
            </div>

            {/* Graphs & Popular items row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sales SVG Bar Chart (7 columns) */}
              <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-900 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="font-display font-bold text-sm text-slate-200 uppercase tracking-wider">Ventas por Mes</h3>
                  {isAdmin && (
                    <button
                      onClick={handleDownloadReport}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/20 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar CSV</span>
                    </button>
                  )}
                </div>

                {/* SVG Responsive Chart */}
                <div className="relative h-64 w-full flex items-end justify-between pt-8 px-4 border-b border-slate-800">
                  {stats.monthlySales?.length > 0 ? (
                    stats.monthlySales.map((item, idx) => {
                      const maxAmount = Math.max(...stats.monthlySales.map(m => m.amount), 1);
                      const heightPercent = Math.min((item.amount / maxAmount) * 100, 100);
                      
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative mx-1">
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-950 border border-slate-800 text-[10px] text-white px-2 py-1 rounded shadow-xl whitespace-nowrap z-10">
                            ${item.amount.toFixed(2)} ({item.count} ventas)
                          </div>
                          
                          {/* Bar */}
                          <div
                            className="w-full bg-gradient-primary rounded-t-md transition-all duration-700 hover:brightness-110 progress-bar-glow"
                            style={{ height: `${heightPercent || 5}%`, minHeight: '8px' }}
                          ></div>
                          <span className="text-[9px] text-slate-500 mt-2 font-mono">{item._id}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs italic">
                      Aún no se registran compras para modelar el historial gráfico.
                    </div>
                  )}
                </div>
              </div>

              {/* Popular courses list (5 columns) */}
              <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-900 shadow-xl space-y-4">
                <h3 className="font-display font-bold text-sm text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-3">Cursos Más Vendidos</h3>
                
                <div className="space-y-4">
                  {stats.popularCourses?.length > 0 ? (
                    stats.popularCourses.map((course, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-900 pb-2.5 last:border-b-0">
                        <div className="min-w-0 pr-4">
                          <h4 className="font-semibold text-slate-200 truncate">{course.title}</h4>
                          <p className="text-[10px] text-slate-500">{course.salesCount} inscripciones</p>
                        </div>
                        <span className="font-bold text-slate-200 flex-shrink-0">${course.revenue.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-650 text-xs italic py-6 text-center">
                      No hay suficientes ventas registradas para calcular estadísticas.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            COURSES PANEL
           ========================================== */}
        {activeTab === 'courses' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="font-display font-bold text-xl text-white">Administrador de Cursos</h2>
              {!showCourseForm && (
                <button
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseTitle('');
                    setCourseSubtitle('');
                    setCourseDescription('');
                    setCoursePrice(0);
                    setShowCourseForm(true);
                  }}
                  className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Curso</span>
                </button>
              )}
            </div>

            {/* Course Editor/Creator panel form */}
            {showCourseForm ? (
              <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-800/80 shadow-2xl space-y-8">
                <h3 className="font-display font-extrabold text-lg text-white">
                  {editingCourse ? 'Editar Datos del Curso' : 'Crear Nuevo Curso'}
                </h3>
                
                <form onSubmit={handleCourseSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Título del Curso</label>
                      <input
                        type="text"
                        required
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Categoría</label>
                      <input
                        type="text"
                        required
                        value={courseCategory}
                        onChange={(e) => setCourseCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Subtítulo / Breve resumen</label>
                    <input
                      type="text"
                      required
                      value={courseSubtitle}
                      onChange={(e) => setCourseSubtitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Descripción del Programa</label>
                    <textarea
                      rows={4}
                      required
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl p-4 text-xs text-slate-200"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Precio (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={coursePrice}
                        onChange={(e) => setCoursePrice(parseFloat(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Nivel</label>
                      <select
                        value={courseLevel}
                        onChange={(e) => setCourseLevel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-350 cursor-pointer"
                      >
                        <option value="beginner">Principiante</option>
                        <option value="intermediate">Intermedio</option>
                        <option value="advanced">Avanzado</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Miniatura / Thumbnail</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCourseThumbnailFile(e.target.files[0])}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 file:cursor-pointer"
                      />
                    </div>
                  </div>

                  {editingCourse && (
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="published"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="rounded border-slate-800 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                      />
                      <label htmlFor="published" className="text-xs font-semibold text-slate-300 cursor-pointer">
                        Publicar curso para catalogación en la tienda
                      </label>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCourseForm(false);
                        setEditingCourse(null);
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl btn-gradient text-xs font-semibold text-white flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingCourse ? 'Actualizar Curso' : 'Guardar Curso'}</span>
                    </button>
                  </div>
                </form>

                {/* VISUAL SYLLABUS BUILDER (Only for existing edited courses) */}
                {editingCourse && (
                  <div className="border-t border-slate-900 pt-8 space-y-6">
                    <h4 className="font-display font-extrabold text-base text-white">Estructura del Temario (Módulos y Lecciones)</h4>
                    
                    {/* Add Module Form */}
                    <form onSubmit={handleAddModule} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Título del Módulo (Ej: Introducción a Python)"
                        value={moduleTitle}
                        onChange={(e) => setModuleTitle(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Añadir Módulo</span>
                      </button>
                    </form>

                    {/* Modules editor layout list */}
                    <div className="space-y-4">
                      {editingCourse.modules?.map((mod, modIdx) => (
                        <div key={mod._id} className="border border-slate-900 rounded-xl p-4 space-y-4 bg-slate-950/20">
                          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                            <span className="font-display font-bold text-sm text-slate-200">
                              Módulo {modIdx + 1}: {mod.title}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedModuleForLesson(mod)}
                                className="text-[10px] bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded text-indigo-400 hover:bg-indigo-500/20 font-bold flex items-center space-x-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Añadir Clase</span>
                              </button>
                              <button
                                onClick={() => handleDeleteModule(mod._id)}
                                className="text-slate-500 hover:text-rose-455 p-1 rounded-full cursor-pointer"
                                title="Eliminar Módulo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Lesson builder inline modal/form */}
                          {selectedModuleForLesson?._id === mod._id && (
                            <form onSubmit={handleAddLesson} className="glass-panel p-4 rounded-xl border border-slate-900/80 space-y-3">
                              <h5 className="font-display font-semibold text-xs text-indigo-400">Nueva Clase para: {mod.title}</h5>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Título de la lección"
                                  required
                                  value={lessonTitle}
                                  onChange={(e) => setLessonTitle(e.target.value)}
                                  className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-slate-200"
                                />
                                <input
                                  type="number"
                                  placeholder="Duración (minutos)"
                                  required
                                  value={lessonDuration}
                                  onChange={(e) => setLessonDuration(parseInt(e.target.value))}
                                  className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-slate-200"
                                />
                              </div>

                              <input
                                type="text"
                                placeholder="Descripción corta"
                                value={lessonDescription}
                                onChange={(e) => setLessonDescription(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-slate-200"
                              />

                              <textarea
                                placeholder="Contenido o notas explicativas"
                                rows={2}
                                value={lessonContent}
                                onChange={(e) => setLessonContent(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-900 rounded-lg p-3 text-xs text-slate-200"
                              ></textarea>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                                    <Video className="w-3.5 h-3.5 text-indigo-455" />
                                    <span>Video (.mp4)</span>
                                  </label>
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setLessonVideoFile(e.target.files[0])}
                                    className="text-[10px] text-slate-400 file:border-0 file:bg-slate-900 file:text-slate-300 file:px-2 file:py-1 file:rounded"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                                    <FileText className="w-3.5 h-3.5 text-indigo-455" />
                                    <span>Recurso PDF</span>
                                  </label>
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setLessonPdfFile(e.target.files[0])}
                                    className="text-[10px] text-slate-400 file:border-0 file:bg-slate-900 file:text-slate-300 file:px-2 file:py-1 file:rounded"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end space-x-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedModuleForLesson(null)}
                                  className="px-3 py-1.5 border border-slate-800 rounded-lg text-[10px] font-semibold text-slate-400"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 btn-gradient text-white rounded-lg text-[10px] font-semibold"
                                >
                                  Añadir
                                </button>
                              </div>
                            </form>
                          )}

                          {/* Lessons lists inside Module */}
                          <div className="divide-y divide-slate-900/60 bg-slate-950/30 rounded-xl border border-slate-900 px-4">
                            {mod.lessons && mod.lessons.length > 0 ? (
                              mod.lessons.map((les) => (
                                <div key={les._id} className="py-2.5 flex items-center justify-between text-xs">
                                  <div className="min-w-0 pr-4">
                                    <p className="font-medium text-slate-350">{les.title}</p>
                                    <p className="text-[10px] text-slate-500 line-clamp-1">{les.description}</p>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteLesson(les._id)}
                                    className="text-slate-650 hover:text-rose-455 p-1 rounded-full cursor-pointer flex-shrink-0"
                                    title="Eliminar Lección"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="text-center py-3 text-[10px] text-slate-600">Este módulo aún no tiene lecciones estructuradas.</p>
                            )}
                          </div>

                        </div>
                      ))}
                    </div>

                  </div>
                )}

              </div>
            ) : (
              /* Catalog Table list for management */
              <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Miniatura</th>
                      <th className="p-4">Título del Curso</th>
                      <th className="p-4">Precio</th>
                      <th className="p-4">Categoría</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {courses.map((course) => (
                      <tr key={course._id} className="hover:bg-slate-900/10">
                        <td className="p-4">
                          <img
                            src={getImageUrl(course.thumbnail)}
                            alt={course.title}
                            className="w-12 h-7 object-cover rounded bg-slate-950"
                          />
                        </td>
                        <td className="p-4 font-semibold text-slate-200 max-w-xs truncate">{course.title}</td>
                        <td className="p-4 font-mono font-medium text-slate-300">${course.price.toFixed(2)}</td>
                        <td className="p-4 text-slate-400">{course.category}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded font-bold text-[9px] border uppercase ${
                            course.isPublished
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                          }`}>
                            {course.isPublished ? 'Publicado' : 'Borrador'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => startEditCourse(course)}
                              className="p-1.5 bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-indigo-400 cursor-pointer"
                              title="Editar Temario/Configuración"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course._id)}
                              className="p-1.5 bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-rose-455 cursor-pointer"
                              title="Eliminar curso"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            USERS PANEL (Admin Only)
           ========================================== */}
        {activeTab === 'users' && isAdmin && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-display font-bold text-xl text-white">Gestión de Cuentas de Usuario</h2>

            <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Correo Electrónico</th>
                    <th className="p-4">Rol de Sistema</th>
                    <th className="p-4">Inscripciones</th>
                    <th className="p-4 text-center">Acciones / Roles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {usersList.map((usr) => (
                    <tr key={usr._id} className="hover:bg-slate-900/10">
                      <td className="p-4 flex items-center space-x-3">
                        <img
                          src={usr.avatar}
                          alt={usr.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-800"
                        />
                        <span className="font-semibold text-slate-200">{usr.name}</span>
                      </td>
                      <td className="p-4 text-slate-400">{usr.email}</td>
                      <td className="p-4 uppercase font-bold text-[9px] tracking-wider text-indigo-400">
                        {usr.role}
                      </td>
                      <td className="p-4 text-slate-500 font-mono">{usr.enrolledCourses?.length || 0} cursos</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2">
                          <select
                            value={usr.role}
                            onChange={(e) => handleUpdateRole(usr._id, e.target.value)}
                            disabled={usr._id === user._id}
                            className="bg-slate-950 border border-slate-900 rounded px-2 py-1 text-[10px] text-slate-350 cursor-pointer disabled:opacity-50"
                          >
                            <option value="student">Estudiante</option>
                            <option value="instructor">Instructor</option>
                            <option value="admin">Administrador</option>
                          </select>
                          
                          <button
                            onClick={() => handleDeleteUser(usr._id)}
                            disabled={usr._id === user._id}
                            className="p-1 text-slate-500 hover:text-rose-455 disabled:opacity-40 cursor-pointer"
                            title="Eliminar Cuenta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================
            COUPONS PANEL (Admin Only)
           ========================================== */}
        {activeTab === 'coupons' && isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            
            {/* Create Coupon form (5 columns) */}
            <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-900 shadow-xl space-y-4">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider border-b border-slate-900 pb-3">Nuevo Cupón de Descuento</h3>
              
              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Código de Cupón</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: PRO50"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Tipo</label>
                    <select
                      value={couponType}
                      onChange={(e) => setCouponType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-350 cursor-pointer"
                    >
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Fijo ($ USD)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Valor Descuento</label>
                    <input
                      type="number"
                      required
                      value={couponValue}
                      onChange={(e) => setCouponValue(parseFloat(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Límite de usos (Dejar vacío para ilimitado)</label>
                  <input
                    type="number"
                    placeholder="Ej: 100"
                    value={couponMaxUses}
                    onChange={(e) => setCouponMaxUses(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-gradient text-white font-semibold py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Crear Cupón
                </button>
              </form>
            </div>

            {/* Coupons list table (7 columns) */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-900 shadow-xl space-y-4">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider border-b border-slate-900 pb-3">Cupones Activos</h3>
              
              <div className="overflow-hidden border border-slate-900 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 font-bold uppercase">
                      <th className="p-3">Código</th>
                      <th className="p-3">Descuento</th>
                      <th className="p-3">Usos</th>
                      <th className="p-3 text-center">Eliminar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {coupons.map((coupon) => (
                      <tr key={coupon._id} className="hover:bg-slate-900/10">
                        <td className="p-3 font-mono font-bold text-indigo-400">{coupon.code}</td>
                        <td className="p-3 font-medium">
                          {coupon.discountType === 'percentage' ? `${coupon.value}%` : `$${coupon.value} USD`}
                        </td>
                        <td className="p-3 text-slate-400 font-mono">
                          {coupon.usesCount} / {coupon.maxUses || '∞'}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            className="text-slate-500 hover:text-rose-455 p-1 rounded-full cursor-pointer"
                            title="Eliminar Cupón"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
