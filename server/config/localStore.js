import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'db.json');

// Ensure data folder exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let memoryDB = {
  books: [],
  members: [],
  transactions: [],
};

// Load saved data if file exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    memoryDB = JSON.parse(raw);
  } catch (err) {
    console.warn('[LocalStore] Could not read existing db.json, initializing fresh store.');
  }
}

export const saveStore = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryDB, null, 2), 'utf-8');
  } catch (err) {
    console.error('[LocalStore Error] Could not persist db.json:', err.message);
  }
};

const generateId = () => {
  const chars = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

// Helper to wrap a plain document with a .save() method
const wrapDoc = (collectionName, doc) => {
  if (!doc) return null;
  const wrapped = { ...doc };
  Object.defineProperty(wrapped, 'save', {
    enumerable: false,
    value: async function () {
      const idx = memoryDB[collectionName].findIndex((item) => String(item._id) === String(this._id));
      if (idx !== -1) {
        memoryDB[collectionName][idx] = { ...this, updatedAt: new Date() };
      } else {
        memoryDB[collectionName].push({ ...this, updatedAt: new Date() });
      }
      saveStore();
      return this;
    },
  });
  return wrapped;
};

// Match query conditions (handles $regex, $options, $or, direct equality)
const matchesQuery = (item, query) => {
  if (!query || Object.keys(query).length === 0) return true;

  if (query.$or && Array.isArray(query.$or)) {
    const orMatched = query.$or.some((subQuery) => matchesQuery(item, subQuery));
    if (!orMatched) return false;
  }

  for (const key of Object.keys(query)) {
    if (key === '$or') continue;
    const condition = query[key];
    const itemVal = item[key];

    if (condition && typeof condition === 'object' && condition.$regex) {
      const regex = new RegExp(condition.$regex, condition.$options || '');
      if (!regex.test(String(itemVal || ''))) return false;
    } else if (String(itemVal) !== String(condition)) {
      return false;
    }
  }

  return true;
};

export class FallbackModel {
  constructor(collectionName) {
    this.name = collectionName;
    if (!memoryDB[collectionName]) {
      memoryDB[collectionName] = [];
    }
  }

  find(query = {}) {
    const list = memoryDB[this.name].filter((item) => matchesQuery(item, query));
    let result = list.map((item) => wrapDoc(this.name, item));

    const chainable = {
      _data: result,
      sort(sortOpt = {}) {
        const key = Object.keys(sortOpt)[0] || 'createdAt';
        const dir = sortOpt[key] === -1 ? -1 : 1;
        this._data.sort((a, b) => {
          if (a[key] < b[key]) return -1 * dir;
          if (a[key] > b[key]) return 1 * dir;
          return 0;
        });
        return this;
      },
      limit(n) {
        this._data = this._data.slice(0, n);
        return this;
      },
      populate(field, selectFields) {
        this._data = this._data.map((item) => {
          let refCol = '';
          if (field === 'bookId') refCol = 'books';
          if (field === 'memberId') refCol = 'members';

          if (refCol && memoryDB[refCol]) {
            const rawRef = memoryDB[refCol].find(
              (r) => String(r._id) === String(item[field]?._id || item[field])
            );
            if (rawRef) {
              item[field] = { ...rawRef };
            }
          }
          return item;
        });
        return this;
      },
      then(resolve, reject) {
        return Promise.resolve(this._data).then(resolve, reject);
      },
    };

    return chainable;
  }

  findOne(query = {}) {
    const item = memoryDB[this.name].find((i) => matchesQuery(i, query));
    let doc = item ? wrapDoc(this.name, item) : null;

    const chainable = {
      _doc: doc,
      populate(field) {
        if (!this._doc) return this;
        let refCol = '';
        if (field === 'bookId') refCol = 'books';
        if (field === 'memberId') refCol = 'members';
        if (refCol && memoryDB[refCol]) {
          const rawRef = memoryDB[refCol].find(
            (r) => String(r._id) === String(this._doc[field]?._id || this._doc[field])
          );
          if (rawRef) {
            this._doc[field] = { ...rawRef };
          }
        }
        return this;
      },
      then(resolve, reject) {
        return Promise.resolve(this._doc).then(resolve, reject);
      },
    };
    return chainable;
  }

  findById(id) {
    const item = memoryDB[this.name].find((i) => String(i._id) === String(id));
    let doc = item ? wrapDoc(this.name, item) : null;

    const chainable = {
      _doc: doc,
      populate(field) {
        if (!this._doc) return this;
        let refCol = '';
        if (field === 'bookId') refCol = 'books';
        if (field === 'memberId') refCol = 'members';
        if (refCol && memoryDB[refCol]) {
          const rawRef = memoryDB[refCol].find(
            (r) => String(r._id) === String(this._doc[field]?._id || this._doc[field])
          );
          if (rawRef) {
            this._doc[field] = { ...rawRef };
          }
        }
        return this;
      },
      then(resolve, reject) {
        return Promise.resolve(this._doc).then(resolve, reject);
      },
    };
    return chainable;
  }

  async create(data) {
    const newDoc = {
      _id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryDB[this.name].push(newDoc);
    saveStore();
    return wrapDoc(this.name, newDoc);
  }

  async findByIdAndDelete(id) {
    const idx = memoryDB[this.name].findIndex((i) => String(i._id) === String(id));
    if (idx !== -1) {
      const deleted = memoryDB[this.name].splice(idx, 1)[0];
      saveStore();
      return wrapDoc(this.name, deleted);
    }
    return null;
  }

  async countDocuments(query = {}) {
    if (!query || Object.keys(query).length === 0) {
      return memoryDB[this.name].length;
    }
    return memoryDB[this.name].filter((i) => matchesQuery(i, query)).length;
  }

  async insertMany(docs = []) {
    const inserted = docs.map((d) => ({
      _id: d._id || generateId(),
      ...d,
      createdAt: d.createdAt || new Date(),
      updatedAt: d.updatedAt || new Date(),
    }));
    memoryDB[this.name].push(...inserted);
    saveStore();
    return inserted.map((i) => wrapDoc(this.name, i));
  }
}

export const fallbackBooks = new FallbackModel('books');
export const fallbackMembers = new FallbackModel('members');
export const fallbackTransactions = new FallbackModel('transactions');
export { memoryDB };
