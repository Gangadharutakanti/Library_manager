import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam && ['student', 'librarian'].includes(roleParam)) {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/register', formData);
      login(data, data.token);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Create Account</h2>

        {/* Role Selection Tabs */}
        <div className="flex mb-6 bg-black/20 rounded-lg p-1 backdrop-blur-sm border border-white/5">
          {['student', 'librarian'].map((r) => (
            <button
              type="button"
              key={r}
              className={`flex-1 py-2 text-sm font-semibold rounded-md capitalize transition-all duration-300 ${formData.role === r ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-sm border border-emerald-500/30' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
              onClick={() => setFormData({...formData, role: r})}
            >
               {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Name</label>
            <input 
              type="text" 
              className="glass-input"
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="glass-input"
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="glass-input"
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>
          <div className="pt-2">
            <button type="submit" className="glass-button-primary w-full">
              Register as {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-gray-400">
          Already have an account? <Link to={`/login?role=${formData.role}`} className="text-emerald-400 hover:text-emerald-300 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
