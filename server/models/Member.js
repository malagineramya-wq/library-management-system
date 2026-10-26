import mongoose from 'mongoose';
import { isMongoConnected } from '../config/db.js';
import { fallbackMembers } from '../config/localStore.js';

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    membershipDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseMember = mongoose.model('Member', memberSchema);

const MemberProxy = new Proxy(MongooseMember, {
  get(target, prop) {
    if (isMongoConnected) {
      return target[prop];
    }
    if (prop in fallbackMembers) {
      return typeof fallbackMembers[prop] === 'function'
        ? fallbackMembers[prop].bind(fallbackMembers)
        : fallbackMembers[prop];
    }
    return target[prop];
  },
});

export default MemberProxy;
export { MongooseMember as Member };
