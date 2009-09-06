Raphael.fn.notebook = function(x, y, width, height, slantDegrees) {
  var slantRadian = Math.PI * slantDegrees / 180;
  var tanSlant = Math.tan(slantRadian);
  var xOffset = height * tanSlant;
  var pageOffset = 3;
  var pathElems = [];
  pathElems.push(["M", x, y]);
  pathElems.push(["L", x + width, y]);
  pathElems.push(["L", x + width - xOffset, y + height]);
  pathElems.push(["L", x - xOffset, y + height]);
  pathElems.push("Z");

  for (var i = 0; i < 3; i++) {
    var offset = i * pageOffset;
    pathElems.push(["M", x + width + offset - pageOffset, y + offset]);
    pathElems.push(["L", x + width + offset, y + offset]);
    pathElems.push(["L", x + width - xOffset + offset, y + height + offset]);
    pathElems.push(["L", x - xOffset + offset, y + height + offset]);
    pathElems.push(["L", x - xOffset + offset + pageOffset * tanSlant, y + height + offset - pageOffset]);
  }

  var r = 5;
  var x0 = x + r;
  var y0 = y + 2 * r;
  var theta = slantRadian + Math.PI / 2;
  var rc = r * Math.cos(theta);
  var rs = r * Math.sin(theta);
  var xi = x0;
  var yi = y0;
  for (var i = 0, len = height / r - 3; i < len; i++) {
    pathElems.push(["M", xi, yi]);
    pathElems.push(["L", xi, yi]);
    pathElems.push(["A", r, r, 0, 1, 0, xi + rc - r, yi + rs]);
    xi -= r * tanSlant
    yi += r;
  }
  return this.path(pathElems);
};
