import mongoose from 'mongoose';
import { isMongoConnected } from '../config/db.js';
import { fallbackBooks } from '../config/localStore.js';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Total quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 1,
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative'],
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.pre('validate', function (next) {
  if (this.isNew && this.availableQuantity === undefined) {
    this.availableQuantity = this.quantity;
  }
  next();
});

const MongooseBook = mongoose.model('Book', bookSchema);

// Proxy that forwards to Mongoose model if connected, or fallback store if not
const BookProxy = new Proxy(MongooseBook, {
  get(target, prop) {
    if (isMongoConnected) {
      return target[prop];
    }
    if (prop in fallbackBooks) {
      return typeof fallbackBooks[prop] === 'function'
        ? fallbackBooks[prop].bind(fallbackBooks)
        : fallbackBooks[prop];
    }
    return target[prop];
  },
});

export default BookProxy;
export { MongooseBook as Book };
