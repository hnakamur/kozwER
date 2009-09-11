Raphael.fn.kozwER = (function() {
  var Defaults = {
    taskTrigger: {
      rx: 40,
      ry: 30,
      fill: '#fff'
    },
    taskUnit: {
      rx: 50,
      ry: 35,
      fill: '#eee'
    },
    notebook: {
      width: 60,
      height: 80,
      angle: 5,
      pageCount: 3,
      pageOffset: 2,
      fill: '#fff',
      r: 5
    },
    arrow: {
      fill: "#000",
      arrowAngle: 45,
      arrowLength: 10
    },
    curve: {
      command: "Q"
    },
    ellipseStar: {
      n: 16,
      innerRadiusRatio: 0.8
    },
    global: {
      coordFloatDigits: 1,
      angleFloatDigits: 1
    }
  }

  function taskTrigger(x, y, text, options) {
    var config = extend({}, Defaults.taskTrigger, options);
    return this.set([
      ellipseStar.call(this, x, y, config.rx, config.ry, config).
          attr({fill: config.fill}),
      this.text(x, y, text)
    ]);
  }

  function taskUnit(x, y, text, options) {
    var config = extend({}, Defaults.taskUnit, options);
    return this.set([
      this.ellipse(x, y, config.rx, config.ry).attr({fill: config.fill}),
      this.text(x, y, text)
    ]);
  }

  function notebook(x, y, text, options) {
    var config = extend({}, Defaults.notebook, options);
    var w = config.width;
    var h = config.height;
    var slantRad = deg2rad(config.angle);
    var wSlant = h * Math.tan(slantRad);
    var x0 = x - w / 2 + wSlant / 2;
    var y0 = y - h / 2;
    var elems = [];
    for (var i = config.pageCount - 1; i >= 0; i--) {
      elems.push(_path.call(this, [
        ["M", x0 + i * config.pageOffset, y0 + i * config.pageOffset],
        ["l", w, 0, w - wSlant, h, -wSlant, h],
        ["z"]
      ]).attr({fill: config.fill}));
    }

    var r = config.r;
    var x1 = x0 + r;
    var y1 = y0 + 2 * r;
    var xOff = wSlant / h * r;
    var ringRad = slantRad + Math.PI / 2;
    var rc = r * Math.cos(ringRad);
    var rs = r * Math.sin(ringRad);
    var pathElems = [];
    for (i = 0, len = h / r - 3; i < len; i++) {
      pathElems.push(["M", x1 - i * xOff, y1 + i * r]);
      pathElems.push(["a", r, r, 0, 1, 0, rc - r, rs]);
    }
    elems.push(_path.call(this, pathElems));
    elems.push(this.text(x, y, text));
    return this.set(elems);
  }

  function curve(xy, options) {
    var config = extend({}, Defaults.curve, options);
    if (config.command != "C" && config.command != "Q") {
      throw new Error("Unsupported command");
    }
    var elem = _path.call(this, [
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

  function arrow(x, y, angle, options) {
    var config = extend({}, Defaults.arrow, options);
    var w = config.arrowLength;
    var h = w * Math.tan(deg2rad(config.arrowAngle / 2));
    var path = _path.call(this, [
      ["M", x, y],
      ["l", -w, h, -w, -h],
      ["z"]
    ]).rotate(angle, x, y);
    if (config.fill) {
      path.attr("fill", config.fill);
    }
    return path;
  }

  function arrow_old(x, y, angle, options) {
    var config = extend({}, Defaults.arrow, options);
    var w = config.arrowLength;
    var h = w * Math.tan(deg2rad(config.arrowAngle / 2));
    var path = _path.call(this, [
      ["M", 0, 0],
      ["l", -w, h, -w, -h],
      ["z"]
    ]).translate(x, y).rotate(angle, x, y);
    if (config.fill) {
      path.attr("fill", config.fill);
    }
    return path;
  }

  function ellipseStar(x, y, rx, ry, options) {
    var config = extend({}, Defaults.ellipseStar, options);
    var n2 = config.n * 2;
    var innerRx = rx * config.innerRadiusRatio;
    var innerRy = ry * config.innerRadiusRatio;
    var moveCmd = ["M", rx, 0];
    var lineCmd = ["L"];
    for (var i = 1; i < n2; i++) {
      var theta = 2 * Math.PI * i / n2;
      lineCmd.push((i % 2 ? innerRx : rx) * Math.cos(theta));
      lineCmd.push((i % 2 ? innerRy : ry) * Math.sin(theta));
    }
    return _path.call(this, [moveCmd, lineCmd, "Z"]).translate(x, y);
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

  function _path(commands) {
    return this.path(fixPathCommands(commands));
  }

  function fixPathCommands(commands) {
    var commands2 = [];
    for (var i = 0, n = commands.length; i < n; i++) {
      var command = commands[i];
      var command2 = [];
      for (var j = 0, m = command.length; j < m; j++) {
        var elem = command[j];
        command2.push(isNaN(elem) ? elem : roundCoord(elem));
      }
      commands2.push(command2);
    }
    return commands2;
  }

  function roundCoord(x) {
    var shift = Math.pow(10, Defaults.global.coordFloatDigits);
    return Math.round(x * shift) / shift;
  }

  function roundAngle(x) {
    var shift = Math.pow(10, Defaults.global.angleFloatDigits);
    return Math.round(x * shift) / shift;
  }

  function deg2rad(degree) {
    return Math.PI / 180 * degree;
  }

  function rad2deg(radian) {
    return roundAngle(180 / Math.PI * radian);
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
    taskTrigger: taskTrigger,
    taskUnit: taskUnit,
    notebook: notebook,
    defaults: defaults,
    arrow: arrow,
    curve: curve,
    ellipseStar: ellipseStar
  };
})();
