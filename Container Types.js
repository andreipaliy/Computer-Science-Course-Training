// # Homework: Container Type Result

// Implement a container type Result with two states: Ok and Err.
// This is similar to Rust's Result or functional programming Either.

class Result {
  #state;
  #result;
  constructor(fn) {
    try {
      this.#result = fn();
      this.#state = "Ok";
    } catch (error) {
      this.#state = "Err";
      this.#result = error;
    }
  }
  isOk() {
    return this.#state === "Ok";
  }
  getValue() {
    if (this.isOk()) return this.#result;
  }
  getError() {
    if (!this.isOk()) return this.#result;
  }
  then(cb) {
    if (this.#state === "Ok") cb(this.#result);
    return this;
  }
  catch(cb) {
    if (this.#state === "Err") cb(this.#result);
    return this;
  }
}

// --- Demo: Result usage ---
const res1 = new Result(() => 42);
res1.then(data => {
  console.log("Success:", data);
});

const res2 = new Result(() => {
  throw "Boom!";
});
res2
  .then(data => {
    // This callback will NOT be called
    console.log(data);
  })
  .catch(err => {
    // This will be called
    console.error("Error:", err);
  });

// --- Generator-based async/await emulation for Result ---
// This function executes a generator, handling Result containers like async/await
const exec = generator => {
  const iterator = generator();
  let next = iterator.next();
  while (!next.done) {
    const result = next.value;
    if (result.isOk()) next = iterator.next(result.getValue());
    else next = iterator.throw(result.getError());
  }
  return next.value;
};

exec(function* main() {
  // Works like await for Result
  const res1 = new Result(() => 42);
  console.log("Yielded value:", yield res1);
  try {
    const res2 = new Result(() => {
      throw "Boom!";
    });
    console.log("Yielded value:", yield res2);
  } catch (err) {
    console.error("Caught in generator:", err);
  }
});

// --- Explanation ---
// The idea: yield pauses the generator and returns a Result container.
// The exec function checks the Result state and resumes the generator with value or throws error.
// This emulates async/await error handling for any container type, not just Promises.
