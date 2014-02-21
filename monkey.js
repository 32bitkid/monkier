var monkey = (function() {
  var invokeHooks = function(list, context, arguments) {
    for(var i=0,l=list.length;i<l;i++) {
      list[i].apply(context, arguments);
    }
  }
  
  var handleFn = function wrap(fn, target) {
    var befores = [], afters = [], returnTarget = false, wrappedFn;
    wrappedFn = function wrapper() {
      invokeHooks(befores, this, arguments);
      var actualReturn = fn.apply(this, arguments);
      invokeHooks(afters, this, arguments);
      return actualReturn;
    };
    
    if(!target) {
      returnTarget = true;
      target = function() { return wrappedFn.apply(this, arguments) };
    }
    
    target.before = function(fn) { befores.push(fn); return target; };
    target.after = function(fn) { afters.push(fn); return target; };
    target.done = function() { return wrappedFn; };
    
    return returnTarget ? target : wrappedFn;
  }
  
  var handleObj = function(ctx, prop) {
    var helper = {};
    ctx[prop] = handleFn(ctx[prop], helper)
    return helper;    
  };
  
  
  return function monkeyPatch() {
    var fn, apply = Function.prototype.apply;
    
    // monkey(fn)
    if(arguments.length == 1 && arguments[0].apply == apply) {
      return handleFn.apply(this, arguments);
    }
    
    // monkey(object, property)
    if(arguments.length == 2 && arguments[0][arguments[1]].apply == apply) {
      return handleObj.apply(this, arguments);
    }
    
    throw "Invalid arguments";
  };
}());
