// ## Реализовать вектор над типизированным массивом

// Вектор должен поддерживать интерфейс двусторонней очереди, как у нативных массивов JS.

//  ```js

// class Vector {
//   constructor(typedArrayFn, options) {
//     let vector = null
//     switch (typedArrayFn) {
//       case Uint8Array:
//         const memorySpace = new ArrayBuffer(options.capacity )
//          vector = new Uint8Array(memorySpace)
//         break;

//       default:
//         console.log("Wrong params passed to Vector contructor!");
//         break;
//     }
//     console.log("Created=", vector);
//     this.vector = vector
//     this.length = 0
//   }

//   push(...values) {
//     for (let value of values) {
//       this.vector[this.length] = value
//       this.length = this.length + 1
//     }
//     console.log(this.length)
//   }

//   pop() {
//     const popedValue = this.vector[this.length-1]
//     this.vector[this.length-1] = 0
//     this.length = this.length - 1
//     console.log(popedValue);
//   }

//   shift() {
//     const shiftedValue = this.vector[0]
//     for(let i = 0; i <= this.length - 1; i++) {
//       this.vector[i] = this.vector[i + 1]
//     }
//     this.length = this.length - 1
//     console.log(shiftedValue);
//   }

//   unshift(value) {
//     let savedValue = this.vector[0]
//     this.vector[0] = value
//     for(let i = 1; i <= this.length; i++) {
//       this.vector[i] = savedValue
//       savedValue = this.vector[i + 1]
//     }
//     this.length = this.length + 1
//     console.log(this.length);
//   }
//  }

//  const uint8Vector = new Vector(Uint8Array, {capacity: 3});

//  uint8Vector.push(100);    // 1 --- [100]
//  uint8Vector.push(20, 10); // 3 --- [100, 20, 10]

//  uint8Vector.pop();        // 10 --- [100, 20]
//  uint8Vector.shift();      // 100 --- [20]

//  uint8Vector.unshift(1);          // 2 --- [1, 20]
//  console.log(uint8Vector.length); // 2
//  ```

// //   ## Сжатие глубокого объекта

// // Необходимо написать функцию, которая бы сжимала некоторый глубокий объект в плоский вид.
// // Задача должна быть решена минимум двумя способами: через рекурсию и через стек. Можно, также, решить через очередь.

//   //  ```js
//    const obj = {
//      a: {
//        b: [1, 2],
//        '': {c: 2}
//      }
//    };

//    function collapse(obj, parentKey = '') {
//     let result = {}
//     for(const key in obj) {
//     if(typeof obj[key] === 'object') {
//       const returnedObj = collapse(obj[key], `${parentKey? parentKey+"." : ""}${key}`)
//       result = {...result, ...returnedObj}
//     } else {
//       result[`${parentKey? `${parentKey}.${key}` : key}`] = obj[key]
//     }
//   }
//   return result
// }

//   console.log(collapse(obj)); /* {'a.b.0': 1, 'a.b.1': 2, 'a..c': 2} */
//   console.log(collapse({ c: 5, b: {a: 5}})) // { c: 5, 'b.a': 5 }
//   //  ```

//   ## Сжатие глубокого объекта

// Необходимо написать функцию, которая бы сжимала некоторый глубокий объект в плоский вид.
// Задача должна быть решена минимум двумя способами: через рекурсию и через стек. Можно, также, решить через очередь.

//  ```js
// const obj = {
//   a: {
//     b: [1, 2],
//     '': {c: 2}
//   }
// };

//   function collapse(obj) {
//    const result = {}
//    const stack = []
//    for(let key in obj) {
//     if (typeof obj[key] === 'object') {

//     } else {

//     }
//    }
// }
// function collapseStack(obj) {
//   let stack = [{ obj, prefix: '' }];
//   let result = {};

//   while (stack.length > 0) {
//     let { obj, prefix } = stack.pop();

//     for (let key in obj) {
//       if (typeof obj[key] === 'object' && obj[key] !== null) {
//         stack.push({ obj: obj[key], prefix: prefix + key + '.' });
//       } else {
//         result[prefix + key] = obj[key];
//       }
//     }
//   }

//   return result;
// }

//  console.log(collapseStack(obj)); /* {'a.b.0': 1, 'a.b.1': 2, 'a..c': 2} */
//  console.log(collapseStack({ c: 5, b: {a: 5}})) // { c: 5, 'b.a': 5 }
//  ```

//  ## Валидация скобочных групп

// Необходимо написать функцию, которая бы принимала строку и возвращала true, если у каждого из символов `{`, `[` и `(` есть своя закрывающая пара и они стоят в правильной последовательности.

// //  ```js
// const isValid = (str) => {
//   const stack = []
//   const openers = ['(', '{', '[']
//   const closers = [')', '}', ']']
//   for (let char of str) {
//     if(openers.includes(char)) {
//       stack.push(char)
//     }

//     if(closers.includes(char)) {
//       const indexOfCloser = closers.indexOf(char)
//       const indexOfOpener = openers.indexOf(stack[stack.length-1])
//       if(indexOfOpener !== indexOfCloser) return false
//       stack.pop()
//     }
//   }
//   return stack.length === 0
// }

//  console.log(isValid('(hello{world} and [me])'));  // true
//  console.log(isValid('(hello{world)} and [me])')); // false
//  console.log(isValid(')'));                        // false
//  ```

// ## Реализовать вектор над типизированным массивом

// Вектор должен поддерживать интерфейс двусторонней очереди, как у нативных массивов JS.

//    ```js

// class Vector {
//   constructor(ArrayConstructor, options) {
//     const buffer = new ArrayBuffer(options.capacity * ArrayConstructor.BYTES_PER_ELEMENT)
//     this.array = new ArrayConstructor(buffer)
//     this.length = 0
//     this.capacity = options.capacity
//   }

//   #extendArray() {
//     const newCapacity = this.capacity * 2;
//     const newArray = new this.array.constructor(newCapacity);
//     newArray.set(this.array);
//     this.array = newArray;
//     this.capacity = newCapacity;
//   }

//    push(...values) {
//     if(this.length+values.length > this.capacity) {
//       this.#extendArray()
//     }
//     for (let value of values) {
//       this.array[this.length] = value
//       this.length++
//     }
//     console.log(this.length);
//     return this.length
//   }

//   pop() {
//     const popedValue = this.array[this.length - 1]
//     this.array[this.length - 1] = 0
//     this.length--
//     console.log(popedValue);
//     return popedValue
//   }

//   shift() {
//     const shiftedValue = this.array[0]
//     this.array[0] = this.array[1]
//     for (let i=1; i<this.length; i++) {
//       this.array[i] = this.array[i+1]
//     }
//     this.length--
//     console.log(shiftedValue);
//     return shiftedValue
//   }

//   unshift(...values) {
//     if(this.length+values.length > this.capacity) {
//       this.#extendArray()
//     }
//     let savedValue = this.array[0]
//     for(let i=0; i < this.length+values.length-1; i++) {
//       this.array[i] = values[i]
//       this.array[i+1] = savedValue
//     }
//     this.length = this.length + values.length
//     console.log(this.length);
//     return this.length
//   }
// }
//    const uint8Vector = new Vector(Uint8Array, {capacity: 2});
//    uint8Vector.push(100);    // 1
//    uint8Vector.push(20, 10); // 3

//    uint8Vector.pop();        // 10
//    uint8Vector.shift();      // 100

//    uint8Vector.unshift(1);          // 2
//    console.log(uint8Vector.length); // 2
//    ```

// ## Реализовать класс для описания 3-х мерной матрицы

//    ```js
//  const matrix = new Matrix3D({x: 10, y: 10, z: 10});
// implementarea e ChatGPT-ului, am fc skip la exercitiul acesta ;)
//  class Matrix3D {
//   constructor(dimensions) {
//     this.dimensions = dimensions;
//     this.data = new Array(dimensions.x);
//     for (let i = 0; i < dimensions.x; i++) {
//       this.data[i] = new Array(dimensions.y);
//       for (let j = 0; j < dimensions.y; j++) {
//         this.data[i][j] = new Array(dimensions.z).fill(0);
//       }
//     }
//   }

//   set(coordinates, value) {
//     const { x, y, z } = coordinates;
//     if (this.isValidIndex(x, y, z)) {
//       this.data[x][y][z] = value;
//     } else {
//       console.error("Invalid coordinates");
//     }
//   }

//   get(coordinates) {
//     const { x, y, z } = coordinates;
//     if (this.isValidIndex(x, y, z)) {
//       return this.data[x][y][z];
//     } else {
//       console.error("Invalid coordinates");
//       return undefined;
//     }
//   }

//   isValidIndex(x, y, z) {
//     return x >= 0 && x < this.dimensions.x &&
//            y >= 0 && y < this.dimensions.y &&
//            z >= 0 && z < this.dimensions.z;
//   }
// }

// Example usage
// const matrix = new Matrix3D({ x: 10, y: 10, z: 10 });

// matrix.set({ x: 1, y: 3, z: 2 }, 10);
// console.log(matrix.get({ x: 1, y: 3, z: 2 })); // Output: 10

//  matrix.set({x: 1, y: 3, z: 2}, 10);
//  matrix.get({x: 1, y: 3, z: 2});
//    ```

// ## Реализовать класс для создания хэш-таблицы

// В качестве ключей можно использовать примитивы или объекты. Алгоритм хэш-функции можно придумать любой.
// Коллизии можно решать через метод цепочек или используя открытую адресацию. Должна быть поддержка расширения внутреннего буфера.

//    ```js
//    // Задаем ёмкость внутреннего буфера

// class HashMap {
//   constructor(sizeBytes) {
//     this.tableSize = sizeBytes
//     this.array = new Uint8Array(new ArrayBuffer(sizeBytes))
//   }
//   #HashFunction(key) {
//     let hash = 0;
//   for (let i = 0; i < key.length; i++) {
//     hash += key.charCodeAt(i);
//   }
//   return hash
//   }

//   set(key, value) {
//     let index = this.#HashFunction(key) % this.tableSize

//     if(this.array[index] === 0) {
//       this.array[index] = value
//     } else {
//      while (this.array[index] !== 0) {
//       index = ++index
//      }
//      this.array[index] = value
//     }
//   }

//   get(key) {
//     let index = this.#HashFunction(key) % this.tableSize
//     return this.array[index]
//   }
//   has(key) {
//     let index = this.#HashFunction(key) % this.tableSize
//     return this.array[index] !== 0
//   }
//   delete(key) {
//     let index = this.#HashFunction(key) % this.tableSize
//     const deletedValue = this.array[index]
//     this.array[index] = 0
//     return deletedValue
//   }
// }
//    const map = new HashMap(10);

//    map.set('foo', 1);
//    map.set(42, 10);
//    map.set(document, 100);

//    console.log(map.get(42));          // 10
//    console.log(map.has(document));    // true
//    console.log(map.delete(document)); // 10
//    console.log(map.has(document));    // false
//    ```
// # ДЗ к лекции База#7

// ## Почитать Лафоре и Плотникова

// * Про графы

// ## Задать и визулизировать граф с помощью SVG

// Реалзиовать задание графа с помощью матричных структур, а также через структуру смежности.
// Сделать несколько вариантов для орграфов и неорграфов. Визуализировать через SVG разметку как изображение.

// -----------------------------------------------

// realizare prin matrix

// class MatrixForGraph {
//   constructor(vertexAmount) {
//     this.vertexAmount = vertexAmount
//     this.matrix = []

//     for(let i=0; i<this.vertexAmount; i++) {
//       this.matrix.push(new Array(this.vertexAmount).fill(0))
//     }

//   }
//   addVertex() {
//     console.log("before add Vertex", this.print());
//     this.vertexAmount++
//     for(let i=0; i<this.vertexAmount; i++) {
//       this.matrix[i][this.vertexAmount-1] = 0

//       if(this.matrix[this.vertexAmount-1]?.[i]) {
//         this.matrix[this.vertexAmount-1][i] = 0

//       } else {
//         this.matrix.push(new Array(this.vertexAmount).fill(0))
//       }
//     }
//     console.log("after add Vertex", this.print());
//   }

//   addEdge(fromVertex, toVertex) {
//     this.matrix[fromVertex][toVertex] = 1
//     console.log("added Edge");
//   }
//   deleteEdge(fromVertex, toVertex) {
//     this.matrix[fromVertex][toVertex] = 0
//     console.log("deleted Edge");
//   }
//   hasEdge(fromVertex, toVertex) {
//     console.log(`has vertex ${fromVertex, toVertex}`, this.matrix[fromVertex][toVertex] !== 0);
//   }

//   print() {
//     for (let i = 0; i < this.vertexAmount; i++) {
//         let row = "";
//         for (let j = 0; j < this.vertexAmount; j++) {
//             row += this.matrix[i][j] + " ";
//         }
//         console.log(row);
//     }
// }
// }

// const myMatrix = new MatrixForGraph(3)

// myMatrix.addEdge(1,2,1)
// myMatrix.deleteEdge(1,2)
// myMatrix.hasEdge(1,2)

// myMatrix.addEdge(1,1)
// myMatrix.print()
// myMatrix.addVertex()
// myMatrix.print()

// -----------------------------------------------

// class Graph {
//   constructor(isDirected = false) {
//     this.graph = new Map();
//     this.isDirected = isDirected;
//   }

//   addVertex(vertexValue) {
//     if (!this.graph.has(vertexValue)) {
//       this.graph.set(vertexValue, []);
//     } else {
//       console.log("This node already exist in the graph!");
//     }
//   }

//   addEdge(vertex1, vertex2) {
//     const areNodesExisting = this.graph.has(vertex1) && this.graph.has(vertex2);

//     if (areNodesExisting) {
//       this.graph.get(vertex2).push(vertex1);
//       if (!this.isDirected) {
//         this.graph.get(vertex1).push(vertex2);
//       }
//     }
//   }

//   print() {
//     console.log(`Graph is ${this.isDirected ? "directed" : "undirected"}`);
//     for (let vertex of this.graph) {
//       console.log(
//         `Value ${vertex[0]} --> ${
//           vertex[1].length ? "Deps:" : "No deps"
//         } ${vertex[1].map((dep) => dep)}`
//       );
//     }
//   }

//   drawSVG() {
//     function drawCircle(x, y, radius, color, text) {
//       return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}">
//       </circle>
//       <text x="${x}" y="${y}" fill="black">
//       ${text}
//       </text>`;
//     }

//     function drawLine(x1, y1, x2, y2, color) {
//       return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" />`;
//     }
//     const svgElements = [];

//     for (let vertex of this.graph) {
//       const radius = 10;
//       // add vertex
//       svgElements.push(
//         drawCircle(
//           vertex[0] + radius,
//           vertex[0] + radius,
//           radius,
//           "orange",
//           vertex[0]
//         )
//       );

//       // add deps
//       if (vertex[1].length) {
//         svgElements.push(
//           vertex[1]
//             .map((dep) => {
//               const color = Math.random() > 0.5 ? "blue" : "red";
//               return `${drawLine(
//                 vertex[0] + radius,
//                 vertex[0] + radius,
//                 dep + radius,
//                 dep + radius,
//                 color
//               )}`;
//             })
//             .join("")
//         );
//       }
//     }
//     console.log(svgElements);
//     const svgContent = svgElements.join("");
//     const svgOutput = `<svg width="800" height="800">${svgContent}</svg>`;
//     console.log(svgOutput);
//     document.body.innerHTML = svgOutput;
//   }
// }

// const myGraph = new Graph(true);

// myGraph.addVertex(100);
// myGraph.addVertex(350);
// myGraph.addVertex(180);

// myGraph.addEdge(100, 180);
// myGraph.addEdge(350, 180);

// myGraph.print();
// myGraph.drawSVG();

// ## Создать класс для удобной работы с графом

// АПИ должно предоставлять функционал для проверки отношений, например, что А является родителем Б и т.д.
// АПИ должно позволять описать орграфы, неорграфы, так и смежные. А также добавлять весь ребрам.

// ### Дополнительно *

// Реализовать итераторы, которые делают обходы графа в глубину и ширину, а также метод топологической сортировки.

// ## Создать транзитивное замыкание на основе заданного графа

// Необходимо написать функцию или коструктор, который бы создавал транзитивное замыкание на основе заданного графа.
