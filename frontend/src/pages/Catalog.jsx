import { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiSearch } from 'react-icons/fi';
import { Navigate } from 'react-router-dom';


const Catalog = () => {
  const [books, setBooks] = useState([]);
  const [mostViewedBooks, setMostViewedBooks] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useContext(AuthContext);

  const formatRating = (book) => {
    if (!book || !book.ratingsCount) return 'No ratings yet';
    return `${(book.averageRating || 0).toFixed(1)} / 5 (${book.ratingsCount})`;
  };

  useEffect(() => {
    fetchBooks();
  }, [search]);

  useEffect(() => {
    fetchMostViewedBooks();
  }, []);

  if (user?.role === 'admin') {
    return <Navigate to="/dashboard" />;
  }

  const fetchBooks = async () => {
    try {
      const { data } = await API.get(`/books?search=${search}`);
      setBooks(data);
    } catch (err) {
      toast.error('Failed to fetch books');
    }
  };

  const fetchMostViewedBooks = async () => {
    try {
      const { data } = await API.get('/books/most-viewed');
      setMostViewedBooks(data);
    } catch (err) {
      toast.error('Failed to fetch most viewed books');
    }
  };

  const handleBookView = async (bookId) => {
    try {
      const { data } = await API.put(`/books/${bookId}/view`);

      setBooks((prev) =>
        prev.map((book) =>
          book._id === bookId
            ? { ...book, viewCount: data.viewCount }
            : book
        )
      );

      setMostViewedBooks((prev) => {
        const updated = prev.map((book) =>
          book._id === bookId
            ? { ...book, viewCount: data.viewCount }
            : book
        );
        return updated.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      });

      fetchMostViewedBooks();
    } catch (err) {
      // Keep silent here to avoid noisy toasts during casual browsing.
    }
  };

  const handleBorrow = async (bookId) => {
    handleBookView(bookId);

    if (!user) {
      toast.info('Please login to borrow books');
      return;
    }
    try {
      await API.post('/borrows', { bookId });
      toast.success('Book borrowed successfully!');
      fetchBooks(); // Refresh availability
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to borrow book');
    }
  };

  const groupedBooks = books.reduce((acc, book) => {
    const dept = book.department || 'General';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(book);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-4xl font-extrabold text-white">Library <span className="text-gradient">Catalog</span></h1>
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by title, author or department..."
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-gray-100 rounded-full focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 backdrop-blur-md transition-all duration-300 placeholder:text-gray-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FiSearch className="absolute left-4 top-3.5 text-gray-400" />
        </div>
      </div>

      {mostViewedBooks.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2 mb-6">
            <span className="text-amber-300">#</span> Most Viewed Books
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mostViewedBooks.map((book) => (
              <div key={`mv-${book._id}`} className="glass-panel p-5 rounded-2xl">
                <div className="flex items-start gap-4">
                  {book['Image-URL-S'] ? (
                    <img
                      src={book['Image-URL-S']}
                      alt={book['Book-Title']}
                      className="w-14 h-20 object-cover rounded-md border border-white/10"
                    />
                  ) : (
                    <div className="w-14 h-20 rounded-md border border-white/10 bg-white/5" />
                  )}
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold leading-tight line-clamp-2">{book['Book-Title']}</h3>
                    <p className="text-sm text-gray-400 line-clamp-1">{book['Book-Author']}</p>
                    <p className="text-xs text-amber-300 mt-2">Views: {book.viewCount || 0}</p>
                    <p className="text-xs text-sky-300 mt-1">Rating: {formatRating(book)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.entries(groupedBooks).map(([department, deptBooks]) => (
        <div key={department} className="mb-12">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2 mb-6">
            <span className="text-emerald-400">#</span> {department}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deptBooks.map((book) => (
              <div key={book._id} className="glass-panel p-6 rounded-2xl flex flex-col h-full hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
                {book['Image-URL-M'] && (
                  <div className="w-full flex justify-center mb-4">
                    <img src={book['Image-URL-M']} alt={book['Book-Title']} className="shadow-lg h-40 object-cover rounded-md" />
                  </div>
                )}
                <div className="mb-4 flex-1">
                  <span className="text-xs font-semibold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full mb-3 inline-block border border-emerald-500/20">
                    {book.department || 'General'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleBookView(book._id)}
                    className="text-left w-full"
                  >
                    <h3 className="text-xl font-bold text-white mb-1 leading-tight hover:text-emerald-300 transition-colors">{book['Book-Title']}</h3>
                  </button>
                  <p className="text-emerald-400/80 text-sm mb-3">by {book['Book-Author']}</p>
                  <p className="text-gray-400 text-sm line-clamp-2">Published {book.Publisher ? `by ${book.Publisher}` : ''} {book['Year-Of-Publication'] ? `in ${book['Year-Of-Publication']}` : ''}</p>
                  <p className="text-amber-300/90 text-sm mt-2">Rating: {formatRating(book)}</p>
                  <p className="text-gray-500 text-xs mt-1">Views: {book.viewCount || 0}</p>
                </div>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                  <span className={`text-sm font-medium ${book.availabilityStatus ? 'text-emerald-400' : 'text-red-400'}`}>
                    {book.availabilityStatus ? 'Available' : 'Borrowed'}
                  </span>
                  <button
                    onClick={() => handleBorrow(book._id)}
                    disabled={!book.availabilityStatus}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${book.availabilityStatus
                        ? 'glass-button-primary'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                      }`}
                  >
                    Borrow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {books.length === 0 && (
        <div className="text-center py-20 text-gray-400 glass-panel mt-8 rounded-2xl mx-auto max-w-2xl">
          <p className="text-xl font-medium">No books found.</p>
        </div>
      )}
    </div>
  );
};

export default Catalog;
