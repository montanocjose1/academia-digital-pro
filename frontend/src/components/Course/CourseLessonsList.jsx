import React, { useState } from 'react';
import { Play, Lock, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export default function CourseLessonsList({ modules = [], isEnrolled = false, onLessonClick }) {
  const [expandedModules, setExpandedModules] = useState(() => {
    // Expand the first module by default
    const initial = {};
    if (modules.length > 0) {
      initial[modules[0]._id] = true;
    }
    return initial;
  });

  const toggleModule = (id) => {
    setExpandedModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!modules || modules.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
        El temario del curso aún no ha sido estructurado por el instructor.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {modules.map((mod, index) => {
        const isExpanded = expandedModules[mod._id];
        return (
          <div key={mod._id} className="border border-slate-800 rounded-xl bg-slate-900/35 overflow-hidden">
            {/* Module Accordion Header */}
            <button
              onClick={() => toggleModule(mod._id)}
              className="w-full flex items-center justify-between p-4 text-left font-display font-semibold text-slate-200 hover:bg-slate-900/60 transition-colors focus:outline-none"
            >
              <div className="flex flex-col">
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Módulo {index + 1}</span>
                <span className="text-base mt-0.5">{mod.title}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-500">
                <span className="text-xs">{mod.lessons?.length || 0} lecciones</span>
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>

            {/* Lessons List */}
            {isExpanded && (
              <div className="border-t border-slate-800/80 divide-y divide-slate-800/50 bg-slate-950/40">
                {mod.lessons && mod.lessons.length > 0 ? (
                  mod.lessons.map((lesson) => {
                    const hasPdf = !!lesson.pdfUrl;

                    return (
                      <div
                        key={lesson._id}
                        onClick={() => isEnrolled && onLessonClick && onLessonClick(lesson)}
                        className={`flex items-center justify-between px-6 py-3.5 transition-colors ${
                          isEnrolled
                            ? 'hover:bg-slate-900/40 cursor-pointer'
                            : 'opacity-75'
                        }`}
                      >
                        <div className="flex items-center space-x-3 pr-4">
                          {isEnrolled ? (
                            <Play className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-300">{lesson.title}</span>
                            <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">{lesson.description}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-slate-500 flex-shrink-0">
                          {hasPdf && (
                            <span className="flex items-center space-x-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-indigo-400 font-medium">
                              <FileText className="w-3 h-3" />
                              <span>PDF</span>
                            </span>
                          )}
                          <span>{lesson.duration} min</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-600">
                    No hay lecciones cargadas en este módulo.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
