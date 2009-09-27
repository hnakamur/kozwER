svgdom.mixin(svgdom.ElementWrapper.prototype, (function() {
  var mixin = svgdom.mixin,
      geom = svgdom.geom;

  function dfdDiagram(settings) {
  }
  dfdDiagram.defaultOptions = {
    taskTrigger: {
      rx: 40,
      ry: 30
    },
    taskUnit: {
      rx: 50,
      ry: 35
    }
  };

  var Defaults = {
    taskTrigger: {
      rx: 40,
      ry: 30,
      fill: '#fff'
    },
    taskUnit: {
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
    }
  }

  function taskTrigger(x, y, text, options) {
    var config = mixin({}, taskTrigger.defaultOptions, options);
    var g = this.g({ 'class': config['class'] });
    var star = g.ellipseStar(x, y, config.rx, config.ry, options);
    var text = g.plainText(x, y, text);
    star.alignElements(text, 0.5, 0.5);
    return g;
  }
  taskTrigger.defaultOptions = {
    'class': 'taskTrigger',
    rx: 40,
    ry: 30
  };

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

  function ellipseStar(x, y, rx, ry, options) {
    var config = mixin({}, ellipseStar.defaultOptions, options);
    var n2 = config.n * 2;
    var innerRx = rx * config.innerRadiusRatio;
    var innerRy = ry * config.innerRadiusRatio;
    var points = [];
    for (var i = 0; i < n2; ++i) {
      var theta = 2 * Math.PI * i / n2;
      points.push((i % 2 ? innerRx : rx) * Math.cos(theta));
      points.push((i % 2 ? innerRy : ry) * Math.sin(theta));
    }
    return this.polygon(points, undefined, { transform: ['translate', x, y] });
  }
  ellipseStar.defaultOptions = {
    n: 16,
    innerRadiusRatio: 0.8
  };

  return {
    dfdDiagram: dfdDiagram,
    taskTrigger: taskTrigger,
    taskUnit: taskUnit,
    notebook: notebook,
    ellipseStar: ellipseStar
  };
})());
