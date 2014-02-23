(function() {
  // Baseline setup
  // --------------
  
  // Establish the root object
  var root = this;
  
  // Create the `monkey()` function.
  //
  // `monkey()` can be invoked in one of two ways. 
  // The first is to monkey-patch a function, and the other is to override a 
  // method of an object.
  //
  // To override a function, simply pass it to `monkey`:
  
  //     var fn = function() { /* do work */ };
  //     var monkeyFn = monkey(fn);
  
  // Then you can use hook functions like `.before()` and `.after()`
  // to add callbacks when the function is invoked. For example:
  
  //     monkeyFn.before(function() { /* do some logging */ });
  //     monkeyFn.after(function() { /* do some clean-up */ });
  
  // When you are finished adding hooks, then you can get a reference to 
  // the wrapped function without the hook helpers functions.
  
  //     var newFn = monkeyFn.done();
  
  // `monkey()` also supports a fluent interface, so you could write monkey
  // patch above as the following:
  
  //     var newFn = monkey(fn)
  //       .before(function() { /* logging */ })
  //       .after(function() { /* clean-up */ })
  //       .done();
  
  // `monkey()` can also be used to override object methods. For example:
  
  //     var obj = { fn: function() { /* work */ } };
  //     moneky(obj, "fn")
  //       .before(function() { /* logging */ })
  //       .after(function() { /* clean-up */ });
  
  // Be aware that when overriding a method then you do call `done()` to 
  // unwrap the generated function. You also not need to reassign the
  // generated function to the object, this is done automatically.
  
  var monkey = function monkey() {
    
    var fn,
        // Quick reference to apply
        apply = Function.prototype.apply;
    
    // Function override: `monkey(fn)`
    // 
    // Verify that the argument is actually a function before
    // trying to override it.
    if(arguments.length == 1 && arguments[0].apply == apply) {
      return handleFn.apply(this, arguments);
    }
    
    // Method override: `monkey(object, property)`
    // 
    // Make sure that the object exists and that the specified 
    // property is a function before trying to override it.
    if(arguments.length == 2 && arguments[0] && arguments[0][arguments[1]] && arguments[0][arguments[1]].apply == apply) {
      return handleObj.apply(this, arguments);
    }
    
    throw new TypeError("Invalid arguments");
  };
  
  // Export `monkey`.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = monkey;
    }
    exports.monkey = monkey;
  } else {
    root.monkey = monkey;
  }
  
  // Quick Reference to `reduce()`. If the browser does not provide a native
  // implementation then use a [reduce polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Polyfill)
  var reduce = Array.prototype.reduce || function(callback, opt_initialValue){
    'use strict';
    if (null === this || 'undefined' === typeof this) {
      throw new TypeError('Array.prototype.reduce called on null or undefined');
    }
    if ('function' !== typeof callback) {
      throw new TypeError(callback + ' is not a function');
    }
    var index, value, length = this.length >>> 0, isValueSet = false;
    if (1 < arguments.length) {
      value = opt_initialValue;
      isValueSet = true;
    }
    for (index = 0; length > index; ++index) {
      if (this.hasOwnProperty(index)) {
        if (isValueSet) {
          value = callback(value, this[index], index, this);
        }
        else {
          value = this[index];
          isValueSet = true;
        }
      }
    }
    if (!isValueSet) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    return value;
  };

  // Loop through a list of hooks, and invoke each one with the same `context` and `arguments.
  var invokeHooks = function(list, context, arguments) {
    for(var i=0,l=list.length;i<l;i++) {
      list[i].apply(context, arguments);
    }
  }
  
  // Handle wrapping a function for monkey patching.
  var handleFn = function wrap(fn, target) {
    
    var // The list of registered before hooks
        befores = [],
        // The list of registered after hooks
        afters = [],
        // The list of registered transformation hooks
        trs = [],
        
        // Should this function return the `target` object or the wrapped function.
        returnTarget = false,
        wrappedFn;
    
    // Define the wrapped function
    wrappedFn = function wrapper() {
      // Invoke all the before hooks
      invokeHooks(befores, this, arguments);
      // Invoke the *actual* function and hold onto its return value
      var actualReturn = fn.apply(this, arguments);
      // Invoke all the after hooks 
      invokeHooks(afters, this, arguments);
      
      // Use `reduce` to apply all the transformations to the actual return value
      return reduce.call(trs, function(val,fn) { return fn(val); }, actualReturn);
    };
    
    // If no target was specified
    if(!target) {
      // Then return the generated target object
      returnTarget = true;
      
      // Create a wrapper of the wrapper. This is used to hold 
      // the hook helpers when overriding an anonymous function.
      target = function monkeyWrapper() { return wrappedFn.apply(this, arguments) };
    }
    
    // Add a before hook
    target.before = function(fn) { befores.push(fn); return target; };
    // Add an after hook
    target.after = function(fn) { afters.push(fn); return target; };
    // Add a transform
    target.tr = function(fn) { trs.push(fn); return target; };
    // Return the *actual* generated function.
    target.done = function() { return wrappedFn; };
    
    return returnTarget ? target : wrappedFn;
  }
  
  // Handle wrapping an method of an object. This will automatically override 
  // the specified implementation.
  var handleObj = function(ctx, prop) {
    // Create a helper for hook helpers to be applied to.
    var helper = {};
    // Create a wrapper function and apply it back over the original function.
    ctx[prop] = handleFn(ctx[prop], helper);
    // Return the helper.
    return helper;
  };

}).call(this);
