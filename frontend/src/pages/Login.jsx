import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password, role });
      console.log(data);
      login(data, data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Welcome Back</h2>
        
        {/* Role Selection Tabs */}
        <div className="flex mb-6 bg-black/20 rounded-lg p-1 backdrop-blur-sm border border-white/5">
          {['student', 'librarian', 'admin'].map((r) => (
            <button
              type="button"
              key={r}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-md capitalize transition-all duration-300 ${role === r ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-sm border border-emerald-500/30' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
              onClick={() => setRole(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="glass-input"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="glass-input"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="pt-2">
            <button type="submit" className="glass-button-primary w-full">
              Login as {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          </div>
        </form>
        {role !== 'admin' && (
          <p className="mt-6 text-center text-gray-400">
            Don't have an account? <Link to={`/register?role=${role}`} className="text-emerald-400 hover:text-emerald-300 hover:underline">Register</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
