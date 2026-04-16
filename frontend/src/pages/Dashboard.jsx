import { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  
  // Admin states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBook, setNewBook] = useState({ ISBN: '', 'Book-Title': '', 'Book-Author': '', department: '', Publisher: '' });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      if (user.role === 'admin') {
        const { data } = await API.get('/borrows');
        setBorrowedBooks(data);
      } else {
        const { data } = await API.get('/borrows/myrecords');
        setBorrowedBooks(data);
      }
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
    }
  };

  const handleReturn = async (recordId) => {
    try {
      await API.put(`/borrows/${recordId}/return`);
      toast.success('Book returned successfully!');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book');
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await API.post('/books', newBook);
      toast.success('Book added to catalog!');
      setShowAddModal(false);
      setNewBook({ ISBN: '', 'Book-Title': '', 'Book-Author': '', department: '', Publisher: '' });
    } catch (err) {
      toast.error('Failed to add book');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}</h1>
          <p className="text-gray-500 mt-1">Role: <span className="capitalize font-medium">{user.role}</span></p>
        </div>
        {user.role === 'admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm transition"
          >
            + Add New Book
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">
            {user.role === 'admin' ? 'All Borrowed Records' : 'My Borrowed Books'}
          </h2>
        </div>
        
        {borrowedBooks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium border-b">Book Title</th>
                  {user.role === 'admin' && <th className="p-4 font-medium border-b">User</th>}
                  <th className="p-4 font-medium border-b">Borrow Date</th>
                  <th className="p-4 font-medium border-b">Due Date</th>
                  <th className="p-4 font-medium border-b">Status</th>
                  <th className="p-4 font-medium border-b text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {borrowedBooks.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 text-gray-800 font-medium">{record.book?.['Book-Title'] || 'Deleted Book'}</td>
                    {user.role === 'admin' && (
                      <td className="p-4 text-gray-600">{record.user?.name || 'Unknown User'}</td>
                    )}
                    <td className="p-4 text-gray-600">{new Date(record.borrowDate).toLocaleDateString()}</td>
                    <td className="p-4 text-gray-600">{new Date(record.dueDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'returned' ? 'bg-green-100 text-green-700' : 
                        record.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {record.status !== 'returned' && (
                        <button 
                          onClick={() => handleReturn(record._id)}
                          className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg text-sm font-medium transition"
                        >
                          Return Book
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No borrow records found.
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Add New Book</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleAddBook} className="space-y-4">
              <input type="text" placeholder="ISBN" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newBook.ISBN} onChange={e => setNewBook({...newBook, ISBN: e.target.value})} />
              <input type="text" placeholder="Book Title" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newBook['Book-Title']} onChange={e => setNewBook({...newBook, 'Book-Title': e.target.value})} />
              <input type="text" placeholder="Author" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newBook['Book-Author']} onChange={e => setNewBook({...newBook, 'Book-Author': e.target.value})} />
              <input type="text" placeholder="Department" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newBook.department} onChange={e => setNewBook({...newBook, department: e.target.value})} />
              <input type="text" placeholder="Publisher" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newBook.Publisher} onChange={e => setNewBook({...newBook, Publisher: e.target.value})} />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition">Save Book</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
