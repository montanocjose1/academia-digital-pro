import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../components/Course/CourseCard';
import StarRating from '../components/Common/StarRating';
import { BrainCircuit, BookOpen, Award, Users, ChevronRight, ShoppingCart, CheckCircle, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Home() {
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [courses, setCourses] = useState([]);
  const [featuredCourse, setFeaturedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/courses`);
        const data = await res.json();
        if (data.success) {
          setCourses(data.courses);
          // Find the Genetic Algorithms course as featured
          const ga = data.courses.find((c) => c.title.toLowerCase().includes('genéticos'));
          if (ga) {
            setFeaturedCourse(ga);
          } else if (data.courses.length > 0) {
            setFeaturedCourse(data.courses[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const isEnrolled = (courseId) => {
    return user?.enrolledCourses?.some(c => c._id === courseId || c === courseId);
  };

  return (
    <div className="space-y-24 pb-20 pt-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-8">
        {/* Neon Glow spots */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <span className="inline-flex items-center space-x-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4 animate-spin-slow" />
            <span>El futuro del aprendizaje digital</span>
          </span>

          <h1 className="font-display font-extrabold text-5xl md:text-7xl text-white tracking-tight leading-none max-w-4xl mx-auto">
            Domina las Habilidades del <span className="text-gradient">Futuro Tecnológico</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Plataforma interactiva y especializada para adquirir conocimientos de nivel profesional en inteligencia artificial, desarrollo de software y optimización matemática.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/courses"
              className="w-full sm:w-auto btn-gradient text-white font-semibold px-8 py-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>Explorar Cursos</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="#featured"
              className="w-full sm:w-auto btn-gradient-secondary text-slate-300 font-semibold px-8 py-4 rounded-xl flex items-center justify-center"
            >
              Ver Curso Destacado
            </a>
          </div>
        </div>
      </section>

      {/* 2. Platform Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '15K+', label: 'Estudiantes Activos', icon: Users, color: 'text-blue-400' },
            { value: '50+', label: 'Cursos Especializados', icon: BookOpen, color: 'text-indigo-400' },
            { value: '98.5%', label: 'Tasa de Satisfacción', icon: Award, color: 'text-purple-400' },
            { value: '10K+', label: 'Certificaciones Emitidas', icon: CheckCircle, color: 'text-emerald-400' },
          ].map((stat, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
              <stat.icon className={`w-8 h-8 ${stat.color} mb-1`} />
              <span className="font-display font-extrabold text-3xl text-white">{stat.value}</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Course Section */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white">
            Curso Destacado del Mes
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Nuestra recomendación principal para adentrarse en la optimización avanzada de inteligencias artificiales.
          </p>
        </div>

        {loading ? (
          <div className="glass-panel p-12 rounded-3xl flex justify-center items-center">
            <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin"></div>
          </div>
        ) : featuredCourse ? (
          <div className="glass-panel rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 border border-slate-800/80 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
            
            {/* Visual Part */}
            <div className="lg:col-span-5 relative aspect-video lg:aspect-auto bg-slate-900 overflow-hidden">
              <img
                src={getImageUrl(featuredCourse.thumbnail)}
                alt={featuredCourse.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 to-transparent"></div>
            </div>

            {/* Description Part */}
            <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase px-3 py-1 rounded-md tracking-wider">
                    {featuredCourse.category}
                  </span>
                  <span className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase px-3 py-1 rounded-md tracking-wider">
                    Avanzado
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl md:text-4xl text-white tracking-tight">
                  {featuredCourse.title}
                </h3>

                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  {featuredCourse.subtitle}
                </p>

                <div className="flex items-center space-x-3 pt-2">
                  <StarRating rating={featuredCourse.rating} size={18} />
                  <span className="text-sm font-bold text-amber-400">{featuredCourse.rating}</span>
                  <span className="text-xs text-slate-500">({featuredCourse.ratingsCount} reviews de estudiantes)</span>
                </div>

                {/* Benefits */}
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 text-xs text-slate-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Resolución del TSP con Algoritmos Evolutivos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Neuroevolución e IA con Python</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Clases en video HD y recursos PDF</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Diploma digital verificado con Hash</span>
                  </li>
                </ul>
              </div>

              {/* Purchase Box */}
              <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Inversión única</span>
                  <span className="font-display font-black text-3xl text-white">${featuredCourse.price.toFixed(2)} USD</span>
                </div>

                <div className="flex items-center gap-3">
                  {isEnrolled(featuredCourse._id) ? (
                    <Link
                      to="/profile"
                      className="w-full sm:w-auto btn-gradient text-white font-semibold px-6 py-3.5 rounded-xl flex items-center justify-center space-x-2"
                    >
                      <span>Estudiar Curso</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        to={`/courses/${featuredCourse._id}`}
                        className="btn-gradient-secondary text-slate-300 font-semibold px-5 py-3 rounded-xl text-sm"
                      >
                        Ver Programa
                      </Link>

                      {isInCart(featuredCourse._id) ? (
                        <Link
                          to="/cart"
                          className="btn-gradient text-white font-semibold px-6 py-3 rounded-xl text-sm flex items-center space-x-2"
                        >
                          <ShoppingCart className="w-4.5 h-4.5" />
                          <span>Ver Carrito</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => addToCart(featuredCourse)}
                          className="btn-gradient text-white font-semibold px-6 py-3 rounded-xl text-sm flex items-center space-x-2 cursor-pointer"
                        >
                          <ShoppingCart className="w-4.5 h-4.5" />
                          <span>Comprar Ahora</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500 py-12">
            No se encontró ningún curso destacado configurado en la base de datos.
          </div>
        )}
      </section>

      {/* 4. Value Propositions Section */}
      <section className="bg-slate-950/40 py-12 border-y border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-16">
            <h2 className="font-display font-bold text-3xl text-white">¿Por qué estudiar en Academia Digital Pro?</h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Nuestra metodología está diseñada para brindar la máxima calidad de aprendizaje e inserción laboral.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Educación Basada en Proyectos',
                desc: 'Aplica cada concepto resolviendo casos prácticos reales, programando simulaciones y configurando optimizaciones desde la primera clase.',
                icon: '🛠️',
              },
              {
                title: 'Profesores Universitarios y de Industria',
                desc: 'Aprende directamente de científicos de datos e ingenieros expertos que trabajan diariamente implementando modelos en producción.',
                icon: '👨‍🏫',
              },
              {
                title: 'Certificados Digitales Auténticos',
                desc: 'Obtén credenciales de egresado aseguradas con hashes criptográficos que puedes enlazar directamente a tu LinkedIn o currículum.',
                icon: '🎓',
              },
            ].map((prop, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-2xl space-y-4">
                <span className="text-4xl">{prop.icon}</span>
                <h3 className="font-display font-bold text-xl text-white">{prop.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Latest Catalog Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <h2 className="font-display font-bold text-3xl text-white">Nuevas Incorporaciones</h2>
            <p className="text-slate-400 text-sm max-w-lg">
              Explora las últimas temáticas incorporadas en nuestra plataforma.
            </p>
          </div>
          <Link
            to="/courses"
            className="text-sm font-semibold text-indigo-400 flex items-center space-x-1 hover:text-indigo-300 transition-colors group"
          >
            <span>Ver todo el catálogo</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel h-80 rounded-2xl animate-pulse bg-slate-900/50"></div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course) => (
              <div key={course._id} className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-full hover:border-slate-700 transition-all">
                <div className="space-y-3">
                  <img
                    src={getImageUrl(course.thumbnail)}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-xl bg-slate-900"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                      {course.category}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-white line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{course.subtitle}</p>
                </div>
                <div className="border-t border-slate-900 mt-4 pt-3 flex items-center justify-between">
                  <span className="font-display font-bold text-base text-white">${course.price} USD</span>
                  <Link to={`/courses/${course._id}`} className="text-xs font-semibold text-indigo-400 hover:underline">
                    Ver Curso
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 py-6">
            No hay cursos catalogados en este momento.
          </div>
        )}
      </section>
      
    </div>
  );
}
