var vegu = (function() {
  var svgns = "http://www.w3.org/2000/svg",
      xlinkns = "http://www.w3.org/1999/xlink",
      doc = document;

  function createFragment() {
    return doc.createDocumentFragment(true);
  }

  function createElement(type) {
    return doc.createElementNS(svgns, type);
  }

  function createText(text) {
    var elem = createElement('text');
    elem.appendChild(doc.createTextNode(text));
    return elem;
  }

  function setAttrs(elem, attrs) {
    for (var k in attrs)
      elem.setAttribute(k, attrs[k]);
  }

  function getAttrs(names) {
    var attrs = {};
    for (var i = 0, len = names.length; i < len; i++) {
      var name = names[i];
      attrs[name] = elem.getAttribute(name);
    }
    return attrs;
  }

  return {
    createFragment: createFragment,
    createElement: createElement,
    createText: createText,
    setAttrs: setAttrs,
    getAttrs: getAttrs
  };
})();
