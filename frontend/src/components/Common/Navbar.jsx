import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  BookOpen, ShoppingCart, User, Menu, X, LogOut,
  LayoutDashboard, ChevronDown, Settings, GraduationCap
} from 'lucide-react';


export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartCount = cart?.length ?? 0;
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
      <div className="container-xl flex items-center justify-between h-[72px]">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-lg animate-pulse-glow">
            <BookOpen className="text-white w-4.5 h-4.5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            Academia<span className="text-indigo-400">Pro</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/') ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Inicio
          </Link>
          <Link
            to="/courses"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/courses') ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Cursos
          </Link>
          {user && (
            <Link
              to="/learning"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/learning') ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Mi Aprendizaje
            </Link>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-indigo-500 rounded-full text-xs text-white font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/8 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-300 max-w-[100px] truncate">{user.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 glass-panel rounded-2xl border border-white/8 shadow-2xl py-1.5 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-white/6">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                    <User className="w-4 h-4" /> Mi Perfil
                  </Link>
                  <Link to="/learning" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                    <GraduationCap className="w-4 h-4" /> Mi Aprendizaje
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                      <LayoutDashboard className="w-4 h-4" /> Panel Admin
                    </Link>
                  )}
                  <div className="divider my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="btn-ghost px-4 py-2 rounded-xl text-sm font-medium">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold text-white">
                Registrarse
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass-panel border-t border-white/6 animate-fade-in">
          <div className="container-xl py-4 flex flex-col gap-1">
            <Link to="/" className="sidebar-link">Inicio</Link>
            <Link to="/courses" className="sidebar-link">Cursos</Link>
            {user ? (
              <>
                <Link to="/learning" className="sidebar-link"><GraduationCap className="w-4 h-4" /> Mi Aprendizaje</Link>
                <Link to="/profile" className="sidebar-link"><User className="w-4 h-4" /> Mi Perfil</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="sidebar-link"><LayoutDashboard className="w-4 h-4" /> Panel Admin</Link>
                )}
                <button onClick={handleLogout} className="sidebar-link text-rose-400 hover:text-rose-300 w-full text-left">
                  <LogOut className="w-4 h-4" /> Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost px-4 py-2 rounded-xl text-sm font-medium text-center mt-2">Iniciar Sesión</Link>
                <Link to="/register" className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold text-white text-center mt-1">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}