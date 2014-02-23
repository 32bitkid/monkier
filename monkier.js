(function() {
  
  var root = this;
  
  var monkey = function monkey() {
    var fn, apply = Function.prototype.apply;
    
    // monkey(fn)
    if(arguments.length == 1 && arguments[0].apply == apply) {
      return handleFn.apply(this, arguments);
    }
    
    // monkey(object, property)
    if(arguments.length == 2 && arguments[0][arguments[1]].apply == apply) {
      return handleObj.apply(this, arguments);
    }
    
    throw new TypeError("Invalid arguments");
  };
  
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = monkey;
    }
    exports.monkey = monkey;
  } else {
    root.monkey = monkey;
  }
  
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Polyfill
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

  var invokeHooks = function(list, context, arguments) {
    for(var i=0,l=list.length;i<l;i++) {
      list[i].apply(context, arguments);
    }
  }
  
  var handleFn = function wrap(fn, target) {
    var befores = [], afters = [], trs = [], returnTarget = false, wrappedFn;
    wrappedFn = function wrapper() {
      invokeHooks(befores, this, arguments);
      var actualReturn = fn.apply(this, arguments);
      invokeHooks(afters, this, arguments);
      return reduce.call(trs, function(val,fn) { return fn(val); }, actualReturn);
    };
    
    if(!target) {
      returnTarget = true;
      target = function() { return wrappedFn.apply(this, arguments) };
    }
    
    target.before = function(fn) { befores.push(fn); return target; };
    target.after = function(fn) { afters.push(fn); return target; };
    target.tr = function(fn) { trs.push(fn); return target; };
    target.done = function() { return wrappedFn; };
    
    return returnTarget ? target : wrappedFn;
  }
  
  var handleObj = function(ctx, prop) {
    var helper = {};
    ctx[prop] = handleFn(ctx[prop], helper)
    return helper;    
  };

}).call(this);
