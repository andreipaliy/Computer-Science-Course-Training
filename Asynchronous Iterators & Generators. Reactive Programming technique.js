// --- 1. Listener as async iterator ---
// This demonstrates how to turn DOM events into async iterators for reactive programming.
const clickableBox = document.getElementById("clickable");

const onAsync = (element, eventType) => {
  const handlers = new Set();
  const eventBuffer = []; // stores events before .next() is called

  element.addEventListener(eventType, event => {
    eventBuffer.push(event);
    handlers.forEach(handler => {
      handler(eventBuffer.shift());
    });
    handlers.clear();
  });

  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      if (eventBuffer.length > 0) {
        return Promise.resolve({ value: eventBuffer.shift(), done: false });
      } else {
        return new Promise(resolve => {
          handlers.add(event => resolve({ value: event, done: false }));
        });
      }
    },
  };
};

(async () => {
  for await (const clickEvent of onAsync(clickableBox, "click")) {
    console.log("Click: ", clickEvent);
  }
})();

// Simulate clicks for demo purposes
clickableBox.dispatchEvent(new Event("click"));
clickableBox.dispatchEvent(new Event("click"));
clickableBox.dispatchEvent(new Event("click"));
clickableBox.dispatchEvent(new Event("click"));

// --- 2. Drag & Drop using async iterators ---

// Converts DOM events to async iterator (single event type)
const on = (element, eventType) => {
  let resolver = () => {};
  element.addEventListener(eventType, event => resolver(event));
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      return new Promise(resolve => {
        resolver = event => resolve({ value: event, done: false });
      });
    },
  };
};

// Async iterator for a single event occurrence
const once = (element, eventType) => {
  let resolver;
  element.addEventListener(eventType, event => resolver(event));
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      return new Promise(resolve => {
        resolver = event => resolve({ value: event, done: true });
      });
    },
  };
};

// Returns an async iterator that yields from whichever input yields first
const any = (...asyncIterators) => ({
  [Symbol.asyncIterator]() {
    return this;
  },
  next() {
    return new Promise(async resolve => {
      const event = await Promise.race(
        asyncIterators.map(asyncIterator => asyncIterator.next())
      );
      resolve({ value: event, done: false });
    });
  },
});

// Yields only if predicate matches, otherwise marks as done
const every = (asyncIterator, predicate) => ({
  [Symbol.asyncIterator]() {
    return this;
  },
  next() {
    return new Promise(async resolve => {
      const event = await asyncIterator.next();
      if (predicate(event.value.value)) {
        resolve({ value: event.value.value, done: false });
      } else {
        resolve({ value: event.value.value, done: true });
      }
    });
  },
});

// Predicate: only allow events of a certain type
const onlyEvent = eventType => event => eventType === event.type;

// Sequence: runs async iterators in order
const seq = (...asyncIterators) => {
  let counter = 0;
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      return new Promise(async resolve => {
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

// Filters events by predicate
const filter = (asyncIterator, predicate) => ({
  [Symbol.asyncIterator]() {
    return this;
  },
  next() {
    return new Promise(async resolve => {
      let event = await asyncIterator.next();
      while (!predicate(event.value) && !event.done) {
        event = await asyncIterator.next();
      }
      return resolve({ value: event.value, done: event.done });
    });
  },
});

// Repeat: restarts the iterator when done
const repeat = fn => {
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

// forEach: applies fn to each event from async iterator
const forEach = async (asyncIterator, fn) => {
  for await (const event of asyncIterator) {
    fn(event);
  }
};

const draggableBox = document.getElementById("draggable");

// --- Drag & Drop: Variant 1 (async/await) ---
(async () => {
  for await (const mouseMoveEvent of filter(
    seq(
      once(draggableBox, "mousedown"),
      every(
        any(on(document.body, "mousemove"), on(draggableBox, "mouseup")),
        onlyEvent("mousemove")
      )
    ),
    onlyEvent("mousemove")
  )) {
    draggableBox.style.left = `${mouseMoveEvent.clientX - 50}px`;
    draggableBox.style.top = `${mouseMoveEvent.clientY - 50}px`;
  }
})();

// --- Drag & Drop: Variant 2 (forEach) ---
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

forEach(dnd, mouseMoveEvent => {
  draggableBox.style.left = `${mouseMoveEvent.clientX - 50}px`;
  draggableBox.style.top = `${mouseMoveEvent.clientY - 50}px`;
});
