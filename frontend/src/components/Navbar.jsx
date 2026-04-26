import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiBook, FiUser, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <nav className="glass-panel px-6 py-4 flex justify-between items-center sm:px-12 sticky top-0 z-50 border-b border-white/5">
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-gradient">
        <FiBook />
        <span>Library</span>
      </Link>

      <div className="flex items-center gap-6">
        {user?.role !== 'admin' && (
          <Link to="/" className="text-gray-300 hover:text-emerald-400 font-medium transition">Catalog</Link>
        )}
        {user ? (
          <>
            <Link to={dashboardPath} className="text-gray-300 hover:text-emerald-400 font-medium transition flex items-center gap-1">
              <FiUser /> Dashboard
            </Link>
            <button onClick={logout} className="text-red-400 hover:text-red-300 font-medium transition flex items-center gap-1">
              <FiLogOut /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-300 hover:text-emerald-400 font-medium transition">Login</Link>
            <Link to="/register" className="glass-button-primary px-4 py-2 rounded-lg">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
