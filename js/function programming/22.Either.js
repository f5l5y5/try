// 需要定义两种类型
// 失败处理
class Left {
  static of(value) {
    return new Left(value);
  }

  constructor(value) {
    this._value = value;
  }
  // 嵌入错误消息
  map(fn) {
    return this;
  }
}

// 成功处理
class Right {
  static of(value) {
    return new Right(value);
  }

  constructor(value) {
    this._value = value;
  }

  map(fn) {
    return Right.of(fn(this._value));
  }
}

let r1 = Right.of(12).map((v) => v + 2);
let l1 = Left.of(12).map((v) => v + 2);

console.log(l1); // Left { _value: 12 }
console.log(r1); // Right { _value: 14 }

function parseJSON(str) {
  try {
    return Right.of(JSON.parse(str));
  } catch (err) {
    return Left.of({ err: err.message });
  }
}

console.log(parseJSON(`{"name":'jack'}`)); // Left { _value: { err: "Unexpected token ' in JSON at position 8" } }
console.log(parseJSON(`{"name":"jack"}`)); // Right { _value: { name: 'jack' } }
console.log(parseJSON(`{"name":"jack"}`).map((v) => v.name.toUpperCase())); // Right { _value: 'JACK' }
