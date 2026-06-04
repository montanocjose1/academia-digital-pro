import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Common/Navbar';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CartPage from './pages/CartPage';
import CourseDetail from './pages/CourseDetail';
import LearningDashboard from './pages/LearningDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Catalog />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/learning" element={<LearningDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

export default App;

