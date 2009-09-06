Raphael.fn.ellipseStar = function(x, y, rx, ry, rOffset, n) {
  var pathElems = [];
  pathElems.push(["M", x + rx, y]);
  for (var i = 1; i < 2 * n; i++) {
    var theta = 2 * Math.PI * i / (2 * n);
    var rxi, ryi;
    if (i % 2 == 0) {
      rxi = rx;
      ryi = ry;
    }
    else {
      rxi = rx - rOffset;
      ryi = ry - rOffset;
    }
    pathElems.push(
      ["L", x + rxi * Math.cos(theta), y + ryi * Math.sin(theta)]);
  }
  pathElems.push("Z");
  return this.path(pathElems);
};
