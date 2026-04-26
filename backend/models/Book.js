const mongoose = require('mongoose');

const bookSchema = mongoose.Schema(
  {
    ISBN: { type: String, required: true },
    'Book-Title': { type: String, required: true },
    'Book-Author': { type: String, required: true },
    'Year-Of-Publication': { type: Number },
    Publisher: { type: String },
    'Image-URL-S': { type: String },
    'Image-URL-M': { type: String },
    'Image-URL-L': { type: String },
    department: { type: String },
    availabilityStatus: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0, min: 0 },
    totalRatingScore: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true, collection: 'books_collection' }
);

module.exports = mongoose.model('Book', bookSchema);
