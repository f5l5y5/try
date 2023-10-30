import fs from "node:fs";
import { promisify } from "node:util";

(async () => {
  const readText = () => {
    fs.readFile("test.txt", function (err, data) {
      if (!err) {
        console.log("callback", data.toString());
      } else {
        console.log(err);
      }
    });
  };
  readText();
  const promiseRead = () => {
    return new Promise((resolve, reject) => {
      fs.readFile("test.txt", function (err, data) {
        if (!err) {
          resolve(data.toString());
        } else {
          reject(err);
        }
      });
    });
  };

  const pr = await promiseRead();
  console.log("=======================================");
  console.log("promise", pr);
  console.log("=======================================");

  const fn = promisify(fs.readFile);
  const psRes = await fn("test.txt");
  console.log("promisify", psRes.toString());

  console.log("=======================================");

  const selfPromisify = (original) => {
    return (...args) => {
      return new Promise((resolve, reject) => {
        args.push((err, ...values) => {
          if (err) {
            return reject(err);
          }
          resolve(values);
        });
        Reflect.apply(original, this, args);
      });
    };
  };

  const selfFn = promisify(fs.readFile);
  const res = await selfFn("test.txt");
  console.log("selfPromisify", res.toString());
})();
