import { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiSearch, FiUsers, FiShield, FiBookOpen, FiBook, FiMail, FiCalendar, FiTrash2 } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('borrowRecords'); // Librarian: borrowRecords, addBook, showBooks, deleteBook

  // Admin states
  const [adminTab, setAdminTab] = useState('borrowRecords'); // borrowRecords, books, librarians, students
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
      else if (adminTab === 'books') fetchBooks();
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
      if (user.role === 'admin' || user.role === 'librarian') {
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
      let payload = {};
      if (user.role === 'student') {
        const ratingInput = window.prompt('Rate this book (1-5):');
        if (ratingInput === null) return;

        const numericRating = Number(ratingInput);
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
          toast.error('Please enter a valid rating between 1 and 5');
          return;
        }

        payload = { rating: numericRating };
      }

      await API.put(`/borrows/${recordId}/return`, payload);
      toast.success('Book returned successfully!');
      fetchBorrowData();
      fetchBooks();
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

  const handleDeleteUser = async (userId, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      await API.delete(`/users/${type}s/${userId}`);
      toast.success(`${type} deleted successfully!`);
      if (type === 'librarian') fetchLibrarians();
      else fetchStudents();
    } catch (err) {
      toast.error(`Failed to delete ${type}`);
    }
  };

  const formatRating = (book) => {
    if (!book || !book.ratingsCount) return 'No ratings';
    return `${(book.averageRating || 0).toFixed(1)} / 5 (${book.ratingsCount})`;
  };

  return (
    <div className={`max-w-6xl mx-auto ${user.role === 'admin' ? 'admin-dashboard' : ''}`}>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Welcome, <span className="text-gradient">{user.name}</span></h1>
          <div className="flex flex-wrap items-center gap-2 text-gray-400">
            <p>
              Role: <span className="capitalize text-emerald-400 font-medium px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">{user.role}</span>
            </p>
            <span className="text-gray-500">|</span>
            <p>
              Email: <span className="text-sky-300 font-medium">{user.email}</span>
            </p>
          </div>
        </div>
      </div>

      {user.role === 'librarian' && (
        <div className="flex space-x-2 mb-8 border-b border-white/10 px-2 overflow-x-auto">
          {['borrowRecords', 'addBook', 'showBooks', 'deleteBook'].map((tab) => (
            <button
              key={tab}
              className={`py-2.5 px-5 font-semibold text-sm transition-all duration-300 border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </button>
          ))}
        </div>
      )}

      {user.role === 'admin' && (
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'borrowRecords', label: 'Borrow Records', icon: FiBookOpen },
            { id: 'books', label: 'Library Catalog', icon: FiBook },
            { id: 'librarians', label: 'Librarians', icon: FiShield },
            { id: 'students', label: 'Students', icon: FiUsers }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`admin-tab flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-nowrap ${adminTab === tab.id ? 'admin-tab-active' : ''}`}
              onClick={() => setAdminTab(tab.id)}
            >
              <tab.icon className="text-lg" />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* DASHBOARD CONTENT BASED ON ROLE AND TABS */}

      {/* BORROW RECORDS */}
      {((user.role === 'student') ||
        (user.role === 'librarian' && activeTab === 'borrowRecords') ||
        (user.role === 'admin' && adminTab === 'borrowRecords')) && (
          <div className="glass-panel overflow-hidden rounded-2xl border border-white/5">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-bold text-white">
                {user.role === 'admin' || user.role === 'librarian' ? 'All Borrowed Records' : 'My Borrowed Books'}
              </h2>
            </div>

            {borrowedBooks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/20 text-gray-400 text-sm uppercase tracking-wider border-b border-white/10">
                      <th className="p-4 font-medium border-b border-white/5">Book Title</th>
                      {(user.role === 'admin' || user.role === 'librarian') && <th className="p-4 font-medium border-b border-white/5">User</th>}
                      <th className="p-4 font-medium border-b border-white/5">Borrow Date</th>
                      <th className="p-4 font-medium border-b border-white/5">Due Date</th>
                      <th className="p-4 font-medium border-b border-white/5">Status</th>
                      <th className="p-4 font-medium border-b border-white/5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {borrowedBooks.map((record) => (
                      <tr key={record._id} className="hover:bg-white/5 transition-all duration-300">
                        <td className="p-4 text-gray-200 font-medium">{record.book?.['Book-Title'] || 'Deleted Book'}</td>
                        {(user.role === 'admin' || user.role === 'librarian') && (
                          <td className="p-4 text-gray-400">{record.user?.name || 'Unknown User'}</td>
                        )}
                        <td className="p-4 text-gray-400">{new Date(record.borrowDate).toLocaleDateString()}</td>
                        <td className="p-4 text-gray-400">{new Date(record.dueDate).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${record.status === 'returned' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              record.status === 'overdue' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {record.status !== 'returned' && (
                            <button
                              onClick={() => handleReturn(record._id)}
                              className="glass-button-primary !py-1.5 !px-4 text-xs inline-block w-auto rounded-lg"
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
              <div className="p-8 text-center text-gray-400">
                No borrow records found.
              </div>
            )}
          </div>
        )}

      {user.role === 'admin' && adminTab === 'books' && (
        <div className="glass-panel admin-card overflow-hidden p-6 rounded-2xl border border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-white">Library Catalog</h2>
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search catalog..."
                className="glass-input !pl-11 pr-4"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-gray-400 text-sm uppercase tracking-wider border-b border-white/10">
                  <th className="p-4 font-medium border-b border-white/5">ISBN</th>
                  <th className="p-4 font-medium border-b border-white/5">Title</th>
                  <th className="p-4 font-medium border-b border-white/5">Author</th>
                  <th className="p-4 font-medium border-b border-white/5">Dept</th>
                  <th className="p-4 font-medium border-b border-white/5">Rating</th>
                  <th className="p-4 font-medium border-b border-white/5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {books.map(book => (
                  <tr key={book._id} className="hover:bg-white/5 transition-all duration-300">
                    <td className="p-4 text-sm text-gray-400">{book.ISBN}</td>
                    <td className="p-4 text-sm text-gray-200 font-medium">{book['Book-Title']}</td>
                    <td className="p-4 text-sm text-gray-400">{book['Book-Author']}</td>
                    <td className="p-4 text-sm text-gray-400">{book.department || '-'}</td>
                    <td className="p-4 text-sm text-gray-300">{formatRating(book)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteBook(book._id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm transition-all duration-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {books.length === 0 && <p className="text-center py-8 text-gray-400">No books found.</p>}
          </div>
        </div>
      )}

      {/* ADMIN ONLY TABS (Librarians and Students) */}
      {user.role === 'admin' && adminTab === 'librarians' && (
        <div className="animate-fade-in">
          <div className="admin-section-header flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl border shadow-lg">
              <FiShield className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Librarians Overview</h2>
              <p className="text-gray-400 text-sm mt-1">Manage library staff and their access</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {librarians.map(lib => (
              <div key={lib._id} className="glass-panel admin-card p-6 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {lib.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="px-3 py-1 bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Librarian
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-sky-300 transition-colors">{lib.name}</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-2 rounded-lg">
                      <FiMail className="text-purple-400/70" />
                      <span className="truncate">{lib.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-2 rounded-lg">
                      <FiCalendar className="text-purple-400/70" />
                      <span>Joined {new Date(lib.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteUser(lib._id, 'librarian')}
                  className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm border border-red-500/20 transition-all duration-300 flex justify-center items-center gap-2 mt-4"
                >
                  <FiTrash2 /> Delete Librarian
                </button>
              </div>
            ))}
          </div>
          {librarians.length === 0 && (
            <div className="glass-panel p-16 text-center rounded-2xl border border-white/5 flex flex-col items-center">
              <div className="p-4 bg-white/5 rounded-full mb-4">
                <FiShield className="text-4xl text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Librarians Found</h3>
              <p className="text-gray-400">There are currently no librarians registered in the system.</p>
            </div>
          )}
        </div>
      )}

      {user.role === 'admin' && adminTab === 'students' && (
        <div className="animate-fade-in">
          <div className="admin-section-header flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl border shadow-lg">
              <FiUsers className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Students Overview</h2>
              <p className="text-gray-400 text-sm mt-1">Monitor student accounts and registration</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map(stu => (
              <div key={stu._id} className="glass-panel admin-card p-6 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {stu.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Student
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">{stu.name}</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-2 rounded-lg">
                      <FiMail className="text-cyan-400/70" />
                      <span className="truncate">{stu.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-2 rounded-lg">
                      <FiCalendar className="text-cyan-400/70" />
                      <span>Joined {new Date(stu.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteUser(stu._id, 'student')}
                  className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm border border-red-500/20 transition-all duration-300 flex justify-center items-center gap-2 mt-4"
                >
                  <FiTrash2 /> Delete Student
                </button>
              </div>
            ))}
          </div>
          {students.length === 0 && (
            <div className="glass-panel p-16 text-center rounded-2xl border border-white/5 flex flex-col items-center">
              <div className="p-4 bg-white/5 rounded-full mb-4">
                <FiUsers className="text-4xl text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Students Found</h3>
              <p className="text-gray-400">There are currently no students registered in the system.</p>
            </div>
          )}
        </div>
      )}

      {/* LIBRARIAN ONLY TABS */}
      {user.role === 'librarian' && activeTab === 'addBook' && (
        <div className="glass-panel p-8 max-w-2xl mx-auto rounded-2xl border border-white/5">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Add New Book</h2>
          <form onSubmit={handleAddBook} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ISBN *</label>
                <input type="text" required className="glass-input" value={newBook.ISBN} onChange={e => setNewBook({ ...newBook, ISBN: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Book Title *</label>
                <input type="text" required className="glass-input" value={newBook['Book-Title']} onChange={e => setNewBook({ ...newBook, 'Book-Title': e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Author *</label>
                <input type="text" required className="glass-input" value={newBook['Book-Author']} onChange={e => setNewBook({ ...newBook, 'Book-Author': e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Publication Year</label>
                <input type="number" className="glass-input" value={newBook['Year-Of-Publication']} onChange={e => setNewBook({ ...newBook, 'Year-Of-Publication': e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Publisher</label>
                <input type="text" className="glass-input" value={newBook.Publisher} onChange={e => setNewBook({ ...newBook, Publisher: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                <input type="text" className="glass-input" value={newBook.department} onChange={e => setNewBook({ ...newBook, department: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Image URL (Small)</label>
              <input type="text" className="glass-input" value={newBook['Image-URL-S']} onChange={e => setNewBook({ ...newBook, 'Image-URL-S': e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Image URL (Medium)</label>
              <input type="text" className="glass-input" value={newBook['Image-URL-M']} onChange={e => setNewBook({ ...newBook, 'Image-URL-M': e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Image URL (Large)</label>
              <input type="text" className="glass-input" value={newBook['Image-URL-L']} onChange={e => setNewBook({ ...newBook, 'Image-URL-L': e.target.value })} />
            </div>

            <div className="pt-2">
              <button type="submit" className="glass-button-primary w-full py-3">Add Book to Database</button>
            </div>
          </form>
        </div>
      )}

      {user.role === 'librarian' && (activeTab === 'showBooks' || activeTab === 'deleteBook') && (
        <div className="glass-panel overflow-hidden p-6 rounded-2xl border border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-white">
              {activeTab === 'showBooks' ? 'Library Catalog' : 'Search and Delete Books'}
            </h2>
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search catalog..."
                className="glass-input !pl-11 pr-4"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-gray-400 text-sm uppercase tracking-wider border-b border-white/10">
                  <th className="p-4 font-medium border-b border-white/5">ISBN</th>
                  <th className="p-4 font-medium border-b border-white/5">Title</th>
                  <th className="p-4 font-medium border-b border-white/5">Author</th>
                  <th className="p-4 font-medium border-b border-white/5">Dept</th>
                  <th className="p-4 font-medium border-b border-white/5">Rating</th>
                  {activeTab === 'deleteBook' && <th className="p-4 font-medium border-b border-white/5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {books.map(book => (
                  <tr key={book._id} className="hover:bg-white/5 transition-all duration-300">
                    <td className="p-4 text-sm text-gray-400">{book.ISBN}</td>
                    <td className="p-4 text-sm text-gray-200 font-medium">{book['Book-Title']}</td>
                    <td className="p-4 text-sm text-gray-400">{book['Book-Author']}</td>
                    <td className="p-4 text-sm text-gray-400">{book.department || '-'}</td>
                    <td className="p-4 text-sm text-gray-300">{formatRating(book)}</td>
                    {activeTab === 'deleteBook' && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-sm transition-all duration-300"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {books.length === 0 && <p className="text-center py-8 text-gray-400">No books found.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
