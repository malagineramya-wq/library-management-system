import express from 'express';
import {
  getTransactions,
  issueBook,
  returnBook,
} from '../controllers/transactionController.js';

const router = express.Router();

router.route('/')
  .get(getTransactions);

router.route('/issue')
  .post(issueBook);

router.route('/:id/return')
  .put(returnBook);

export default router;
