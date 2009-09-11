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

  function setAttr(elem, attributes) {
    for (var k in attributes)
      elem.setAttribute(k, attributes[k]);
    return elem;
  }

  function attr(elem, names) {
    var ret = {};
    for (var i = 0, len = names.length; i < len; i++) {
      var name = names[i];
      ret[name] = elem.getAttribute(name);
    }
    return ret;
  }

  return {
    createFragment: createFragment,
    createElement: createElement,
    createText: createText,
    setAttr: setAttr,
    attr: attr
  };
})();
