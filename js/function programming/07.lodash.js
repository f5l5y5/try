const _ = require("lodash")

const array = ['jack', 'tom', 'lucy', 'kate']

console.log(_.first(array),_.head(array));
console.log(_.last(array));
console.log(_.toUpper(_.first(array)));
console.log(_.reverse(array));


const r = _.each(array, (item, index) => {
	console.log(item,index);
})

console.log(r);


console.log(_.includes(array,"jack"));
console.log(_.find(array,name=>name==="kate"));
console.log(_.findIndex(array,name=>name==="lucy"));