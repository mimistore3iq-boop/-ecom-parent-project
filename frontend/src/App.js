import React, { useEffect, useState, Component } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './firebase';
import AdminPanel from './pages/AdminPanel';
import Home from './pages/Home';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import SpecialOffers from './pages/SpecialOffers';
import Categories from './pages/Categories';

// ErrorBoundary to catch rendering errors and suggest reload
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    // Reload once on error
    const lastErrorReload = sessionStorage.getItem('last_error_reload');
    const now = Date.now();
    if (!lastErrorReload || (now - parseInt(lastErrorReload) > 60000)) {
      sessionStorage.setItem('last_error_reload', now.toString());
      window.location.reload(true);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">عذراً، حدث خطأ غير متوقع</h2>
            <p className="text-gray-600 mb-6">جاري محاولة إصلاح المشكلة تلقائياً. إذا لم يفتح المتجر، يرجى النقر على الزر أدناه.</p>
            <button 
              onClick={() => window.location.reload(true)}
              className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <Router>
        <div className="App min-h-screen bg-gray-50 flex flex-col">
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
          <div 
            className="flex-grow flex flex-col" 
            style={showInstagramWarning ? { marginTop: '60px' } : {}}
          >
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
    </ErrorBoundary>
  );
}

export default App;