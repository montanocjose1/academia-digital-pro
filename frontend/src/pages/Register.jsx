import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, UserPlus, Mail, Lock, User, ShieldAlert, ArrowRight } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role: student
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!name || !email || !password) {
      setError('Por favor, complete todos los campos.');
      setSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setSubmitting(false);
      return;
    }

    const res = await register(name, email, password, role);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Error al crear la cuenta.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center pt-28 pb-16 px-4 relative overflow-hidden">
      
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-3xl border border-slate-900 shadow-2xl relative">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 justify-center">
            <div className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Academia<span className="text-indigo-400">Pro</span>
            </span>
          </Link>
          <h2 className="font-display font-bold text-2xl text-white">Crea tu cuenta</h2>
          <p className="text-xs text-slate-400">
            Únete a nuestra plataforma académica y comienza hoy.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs rounded-xl p-3.5 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Nombre Completo</label>
              <div className="relative">
                <User className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-650" />
                <input
                  type="text"
                  required
                  placeholder="Tu Nombre y Apellido"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Contraseña (mín. 6 caracteres)</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Role Switch tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">¿Deseas comprar o vender cursos?</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-955 border border-slate-850 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    role === 'student'
                      ? 'bg-slate-900 text-indigo-400 border border-slate-800'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Quiero Estudiar
                </button>
                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    role === 'instructor'
                      ? 'bg-slate-900 text-indigo-400 border border-slate-800'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Quiero Enseñar
                </button>
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-gradient text-white font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? 'Creando Cuenta...' : 'Registrarse'}</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </form>

        {/* Redirect toggle */}
        <p className="text-center text-xs text-slate-500">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-semibold text-indigo-400 hover:underline">
            Inicia sesión
          </Link>
        </p>

      </div>
    </div>
  );
}
