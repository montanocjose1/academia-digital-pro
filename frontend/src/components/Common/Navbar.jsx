import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { BookOpen, ShoppingCart, User, LogOut, LayoutDashboard, LogIn, Menu, X, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Monitor scroll to trigger glassmorphic background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 py-3 shadow-lg'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center shadow-md">
                <BookOpen className="text-white w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Academia<span className="text-indigo-400">Pro</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/courses"
              className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
                isActive('/courses') ? 'text-indigo-400' : 'text-slate-300'
              }`}
            >
              Cursos
            </Link>

            {user && user.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-indigo-400 ${
                  isActive('/admin') ? 'text-indigo-400' : 'text-slate-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel Admin</span>
              </Link>
            )}

            {user && user.role === 'instructor' && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-indigo-400 ${
                  isActive('/admin') ? 'text-indigo-400' : 'text-slate-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel Instructor</span>
              </Link>
            )}

            {user && user.role === 'student' && (
              <Link
                to="/profile"
                className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
                  isActive('/profile') ? 'text-indigo-400' : 'text-slate-300'
                }`}
              >
                Mis Cursos
              </Link>
            )}
          </div>

          {/* Desktop User / Cart Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-300 hover:text-indigo-400 hover:bg-slate-900/50 rounded-full transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full transform translate-x-1 -translate-y-1">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-full py-1.5 pl-2 pr-4 hover:border-slate-700 transition-all"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-slate-200">{user.name.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-full transition-all cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900/50 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Ingresar</span>
                </Link>
                <Link
                  to="/register"
                  className="btn-gradient text-sm font-medium text-white px-4 py-2 rounded-lg"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/cart" className="relative p-2 text-slate-300">
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full transform translate-x-1 -translate-y-1">
                  {cartItems.length}
                </span>
              )}
            </Link>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 mt-2 py-4 px-2 space-y-1 shadow-2xl">
          <Link
            to="/courses"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900/50"
          >
            Cursos
          </Link>

          {user && (user.role === 'admin' || user.role === 'instructor') && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-indigo-400 hover:bg-slate-900/50"
            >
              Panel Control
            </Link>
          )}

          {user && user.role === 'student' && (
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900/50"
            >
              Mis Cursos
            </Link>
          )}

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium text-slate-200 hover:bg-slate-900/50"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span>Mi Perfil</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium text-rose-400 hover:bg-rose-950/20 text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-4 px-3">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center py-2.5 rounded-lg border border-slate-800 text-center text-sm font-medium text-slate-300 hover:bg-slate-900"
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center py-2.5 rounded-lg btn-gradient text-center text-sm font-medium text-white"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
