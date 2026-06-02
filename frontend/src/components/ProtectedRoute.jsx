import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-950"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
        </div>
        <p className="text-slate-400 font-medium text-sm animate-pulse">Cargando perfil seguro...</p>
      </div>
    );
  }

  // Check if authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-rose-950/30 rounded-2xl flex items-center justify-center border border-rose-500/20 mb-6 text-rose-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="font-display font-bold text-3xl text-white mb-2">Acceso No Autorizado</h1>
        <p className="text-slate-400 max-w-md mb-8">
          Tu cuenta con rol de <span className="text-indigo-400 font-semibold">{user.role}</span> no tiene los privilegios necesarios para ver este contenido.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
}
