// 传递null 和 undefined
class MayBe {
  static of(value) {
    return new MayBe(value);
  }

  constructor(value) {
    this._value = value;
  }

  map(fn) {
    return this.isNothing()
      ? MayBe.of(null)
      : MayBe.of(fn(this._value));
  }

  isNothing() {
    return (
      this._value === null || this._value === undefined
    );
  }
}

const r = MayBe.of("hello world").map((v) =>
  v.toUpperCase()
);
console.log(r);
const r1 = MayBe.of(null).map((v) => v.toUpperCase());
console.log(r1);
const r2 = MayBe.of("hello world")
  .map((v) => v.toUpperCase())
  .map((v) => null)
  .map((v) => v.split(" "));
console.log(r2);
// 哪一次出现空值是不清楚的