// ===== IN-MEMORY STORAGE POLYFILL =====
// Provides window.storage API for game state persistence

window.storage = {
  _data: {},

  set: function(key, value) {
    try {
      this._data[key] = value;
      return { key, value, shared: false };
    } catch (e) {
      console.error("Storage set error:", e);
      return null;
    }
  },

  get: function(key) {
    try {
      if (key in this._data) {
        return { key, value: this._data[key], shared: false };
      }
      return null;
    } catch (e) {
      console.error("Storage get error:", e);
      return null;
    }
  },

  delete: function(key) {
    try {
      if (key in this._data) {
        delete this._data[key];
        return { key, deleted: true, shared: false };
      }
      return null;
    } catch (e) {
      console.error("Storage delete error:", e);
      return null;
    }
  },

  list: function(prefix) {
    try {
      const keys = Object.keys(this._data).filter(k => !prefix || k.startsWith(prefix));
      return { keys, prefix, shared: false };
    } catch (e) {
      console.error("Storage list error:", e);
      return null;
    }
  }
};

console.log("[STORAGE] In-memory storage initialized");