Raphael.fn.kozwER = (function() {
  var Defaults = {
    arrow: {
      fill: "#000",
      arrowAngle: 45,
      arrowLength: 10
    },
    curve: {
      command: "Q"
    },
    global: {
      fixedDigits: 3
    }
  }

  function curve(xy, options) {
    var config = extend({}, Defaults.curve, options);
    if (config.command != "C" && config.command != "Q") {
      throw new Error("Unsupported command");
    }
    var elem = myPath.call(this, [
      ["M", xy[0], xy[1]],
      [config.command].concat(xy.slice(2))
    ]);
    var elems = [elem];

    if (options.arrow.start) {
      var sx = xy[0],
          sy = xy[1],
          angle = Math.atan2(sy - xy[3], sx - xy[2]);
      elems.push(arrow.call(this, sx, sy, rad2deg(angle), options.arrow.start));
    }

    if (options.arrow.end) {
      var len = xy.length,
          ex = xy[len - 2],
          ey = xy[len - 1],
          angle = Math.atan2(ey - xy[len - 3], ex - xy[len - 4]);
      elems.push(arrow.call(this, ex, ey, rad2deg(angle), options.arrow.end));
    }

    return elems.length > 1 ? this.set(elems) : elem;
  }

  function arrow(ex, ey, angle, options) {
    var config = extend({}, Defaults.arrow, options);
    var arrowAngleHalf = deg2rad(config.arrowAngle / 2);
    var theta0 = deg2rad(angle + 180);
    var theta1 = theta0 + arrowAngleHalf;
    var theta2 = theta0 - arrowAngleHalf;
    var r = config.arrowLength / Math.cos(arrowAngleHalf);
    var path = myPath.call(this, [
      ["M", ex, ey],
      ["l", r * Math.cos(theta1), r * Math.sin(theta1),
            r * Math.cos(theta2), r * Math.sin(theta2)],
      ["z"]
    ]);
    if (config.fill) {
      path.attr("fill", config.fill);
    }
    return path;
  }

  function defaults() {
    switch (arguments.length) {
    case 0:
      return Defaults;
    case 1:
      var arg = arguments[0];
      if (isString(arg)) {
        return Defaults[arg];
      }
      else {
        for (var k in arg) {
          extend(Defaults[k], arg[k]);
        }
        return Defaults;
      }
      break;
    default:
      throw new Error("Illegal Argument for defaults");
    }
  }

  function myPath(commands) {
    return this.path(fixPathCommands(commands));
  }

  function fixPathCommands(commands) {
    return commands.map(function(command) {
      return command.map(function(elem) {
        return isNaN(elem) ? elem :
            roundFloat(elem, Defaults.global.fixedDigits);
      });
    });
  }

  function roundFloat(x, digits) {
    var shift = Math.pow(10, digits);
    return Math.round(x * shift) / shift;
  }

  function deg2rad(degree) {
    return Math.PI / 180 * degree;
  }

  function rad2deg(radian) {
    return 180 / Math.PI * radian;
  }

  function extend(dest /* , sources...*/) {
    for (var i = 1, len = arguments.length; i < len; i++) {
      var src = arguments[i];
      for (var k in src) {
        dest[k] = src[k];
      }
    }
    return dest;
  }

  function isString(obj) {
    return typeof obj == "string";
  }

  return {
    defaults: defaults,
    arrow: arrow,
    curve: curve
  };
})();
