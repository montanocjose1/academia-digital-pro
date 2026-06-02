import React, { useState, useEffect } from 'react';
import CourseCard from '../components/Course/CourseCard';
import { Search, Filter, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Catalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let queryParams = new URLSearchParams();
      if (category) queryParams.append('category', category);
      if (level) queryParams.append('level', level);
      if (search) queryParams.append('search', search);
      queryParams.append('publishedOnly', 'true');

      const res = await fetch(`${API_URL}/courses?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch courses when filters change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCourses();
    }, 300); // Debounce search input

    return () => clearTimeout(delayDebounce);
  }, [search, category, level]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setLevel('');
  };

  const categories = ['Inteligencia Artificial', 'Desarrollo Web', 'Programación'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-12">
      
      {/* Page Header */}
      <div className="space-y-2 text-center md:text-left">
        <h1 className="font-display font-extrabold text-4xl text-white">Catálogo de Cursos</h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl">
          Explora toda nuestra oferta educativa y comienza a capacitarte con el temario más moderno y estructurado.
        </p>
      </div>

      {/* Filter Controls Row */}
      <div className="glass-panel p-6 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center border border-slate-800/80">
        
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por título, palabra clave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="">Todas las Categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div className="md:col-span-3">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="">Todos los Niveles</option>
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </div>

        {/* Reset Filters button */}
        <div className="md:col-span-1 flex justify-center">
          <button
            onClick={handleResetFilters}
            className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            title="Limpiar filtros"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-panel h-96 rounded-2xl animate-pulse bg-slate-900/50"></div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-panel rounded-2xl border border-dashed border-slate-800/80">
          <Filter className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl text-white mb-2">No se encontraron cursos</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
            Intente ajustando sus filtros de búsqueda o categoría para encontrar lo que busca.
          </p>
          <button
            onClick={handleResetFilters}
            className="btn-gradient text-white text-xs font-semibold px-4 py-2.5 rounded-lg"
          >
            Restablecer Filtros
          </button>
        </div>
      )}

    </div>
  );
}
