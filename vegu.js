var vegu = (function() {
  var svgns = "http://www.w3.org/2000/svg",
      xlinkns = "http://www.w3.org/1999/xlink";

  function Manip(elem) {
    this.elem = elem;
  }

  Manip.buildElement = function(type, setupFn) {
    var elem = document.createElementNS(svgns, type);
    if (setupFn) {
      setupFn.apply(new Manip(elem),
          Array.prototype.slice.call(arguments, 2));
    }
    return elem;
  };
  Manip.buildFragment = function(setupFn) {
    var frag = document.createDocumentFragment(true);
    if (setupFn) {
      setupFn.apply(new Manip(frag),
          Array.prototype.slice.call(arguments, 1));
    }
    return frag;
  };

  Manip.prototype = {
    appendNewFragment: function(setupFn) {
      this.elem.appendChild(
          Manip.buildFragment.apply(undefined, arguments));
      return this;
    },
    appendNewElement: function(type, setupFn) {
      this.elem.appendChild(
          Manip.buildElement.apply(undefined, arguments));
      return this;
    },
    setAttrs: function(attrs) {
      var elem = this.elem;
      for (var k in attrs)
        elem.setAttribute(k, attrs[k]);
      return this;
    },
    getAttrs: function(names) {
      var attrs = {},
        elem = this.elem;
      for (var i = 0, len = names.length; i < len; i++) {
        var name = names[i];
        attrs[name] = elem.getAttribute(name);
      }
      return elems;
    }
  };

  return {
    Manip: Manip
  };
})();
