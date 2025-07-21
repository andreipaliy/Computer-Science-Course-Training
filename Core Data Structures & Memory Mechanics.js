// ## Implement a vector based on a typed array

// The vector should support a deque interface, similar to native JS arrays.

//  ```js

class Vector {
  constructor(ArrayConstructor, options) {
    const buffer = new ArrayBuffer(
      options.capacity * ArrayConstructor.BYTES_PER_ELEMENT
    );
    this.array = new ArrayConstructor(buffer);
    this.length = 0;
    this.capacity = options.capacity;
  }

  #extendArray() {
    const newCapacity = this.capacity * 2;
    const newArray = new this.array.constructor(newCapacity);
    newArray.set(this.array);
    this.array = newArray;
    this.capacity = newCapacity;
  }

  push(...values) {
    if (this.length + values.length > this.capacity) {
      this.#extendArray();
    }
    for (let value of values) {
      this.array[this.length++] = value;
    }
    return this.length;
  }

  pop() {
    const value = this.array[this.length - 1];
    this.array[--this.length] = 0;
    return value;
  }

  shift() {
    const value = this.array[0];
    for (let i = 1; i < this.length; i++) {
      this.array[i - 1] = this.array[i];
    }
    this.array[--this.length] = 0;
    return value;
  }

  unshift(...values) {
    if (this.length + values.length > this.capacity) {
      this.#extendArray();
    }
    for (let i = this.length - 1; i >= 0; i--) {
      this.array[i + values.length] = this.array[i];
    }
    for (let i = 0; i < values.length; i++) {
      this.array[i] = values[i];
    }
    this.length += values.length;
    return this.length;
  }
}

// Demo
const uint8Vector = new Vector(Uint8Array, { capacity: 2 });

uint8Vector.push(100); // [100]
uint8Vector.push(20, 10); // [100, 20, 10]
uint8Vector.pop(); // -> 10, [100, 20]
uint8Vector.shift(); // -> 100, [20]
uint8Vector.unshift(1); // -> [1, 20]
console.log(uint8Vector.length); // -> 2
//  ```

//  ##  Flatten Deep Object (Recursion & Stack)

// ```js
function collapse(obj, parentKey = "") {
  let result = {};
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      const nested = collapse(
        obj[key],
        parentKey ? `${parentKey}.${key}` : key
      );
      result = { ...result, ...nested };
    } else {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      result[fullKey] = obj[key];
    }
  }
  return result;
}

// Demo
const obj1 = {
  a: {
    b: [1, 2],
    "": { c: 2 },
  },
};

console.log(collapse(obj1)); // { 'a.b.0': 1, 'a.b.1': 2, 'a..c': 2 }
console.log(collapse({ c: 5, b: { a: 5 } })); // { c: 5, 'b.a': 5 }
//  ```js

//   ## Stack-Based Implementation
//  ```js
function collapseStack(obj) {
  const stack = [{ obj, prefix: "" }];
  const result = {};

  while (stack.length > 0) {
    const { obj, prefix } = stack.pop();
    for (let key in obj) {
      const value = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "object" && value !== null) {
        stack.push({ obj: value, prefix: fullKey });
      } else {
        result[fullKey] = value;
      }
    }
  }

  return result;
}

// Demo
const obj2 = {
  a: {
    b: [1, 2],
    "": { c: 2 },
  },
};

console.log(collapseStack(obj2)); // { 'a.b.0': 1, 'a.b.1': 2, 'a..c': 2 }
console.log(collapseStack({ c: 5, b: { a: 5 } })); // { c: 5, 'b.a': 5 }

//  ```

// Check if all types of brackets are balanced and correctly ordered.
// //  ```js
function isValid(str) {
  const stack = [];
  const openers = ["(", "{", "["];
  const closers = [")", "}", "]"];

  for (const char of str) {
    if (openers.includes(char)) {
      stack.push(char);
    } else if (closers.includes(char)) {
      const expectedOpener = openers[closers.indexOf(char)];
      if (stack.pop() !== expectedOpener) {
        return false;
      }
    }
  }

  return stack.length === 0;
}

// Demo
console.log(isValid("(hello{world} and [me])")); // true
console.log(isValid("(hello{world)} and [me])")); // false
console.log(isValid(")")); // false
//  ```

//    ```js
class Matrix3D {
  constructor(dimensions) {
    this.dimensions = dimensions;
    this.data = Array.from({ length: dimensions.x }, () =>
      Array.from({ length: dimensions.y }, () => Array(dimensions.z).fill(0))
    );
  }

  set({ x, y, z }, value) {
    if (this.isValidIndex(x, y, z)) {
      this.data[x][y][z] = value;
    } else {
      console.error("Invalid coordinates");
    }
  }

  get({ x, y, z }) {
    if (this.isValidIndex(x, y, z)) {
      return this.data[x][y][z];
    } else {
      console.error("Invalid coordinates");
      return undefined;
    }
  }

  isValidIndex(x, y, z) {
    return (
      x >= 0 &&
      x < this.dimensions.x &&
      y >= 0 &&
      y < this.dimensions.y &&
      z >= 0 &&
      z < this.dimensions.z
    );
  }
}

// Demo
const matrix = new Matrix3D({ x: 10, y: 10, z: 10 });
matrix.set({ x: 1, y: 3, z: 2 }, 10);
console.log(matrix.get({ x: 1, y: 3, z: 2 })); // Output: 10
//    ```

// ## Custom HashMap (Open Addressing)

// You can use primitives or objects as keys. You can design any hash function algorithm.
// Collisions can be resolved using chaining or open addressing. There should be support for expanding the internal buffer.

//    ```js
class HashMap {
  constructor(sizeBytes) {
    this.tableSize = sizeBytes;
    this.array = new Uint8Array(new ArrayBuffer(sizeBytes));
  }

  #hashFunction(key) {
    let str = typeof key === "string" ? key : String(key);
    return [...str].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  set(key, value) {
    let index = this.#hashFunction(key) % this.tableSize;

    while (this.array[index] !== 0) {
      index = (index + 1) % this.tableSize;
    }

    this.array[index] = value;
  }

  get(key) {
    let index = this.#hashFunction(key) % this.tableSize;
    return this.array[index];
  }

  has(key) {
    let index = this.#hashFunction(key) % this.tableSize;
    return this.array[index] !== 0;
  }

  delete(key) {
    let index = this.#hashFunction(key) % this.tableSize;
    const value = this.array[index];
    this.array[index] = 0;
    return value;
  }
}

// Demo
const map = new HashMap(10);
map.set("foo", 1);
map.set(42, 10);
map.set(document, 100);

console.log(map.get(42)); // 10
console.log(map.has(document)); // true
console.log(map.delete(document)); // 100
console.log(map.has(document)); // false
//    ```

// ## Define and Visualize a Graph Using SVG

// Implement graph definition using matrix structures, as well as adjacency structures.
// Make several variants for directed and undirected graphs. Visualize as an SVG image.

// -----------------------------------------------

// implementation via matrix

class MatrixForGraph {
  constructor(vertexAmount) {
    this.vertexAmount = vertexAmount;
    this.matrix = [];

    for (let i = 0; i < this.vertexAmount; i++) {
      this.matrix.push(new Array(this.vertexAmount).fill(0));
    }
  }
  addVertex() {
    console.log("before add Vertex", this.print());
    this.vertexAmount++;
    for (let i = 0; i < this.vertexAmount; i++) {
      this.matrix[i][this.vertexAmount - 1] = 0;

      if (this.matrix[this.vertexAmount - 1]?.[i]) {
        this.matrix[this.vertexAmount - 1][i] = 0;
      } else {
        this.matrix.push(new Array(this.vertexAmount).fill(0));
      }
    }
    console.log("after add Vertex", this.print());
  }

  addEdge(fromVertex, toVertex) {
    this.matrix[fromVertex][toVertex] = 1;
    console.log("added Edge");
  }
  deleteEdge(fromVertex, toVertex) {
    this.matrix[fromVertex][toVertex] = 0;
    console.log("deleted Edge");
  }
  hasEdge(fromVertex, toVertex) {
    console.log(
      `has vertex ${(fromVertex, toVertex)}`,
      this.matrix[fromVertex][toVertex] !== 0
    );
  }

  print() {
    for (let i = 0; i < this.vertexAmount; i++) {
      let row = "";
      for (let j = 0; j < this.vertexAmount; j++) {
        row += this.matrix[i][j] + " ";
      }
      console.log(row);
    }
  }
}

const myMatrix = new MatrixForGraph(3);

myMatrix.addEdge(1, 2, 1);
myMatrix.deleteEdge(1, 2);
myMatrix.hasEdge(1, 2);

myMatrix.addEdge(1, 1);
myMatrix.print();
myMatrix.addVertex();
myMatrix.print();

// -----------------------------------------------

class Graph {
  constructor(isDirected = false) {
    this.graph = new Map();
    this.isDirected = isDirected;
  }

  addVertex(vertexValue) {
    if (!this.graph.has(vertexValue)) {
      this.graph.set(vertexValue, []);
    } else {
      console.log("This node already exist in the graph!");
    }
  }

  addEdge(vertex1, vertex2) {
    const areNodesExisting = this.graph.has(vertex1) && this.graph.has(vertex2);

    if (areNodesExisting) {
      this.graph.get(vertex2).push(vertex1);
      if (!this.isDirected) {
        this.graph.get(vertex1).push(vertex2);
      }
    }
  }

  print() {
    console.log("RAW graph= ", this.graph);
    console.log(`Graph is ${this.isDirected ? "directed" : "undirected"}`);
    for (let vertex of this.graph) {
      console.log(
        `Value ${vertex[0]} --> ${
          vertex[1].length ? "Deps:" : "No deps"
        } ${vertex[1].map(dep => dep)}`
      );
    }
  }

  drawSVG() {
    function drawCircle(x, y, radius, color, text) {
      return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}">
      </circle>
      <text x="${x}" y="${y}" fill="black">
      ${text}
      </text>`;
    }

    function drawLine(x1, y1, x2, y2, color) {
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" />`;
    }
    const svgElements = [];

    for (let vertex of this.graph) {
      const radius = 10;
      // add vertex
      svgElements.push(
        drawCircle(
          vertex[0] + radius,
          vertex[0] + radius,
          radius,
          "orange",
          vertex[0]
        )
      );

      // add deps
      if (vertex[1].length) {
        svgElements.push(
          vertex[1]
            .map(dep => {
              const color = Math.random() > 0.5 ? "blue" : "red";
              return `${drawLine(
                vertex[0] + radius,
                vertex[0] + radius,
                dep + radius,
                dep + radius,
                color
              )}`;
            })
            .join("")
        );
      }
    }
    const svgContent = svgElements.join("");
    const svgOutput = `<svg width="800" height="800">${svgContent}</svg>`;
    if (typeof window !== "undefined") {
      document.body.innerHTML = svgOutput;
    }
  }

  // Implementing the isParent method
  isParent(parentValue, childValue) {
    const parentVertexDeps = this.graph.get(parentValue);
    const childVertexDeps = this.graph.get(childValue);

    console.log(parentVertexDeps, childVertexDeps);

    if (!parentVertexDeps || !childVertexDeps) {
      return false; // One or both vertices don't exist
    }

    // Check if the child vertex directly depends on the parent vertex
    if (childVertexDeps.includes(parentValue)) {
      return console.log("Yes!");
    }

    // Check if the parent is a parent of the child transitively
    const visited = new Set();
    const stack = [...childVertexDeps]; // Start with child's dependencies
    console.log("stack", stack);
    while (stack.length > 0) {
      const currentDependency = stack.pop();
      console.log("currentDependency", currentDependency);
      if (currentDependency === parentValue) {
        return true; // Found the parent
      }
      if (!visited.has(currentDependency)) {
        visited.add(currentDependency);
        const dependencyVertex = this.graph.get(currentDependency);
        if (dependencyVertex) {
          stack.push(...dependencyVertex);
        }
      }
    }

    console.log("Not parent"); // Parent is not a parent of child
  }
}

const myGraph = new Graph(true);

myGraph.addVertex(100);
myGraph.addVertex(200);
myGraph.addVertex(300);
myGraph.addVertex(400);
myGraph.addVertex(500);

myGraph.addEdge(100, 200);
myGraph.addEdge(100, 300);
myGraph.addEdge(200, 400);
myGraph.addEdge(300, 500);

myGraph.print();
myGraph.isParent(100, 200); // true
myGraph.isParent(200, 100); // false
myGraph.isParent(300, 200); // false
myGraph.isParent(300, 500); // false

myGraph.drawSVG();
