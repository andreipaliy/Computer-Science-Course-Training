// ## Implement the Monad interface for the Result type

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
  static Error(value) {
    return new Result(() => {
      throw value;
    });
  }
  static Ok(value) {
    return new Result(() => value);
  }
  flatMap(clasleyArrow) {
    if (this.#state === "Ok") {
      return clasleyArrow(this.#result); // clasleyArrow gets an atomic (unwrapper value) & returns a container type
    }

    return this;
  }
  map(cb) {
    // callback in functor's interface map gets as input and returns simple unwrapper value
    if (this.#state === "Ok") {
      const result = cb(this.#result); // functor's map is responsible for unwrapping the container and passing the value to callback
      return new Result(() => result); // but also for wrappinf cb's result
    }

    return this;
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
const res = new Result(() => 42);

res
  .flatMap(value => Result.Error("Boom")) // executed, changes state to error
  .then(value => console.log("Not called")) // this is skipped because in Error state
  .catch(console.error); // Boom

const res1 = new Result(() => {
  throw "Initial Error";
});

res1
  .flatMap(value => Result.Error("Boom")) // this is skipped because already in Error state (with another error)
  .then(value => console.log("Not called")) // this is skipped because in Error state
  .catch(console.error); // Initial Error

const res2 = new Result(() => 42);

res2
  .flatMap(value => Result.Ok(42)) // executed, no error
  .then(value => console.log("Called")) // executed
  .catch(value => console.error); //  not executed

// ## Implement the Functor interface for the Result type

// const res = new Result(() => 42);

// res.map((value) => value * 10).then(console.log); //420

// ## Implement the Functor interface for the Function type
Function.prototype.map = function (cb) {
  return () => this(cb());
};
console.log((v => v * 10).map(() => 42)()); // 420

// NOTE: Function.prototype from which every function is inheriting is also a Container Type
// ```
