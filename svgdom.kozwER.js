svgdom.mixin(svgdom.Element.prototype, (function() {
  var mixin = svgdom.mixin,
      filterOut = svgdom.filterOut,
      geom = svgdom.geom,
      rad2deg = geom.rad2deg,
      deg2rad = geom.deg2rad;

  function relationLine(end1, end2, options) {
    var config = mixin({}, relationLine.defaults, options);
    var end1 = this.relationEnd(end1.x, end1.y, end1.angle, end1.cardinarity,
        options.end1);
    var end2 = this.relationEnd(end2.x, end2.y, end2.angle, end2.cardinarity,
        options.end2);
    var p1, p2;

    function endStartPoint(x, y, angle, length) {
      var rad = M.geom.deg2rad(angle);
      return {
        x: x - length * Math.cos(rad),
        y: y - length * Math.sin(rad)
      };
    }

    if (end1.y < end2.y) {
      p1 = endStartPoint(end1.x, end1.y, end1.angle);
      p2 = endStartPoint(end2.x, end2.y, end2.angle);
    }
    else {
      p1 = endStartPoint(end2.x, end2.y, end2.angle);
      p2 = endStartPoint(end1.x, end1.y, end1.angle);
    }

  }
  relationLine.defaults = {
    'class': 'relationLine',
    stroke: '#000',
    fill: 'none'
  };

  function relationEnd(x, y, angle, cardinality, options) {
    var config = mixin({}, relationEnd.defaults, options);
    var h = config.relationEndLength;
    var w = h * config.relationEndWidthRatio;
    var transform = this.rotateThenTranslateTransform(x, y, angle);
    var elem;
    switch (cardinality) {
    case 'one':
      var x2 = h * config.oneConnectorEndPosRatio;
      elem = this.path({
        'class': 'relationEnd one',
        stroke: '#000',
        fill: 'none',
        d: this.formatPath([
          ['M', 0, 0],
          ['L', -h, 0],
          ['M', -x2, -w / 2],
          ['L', -x2, w / 2]
        ]),
        transform: transform
      });
      break;
    case 'many':
      var r = w / 2;
      elem = this.path({
        'class': 'relationEnd many',
        stroke: '#000',
        fill: 'none',
        d: this.formatPath([
          ['M', 0, 0],
          ['L', -h, 0],
          ['M', 0, -r],
          ['L', -h + r, -r],
          ['A', r, r, 0, 0, 0, -h + r, r],
          ['L', 0, r]
        ]),
        transform: transform
      });
      break;
    case 'ref':
      var dotCount = 3;
      var dotLen = h / (2 * dotCount - 1);
      var pathElems = [];
      for (var i = 0; i < dotCount; i++) {
        pathElems.push(['M', -dotLen * 2 * i, 0]);
        pathElems.push(['L', -dotLen * (2 * i + 1), 0]);
      }
      elem = this.path({
        'class': 'relationEnd ref',
        stroke: '#000',
        fill: 'none',
        d: this.formatPath(pathElems),
        transform: transform
      });
      break;
    case 'inherit':
      var x2 = h * config.oneConnectorEndPosRatio;
      var r = h * config.inheritConnectorEndRadiusRatio;
      elem = this.g({
        'class': 'relationEnd inherit',
        transform: transform
      }).append(
        this.path({
          stroke: '#000',
          fill: 'none',
          d: this.formatPath([
            ['M', 0, 0],
            ['L', -h, 0],
            ['M', -x2, -w / 2],
            ['L', -x2, w / 2]
          ])
        }),
        this.circle({
          cx: -h, cy: 0, r: r, fill: '#000'
        })
      );
      break;
    }
    return elem;
  }
  relationEnd.defaults = {
    'class': 'relationEnd',
    stroke: '#000',
    fill: 'none',
    relationEndLength: 10,
    relationEndWidthRatio: 0.6,
    oneConnectorEndPosRatio: 0.4,
    inheritConnectorEndRadiusRatio: 0.25
  };

  return {
    relationLine: relationLine,
    relationEnd: relationEnd
  };
})());
