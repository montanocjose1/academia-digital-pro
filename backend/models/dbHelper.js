import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, '../../database/mockDb.json');

// Global mock state
let useMock = false;

export const setUseMock = (val) => {
  useMock = val;
};

export const getUseMock = () => useMock;

// Helper to generate custom IDs
const generateId = () => new mongoose.Types.ObjectId().toString();

// Load data from file
const loadData = () => {
  try {
    if (!fs.existsSync(dbFilePath)) {
      const initial = {
        users: [],
        courses: [],
        modules: [],
        lessons: [],
        purchases: [],
        reviews: [],
        certificates: [],
        coupons: []
      };
      fs.writeFileSync(dbFilePath, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading mock database file:', err);
    return {};
  }
};

// Save data to file
const saveData = (data) => {
  try {
    const dir = path.dirname(dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving mock database file:', err);
  }
};

// Mock Query Class to handle Mongoose Chainable Methods (.populate, .sort, thenable)
class MockQuery {
  constructor(data, collectionName, allDbData) {
    this.data = data;
    this.collectionName = collectionName;
    this.allDbData = allDbData;
  }

  populate(pathOption) {
    if (!this.data) return this;
    const paths = typeof pathOption === 'string' ? [pathOption] : [pathOption.path];
    const isArray = Array.isArray(this.data);
    const items = isArray ? this.data : [this.data];

    items.forEach((item) => {
      paths.forEach((p) => {
        let fieldName = p;
        let subPopulate = null;
        if (typeof pathOption === 'object') {
          fieldName = pathOption.path;
          subPopulate = pathOption.populate;
        }

        const value = item[fieldName];
        if (!value) return;

        // Resolve references
        const targetCollectionMap = {
          instructor: 'users',
          student: 'users',
          courses: 'courses',
          course: 'courses',
          modules: 'modules',
          lessons: 'lessons',
        };
        const targetColl = targetCollectionMap[fieldName];
        if (!targetColl) return;

        const populateSingle = (id) => {
          const found = this.allDbData[targetColl]?.find((x) => x._id === id.toString() || x._id?.toString() === id.toString());
          if (!found) return id;

          // Clone to prevent circular mutating
          const cloned = { ...found };

          // Handle sub-populate (e.g. course.modules -> lessons)
          if (subPopulate && cloned) {
            const subFieldName = subPopulate.path;
            const subTargetColl = targetCollectionMap[subFieldName];
            if (subTargetColl && cloned[subFieldName]) {
              const subItems = Array.isArray(cloned[subFieldName]) ? cloned[subFieldName] : [cloned[subFieldName]];
              const resolvedSub = subItems.map((subId) => {
                const subFound = this.allDbData[subTargetColl]?.find((y) => y._id === subId.toString() || y._id?.toString() === subId.toString());
                return subFound ? { ...subFound } : subId;
              });
              cloned[subFieldName] = Array.isArray(cloned[subFieldName]) ? resolvedSub : resolvedSub[0];
            }
          }
          return cloned;
        };

        if (Array.isArray(value)) {
          item[fieldName] = value.map((id) => populateSingle(id));
        } else {
          item[fieldName] = populateSingle(value);
        }
      });
    });

    if (!isArray) {
      this.data = items[0];
    }
    return this;
  }

  sort(sortObj) {
    if (!Array.isArray(this.data)) return this;
    const key = Object.keys(sortObj)[0];
    const order = sortObj[key]; // 1 for asc, -1 for desc

    this.data.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      if (key === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return order === 1 ? -1 : 1;
      if (valA > valB) return order === 1 ? 1 : -1;
      return 0;
    });

    return this;
  }

  // Thenable implementation to allow await query
  async then(resolve, reject) {
    try {
      resolve(this.data);
    } catch (err) {
      reject(err);
    }
  }
}

// Mock Model Class
class MockModel {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema;
    this.collectionName = `${name.toLowerCase()}s`; // user -> users
  }

  async find(query = {}) {
    const db = loadData();
    const list = db[this.collectionName] || [];
    const filtered = list.filter((item) => {
      for (const key in query) {
        if (key === '$or') {
          return query.$or.some((subQuery) => {
            for (const subKey in subQuery) {
              const val = item[subKey]?.toString() || '';
              const searchVal = subQuery[subKey]?.$regex || subQuery[subKey] || '';
              if (new RegExp(searchVal, 'i').test(val)) return true;
            }
            return false;
          });
        }
        if (query[key] && typeof query[key] === 'object' && query[key].$in) {
          return query[key].$in.map(id => id.toString()).includes(item[key]?.toString());
        }
        if (item[key]?.toString() !== query[key]?.toString()) {
          return false;
        }
      }
      return true;
    });
    // Deep clone to isolate mutations
    const clonedList = JSON.parse(JSON.stringify(filtered));
    return new MockQuery(clonedList.map(item => this._instantiate(item)), this.collectionName, db);
  }

  async findOne(query = {}) {
    const db = loadData();
    const list = db[this.collectionName] || [];
    const found = list.find((item) => {
      for (const key in query) {
        if (item[key]?.toString() !== query[key]?.toString()) {
          return false;
        }
      }
      return true;
    });
    if (!found) return new MockQuery(null, this.collectionName, db);
    const cloned = JSON.parse(JSON.stringify(found));
    return new MockQuery(this._instantiate(cloned), this.collectionName, db);
  }

  async findById(id) {
    if (!id) return new MockQuery(null, this.collectionName, loadData());
    return this.findOne({ _id: id.toString() });
  }

  async create(data) {
    const db = loadData();
    const newDoc = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    db[this.collectionName].push(newDoc);
    saveData(db);
    return this._instantiate(JSON.parse(JSON.stringify(newDoc)));
  }

  async findByIdAndUpdate(id, data, options = {}) {
    const db = loadData();
    const index = db[this.collectionName].findIndex((item) => item._id === id.toString());
    if (index === -1) return null;
    
    db[this.collectionName][index] = {
      ...db[this.collectionName][index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveData(db);
    return this._instantiate(JSON.parse(JSON.stringify(db[this.collectionName][index])));
  }

  async countDocuments(query = {}) {
    const res = await this.find(query);
    return res.data?.length || 0;
  }

  async deleteMany(query = {}) {
    const db = loadData();
    db[this.collectionName] = db[this.collectionName].filter((item) => {
      for (const key in query) {
        if (item[key]?.toString() !== query[key]?.toString()) {
          return true; // Keep
        }
      }
      return false; // Delete
    });
    saveData(db);
    return { deletedCount: 1 };
  }

  async aggregate(pipeline) {
    const db = loadData();
    const list = db[this.collectionName] || [];

    // Simple emulation of aggregate functions needed in app
    // totalAmount sums
    if (pipeline.some(p => p.$group && p.$group.totalSales)) {
      const sum = list.reduce((total, p) => total + (p.totalAmount || 0), 0);
      return [{ totalSales: sum }];
    }
    // monthly sales groups
    if (pipeline.some(p => p.$group && p.$group._id && p.$group._id.$dateToString)) {
      const groups = {};
      list.forEach((p) => {
        const dateStr = p.createdAt.slice(0, 7); // YYYY-MM
        if (!groups[dateStr]) groups[dateStr] = { amount: 0, count: 0 };
        groups[dateStr].amount += p.totalAmount || 0;
        groups[dateStr].count += 1;
      });
      return Object.keys(groups).map(key => ({
        _id: key,
        amount: groups[key].amount,
        count: groups[key].count
      })).sort((a, b) => a._id.localeCompare(b._id));
    }
    // course ratings averages
    if (pipeline.some(p => p.$group && p.$group.rating && p.$group.rating.$avg)) {
      const matchObj = pipeline.find((p) => p.$match);
      const matchCourse = matchObj ? matchObj.$match?.course : null;
      const filtered = matchCourse ? list.filter(r => r.course.toString() === matchCourse.toString()) : list;
      if (filtered.length === 0) return [];
      const sum = filtered.reduce((total, r) => total + r.rating, 0);
      return [{
        _id: matchCourse,
        rating: sum / filtered.length,
        ratingsCount: filtered.length
      }];
    }

    return [];
  }

  _instantiate(doc) {
    if (!doc) return null;
    const modelName = this.name;
    const collName = this.collectionName;

    // Initialize array defaults
    if (collName === 'users') {
      doc.enrolledCourses = doc.enrolledCourses || [];
      doc.completedLessons = doc.completedLessons || [];
    }
    if (collName === 'courses') {
      doc.modules = doc.modules || [];
    }
    if (collName === 'modules') {
      doc.lessons = doc.lessons || [];
    }

    // Attach instance methods
    doc.save = async function () {
      const db = loadData();
      const index = db[collName].findIndex((item) => item._id === doc._id.toString());
      const cleanDoc = { ...doc };
      delete cleanDoc.save;
      delete cleanDoc.deleteOne;
      delete cleanDoc.matchPassword;
      delete cleanDoc.isValid;

      cleanDoc.updatedAt = new Date().toISOString();
      
      if (index > -1) {
        db[collName][index] = cleanDoc;
      } else {
        db[collName].push(cleanDoc);
      }
      saveData(db);
      return this;
    };

    doc.deleteOne = async function () {
      const db = loadData();
      db[collName] = db[collName].filter((item) => item._id !== doc._id.toString());
      saveData(db);
      return { deletedCount: 1 };
    };

    if (modelName === 'User') {
      doc.matchPassword = async function (entered) {
        // Since we are mocking without full bcrypt on client side for easy demos,
        // we check both hashed and plain text comparisons (our seed script uses plain/hashed)
        // For local development, check simple match or hashed
        return entered === this.password || this.password === entered;
      };
    }

    if (modelName === 'Coupon') {
      doc.isValid = function () {
        if (!this.isActive) return false;
        if (this.expiresAt && new Date() > new Date(this.expiresAt)) return false;
        if (this.maxUses !== null && this.usesCount >= this.maxUses) return false;
        return true;
      };
    }

    return doc;
  }
}

// Dynamic Model Proxy to defer resolution of Mongoose vs Mock to execution/query time
class DynamicModelProxy {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema;
    this.mongooseModel = null;
    this.mockModel = new MockModel(name, schema);
  }

  _getModel() {
    if (useMock) {
      return this.mockModel;
    }
    if (!this.mongooseModel) {
      try {
        this.mongooseModel = mongoose.model(this.name) || mongoose.model(this.name, this.schema);
      } catch {
        this.mongooseModel = mongoose.model(this.name, this.schema);
      }
    }
    return this.mongooseModel;
  }

  // Delegate static queries
  find(...args) { return this._getModel().find(...args); }
  findOne(...args) { return this._getModel().findOne(...args); }
  findById(...args) { return this._getModel().findById(...args); }
  create(...args) { return this._getModel().create(...args); }
  findByIdAndUpdate(...args) { return this._getModel().findByIdAndUpdate(...args); }
  countDocuments(...args) { return this._getModel().countDocuments(...args); }
  deleteMany(...args) { return this._getModel().deleteMany(...args); }
  aggregate(...args) { return this._getModel().aggregate(...args); }
}

// Main hybrid model loader
export const getModel = (name, schema) => {
  return new DynamicModelProxy(name, schema);
};
