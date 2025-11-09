import { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './firebase';
import AdminPanel from './pages/AdminPanel';
import Home from './pages/Home';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import SpecialOffers from './pages/SpecialOffers';
import Categories from './pages/Categories';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInstagramWarning, setShowInstagramWarning] = useState(false);

  useEffect(() => {
    // Firebase is initialized by importing './firebase'

    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }

    // Check if it's Instagram browser and show warning
    if (window.isInstagramBrowser) {
      setShowInstagramWarning(true);
      console.log('Instagram browser detected - showing warning');
    }

    setLoading(false);
  }, []);

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" />;
    }

    if (adminOnly && !user.is_admin) {
      return <Navigate to="/" />;
    }

    return children;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-primary-700">جاري التحميل...</h2>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        {/* Instagram Browser Warning */}
        {showInstagramWarning && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b-2 border-yellow-300">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-yellow-800 text-sm md:text-base">
                  ⚠️ لتجربة أفضل، يرجى فتح المتجر في متصفح خارجي
                </p>
              </div>
              <button
                onClick={() => setShowInstagramWarning(false)}
                className="ml-2 text-yellow-800 hover:text-yellow-900 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <div style={showInstagramWarning ? { marginTop: '60px' } : {}}>
          <Routes>
            <Route path="/" element={<Home user={user} setUser={setUser} />} />
            <Route path="/product/:id" element={<ProductDetail user={user} />} />
            <Route path="/offers" element={<SpecialOffers user={user} />} />
            <Route path="/categories" element={<Categories user={user} />} />
            <Route path="/categories/:id" element={<Categories user={user} />} />
            <Route
              path="/login"
              element={
                user ? <Navigate to="/" /> : <Login setUser={setUser} />
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminPanel user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;