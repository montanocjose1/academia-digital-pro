import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogIn, Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Password Recovery Mockup states
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  // Retrieve redirects if they were sent here from checkout or admin guards
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!email || !password) {
      setError('Por favor, complete todos los campos.');
      setSubmitting(false);
      return;
    }

    const res = await login(email, password);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.message || 'Credenciales inválidas.');
    }
    setSubmitting(false);
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySent(false);
    setRecoveryLoading(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      const res = await fetch(`${API_URL}/auth/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setRecoverySent(true);
      } else {
        setRecoveryError(data.message);
      }
    } catch (err) {
      setRecoveryError('Error de red al intentar recuperar contraseña.');
    } finally {
      setRecoveryLoading(false);
    }
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
          <h2 className="font-display font-bold text-2xl text-white">Bienvenido de nuevo</h2>
          <p className="text-xs text-slate-400">
            Ingresa a tu cuenta para continuar con tu aprendizaje.
          </p>
        </div>

        {/* Credentials guide helper */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl space-y-1.5 text-[11px] text-slate-400">
          <span className="font-bold text-indigo-400 uppercase tracking-wide">Cuentas demo (Semilla):</span>
          <div className="grid grid-cols-1 gap-1">
            <div>• <span className="text-slate-200 font-medium">Estudiante:</span> estudiante@academiapro.com / estudiante123</div>
            <div>• <span className="text-slate-200 font-medium">Instructor:</span> instructor@academiapro.com / instructor123</div>
            <div>• <span className="text-slate-200 font-medium">Administrador:</span> admin@academiapro.com / admin123</div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs rounded-xl p-3.5 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            
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
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400">Contraseña</label>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="text-[11px] font-semibold text-indigo-400 hover:underline focus:outline-none"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
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

          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-gradient text-white font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? 'Ingresando...' : 'Iniciar Sesión'}</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </form>

        {/* Redirect toggle */}
        <p className="text-center text-xs text-slate-500">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-semibold text-indigo-400 hover:underline">
            Registrate ahora
          </Link>
        </p>

      </div>

      {/* Password Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <h3 className="font-display font-bold text-lg text-white">Recuperar Contraseña</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Ingrese su dirección de correo electrónico registrado. Le enviaremos instrucciones de recuperación ficticias.
            </p>

            {recoveryError && <p className="text-xs text-rose-400 font-semibold">{recoveryError}</p>}
            {recoverySent && <p className="text-xs text-emerald-400 font-semibold">¡Enlace enviado! Revisa tu bandeja de entrada.</p>}

            <form onSubmit={handleRecoverySubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="correo@recuperar.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecoveryModal(false);
                    setRecoverySent(false);
                    setRecoveryError('');
                  }}
                  className="flex-1 py-2 rounded-lg border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={recoveryLoading || recoverySent}
                  className="flex-1 py-2 rounded-lg btn-gradient text-xs font-semibold text-white disabled:opacity-50 cursor-pointer"
                >
                  {recoveryLoading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
