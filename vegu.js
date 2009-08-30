var vegu = (function() {
  var svgns = "http://www.w3.org/2000/svg",
      xlinkns = "http://www.w3.org/1999/xlink";

  function Manip(elem) {
    this.elem = elem;
  }

  Manip.createElem = function(type) {
    return document.createElementNS(svgns, type);
  };
  Manip.createFragment = function() {
    return document.createDocumentFragment(true);
  };

  Manip.prototype = {
    getAttrs: function(names) {
      var attrs = {},
        elem = this.elem;
      for (var i = 0, len = names.length; i < len; i++) {
        var name = names[i];
        attrs[name] = elem.getAttribute(name);
      }
      return elems;
    },
    setAttrs: function(attrs) {
      var elem = this.elem;
      for (var k in attrs)
        elem.setAttribute(k, attrs[k]);
      return this;
    },
    appendNewElem: function(type, setupFn) {
      var newElem = Manip.createElem(type);
      if (setupFn) {
        setupFn.apply(new Manip(newElem),
            Array.prototype.slice.call(arguments, 2));
      }
      this.elem.appendChild(newElem);
      return this;
    },
    appendNewFragment: function(setupFn) {
      var frag = Manip.createFragment();
      if (setupFn) {
        setupFn.apply(new Manip(frag),
            Array.prototype.slice.call(arguments, 1));
      }
      this.elem.appendChild(frag);
      return this;
    }
  };

  return {
    Manip: Manip
  };
})();
