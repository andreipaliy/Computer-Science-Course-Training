// # Parser Combinators & Generators

// --- Explanation ---
// A parser is a function that takes an Iterable (usually a string) and optional previous state.
// It returns a generator whose elements are tokens, and whose return value is a tuple:
// [parse result, remaining Iterable]. If parsing fails, the parser throws.

// Example TypeScript interfaces:
// interface ParserToken<T = unknown> { type: string; value?: T; }
// type ParserResult<T = unknown> = [ParserToken, Iterable<string>];
// type Parser = (iterable: Iterable<string>, prev?) => Generator<ParserToken, ParserResult, Iterable<string> | undefined>;

// --- Parser generator: tag ---
// Returns a parser that matches a given string in the source Iterable.
function tag(target) {
  return function* (source) {
    let acc = "";
    let result;
    for (const subString of source) {
      acc += subString;
      if (acc.length > target.length) {
        acc = acc.slice(1);
      }
      if (acc === target) {
        acc = "";
        if (result) {
          yield result;
        }
        result = { type: "TAG", value: target };
      }
    }
    return result;
  };
}
// Example:
// const fnTag = tag("function")("function foo() {}");
// console.log(fnTag.next()); // {done: true, value: {type: 'TAG', value: 'function'}}

// --- Parser generator: take ---
// Returns a parser that matches characters by regex or function, with optional min/max limits.
const take = check =>
  function* (source, limits = {}) {
    limits.min ??= 0;
    limits.max ??= source.length;
    let match;
    let acc = "";
    while ((match = check.exec(source)) !== null) {
      if (match.index !== 0 && acc !== "") {
        yield { type: "TAKE", value: acc };
        acc = "";
      }
      acc += match[0];
      source = source.slice(match.index + 1);
      if (acc.length >= limits.max) {
        yield { type: "TAKE", value: acc };
        acc = "";
      }
    }
    yield acc ? { type: "TAKE", value: acc } : undefined;
  };
// Example:
// const takeNumber = take(/\d/)("1234 foo");
// console.log(takeNumber.next()); // {done: false, value: {type: 'TAKE', value: '1234'}}

// --- Parser combinator: seq ---
// Returns a parser that applies multiple parsers in sequence.
const seq = (...parsers) =>
  function* (source) {
    let result = "";
    for (const parser of parsers) {
      const parserResult = parser(source).next().value?.value;
      if (parserResult) {
        source = source.slice(parserResult.length);
        result += parserResult;
      }
    }
    yield { type: "SEQ", value: result || undefined };
  };
// Example:
// const fnExpr = seq(tag("function "), take(/[a-z_$]/i, { max: 1 }), take(/\w/, { min: 0 }), tag("()"))("function foo() {}");
// console.log(fnExpr.next()); // {done: true, value: {type: 'SEQ', value: 'function foo()'}}

// --- Parser combinator: or ---
// Returns a parser that tries each parser in order, returning the first successful result.
const or = (...parsers) =>
  function* (source) {
    for (const parser of parsers) {
      const value = parser(source).next().value?.value;
      if (value) {
        return { type: "TAG", value };
      }
    }
  };
// Example:
// const boolExpr = or(tag("true"), tag("false"))("false");
// console.log(boolExpr.next()); // {done: true, value: {type: 'TAG', value: 'false'}}

// --- Parser combinator: repeat ---
// Returns a parser that applies the given parser min/max times.
const repeat = (parser, limits) =>
  function* (source) {
    limits.min ??= 0;
    limits.max ??= source.length;
    let callsCounter = 0;
    while (true) {
      if (limits.max <= callsCounter) return;
      const result = parser(source).next(source);
      source = source.slice(result.value.value.length);
      callsCounter++;
      yield result.value;
    }
  };
// Example:
// const takeNumbers = repeat(seq(take(/\d/), tag(",")), { min: 1, max: 3 })("100,200,300,");
// console.log(takeNumbers.next()); // {done: false, value: {type: 'SEQ', value: '100,'}}

// --- Parser combinator: opt ---
// Returns a parser that applies the given parser once or zero times.
const opt = parser =>
  function* (source) {
    yield parser(source).next().value;
  };
// Example:
const takeNumbers = repeat(seq(take(/\d/), opt(tag(","))), { min: 1 })(
  "100,200,300"
);
console.log(takeNumbers.next()); // {done: false, value: {type: 'SEQ', value: '100,'}}
console.log(takeNumbers.next()); // {done: false, value: {type: 'SEQ', value: '200,'}}
console.log(takeNumbers.next()); // {done: false, value: {type: 'SEQ', value: '300'}}
