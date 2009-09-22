svgdom.mixin(svgdom.Element.prototype, (function() {
  var mixin = svgdom.mixin,
      filterOut = svgdom.filterOut,
      geom = svgdom.geom,
      rad2deg = geom.rad2deg,
      deg2rad = geom.deg2rad;


  function table(x, y, name, options) {
    var config = mixin({}, table.defaults, options);
    var gTable = this.g({'class': 'table'});

    var gName = gTable.g({'class': 'tableName'});
    var rect = gName.rect({x: x, y: y, width: 1, height: 1,
        stroke: '#000', fill: 'none'});
    var xName = x + config.nameBoxPadding,
        yName = y + config.nameBoxPadding;
    var text = gName.text({
      x: xName,
      y: yName,
      'text-anchor': 'start',
      'dominant-baseline': 'text-before-edge'
    });
    text.textNode(name);

    var nameBox = gTable.nameBox =
        geom.insetRect(text.getTextBBox(), -config.nameBoxPadding);
    rect.setAttr({width: nameBox.width, height: nameBox.height});

    var gColumns = gTable.g({'class': 'columns'});
    var columnNames = config.columns;
    if (columnNames) {
      var columnCount = columnNames.length;
      x = nameBox.x + nameBox.width + config.tableNameColumnNameMargin;
      y = yName;
      var columnBoxes = [];
      for (var i = 0; i < columnCount; i++) {
        var columnName = columnNames[i];
        var columnText = gColumns.text({
          x: x,
          y: y,
          'text-anchor': 'start',
          'dominant-baseline': 'text-before-edge'
        });
        columnText.textNode(columnName);

        var columnBox = columnText.getTextBBox();
        columnBoxes.push(columnBox);

        if (i < columnCount - 1) {
          x += columnBox.width;

          var separatorText = gColumns.text({
            x: x,
            y: y,
            'text-anchor': 'start',
            'dominant-baseline': 'text-before-edge'
          });
          separatorText.textNode(config.columnSeparator);

          x += config.columnMargin;
        }
      }
    }

    return gTable;
  }
  table.defaults = {
    nameBoxPadding: 4,
    tableNameColumnNameMargin: 8,
    columnSeparator: '、',
    columnMargin: 12
  }

  function relationLine(end1, end2, options) {
    var config = mixin({}, relationLine.defaults, options);
    var end1 = this.relationEnd(end1.x, end1.y, end1.angle, end1.cardinarity,
        options.end1);
    var end2 = this.relationEnd(end2.x, end2.y, end2.angle, end2.cardinarity,
        options.end2);
    var p1, p2;

    function endStartPoint(x, y, angle, length) {
      var rad = deg2rad(angle);
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
        d: this.formatPath([
          ['M', 0, 0],
          ['L', -h, 0],
          ['M', -x2, -w / 2],
          ['L', -x2, w / 2]
        ]),
        stroke: '#000',
        fill: 'none',
        transform: transform
      });
      break;
    case 'many':
      var r = w / 2;
      elem = this.path({
        'class': 'relationEnd many',
        d: this.formatPath([
          ['M', 0, 0],
          ['L', -h, 0],
          ['M', 0, -r],
          ['L', -h + r, -r],
          ['A', r, r, 0, 0, 0, -h + r, r],
          ['L', 0, r]
        ]),
        stroke: '#000',
        fill: 'none',
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
        d: this.formatPath(pathElems),
        stroke: '#000',
        fill: 'none',
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
          d: this.formatPath([
            ['M', 0, 0],
            ['L', -h, 0],
            ['M', -x2, -w / 2],
            ['L', -x2, w / 2]
          ]),
          stroke: '#000',
          fill: 'none',
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
    table: table,
    relationLine: relationLine,
    relationEnd: relationEnd
  };
})());
