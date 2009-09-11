var svgdom = (function() {
  var svgns = "http://www.w3.org/2000/svg",
      xlinkns = "http://www.w3.org/1999/xlink",
      isOpera = navigator.userAgent.indexOf("Opera") >= 0 &&
          parseFloat(navigator.appVersion),
      isIE = (document.all && !isOpera) &&
          parseFloat(navigator.appVersion.split('MSIE ')[1]) || undefined;

  function createFragment() {
    // To create a DocumentFragment for use with SVG, you should call
    // document.createDocumentFragment(true). Note the extra true parameter --
    // this is required by SVG Web to help us know that this DocumentFragment
    // will be used with SVG, possibly going into our fake Flash backend.
    return document.createDocumentFragment(true);
  }

  function createElement(type) {
    return document.createElementNS(svgns, type);
  }

  function createTextNode(text) {
    // On Internet Explorer, DOM text nodes created through
    // document.createTextNode with the second argument given as 'true':
    //
    // document.createTextNode('some text', true)
    //
    // will have a .style property on them as an artifact of how we support
    // various things internally. Changing this will have no affect.
    // Technically DOM text nodes should not have a .style property.
    return isIE ? document.createTextNode(text, true)
                : document.createTextNode(text);
  }

  function setAttr(elem, attributes) {
    for (var k in attributes)
      elem.setAttribute(k, attributes[k]);
    return elem;
  }

  function setAttrNS(elem, ns, attributes) {
    for (var k in attributes)
      elem.setAttributeNS(ns, k, attributes[k]);
    return elem;
  }

  function getAttr(elem, names) {
    var ret = {};
    for (var i = 0, len = names.length; i < len; i++) {
      var name = names[i];
      ret[name] = elem.getAttribute(name);
    }
    return ret;
  }

  function getAttrNS(elem, ns, names) {
    var ret = {};
    for (var i = 0, len = names.length; i < len; i++) {
      var name = names[i];
      ret[name] = elem.getAttributeNS(ns, name);
    }
    return ret;
  }

  return {
    isOpera: isOpera,
    isIE: isIE,
    createFragment: createFragment,
    createElement: createElement,
    createTextNode: createTextNode,
    setAttr: setAttr,
    setAttrNS: setAttrNS,
    getAttr: getAttr,
    getAttrNS: getAttrNS
  };
})();
