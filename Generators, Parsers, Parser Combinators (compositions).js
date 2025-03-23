// # ДЗ к лекции База#17

// ## Пояснение

// ### Парсер

// Функция принимающая Iterable (в нашем случае Iterable строк) и предыдущее состояние (опционально).
// Возвращает такая функция генератор, элементами которого являются токены, а возвращаемым значением пара, где первым параметром
// идет результат парсинга, а вторым - Iterable для последующего парсинга. Если парсинг невозможен - парсер выбрасывает исключение.

// ```typescript
// interface ParserToken<T = unknown> {
//   type: string;
//   value?: T;
// }

// interface ParserValue<T = unknown> extends ParserToken<T> {

// }

// type ParserResult<T = unknown> = [ParserValue, Iterable<string>];

// type Parser<T = unknown, R = unknown> =
//   (iterable: Iterable<string>, prev?: ParserValue) =>
//     Generator<ParserToken<T>, ParserResult<R>, Iterable<string> | undefined>;
// ```

// ## Необходимо написать парсерный генератор tag

// Функция принимает строку и возвращает парсер, который считывает в заданному Iterable указанную строку.

// ```typescript

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

// const fnTag = tag("function")("function foo() {}");

// console.log(fnTag.next()); // {done: true, value: {type: 'TAG', value: 'function'}}
// ```

// ## Необходимо написать парсерный генератор take

// Функция принимает функцию или регулярное выражение и возвращает парсер, который считывает символы походящие под условие.
// Генератор должен настраиваться опциональными параметрами min и max для указания минимального и максимального количество считанных символов.

// ```typescript
const take = (check) =>
  function* (source, limits = {}) {
    limits.min ??= 0;
    limits.max ??= source.length;
    // const regex = new RegExp(check, check.flags + "g");

    let match;
    let acc = "";

    while ((match = check.exec(source)) !== null) {
      // console.log({ acc, match: match, source });
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

const takeNumber = take(/\d/)("1234 foo");

// console.log(takeNumber.next()); // {done: false, value: {type: 'TAKE', value: '1234'}}
// console.log(takeNumber.next()); // {done: true, value: undefined}

// const takeNumber2 = take(/\d/)("1234 foo 5678", { max: 2 });

// console.log(takeNumber2.next()); // {done: false, value: {type: 'TAKE', value: '12'}}
// console.log(takeNumber2.next()); // {done: false, value: {type: 'TAKE', value: '34'}}
// console.log(takeNumber2.next()); // {done: false, value: {type: 'TAKE', value: '56'}}
// console.log(takeNumber2.next()); // {done: false, value: {type: 'TAKE', value: '78'}}
// console.log(takeNumber2.next()); // {done: true, value: undefined}

// const takeNumber3 = take(/\d/)("1234 foo 5678");

// console.log(takeNumber3.next()); // {done: false, value: {type: 'TAKE', value: '1234'}}
// console.log(takeNumber3.next()); // {done: false, value: {type: 'TAKE', value: '5678'}}
// console.log(takeNumber3.next()); // {done: true, value: undefined}
// ```

// ## Необходимо написать парсерный комбинатор seq

// Функция принимает множество парсеров и возвращает новый, который последовательно считывает символы походящие под заданные парсеры.

// ```typescript

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

const fnExpr = seq(
  tag("function "),

  take(/[a-z_$]/i, { max: 1 }),
  take(/\w/, { min: 0 }),

  tag("()")
)("function foo() {}");

// console.log(fnExpr.next()); // {done: true, value: {type: 'SEQ', value: 'function foo()'}}

// const parser = seq(take(/\d/), tag(","))("100,200,300,");
// console.log(parser.next()); // {done: false, value: {type: 'SEQ', value: '100,'}}
// console.log(parser.next()); // {done: false, value: {type: 'SEQ', value: '200,'}}
// console.log(parser.next()); // {done: false, value: {type: 'SEQ', value: '300,'}}
// console.log(parser.next()); // {done: true, value: undefined}
// ```

// ## Необходимо написать парсерный комбинатор or

// Функция принимает множество парсеров и возвращает новый, который пытается применить первые иетратор, а если это невозможно, то пробует второй и т.д.

// ```typescript
const or = (...parsers) =>
  function* (source) {
    for (const parser of parsers) {
      const value = parser(source).next().value?.value;

      if (value) {
        return { type: "TAG", value };
      }
    }
  };

// const boolExpr = or(tag("true"), tag("false"))("false");

// console.log(boolExpr.next()); // {done: true, value: {type: 'TAG', value: 'false'}}
// ```

// ## Необходимо написать парсерный комбинатор repeat

// Функция принимает парсер и параметры min/max и возвращает новый, который применяет заданный итератор указанное количество раз.

// ```typescript
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

// const takeNumbers = repeat(seq(take(/\d/), tag(",")), { min: 1, max: 3 })(
//   "100,200,300,"
// );

// console.log(takeNumbers.next()); // {done: false, value: {type: 'SEQ', value: '100,'}}
// console.log(takeNumbers.next()); // {done: false, value: {type: 'SEQ', value: '200,'}}
// console.log(takeNumbers.next()); // {done: false, value: {type: 'SEQ', value: '300,'}}
// console.log(takeNumbers.next()); // {done: false, value: undefined}
// // ```

// ## Необходимо написать парсерный комбинатор opt

// Функция принимает парсер и возвращает новый, который применяет заданный итератор один раз или ноль (если применить парсер невозможно).

// ```typescript
const opt = (parser) =>
  function* (source) {
    yield parser(source).next().value;
  };

const takeNumbers = repeat(seq(take(/\d/), opt(tag(","))), { min: 1 })(
  "100,200,300"
);

console.log(takeNumbers.next()); // {done: false, value: {type: 'SEQ', value: '100,'}}
console.log(takeNumbers.next()); // {done: false, value: {type: 'SEQ', value: '200,'}}
console.log(takeNumbers.next()); // {done: false, value: {type: 'SEQ', value: '300'}}
// ```
