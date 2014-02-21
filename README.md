monkier
=======

A utility/helper for monkey patching JavaScript functions.

## Overview

`monkier` is a small utility for fluently monkey patching a JavaScript function. 

## Examples

Monkey patching a function:

```js
var add = function(a,b) { return a + b; }

var newAdd = monkey(add)
  .before(function() { console.log("Going to add:", arguments); })
  .after(function() { console.log("Just added:", arguments); })
  .done();

newAdd(1, 2); // 3
```

> Note: Calling `done()` will return the *non-fluent* wrapped function. This can be valuable to isolate the `.before()` and `.after()` helpers from other scopes the function will be visible.

Monkey patching a property:

```js    
var math = {
  multiply: function(a,b) { return a * b; }
};

monkey(math, "multiply")
  .before(function() { console.log("Before multiplication:", arguments); })
  .after(function() { console.log("After multiplication:", arguments); })  

math.multiply(2,4); // 8
```

> Note: When overriding the property, there is no need to call `.done()` and the desired property will be automatically overridden.
