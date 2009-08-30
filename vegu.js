var vegu = (function() {
  var svgns = "http://www.w3.org/2000/svg",
      xlinkns = "http://www.w3.org/1999/xlink";

  function Manip(elem) {
    if (!(this instanceof Manip))
      return new Manip(elem);

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
      var newElem = Manip.createElem(type),
        args = Array.prototype.slice.call(arguments, 2);
      if (setupFn)
        setupFn.apply(this, [newElem].concat(args));
      this.elem.appendChild(newElem);
      return this;
    },
    appendNewFragment: function(setupFn) {
      var frag = Manip.createFragment(),
        args = Array.prototype.slice.call(arguments, 1);
      if (setupFn)
        setupFn.apply(this, [frag].concat(args));
      this.elem.appendChild(frag);
      return this;
    }
  };

  return {
    Manip: Manip
  };
})();
