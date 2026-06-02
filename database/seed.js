import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load models
import User from '../backend/models/User.js';
import Course from '../backend/models/Course.js';
import Module from '../backend/models/Module.js';
import Lesson from '../backend/models/Lesson.js';
import Purchase from '../backend/models/Purchase.js';
import Review from '../backend/models/Review.js';
import Certificate from '../backend/models/Certificate.js';
import Coupon from '../backend/models/Coupon.js';
import { setUseMock } from '../backend/models/dbHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/academiapro', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`Seed script connected to MongoDB: ${conn.connection.host}`);
    setUseMock(false);
  } catch (error) {
    console.warn(`\n[WARNING] Database connection failed for seeding: ${error.message}`);
    console.warn(`[WARNING] Seeding local JSON Database instead (/database/mockDb.json)\n`);
    setUseMock(true);
  }

  try {
    // Clear existing data
    console.log('Clearing old collections...');
    await User.deleteMany();
    await Course.deleteMany();
    await Module.deleteMany();
    await Lesson.deleteMany();
    await Purchase.deleteMany();
    await Review.deleteMany();
    await Certificate.deleteMany();
    await Coupon.deleteMany();

    console.log('Creating initial user roles...');
    
    // Create Users
    const admin = await User.create({
      name: 'Administrador Pro',
      email: 'admin@academiapro.com',
      password: 'admin123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    });

    const instructor = await User.create({
      name: 'Dr. Alejandro Rueda',
      email: 'instructor@academiapro.com',
      password: 'instructor123',
      role: 'instructor',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    });

    const student = await User.create({
      name: 'Estudiante Demo',
      email: 'estudiante@academiapro.com',
      password: 'estudiante123',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    });

    console.log('Users created:');
    console.log(`- Admin: ${admin.email} (Password: admin123)`);
    console.log(`- Instructor: ${instructor.email} (Password: instructor123)`);
    console.log(`- Student: ${student.email} (Password: estudiante123)`);

    console.log('Seeding discount coupons...');
    
    // Create Coupons
    const coupon1 = await Coupon.create({
      code: 'PRO50',
      discountType: 'percentage',
      value: 50,
      isActive: true,
      maxUses: 100,
    });

    const coupon2 = await Coupon.create({
      code: 'BIENVENIDA',
      discountType: 'fixed',
      value: 10,
      isActive: true,
      maxUses: 200,
    });

    console.log('Coupons created: PRO50 (50%), BIENVENIDA ($10)');

    console.log('Seeding courses...');

    // ----------------------------------------------------
    // COURSE 1: GENETIC ALGORITHMS (FEATURED COURSE)
    // ----------------------------------------------------
    const featuredCourse = await Course.create({
      title: 'Algoritmos Genéticos: De Principiante a Experto',
      subtitle: 'Aprende a resolver problemas complejos de optimización y entrenar inteligencias artificiales utilizando computación evolutiva.',
      description: 'Los algoritmos genéticos son métodos sistemáticos para la resolución de problemas de búsqueda y optimización que aplican los principios de la selección natural y la genética. En este curso completo, aprenderás desde las bases matemáticas teóricas hasta implementaciones avanzadas en Python.\n\nResolveremos problemas clásicos como el Agente Viajero (TSP), la Mochila (Knapsack), y finalmente entraremos en Neuroevolución: optimizar los pesos y topología de redes neuronales artificiales usando algoritmos genéticos en lugar de retropropagación tradicional.',
      thumbnail: '/uploads/genetic_algorithms_thumbnail.png',
      price: 49.99,
      level: 'advanced',
      category: 'Inteligencia Artificial',
      instructor: instructor._id,
      isPublished: true,
      rating: 4.9,
      ratingsCount: 24,
    });

    // Modules for Genetic Algorithms
    const m1_ga = await Module.create({
      title: 'Módulo 1: Introducción a la Computación Evolutiva',
      course: featuredCourse._id,
      order: 1,
    });

    const l1_ga = await Lesson.create({
      title: '1.1 Conceptos Básicos y Terminología',
      description: 'Fundamentos de la terminología biológica adaptada a la computación: genes, cromosomas, poblaciones y aptitud (fitness).',
      content: 'Bienvenidos al curso. En esta lección aprenderemos cómo representar un problema en forma de cromosoma, definir qué es un gen y cómo evaluar la idoneidad de un individuo mediante la función de fitness.\n\nLos algoritmos genéticos operan sobre una población de soluciones potenciales de forma iterativa hasta alcanzar una condición de parada.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      duration: 12,
      module: m1_ga._id,
      order: 1,
    });

    const l2_ga = await Lesson.create({
      title: '1.2 Operadores Evolutivos: Selección, Cruce y Mutación',
      description: 'Estudio matemático de los operadores genéticos fundamentales que impulsan la exploración del espacio de búsqueda.',
      content: 'El éxito de un algoritmo genético depende de sus operadores:\n\n1. **Selección**: Escogemos individuos favoreciendo a los de mayor fitness (por ejemplo, Selección por Torneo o Ruleta).\n2. **Cruce (Crossover)**: Combinamos el material genético de dos padres para crear descendientes (Cruce de un punto, dos puntos o uniforme).\n3. **Mutación**: Introducimos variabilidad aleatoria alterando bits con una baja probabilidad para evitar mínimos locales.',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      duration: 18,
      module: m1_ga._id,
      order: 2,
    });

    m1_ga.lessons.push(l1_ga._id, l2_ga._id);
    await m1_ga.save();

    const m2_ga = await Module.create({
      title: 'Módulo 2: Casos Prácticos y Neuroevolución',
      course: featuredCourse._id,
      order: 2,
    });

    const l3_ga = await Lesson.create({
      title: '2.1 Resolviendo el Problema del Agente Viajero (TSP)',
      description: 'Implementación práctica de un algoritmo genético para encontrar la ruta óptima de reparto en una red de ciudades.',
      content: 'El problema del viajante de comercio (TSP) es NP-difícil. Veremos cómo usar codificación de permutaciones y operadores específicos como el Cruce de Orden (OX) y la Mutación por Intercambio (Swap Mutation) para resolverlo eficientemente.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: 25,
      module: m2_ga._id,
      order: 1,
    });

    const l4_ga = await Lesson.create({
      title: '2.2 Neuroevolución: Optimización de Redes Neuronales',
      description: 'Entrenamiento de redes neuronales artificiales utilizando algoritmos genéticos para ajustar pesos sin usar gradiente descendente.',
      content: 'En esta lección final, utilizaremos algoritmos genéticos para evolucionar los pesos de una red neuronal. Esto es muy útil en entornos de aprendizaje por refuerzo donde no disponemos de un gradiente diferenciable continuo.',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      duration: 35,
      module: m2_ga._id,
      order: 2,
    });

    m2_ga.lessons.push(l3_ga._id, l4_ga._id);
    await m2_ga.save();

    // Link modules to course
    featuredCourse.modules.push(m1_ga._id, m2_ga._id);
    await featuredCourse.save();

    // ----------------------------------------------------
    // COURSE 2: MACHINE LEARNING
    // ----------------------------------------------------
    const course2 = await Course.create({
      title: 'Machine Learning con Python: De Cero a Experto',
      subtitle: 'Domina los modelos predictivos supervisados y no supervisados con Scikit-Learn y Pandas.',
      description: 'El aprendizaje automático es el motor de la inteligencia artificial. En este curso aprenderás a limpiar datos, realizar análisis exploratorio, y entrenar modelos de regresión lineal, árboles de decisión, bosques aleatorios, y algoritmos de clustering como K-Means.',
      thumbnail: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=600&q=80',
      price: 39.99,
      level: 'intermediate',
      category: 'Inteligencia Artificial',
      instructor: instructor._id,
      isPublished: true,
      rating: 4.7,
      ratingsCount: 15,
    });

    const m1_c2 = await Module.create({
      title: 'Módulo 1: Fundamentos de ML',
      course: course2._id,
      order: 1,
    });

    const l1_c2 = await Lesson.create({
      title: '1.1 ¿Qué es el Machine Learning?',
      description: 'Comprende la diferencia entre programación tradicional y aprendizaje automático.',
      content: 'El Machine Learning permite a las computadoras aprender de los datos sin ser programadas explícitamente.',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      duration: 10,
      module: m1_c2._id,
      order: 1,
    });

    m1_c2.lessons.push(l1_c2._id);
    await m1_c2.save();
    course2.modules.push(m1_c2._id);
    await course2.save();

    // ----------------------------------------------------
    // COURSE 3: FULLSTACK DEVELOPMENT
    // ----------------------------------------------------
    const course3 = await Course.create({
      title: 'Desarrollo Web Fullstack con React y Node.js',
      subtitle: 'Construye aplicaciones web modernas, rápidas y escalables con MERN Stack.',
      description: 'Conviértete en desarrollador fullstack creando proyectos reales. Aprende React, hooks de estado, router, diseño UI responsive con Tailwind CSS, APIs RESTful con Node y Express, y almacenamiento de datos persistentes con MongoDB.',
      thumbnail: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80',
      price: 29.99,
      level: 'beginner',
      category: 'Desarrollo Web',
      instructor: instructor._id,
      isPublished: true,
      rating: 4.8,
      ratingsCount: 38,
    });

    const m1_c3 = await Module.create({
      title: 'Módulo 1: Fundamentos de React',
      course: course3._id,
      order: 1,
    });

    const l1_c3 = await Lesson.create({
      title: '1.1 Introducción a React y JSX',
      description: 'Primeros pasos con la biblioteca de UI más popular.',
      content: 'Aprende a declarar componentes funcionales de React e integrar expresiones JS usando sintaxis JSX.',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      duration: 15,
      module: m1_c3._id,
      order: 1,
    });

    m1_c3.lessons.push(l1_c3._id);
    await m1_c3.save();
    course3.modules.push(m1_c3._id);
    await course3.save();

    // Add some reviews to the featured course
    await Review.create({
      student: student._id,
      course: featuredCourse._id,
      rating: 5,
      comment: '¡Un curso increíble! La explicación sobre neuroevolución es oro puro. Totalmente recomendado.',
    });

    console.log('Database seeded successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
