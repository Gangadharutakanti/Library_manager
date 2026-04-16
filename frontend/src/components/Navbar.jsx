import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiBook, FiUser, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sm:px-12 sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
        <FiBook />
        <span>Library</span>
      </Link>
      
      <div className="flex items-center gap-6">
        <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">Catalog</Link>
        {user ? (
          <>
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition flex items-center gap-1">
              <FiUser /> Dashboard
            </Link>
            <button onClick={logout} className="text-red-500 hover:text-red-600 font-medium transition flex items-center gap-1">
              <FiLogOut /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition">Login</Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
