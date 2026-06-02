import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../components/Course/CourseCard';
import { Settings, BookOpen, Award, User, Mail, Lock, ShieldCheck, ArrowRight, BookOpenCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  
  // Profile update form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [password, setPassword] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  // Certificates state
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [enrolledCoursesDetails, setEnrolledCoursesDetails] = useState([]);

  // Fetch full details of enrolled courses (to compute progress)
  useEffect(() => {
    const fetchCoursesProgress = async () => {
      if (!user?.enrolledCourses || user.enrolledCourses.length === 0) return;
      
      try {
        const token = localStorage.getItem('token');
        const detailedCourses = [];
        
        for (const ec of user.enrolledCourses) {
          const courseId = ec._id || ec;
          const res = await fetch(`${API_URL}/courses/${courseId}`);
          const data = await res.json();
          if (data.success) {
            detailedCourses.push(data.course);
          }
        }
        setEnrolledCoursesDetails(detailedCourses);
      } catch (err) {
        console.error('Error fetching enrolled course details:', err);
      }
    };

    fetchCoursesProgress();
  }, [user]);

  // Fetch user certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      setLoadingCertificates(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/certificates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setCertificates(data.certificates);
        }
      } catch (err) {
        console.error('Error fetching certificates:', err);
      } finally {
        setLoadingCertificates(false);
      }
    };

    if (activeTab === 'certificates') {
      fetchCertificates();
    }
  }, [activeTab]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');
    setUpdating(true);

    if (!name || !email) {
      setUpdateError('Nombre y correo son obligatorios.');
      setUpdating(false);
      return;
    }

    const payload = { name, email, avatar };
    if (password) {
      if (password.length < 6) {
        setUpdateError('La nueva contraseña debe tener al menos 6 caracteres.');
        setUpdating(false);
        return;
      }
      payload.password = password;
    }

    const res = await updateProfile(payload);
    if (res.success) {
      setUpdateSuccess('¡Perfil actualizado con éxito!');
      setPassword('');
    } else {
      setUpdateError(res.message || 'Error al actualizar perfil.');
    }
    setUpdating(false);
  };

  // Helper to calculate progress percentage for a course
  const calculateCourseProgress = (course) => {
    if (!course.modules || course.modules.length === 0) return 0;
    
    // Total lessons in course
    let totalLessons = 0;
    let completedCount = 0;

    course.modules.forEach((mod) => {
      if (mod.lessons) {
        totalLessons += mod.lessons.length;
        mod.lessons.forEach((les) => {
          if (user?.completedLessons?.includes(les._id || les)) {
            completedCount++;
          }
        });
      }
    });

    if (totalLessons === 0) return 0;
    return Math.round((completedCount / totalLessons) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-10">
      
      {/* Profile Header */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-900 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6">
        <img
          src={user?.avatar}
          alt={user?.name}
          className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md flex-shrink-0"
        />
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="font-display font-black text-2xl md:text-3xl text-white">{user?.name}</h1>
            <span className="inline-flex self-center md:self-auto bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wide">
              {user?.role === 'student' ? 'Estudiante' : user?.role === 'instructor' ? 'Instructor' : 'Administrador'}
            </span>
          </div>
          <p className="text-slate-400 text-xs md:text-sm">{user?.email}</p>
          <p className="text-slate-500 text-xs">Miembro desde: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-900 gap-1.5 pb-px">
        {[
          { id: 'courses', label: 'Mis Cursos', icon: BookOpen },
          { id: 'certificates', label: 'Mis Certificados', icon: Award },
          { id: 'account', label: 'Configuración de Cuenta', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-display text-sm font-semibold transition-all cursor-pointer focus:outline-none ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tabs panels */}
      <div className="min-h-[400px]">
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-xl text-white">Cursos en los que estás inscrito</h2>
            {enrolledCoursesDetails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCoursesDetails.map((course) => {
                  const progress = calculateCourseProgress(course);
                  return (
                    <div key={course._id} className="glass-panel p-5 rounded-2xl border border-slate-900 flex flex-col md:flex-row gap-5 items-center justify-between">
                      <div className="flex items-center space-x-4 min-w-0 w-full md:w-auto">
                        <img
                          src={getImageUrl(course.thumbnail)}
                          alt={course.title}
                          className="w-20 h-12 object-cover rounded-lg bg-slate-950 flex-shrink-0"
                        />
                        <div className="min-w-0 space-y-1.5 flex-1">
                          <h3 className="text-sm font-semibold text-slate-200 truncate pr-2" title={course.title}>{course.title}</h3>
                          
                          {/* Progress bar wrapper */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                              <span>Progreso</span>
                              <span className="text-indigo-450">{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-900 overflow-hidden">
                              <div
                                className="bg-gradient-primary h-full rounded-full transition-all duration-500 progress-bar-glow"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0 w-full md:w-auto text-right">
                        <Link
                          to={`/learn/${course._id}`}
                          className="w-full md:w-auto btn-gradient text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center space-x-1"
                        >
                          <span>{progress > 0 ? 'Continuar' : 'Iniciar'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 glass-panel rounded-2xl border border-dashed border-slate-800/80">
                <BookOpenCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg text-white mb-1">Aún no estás inscrito en ningún curso</h3>
                <p className="text-slate-500 text-xs max-w-xs mx-auto mb-6">
                  Adquiere tu primer curso del catálogo y comienza a aprender hoy mismo.
                </p>
                <Link to="/courses" className="btn-gradient text-white text-xs font-semibold px-4 py-2.5 rounded-lg">
                  Ver Catálogo de Cursos
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-xl text-white">Certificados Oficiales Obtenidos</h2>
            {loadingCertificates ? (
              <div className="flex justify-center py-10">
                <div className="w-10 h-10 border-4 border-slate-900 border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
            ) : certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                  <div key={cert._id} className="glass-panel p-6 rounded-2xl border border-slate-900 space-y-4 flex flex-col justify-between h-full relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 border border-amber-500/25">
                        <Award className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-bold text-sm text-slate-200 line-clamp-2 leading-tight">
                        {cert.course?.title}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Cód: {cert.certificateHash}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Fecha: {new Date(cert.issueDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="border-t border-slate-900/60 pt-3 mt-4 text-right">
                      {/* Open public certificate verification */}
                      <a
                        href={`${API_URL}/certificates/verify/${cert.certificateHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center space-x-1"
                      >
                        <span>Verificar Credencial</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 glass-panel rounded-2xl border border-dashed border-slate-800/80">
                <Award className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="font-display font-bold text-lg text-white mb-1">Aún no has completado ningún curso</h3>
                <p className="text-slate-500 text-xs max-w-xs mx-auto">
                  Completa el 100% de las lecciones de un curso inscrito para desbloquear y descargar tu certificado digital.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-900 shadow-xl max-w-xl mx-auto space-y-6">
            <h2 className="font-display font-bold text-lg text-white flex items-center space-x-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              <span>Configuración de Cuenta</span>
            </h2>

            {updateError && <p className="text-xs text-rose-400 font-semibold">{updateError}</p>}
            {updateSuccess && <p className="text-xs text-emerald-400 font-semibold">{updateSuccess}</p>}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Nombre Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-650" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-650" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">URL de Avatar / Foto Perfil</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2.5 px-4 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Nueva Contraseña (Dejar vacío para mantener actual)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-650" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2.5 pl-11 pr-4 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full btn-gradient text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{updating ? 'Actualizando...' : 'Guardar Cambios'}</span>
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
