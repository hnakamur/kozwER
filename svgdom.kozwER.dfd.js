svgdom.extend(svgdom.ElementWrapper.prototype, (function() {
  var extend = svgdom.extend,
      filter = svgdom.filter,
      geom = svgdom.geom;

  function dfdDiagram(settings) {
  }


  function taskTrigger(x, y, text, options) {
    var config = extend({}, taskTrigger.defaultOptions, options);
    var g = this.g({ 'class': config['class'] });
    var star = g.ellipseStar(0, 0, config.rx, config.ry,
      filter(config, ['stroke', 'fill'])
    );
    var text = g.plainText(0, 0, text, undefined, {textAlign: 'center'});
    star.alignElements(text, 'center', 'middle');
    g.moveElement(x, y);
    return g;
  }
  taskTrigger.defaultOptions = {
    'class': 'taskTrigger',
    rx: 40,
    ry: 30,
    stroke: '#000',
    fill: '#fff'
  };

  function taskUnit(x, y, text, options) {
    var config = extend({}, taskUnit.defaultOptions, options);
    var g = this.g({'class': config['class']});
    var ellipse = g.ellipse(0, 0, config.rx, config.ry,
      filter(config, ['stroke', 'fill']), options
    );
    var text = g.plainText(0, 0, text, undefined, {textAlign: 'center'});
    ellipse.alignElements(text, 'center', 'middle');
    g.moveElement(x, y);
    return g;
  }
  taskUnit.defaultOptions = {
    'class': 'taskUnit',
    rx: 60,
    ry: 48,
    stroke: '#000',
    fill: '#eee'
  };

  function notebook(x, y, text, options) {
    var config = extend({}, notebook.defaults, options);
    var g = this.g(filter(config, 'class'));
    var w = config.width;
    var h = config.height;
    var pageOffset = config.pageOffset;
    var gPages = g.g({
        'class': 'pages', fill: config.fill, stroke: config.stroke});
    for (var i = config.pageCount - 1; i >= 0; i--) {
      var offset = i * pageOffset;
      gPages.rect(0, 0, w, h, {
        transform: [
          ['translate', offset, offset],
          ['skewX', -config.angle]],
        fill: undefined,
        stroke: undefined
      });
    }

    var slantRad = geom.deg2rad(config.angle);
    var wSlant = h * Math.tan(slantRad);
    var r = config.r;
    var xOff = wSlant / h * r;
    var ringRad = slantRad + Math.PI / 2;
    var rc = r * Math.cos(ringRad);
    var rs = r * Math.sin(ringRad);
    var gRings = g.g({'class': 'rings', fill: 'none', stroke: config.stroke});
    for (i = 0, len = h / r - 3; i < len; i++) {
      gRings.path([['M', r, 0], ['A', r, r, 0, 1, 0, rc, rs]],
        {transform: ['translate', -i * xOff, (i + 2) * r],
         fill: undefined, stroke: undefined}
      );
    }

    var text = g.plainText(0, 0, text, {textAlign: 'center'});
    gPages.lastChild().alignElements(text, 'center', 'middle');

    g.moveElement(x, y);
    return g;
  }
  notebook.defaults = {
    'class': 'notebook',
    width: 80,
    height: 100,
    angle: 5,
    pageCount: 3,
    pageOffset: 2,
    stroke: '#000',
    fill: '#fff',
    r: 5
  };

  function ellipseStar(x, y, rx, ry, options) {
    var config = extend({}, ellipseStar.defaultOptions, options);
    var n2 = config.n * 2;
    var innerRx = rx * config.innerRadiusRatio;
    var innerRy = ry * config.innerRadiusRatio;
    var points = [];
    for (var i = 0; i < n2; ++i) {
      var theta = 2 * Math.PI * i / n2;
      points.push((i % 2 ? innerRx : rx) * Math.cos(theta));
      points.push((i % 2 ? innerRy : ry) * Math.sin(theta));
    }
    return this.polygon(points,
      filter(config, ['stroke', 'fill']),
      { transform: ['translate', x, y] }
    );
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
