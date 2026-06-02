import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../components/Course/CourseCard';
import StarRating from '../components/Common/StarRating';
import CourseLessonsList from '../components/Course/CourseLessonsList';
import { BookOpen, User, Calendar, Award, Star, ShoppingCart, Lock, ArrowRight, MessageSquare } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review inputs
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchCourseData = async () => {
    try {
      const courseRes = await fetch(`${API_URL}/courses/${id}`);
      const courseData = await courseRes.json();
      if (courseData.success) {
        setCourse(courseData.course);
      }

      const reviewsRes = await fetch(`${API_URL}/reviews/course/${id}`);
      const reviewsData = await reviewsRes.json();
      if (reviewsData.success) {
        setReviews(reviewsData.reviews);
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const isEnrolled = course ? user?.enrolledCourses?.some(c => c._id === course._id || c === course._id) : false;
  
  const handleLessonClick = (lesson) => {
    // Redirect to study workspace
    navigate(`/learn/${course._id}`, { state: { initialLessonId: lesson._id } });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setReviewSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setReviewError('Debes iniciar sesión para calificar este curso.');
      setReviewSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: course._id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setReviewSuccess('¡Calificación guardada exitosamente!');
        setReviewComment('');
        // Re-fetch reviews and course rating
        fetchCourseData();
      } else {
        setReviewError(data.message);
      }
    } catch (err) {
      setReviewError('Error de conexión al enviar calificación.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-900 border-t-indigo-500 animate-spin"></div>
        <p className="text-slate-500 text-sm">Cargando detalles del curso...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-display font-bold text-3xl text-white mb-2">Curso No Encontrado</h1>
        <p className="text-slate-400 mb-6">El curso que intentas buscar no existe o ha sido despublicado.</p>
        <Link to="/courses" className="btn-gradient text-white px-5 py-2.5 rounded-lg text-sm">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const levelLabels = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Details column (Left) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header Metadata */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase px-3 py-1 rounded-md tracking-wider">
                {course.category}
              </span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold uppercase px-3 py-1 rounded-md tracking-wider">
                {levelLabels[course.level]}
              </span>
            </div>
            
            <h1 className="font-display font-black text-3xl md:text-5xl text-white leading-tight">
              {course.title}
            </h1>
            
            <p className="text-slate-400 text-base md:text-lg leading-relaxed">
              {course.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs md:text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <StarRating rating={course.rating} size={16} />
                <span className="font-bold text-amber-400">{course.rating}</span>
                <span className="text-slate-500">({course.ratingsCount} calificaciones)</span>
              </div>
              <div className="flex items-center space-x-2 border-l border-slate-800 pl-6">
                <User className="w-4.5 h-4.5 text-indigo-400" />
                <span>Instructor: <span className="text-white font-medium">{course.instructor?.name}</span></span>
              </div>
              <div className="flex items-center space-x-2 border-l border-slate-800 pl-6">
                <Calendar className="w-4.5 h-4.5 text-indigo-400" />
                <span>Última actualización: {new Date(course.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-panel p-8 rounded-2xl space-y-4 border border-slate-800/80">
            <h2 className="font-display font-bold text-xl text-white">Acerca del Curso</h2>
            <div className="text-sm text-slate-300 space-y-4 leading-relaxed whitespace-pre-wrap">
              {course.description}
            </div>
          </div>

          {/* Curriculum */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl text-white">Programa de Estudios</h2>
              <span className="text-xs text-slate-500">{course.modules?.length || 0} módulos</span>
            </div>
            <CourseLessonsList
              modules={course.modules}
              isEnrolled={isEnrolled}
              onLessonClick={handleLessonClick}
            />
          </div>

          {/* Reviews List & Write Review */}
          <div className="space-y-6">
            <h2 className="font-display font-bold text-xl text-white flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <span>Reseñas de Alumnos</span>
            </h2>

            {/* Write review panel if enrolled */}
            {isEnrolled && (
              <form onSubmit={handleReviewSubmit} className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800/80">
                <h3 className="font-display font-semibold text-sm text-slate-200 uppercase tracking-wider">Dejar una Calificación</h3>
                
                {reviewError && <p className="text-xs text-rose-400 font-medium">{reviewError}</p>}
                {reviewSuccess && <p className="text-xs text-emerald-400 font-medium">{reviewSuccess}</p>}

                <div className="flex items-center space-x-4">
                  <span className="text-xs text-slate-400">Puntuación:</span>
                  <div className="flex space-x-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none cursor-pointer"
                      >
                        <Star
                          size={20}
                          className={`${
                            reviewRating >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600 hover:text-amber-500'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Escribe tus comentarios acerca del temario, la explicación y calidad del curso..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="btn-gradient text-white text-xs font-semibold px-4 py-2.5 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {reviewSubmitting ? 'Enviando...' : 'Enviar Calificación'}
                </button>
              </form>
            )}

            {/* Review Cards Grid */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev._id} className="glass-panel p-6 rounded-2xl border border-slate-900 flex space-x-4">
                    <img
                      src={rev.student?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&q=80'}
                      alt={rev.student?.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-800"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-200">{rev.student?.name}</span>
                        <span className="text-[10px] text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <StarRating rating={rev.rating} size={12} />
                      <p className="text-xs text-slate-400 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-600 text-xs">
                  Este curso aún no tiene comentarios de alumnos.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Purchase Panel (Right) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl space-y-6 p-6">
            
            <img
              src={getImageUrl(course.thumbnail)}
              alt={course.title}
              className="w-full aspect-video object-cover rounded-xl bg-slate-950"
            />

            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Acceso total de por vida</span>
              <div className="flex items-baseline space-x-2">
                <span className="font-display font-black text-3xl text-white">
                  {course.price > 0 ? `$${course.price.toFixed(2)} USD` : 'Gratis'}
                </span>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="space-y-3">
              {isEnrolled ? (
                <Link
                  to={`/learn/${course._id}`}
                  className="w-full btn-gradient text-white font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Estudiar Ahora</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </Link>
              ) : (
                <>
                  {isInCart(course._id) ? (
                    <Link
                      to="/cart"
                      className="w-full btn-gradient text-white font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <ShoppingCart className="w-4.5 h-4.5" />
                      <span>Ver en Carrito</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => addToCart(course)}
                      className="w-full btn-gradient text-white font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                    >
                      <ShoppingCart className="w-4.5 h-4.5" />
                      <span>Agregar al Carrito</span>
                    </button>
                  )}
                  
                  <p className="text-center text-[10px] text-slate-500 leading-normal">
                    Garantía de reembolso de 30 días. Acceso multidispositivo en móviles y tablets.
                  </p>
                </>
              )}
            </div>

            {/* Course Features bullet points */}
            <div className="border-t border-slate-800/80 pt-4 space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Diploma Criptográfico verificado</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Temario completo y archivos PDF</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Soporte uno a uno con el instructor</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
