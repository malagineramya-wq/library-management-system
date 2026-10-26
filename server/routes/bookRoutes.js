import express from 'express';
import {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';

const router = express.Router();

router.route('/')
  .get(getBooks)
  .post(addBook);

router.route('/:id')
  .get(getBookById)
  .put(updateBook)
  .delete(deleteBook);

export default router;
