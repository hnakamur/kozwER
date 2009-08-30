var minj = (function() {
  function def(target, src) {
    for (var k in src)
      target[k] = src[k];
    return target;
  }

  function configs(defaults, src) {
    var ret = {};
    for (var k in defaults)
      ret[k] = k in src ? src[k] : defaults[k];
    return ret;
  }

  function attrs(names, src) {
    var ret = {};
    for (var i = 0, len = names.length; i < len; i++) {
      var name = names[i];
      ret[name] = src[name];
    }
    return ret;
  }

  function forEach(array, fn) {
    var ret;
    for (var i = 0, len = array.length; i < len; i++)
      ret = fn(array[i], i, array);
    return ret;
  }

  function map(array, fn) {
    var ret = [];
    for (var i = 0, len = array.length; i < len; i++)
      ret.push(fn(array[i], i, array));
    return ret;
  }

  function bind(obj, fn) {
    return function() {
      return fn.apply(obj, arguments);
    }
  }

  return {
    def: def,
    configs: configs,
    attrs: attrs,
    forEach: forEach,
    map: map,
    bind: bind
  };
})();
