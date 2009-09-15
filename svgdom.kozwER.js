svgdom.mixin(svgdom, (function(M) {
  function curve(pathElements, options) {
    var config = M.mixin({}, curve.defaults, options);
    var arrowsOptions = config && config.arrows;
        arrowAtStart = arrowsOptions && arrowsOptions.start,
        arrowAtEnd = arrowsOptions && arrowsOptions.end,
        ret = path = M.path(M.mixin({
          d: M.formatPath(pathElements)
        }, M.filterOut(config, 'arrows')));

    if (arrowAtStart || arrowAtEnd) {
      ret = M.g();
      ret.append(path);
      if (path.getTangentToPathAt) {
        if (arrowAtStart) {
          var t0 = path.getTangentToPathAt(0);
          ret.append(arrow(t0.x, t0.y, t0.angle + 180, arrowAtStart));
        }

        if (arrowAtEnd) {
          var t1 = path.getTangentToPathAt(1);
          ret.append(arrow(t1.x, t1.y, t1.angle, arrowAtEnd));
        }
      }
      else {
        // This is temporary lousy implementation (especially for arc pathSeg)
        // and should be deleted when SVGPathElement.getTotalLength() and
        // SVGPathElement.getPointAtLength() are implemented in svgweb.
        function getControlPointsAbs(commands) {
          var pts = [],
              pt = {x: 0, y: 0};

          function nextPoint(relative, x, y) {
            if (relative) {
              pt.x += x;
              pt.y += y;
            }
            else {
              pt.x = x;
              pt.y = y;
            }
            pts.push({x: pt.x, y: pt.y});
          }

          for (var i = 0, n = commands.length; i < n; i++) {
            var command = commands[i],
                cmdChar = command[0],
                relative = (cmdChar === cmdChar.toLowerCase()),
                m = command.length,
                j = 1,
                paramCount = m - j,
                x, y;
            switch (cmdChar.toUpperCase()) {
            case 'M':
            case 'L':
            case 'T':
              while (j < m) {
                x = command[j++];
                y = command[j++];
                nextPoint(relative, x, y);
              }
              break;
            case 'S':
            case 'Q':
              while (j < m) {
                x = command[j++];
                y = command[j++];
                nextPoint(relative, x, y);
                x = command[j++];
                y = command[j++];
                nextPoint(relative, x, y);
              }
              break;
            case 'C':
              while (j < m) {
                x = command[j++];
                y = command[j++];
                nextPoint(relative, x, y);
                x = command[j++];
                y = command[j++];
                nextPoint(relative, x, y);
                x = command[j++];
                y = command[j++];
                nextPoint(relative, x, y);
              }
              break;
            case 'H':
              while (j < m) {
                x = command[j++];
                nextPoint(relative, x, 0);
              }
              break;
            case 'V':
              while (j < m) {
                y = command[j++];
                nextPoint(relative, 0, y);
              }
              break;
            case 'Z':
              break;
            case 'A':
              while (j < m) {
                j += 5;
                x = command[j++];
                y = command[j++];
                nextPoint(relative, x, y);
              }
              break;
            default:
              throw new Error('Unsupported path command. command=' + cmdChar);
            }
          }
          return pts;
        }

        var pts = getControlPointsAbs(pathElements);
        if (arrowAtStart) {
          var p0 = pts[0],
              p1 = pts[1],
              angle = M.geom.rad2deg(Math.atan2(p0.y - p1.y, p0.x - p1.x));
          ret.append(arrow(p0.x, p0.y, angle, arrowAtStart));
        }

        if (arrowAtEnd) {
          var n = pts.length,
              p0 = pts[n - 2],
              p1 = pts[n - 1],
              angle = M.geom.rad2deg(Math.atan2(p1.y - p0.y, p1.x - p0.x));
          ret.append(arrow(p1.x, p1.y, angle, arrowAtEnd));
        }
      }
    }
    return ret;
  }
  curve.defaults = {
    'class': 'curve',
    stroke: '#000',
    fill: 'none'
  };

  function arrow(x, y, angle, options) {
    var config = M.mixin({}, arrow.defaults, options);
    var w = config.arrowLength;
    var h = w * Math.tan(M.geom.deg2rad(config.arrowAngle / 2));
    return M.path().setAttr(M.mixin({
      d: M.formatPath([
        ['M', 0, 0],
        ['l', -w, h, 0, -h * 2],
        ['z']
      ]),
      transform: M.rotateThenTranslateTransform(x, y, angle)
    }, M.filterOut(config, 'arrowAngle', 'arrowLength')));
  }
  arrow.defaults = {
    'class': 'arrow',
    stroke: '#000',
    fill: 'none',
    arrowAngle: 45,
    arrowLength: 10
  };

  function relationLine(end1, end2, options) {
    var config = M.mixin({}, relationLine.defaults, options);
    var end1 = relationEnd(end1.x, end1.y, end1.angle, end1.cardinarity,
        options.end1);
    var end2 = relationEnd(end2.x, end2.y, end2.angle, end2.cardinarity,
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
    var config = M.mixin({}, relationEnd.defaults, options);
    var h = config.relationEndLength;
    var w = h * config.relationEndWidthRatio;
    var transform = M.rotateThenTranslateTransform(x, y, angle);
    var elem;
    switch (cardinality) {
    case 'one':
      var x2 = h * config.oneConnectorEndPosRatio;
      elem = M.path({
        'class': 'relationEnd one',
        stroke: '#000',
        fill: 'none',
        d: M.formatPath([
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
      elem = M.path({
        'class': 'relationEnd many',
        stroke: '#000',
        fill: 'none',
        d: M.formatPath([
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
      elem = M.path({
        'class': 'relationEnd ref',
        stroke: '#000',
        fill: 'none',
        d: M.formatPath(pathElems),
        transform: transform
      });
      break;
    case 'inherit':
      var x2 = h * config.oneConnectorEndPosRatio;
      var r = h * config.inheritConnectorEndRadiusRatio;
      elem = M.g({
        'class': 'relationEnd inherit',
        transform: transform
      }).append(
        M.path({
          stroke: '#000',
          fill: 'none',
          d: M.formatPath([
            ['M', 0, 0],
            ['L', -h, 0],
            ['M', -x2, -w / 2],
            ['L', -x2, w / 2]
          ])
        }),
        M.circle({
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
    curve: curve,
    arrow: arrow,
    relationLine: relationLine,
    relationEnd: relationEnd
  };
})(svgdom));
