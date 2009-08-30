var Geom2d = (function() {
  var rect = {
    inset: function(rect, offset) {
      return {x: rect.x + offset, y: rect.y + offset,
        width: rect.width - 2 * offset, height: rect.height - 2 * offset};
    }
  };

  return {
    rect: rect
  };
})();
