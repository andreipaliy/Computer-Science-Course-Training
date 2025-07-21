// --- Doubly Linked Iterable List ---

const LinkedList = () => ({
  first: null,
  last: null,
  _data: [],

  get data() {
    // Access the raw node array
    return this._data;
  },

  add(value) {
    // Add a new node to the list
    let isEmptyArray = this._data.length === 0;
    this._data.push({
      next: null,
      prev: isEmptyArray ? null : this._data[this._data.length - 1],
      value: value,
    });
    this.last = this._data[this._data.length - 1];
    this.first = this._data[0];
    if (!isEmptyArray) {
      this._data[this._data.length - 2].next =
        this._data[this._data.length - 1];
    }
  },

  // Custom iterator for the linked list
  [Symbol.iterator]() {
    let current = this.first;
    return {
      next: () => {
        if (current) {
          const value = current.value;
          current = current.next;
          return { value, done: false };
        } else {
          return { done: true };
        }
      },
    };
  },
});

// --- Demo: LinkedList usage ---
const list = LinkedList();
list.add(1);
list.add(2);
list.add(3);
for (const value of list) {
  console.log("Iterated value:", value);
}
console.log("First:", list.first.value); // 1
console.log("Last:", list.last.value); // 3
console.log("Second:", list.first.next.value); // 2
console.log("Back to first:", list.first.next.prev.value); // 1

// --- Structure based on ArrayBuffer ---
function Structure(fields) {
  // Map field names to type/length
  const fieldMap = new Map(
    fields.map(([name, type, length]) => [name, { type, length }])
  );

  // Calculate buffer size
  const buffer = new ArrayBuffer(
    fields.reduce((total, [fieldName, , length]) => {
      const lengthForOneElementOfArray =
        (length ? length * 16 : 16) + fieldName.length * 16;
      total = total + lengthForOneElementOfArray;
      return total;
    }, 0) / 8
  );

  const dataView = new DataView(buffer);

  // Uncomment to enable set/get methods for the structure
  /*
  const methods = {
    set(key, value) {
      const field = fieldMap.get(key);
      if (!field) throw new Error(`Field '${key}' not found in the structure.`);
      let offset = 0;
      if (fieldMap.has(key)) {
        if (field.type === 'utf16') {
          const encoder = new TextEncoder();
          const encoded = encoder.encode(value);
          for (let i = 0; i < Math.min(encoded.length, field.length); i++) {
            dataView.setUint16(offset, encoded[i], true);
            offset += 2;
          }
        } else if (field.type === 'u16') {
          dataView.setUint16(offset, value, true);
          offset += 2;
        }
      }
    },
    get(key) {
      const field = fieldMap.get(key);
      if (!field) throw new Error(`Field '${key}' not found in the structure.`);
      let offset = 0;
      if (fieldMap.has(key)) {
        if (field.type === 'utf16') {
          const utf16Bytes = new Uint16Array(buffer, offset, field.length);
          const decoder = new TextDecoder();
          return decoder.decode(utf16Bytes).replace(/\0/g, ''); // Remove null characters
        } else if (field.type === 'u16') {
          return dataView.getUint16(offset, true);
        }
      }
    },
  };
  return methods;
  */
}

// --- Demo: Structure usage ---
const jackBlack = Structure([
  ["name", "utf16", 10],
  ["lastName", "utf16", 10],
  ["age", "u16"],
]);

// Uncomment to use set/get methods
// jackBlack.set('name', 'Jack');
// jackBlack.set('lastName', 'Black');
// jackBlack.set('age', 53);
// console.log(jackBlack.get('name')); // 'Jack'
