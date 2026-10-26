import mongoose from 'mongoose';
import { isMongoConnected } from '../config/db.js';
import { fallbackTransactions } from '../config/localStore.js';

const transactionSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book ID is required'],
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member ID is required'],
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Issued', 'Returned'],
      default: 'Issued',
    },
  },
  {
    timestamps: true,
  }
);

const MongooseTransaction = mongoose.model('Transaction', transactionSchema);

const TransactionProxy = new Proxy(MongooseTransaction, {
  get(target, prop) {
    if (isMongoConnected) {
      return target[prop];
    }
    if (prop in fallbackTransactions) {
      return typeof fallbackTransactions[prop] === 'function'
        ? fallbackTransactions[prop].bind(fallbackTransactions)
        : fallbackTransactions[prop];
    }
    return target[prop];
  },
});

export default TransactionProxy;
export { MongooseTransaction as Transaction };
