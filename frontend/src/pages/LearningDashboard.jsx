import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Square, PlayCircle, Download, Award, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, X, FileText } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function LearningDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, toggleLesson } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  
  // Certificate states
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Load course details
  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/courses/${id}`);
      const data = await response.json();
      if (data.success) {
        setCourse(data.course);

        // Find initial lesson
        const initialLessonId = location.state?.initialLessonId;
        let foundLesson = null;
        
        if (data.course.modules && data.course.modules.length > 0) {
          if (initialLessonId) {
            // Find lesson by ID from redirect state
            data.course.modules.forEach((mod) => {
              const match = mod.lessons?.find((l) => l._id === initialLessonId);
              if (match) foundLesson = match;
            });
          }
          if (!foundLesson && data.course.modules[0].lessons?.length > 0) {
            // Default to first lesson
            foundLesson = data.course.modules[0].lessons[0];
          }
        }
        setActiveLesson(foundLesson);
      }
    } catch (err) {
      console.error('Error loading course workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  // Check if enrolled
  const isEnrolled = course ? user?.enrolledCourses?.some(c => c._id === course._id || c === course._id) : false;

  useEffect(() => {
    if (!loading && !isEnrolled) {
      navigate(`/courses/${id}`);
    }
  }, [loading, isEnrolled]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-900 border-t-indigo-500 animate-spin"></div>
        <p className="text-slate-500 text-sm">Abriendo sala de aprendizaje...</p>
      </div>
    );
  }

  if (!course) return null;

  // Flatten lessons list for progress calculations and nav next/prev
  const allLessons = [];
  course.modules?.forEach((mod) => {
    mod.lessons?.forEach((les) => {
      allLessons.push(les);
    });
  });

  const totalLessonsCount = allLessons.length;
  const completedLessonsInCourse = allLessons.filter((les) =>
    user?.completedLessons?.includes(les._id)
  );
  const completedLessonsCount = completedLessonsInCourse.length;
  const progressPercentage = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;
  const courseFinished = progressPercentage === 100;

  // Next/Prev navigation
  const activeIndex = allLessons.findIndex((l) => l._id === activeLesson?._id);
  const nextLesson = activeIndex > -1 && activeIndex < allLessons.length - 1 ? allLessons[activeIndex + 1] : null;
  const prevLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : null;

  // Handle lesson checkmark toggle
  const handleToggleComplete = async (lessonId) => {
    await toggleLesson(lessonId);
  };

  // Generate certificate API call
  const handleGenerateCertificate = async () => {
    setCertificateLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: course._id }),
      });
      const data = await response.json();
      if (data.success) {
        setCertificateData(data.certificate);
        setShowCertificateModal(true);
      }
    } catch (err) {
      console.error('Error generating certificate:', err);
    } finally {
      setCertificateLoading(false);
    }
  };

  // Resolves local PDF paths or returns links
  const getPdfLink = (pdfUrl) => {
    if (!pdfUrl) return null;
    if (pdfUrl.startsWith('/uploads')) {
      return `${BACKEND_URL}${pdfUrl}`;
    }
    return pdfUrl;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pt-16">
      
      {/* Header Info Area */}
      <div className="bg-slate-950/80 backdrop-blur border-b border-slate-900 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link to={`/courses/${course._id}`} className="text-xs text-indigo-400 font-semibold hover:underline flex items-center space-x-1">
            <ChevronLeft className="w-4 h-4" />
            <span>Volver a detalles</span>
          </Link>
          <h1 className="font-display font-bold text-lg text-white truncate max-w-md">{course.title}</h1>
        </div>

        {/* Progress Display */}
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="flex-1 sm:w-48 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
              <span>Mi Progreso</span>
              <span className="text-indigo-400">{progressPercentage}% ({completedLessonsCount}/{totalLessonsCount})</span>
            </div>
            <div className="w-full bg-slate-900 border border-slate-850 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300 progress-bar-glow"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Certificate Download button if 100% */}
          {courseFinished && (
            <button
              onClick={handleGenerateCertificate}
              disabled={certificateLoading}
              className="bg-gradient-to-r from-amber-500 to-indigo-650 hover:from-amber-400 hover:to-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 flex-shrink-0 animate-bounce"
            >
              <Award className="w-4.5 h-4.5" />
              <span>{certificateLoading ? 'Generando...' : 'Mi Certificado'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Course Workspace (Left/Center) */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {activeLesson ? (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* HTML5 video player */}
              <div className="aspect-video bg-slate-900 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center">
                {activeLesson.videoUrl ? (
                  <video
                    src={activeLesson.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-8 space-y-2 text-slate-500">
                    <PlayCircle className="w-12 h-12 text-slate-650 mx-auto" />
                    <p className="text-sm font-medium">No hay video configurado para esta clase.</p>
                  </div>
                )}
              </div>

              {/* Title & Notes Info */}
              <div className="glass-panel p-6 md:p-8 rounded-2xl space-y-4 border border-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                  <div className="space-y-1">
                    <h2 className="font-display font-bold text-xl text-white">{activeLesson.title}</h2>
                    <p className="text-xs text-slate-500">Duración estimada: {activeLesson.duration} minutos</p>
                  </div>
                  
                  {/* Mark complete checkbox */}
                  <button
                    onClick={() => handleToggleComplete(activeLesson._id)}
                    className={`flex items-center space-x-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      user?.completedLessons?.includes(activeLesson._id)
                        ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {user?.completedLessons?.includes(activeLesson._id) ? (
                      <>
                        <CheckSquare className="w-4 h-4" />
                        <span>Completada ✓</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4" />
                        <span>Marcar Completada</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Lesson Description */}
                <p className="text-slate-350 text-xs md:text-sm leading-relaxed whitespace-pre-wrap pt-2">
                  {activeLesson.description}
                </p>

                {/* Lesson Notes/Content */}
                {activeLesson.content && (
                  <div className="bg-slate-950/50 border border-slate-900/60 p-5 rounded-xl space-y-3 mt-4">
                    <h4 className="font-display font-semibold text-xs text-indigo-400 uppercase tracking-wider">Notas de Clase</h4>
                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap font-sans">
                      {activeLesson.content}
                    </p>
                  </div>
                )}

                {/* Download PDF resources button */}
                {activeLesson.pdfUrl && (
                  <div className="pt-4 border-t border-slate-900 flex justify-end">
                    <a
                      href={getPdfLink(activeLesson.pdfUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-4 py-2.5 hover:bg-indigo-500/10 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar Lectura PDF</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Navigation next/prev button row */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => prevLesson && setActiveLesson(prevLesson)}
                  disabled={!prevLesson}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-455 cursor-pointer p-2 bg-slate-900 rounded-xl border border-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
                <button
                  onClick={() => nextLesson && setActiveLesson(nextLesson)}
                  disabled={!nextLesson}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-slate-450 hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-455 cursor-pointer p-2 bg-slate-900 rounded-xl border border-slate-800"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              No hay lección activa seleccionada.
            </div>
          )}
        </div>

        {/* Sidebar Index Syllabus (Right Column) */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-900 bg-slate-950/20 overflow-y-auto p-4 space-y-4">
          <h3 className="font-display font-extrabold text-sm text-slate-200 uppercase tracking-wider px-2">Temario de Estudios</h3>
          
          <div className="space-y-4">
            {course.modules?.map((mod, modIdx) => (
              <div key={mod._id} className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-2">
                  Mod {modIdx + 1}: {mod.title.replace(/^Módulo \d+:\s*/i, '')}
                </h4>

                <div className="space-y-1">
                  {mod.lessons?.map((lesson) => {
                    const isSelected = activeLesson?._id === lesson._id;
                    const isCompleted = user?.completedLessons?.includes(lesson._id);

                    return (
                      <button
                        key={lesson._id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all text-xs font-medium cursor-pointer focus:outline-none ${
                          isSelected
                            ? 'bg-indigo-500/10 border border-indigo-500/30 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border border-transparent'
                        }`}
                      >
                        <span className="truncate pr-4">{lesson.title}</span>
                        {isCompleted && (
                          <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            Ok
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Certificate Modal */}
      {showCertificateModal && certificateData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative text-center">
            
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Premium Gold Diploma Layout */}
            <div className="border-4 border-double border-amber-500/40 p-6 md:p-10 rounded-2xl space-y-6 relative overflow-hidden bg-slate-950">
              
              {/* Background gold graphics */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>

              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/25 mx-auto">
                <Award className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="font-display font-bold text-xs uppercase tracking-widest text-amber-550">Academia Digital Pro</h4>
                <h2 className="font-display font-extrabold text-2xl md:text-3xl text-gradient-gold uppercase tracking-tight">Diploma de Egreso</h2>
                <p className="text-[10px] text-slate-500 italic">Este certificado acredita la finalización y aprobación del programa de estudios.</p>
              </div>

              <div className="space-y-1 py-4">
                <p className="text-xs text-slate-400">Otorgado con honor a:</p>
                <h3 className="font-display font-black text-xl md:text-2xl text-white">{certificateData.student?.name}</h3>
                <div className="w-24 h-px bg-amber-500/30 mx-auto mt-2"></div>
              </div>

              <div className="space-y-1 py-2">
                <p className="text-xs text-slate-400">Por haber concluido exitosamente el curso de nivel avanzado:</p>
                <h3 className="font-display font-bold text-base text-indigo-300">{certificateData.course?.title}</h3>
                <p className="text-[10px] text-slate-500">Bajo la guía e instrucción de: <span className="text-slate-400 font-medium">Dr. Alejandro Rueda</span></p>
              </div>

              {/* Code Hash details */}
              <div className="border-t border-slate-900 pt-6 grid grid-cols-2 gap-4 text-[10px] text-left text-slate-500">
                <div className="space-y-0.5">
                  <span className="font-semibold uppercase tracking-wider text-slate-600">ID de Certificado:</span>
                  <p className="font-mono text-slate-400">{certificateData.certificateHash}</p>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="font-semibold uppercase tracking-wider text-slate-600">Fecha de Emisión:</span>
                  <p className="text-slate-400">{new Date(certificateData.issueDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Print and share triggers */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`${API_URL}/certificates/verify/${certificateData.certificateHash}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto btn-gradient text-white font-semibold px-6 py-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verificar y Compartir</span>
              </a>
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto btn-gradient-secondary text-slate-300 font-semibold px-6 py-3 rounded-xl text-xs flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Imprimir Diploma</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
