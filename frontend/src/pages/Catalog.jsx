import { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiSearch } from 'react-icons/fi';

const Catalog = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchBooks();
  }, [search]);

  const fetchBooks = async () => {
    try {
      const { data } = await API.get(`/books?search=${search}`);
      setBooks(data);
    } catch (err) {
      toast.error('Failed to fetch books');
    }
  };

  const handleBorrow = async (bookId) => {
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-gray-800">Library Catalog</h1>
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search by title, author or department..." 
            className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FiSearch className="absolute left-4 top-3 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col h-full">
            {book['Image-URL-M'] && (
              <div className="w-full flex justify-center mb-4">
                <img src={book['Image-URL-M']} alt={book['Book-Title']} className="shadow-md h-40 object-cover" />
              </div>
            )}
            <div className="mb-4 flex-1">
              <span className="text-xs font-semibold uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-full mb-2 inline-block">
                {book.department || 'General'}
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{book['Book-Title']}</h3>
              <p className="text-gray-500 text-sm mb-3">by {book['Book-Author']}</p>
              <p className="text-gray-600 text-sm line-clamp-2">Published {book.Publisher ? `by ${book.Publisher}` : ''} {book['Year-Of-Publication'] ? `in ${book['Year-Of-Publication']}` : ''}</p>
            </div>
            <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
              <span className={`text-sm font-medium ${book.availabilityStatus ? 'text-green-500' : 'text-red-500'}`}>
                {book.availabilityStatus ? 'Available' : 'Borrowed'}
              </span>
              <button 
                onClick={() => handleBorrow(book._id)}
                disabled={!book.availabilityStatus}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  book.availabilityStatus 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Borrow
              </button>
            </div>
          </div>
        ))}
      </div>
      {books.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">No books found.</p>
        </div>
      )}
    </div>
  );
};

export default Catalog;
