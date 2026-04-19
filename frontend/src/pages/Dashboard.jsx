import { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiSearch } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('borrowRecords'); // Librarian: borrowRecords, addBook, showBooks, deleteBook

  // Admin states
  const [adminTab, setAdminTab] = useState('borrowRecords'); // borrowRecords, librarians, students
  const [librarians, setLibrarians] = useState([]);
  const [students, setStudents] = useState([]);

  // Admin/Librarian states
  const [newBook, setNewBook] = useState({
    ISBN: '', 'Book-Title': '', 'Book-Author': '', 'Year-Of-Publication': '', Publisher: '',
    'Image-URL-S': '', 'Image-URL-M': '', 'Image-URL-L': '', department: ''
  });

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user.role === 'admin') {
      if (adminTab === 'borrowRecords') fetchBorrowData();
      else if (adminTab === 'librarians') fetchLibrarians();
      else if (adminTab === 'students') fetchStudents();
    } else {
      if (activeTab === 'borrowRecords') {
        fetchBorrowData();
      } else if (activeTab === 'showBooks' || activeTab === 'deleteBook') {
        fetchBooks();
      }
    }
  }, [user, activeTab, adminTab, search]);

  const fetchBorrowData = async () => {
    try {
      if (user.role === 'admin' || user.role === 'Librarian') {
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

  const fetchLibrarians = async () => {
    try {
      const { data } = await API.get('/users/librarians');
      setLibrarians(data);
    } catch (err) {
      toast.error('Failed to fetch librarians');
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await API.get('/users/students');
      setStudents(data);
    } catch (err) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchBooks = async () => {
    try {
      const { data } = await API.get(`/books?search=${search}`);
      setBooks(data);
    } catch (err) {
      toast.error('Failed to fetch books');
    }
  };

  const handleReturn = async (recordId) => {
    try {
      await API.put(`/borrows/${recordId}/return`);
      toast.success('Book returned successfully!');
      fetchBorrowData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book');
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await API.post('/books', newBook);
      toast.success('Book added to catalog!');
      setNewBook({
        ISBN: '', 'Book-Title': '', 'Book-Author': '', 'Year-Of-Publication': '', Publisher: '',
        'Image-URL-S': '', 'Image-URL-M': '', 'Image-URL-L': '', department: ''
      });
      setActiveTab('showBooks');
    } catch (err) {
      toast.error('Failed to add book');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await API.delete(`/books/${bookId}`);
      toast.success('Book deleted successfully!');
      fetchBooks();
    } catch (err) {
      toast.error('Failed to delete book');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}</h1>
          <p className="text-gray-500 mt-1">Role: <span className="capitalize font-medium">{user.role}</span></p>
        </div>
      </div>

      {user.role === 'librarian' && (
        <div className="flex space-x-4 mb-6 border-b border-gray-200 px-2">
          {['borrowRecords', 'addBook', 'showBooks', 'deleteBook'].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </button>
          ))}
        </div>
      )}

      {user.role === 'admin' && (
        <div className="flex space-x-4 mb-6 border-b border-gray-200 px-2">
          {['borrowRecords', 'librarians', 'students'].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 font-semibold text-sm transition-colors border-b-2 ${adminTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setAdminTab(tab)}
            >
              {tab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </button>
          ))}
        </div>
      )}

      {/* DASHBOARD CONTENT BASED ON ROLE AND TABS */}

      {/* BORROW RECORDS */}
      {((user.role === 'student') ||
        (user.role === 'librarian' && activeTab === 'borrowRecords') ||
        (user.role === 'admin' && adminTab === 'borrowRecords')) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">
                {user.role === 'admin' || user.role === 'librarian' ? 'All Borrowed Records' : 'My Borrowed Books'}
              </h2>
            </div>

            {borrowedBooks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                      <th className="p-4 font-medium border-b">Book Title</th>
                      {(user.role === 'admin' || user.role === 'librarian') && <th className="p-4 font-medium border-b">User</th>}
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
                        {(user.role === 'admin' || user.role === 'librarian') && (
                          <td className="p-4 text-gray-600">{record.user?.name || 'Unknown User'}</td>
                        )}
                        <td className="p-4 text-gray-600">{new Date(record.borrowDate).toLocaleDateString()}</td>
                        <td className="p-4 text-gray-600">{new Date(record.dueDate).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${record.status === 'returned' ? 'bg-green-100 text-green-700' :
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
        )}

      {/* ADMIN ONLY TABS (Librarians and Students) */}
      {user.role === 'admin' && adminTab === 'librarians' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-800">Librarians Overview</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium border-b">Name</th>
                <th className="p-4 font-medium border-b">Email</th>
                <th className="p-4 font-medium border-b">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {librarians.map(lib => (
                <tr key={lib._id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-800">{lib.name}</td>
                  <td className="p-4 text-gray-600">{lib.email}</td>
                  <td className="p-4 text-gray-600">{new Date(lib.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {librarians.length === 0 && <p className="text-center py-6 text-gray-500">No librarians registered.</p>}
        </div>
      )}

      {user.role === 'admin' && adminTab === 'students' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-800">Students Overview</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium border-b">Name</th>
                <th className="p-4 font-medium border-b">Email</th>
                <th className="p-4 font-medium border-b">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(stu => (
                <tr key={stu._id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-800">{stu.name}</td>
                  <td className="p-4 text-gray-600">{stu.email}</td>
                  <td className="p-4 text-gray-600">{new Date(stu.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && <p className="text-center py-6 text-gray-500">No students registered.</p>}
        </div>
      )}

      {/* LIBRARIAN ONLY TABS */}
      {user.role === 'librarian' && activeTab === 'addBook' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Add New Book</h2>
          <form onSubmit={handleAddBook} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
                <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newBook.ISBN} onChange={e => setNewBook({ ...newBook, ISBN: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book Title *</label>
                <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newBook['Book-Title']} onChange={e => setNewBook({ ...newBook, 'Book-Title': e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newBook['Book-Author']} onChange={e => setNewBook({ ...newBook, 'Book-Author': e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
                <input type="number" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newBook['Year-Of-Publication']} onChange={e => setNewBook({ ...newBook, 'Year-Of-Publication': e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newBook.Publisher} onChange={e => setNewBook({ ...newBook, Publisher: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newBook.department} onChange={e => setNewBook({ ...newBook, department: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Small)</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newBook['Image-URL-S']} onChange={e => setNewBook({ ...newBook, 'Image-URL-S': e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Medium)</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newBook['Image-URL-M']} onChange={e => setNewBook({ ...newBook, 'Image-URL-M': e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Large)</label>
              <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={newBook['Image-URL-L']} onChange={e => setNewBook({ ...newBook, 'Image-URL-L': e.target.value })} />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 mt-4 rounded-lg transition shadow-md">Add Book to Database</button>
          </form>
        </div>
      )}

      {user.role === 'librarian' && (activeTab === 'showBooks' || activeTab === 'deleteBook') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              {activeTab === 'showBooks' ? 'Library Catalog' : 'Search and Delete Books'}
            </h2>
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search catalog..."
                className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch className="absolute left-4 top-3 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium border-b">ISBN</th>
                  <th className="p-4 font-medium border-b">Title</th>
                  <th className="p-4 font-medium border-b">Author</th>
                  <th className="p-4 font-medium border-b">Dept</th>
                  {activeTab === 'deleteBook' && <th className="p-4 font-medium border-b text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {books.map(book => (
                  <tr key={book._id} className="hover:bg-gray-50/50">
                    <td className="p-4 text-sm text-gray-500">{book.ISBN}</td>
                    <td className="p-4 text-sm text-gray-800 font-medium">{book['Book-Title']}</td>
                    <td className="p-4 text-sm text-gray-600">{book['Book-Author']}</td>
                    <td className="p-4 text-sm text-gray-500">{book.department || '-'}</td>
                    {activeTab === 'deleteBook' && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {books.length === 0 && <p className="text-center py-6 text-gray-500">No books found.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
