import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Linkedin, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900/60 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-900">
          
          {/* Logo & Description */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BookOpen className="text-white w-4.5 h-4.5" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white">
                Academia<span className="text-indigo-400">Pro</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Plataforma de cursos de vanguardia tecnológica. Desarrolla habilidades profesionales reales con el soporte de instructores expertos.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Plataforma</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/courses" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Catálogo de Cursos
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Carrito de Compras
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>

          {/* Featured Courses */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Especialidades</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Inteligencia Artificial
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Computación Evolutiva
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Desarrollo Web Fullstack
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Soporte</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              ¿Tienes dudas? Escríbenos a soporte@academiapro.com o visita nuestro centro de ayuda.
            </p>
            <div className="text-xs text-indigo-400 font-medium">
              Lunes a Viernes: 9:00 AM - 6:00 PM (GMT-5)
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Academia Digital Pro. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-300">Términos de Servicio</a>
            <a href="#" className="hover:text-slate-300">Políticas de Privacidad</a>
            <a href="#" className="hover:text-slate-300">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
