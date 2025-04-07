// 1. listener as async iterator
// const clickableBox = document.getElementById("clickable");

// const on = (element, eventType) => {
//   const handlers = new Set();

//   const eventBuffer = []; // stores clicks (i.e. synchronous ones) before .next() is called

//   element.addEventListener(eventType, (event) => {
//     eventBuffer.push(event);

//     handlers.forEach((handler) => {
//       handler(eventBuffer.shift());
//     });
//     handlers.clear();
//   });

//   return {
//     [Symbol.asyncIterator]() {
//       return this;
//     },
//     next() {
//       if (eventBuffer.length > 0) {
//         return Promise.resolve({ value: eventBuffer.shift(), done: false });
//       } else {
//         return new Promise((resolve) => {
//           handlers.add((event) => resolve({ value: event, done: false }));
//         });
//       }
//     },
//   };
// };

// (async () => {
//   for await (const clickEvent of on(clickableBox, "click")) {
//     console.log("Click: ", clickEvent);
//   }
// })();

// clickableBox.dispatchEvent(new Event("click"));
// clickableBox.dispatchEvent(new Event("click"));
// clickableBox.dispatchEvent(new Event("click"));
// clickableBox.dispatchEvent(new Event("click"));

// 2. DnD on async iterators

const on = (element, eventType) => {
  let resolver = () => {};

  element.addEventListener(eventType, (event) => {
    return resolver(event);
  });

  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      return new Promise((resolve) => {
        resolver = (event) => resolve({ value: event, done: false });
      });
    },
  };
};

const once = (element, eventType) => {
  let resolver;

  element.addEventListener(eventType, (event) => {
    return resolver(event);
  });

  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      return new Promise((resolve) => {
        resolver = (event) => resolve({ value: event, done: true });
      });
    },
  };
};

const any = (...asyncIterators) => {
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      return new Promise(async (resolve) => {
        const event = await Promise.race(
          asyncIterators.map((asyncIterator) => asyncIterator.next())
        );

        resolve({ value: event, done: false });
      });
    },
  };
};

const every = (asyncIterator, predicat) => {
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      return new Promise(async (resolve) => {
        const event = await asyncIterator.next();
        if (predicat(event.value.value)) {
          resolve({ value: event.value.value, done: false });
        } else {
          resolve({ value: event.value.value, done: true });
        }
      });
    },
  };
};

const onlyEvent = (eventType) => (event) => eventType === event.type;

const seq = (...asyncIterators) => {
  let counter = 0;
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      return new Promise(async (resolve) => {
        const event = await asyncIterators[counter].next();

        if (event.done) {
          counter++;

          return resolve({
            value: event.value,
            done: counter >= asyncIterators.length,
          });
        } else {
          return resolve({ value: event.value, done: false });
        }
      });
    },
  };
};

const filter = (asyncIterator, predicat) => {
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      return new Promise(async (resolve) => {
        let event = await asyncIterator.next();

        while (!predicat(event.value) && !event.done) {
          event = await asyncIterator.next();
        }

        return resolve({ value: event.value, done: event.done });
      });
    },
  };
};

const repeat = (fn) => {
  let iterator = fn()[Symbol.asyncIterator]();

  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    async next() {
      const result = await iterator.next();

      if (result.done) {
        iterator = fn()[Symbol.asyncIterator]();
      }

      return { value: result.value, done: false };
    },
  };
};

const forEach = async (asyncIterator, fn) => {
  for await (const event of asyncIterator) {
    fn(event);
  }
};

const draggableBox = document.getElementById("draggable");

// First variant: using async/await
// (async () => {
//   for await (const mouseMoveEvent of filter(
//     seq(
//       once(draggableBox, "mousedown"),
//       every(
//         any(on(document.body, "mousemove"), on(draggableBox, "mouseup")),
//         onlyEvent("mousemove")
//       )
//     ),
//     onlyEvent("mousemove")
//   )) {
//     draggableBox.style.left = `${mouseMoveEvent.clientX - 50}px`;
//     draggableBox.style.top = `${mouseMoveEvent.clientY - 50}px`;
//   }
// })();

// Second variant: using forEach
const dnd = repeat(() =>
  filter(
    seq(
      once(draggableBox, "mousedown"),
      every(
        any(on(document.body, "mousemove"), on(draggableBox, "mouseup")),
        onlyEvent("mousemove")
      )
    ),
    onlyEvent("mousemove")
  )
);

forEach(dnd, (mouseMoveEvent) => {
  draggableBox.style.left = `${mouseMoveEvent.clientX - 50}px`;
  draggableBox.style.top = `${mouseMoveEvent.clientY - 50}px`;
});
