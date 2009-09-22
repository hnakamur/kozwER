svgdom.mixin(svgdom.Element.prototype, (function() {
  var mixin = svgdom.mixin,
      filterOut = svgdom.filterOut,
      geom = svgdom.geom,
      rad2deg = geom.rad2deg,
      deg2rad = geom.deg2rad;

  function erDiagram(settings) {
    var config = buildErDiagramConfig(settings);
    var tableConfigs = config.tables;
    var tableCount = tableConfigs.length;

    var x = 0;
    var y = 0;
    var gErDiagram = this.g({'class': 'erDiagram'});
    for (var i = 0; i < tableCount; i++) {
      var tableConfig = tableConfigs[i];
      var margin = tableConfig.margin;
      x = margin.x;
      y += margin.y;
      var tableElem = table.call(gErDiagram, x, y, tableConfig.name, {
        id: tableConfig.id,
        columns: tableConfig.columns
      });
      config.tableHash[tableConfig.id].nodeWrapper = tableElem;
      var tableRect = tableElem.boundingBox;
      y += tableRect.height;
    }

    var connectorConfigs = config.connectors;
    var connectorCount = connectorConfigs.length;
    for (var i = 0; i < connectorCount; i++) {
      var connectorConfig = connectorConfigs[i];
      var endsConfig = connectorConfig.ends;
      for (var j = 0, endCount = endsConfig.length; j < endCount; j++) {
        var endConfig = endsConfig[j];
        var p = connectorEndPoint(config, endConfig);
        endConfig.x = p.x;
        endConfig.y = p.y;
        if (endConfig.side === 'left')
          endConfig.angle = 0;
        else if (endConfig.side === 'top')
          endConfig.angle = 90;
        else if (endConfig.side === 'bottom')
          endConfig.angle = 270;
      }
      relationLine.call(gErDiagram, endsConfig[0], endsConfig[1]);
    }

    gErDiagram.config = config;
    console.log(gErDiagram);
    return gErDiagram;
  }
  erDiagram.defaults = {
    connectorEndLen: 10,
    connectorWidthRatio: 0.6,
    connectorMarginRatio: 0.3,
    connectorEndFirstOffset: 8,
    oneConnectorEndPosRatio: 0.4,
    inheritConnectorEndRadiusRatio: 0.3,
    inheritConnectorOffsetX: 20
  };

  function buildErDiagramConfig(settings) {
    var config = mixin({}, erDiagram.defaults, settings);
    var tableConfigs = config.tables;
    var tableCount = tableConfigs.length;

    config.tableHash = {};
    for (var i = 0; i < tableCount; i++) {
      var tableConfig = tableConfigs[i];
      config.tableHash[tableConfig.id] = tableConfig;
    }

    var connectorConfigs = config.connectors;
    var connectorCount = connectorConfigs.length;
    for (var i = 0; i < connectorCount; i++) {
      var connectorConfig = connectorConfigs[i];
      var endsConfig = connectorConfig.ends;
      for (var j = 0, endCount = endsConfig.length; j < endCount; j++) {
        var endConfig = endsConfig[j];
        var tableId = endConfig.table;
        var tableConfig = config.tableHash[tableId];
        if (tableConfig.ends === undefined)
          tableConfig.ends = {top: [], left: [], bottom: []};
        var side = endConfig.side;
        if (!(side === 'top' || side === 'bottom' || side == 'left'))
          throw new Error('Invalid endConfig.side');
        var endsAtSide = tableConfig.ends[side];
        if (endConfig.index === undefined)
          endConfig.index = endsAtSide.length;
        endsAtSide[endConfig.index] = endConfig;
      }
    }
    return config;
  }

  function connectorEndPoint(erDiagramConfig, endConfig) {
    var tableConfig = erDiagramConfig.tableHash[endConfig.table],
        tableElem = tableConfig.nodeWrapper,
        box = tableElem.nameBox,
        cew = erDiagramConfig.connectorEndLen * erDiagramConfig.connectorWidthRatio,
        cem = erDiagramConfig.connectorEndLen * erDiagramConfig.connectorMarginRatio,
        x, y;
    switch (endConfig.side) {
    case 'top':
      x = box.x + erDiagramConfig.connectorEndFirstOffset +
          endConfig.index * (cew + cem);
      y = box.y;
      break;
    case 'bottom':
      x = box.x + erDiagramConfig.connectorEndFirstOffset +
          endConfig.index * (cew + cem);
      y = box.y + box.height;
      break;
    case 'left':
      x = box.x;
      var c = tableConfig.ends[endConfig.side].length,
          w = cew * c + cem * (c - 1);
      y = box.y + box.height / 2 - w / 2 +
          endConfig.index * (cew + cem) + cew / 2;
      break;
    }
    return {x: x, y: y};
  }

  function table(x, y, name, options) {
    var config = mixin({}, table.defaults, options);
    var gTable = this.g({'class': 'table'});

    var gName = gTable.g({'class': 'tableName'});
    var rect = gName.rect({
      x: x, y: y, width: 1, height: 1,
      stroke: '#000', fill: 'none'
    });
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
    gTable.boundingBox = geom.cloneRect(nameBox);
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
      gTable.boundingBox.width = x - nameBox.x;
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
    if (end1.y > end2.y)
      return relationLine(end2, end1, options);

    var config = mixin({}, relationLine.defaults, options);
    var gRelationLine = this.g({'class': config['class']});
    var end1Elem = relationEnd.call(gRelationLine, end1.x, end1.y, end1.angle,
        end1.cardinality, options && options.end1);
    var end2Elem = relationEnd.call(gRelationLine, end2.x, end2.y, end2.angle,
        end2.cardinality, options && options.end2);

    function endStartPoint(x, y, angle, length) {
      var rad = deg2rad(angle);
      return {
        x: x - length * Math.cos(rad),
        y: y - length * Math.sin(rad)
      };
    }

    var p1, p2;
    p1 = endStartPoint(end1.x, end1.y, end1.angle, config.relationEndLength);
    p2 = endStartPoint(end2.x, end2.y, end2.angle, config.relationEndLength);
    var r = config.connectorCornerRadius;
    switch (end1.side) {
    case 'top':
      switch (end2.side) {
      case 'top':
        break;
      case 'bottom':
        break;
      case 'left':
        gRelationLine.path({
          d: this.formatPath([
            ["M", p1.x, p1.y],
            ["L", p1.x, p2.y - r],
            ["A", r, r, 0, 0, 1, p1.x + r, p2.y],
            ["L", p2.x, p2.y]
          ]),
          stroke: config.stroke,
          fill: config.fill
        });
        break;
      }
      break;
    case 'bottom':
      switch (end2.side) {
      case 'top':
        break;
      case 'bottom':
        break;
      case 'left':
        gRelationLine.path({
          d: this.formatPath([
            ["M", p1.x, p1.y],
            ["L", p1.x, p2.y - r],
            ["A", r, r, 0, 0, 0, p1.x + r, p2.y],
            ["L", p2.x, p2.y]
          ]),
          stroke: config.stroke,
          fill: config.fill
        });
        break;
      }
      break;
    case 'left':
      switch (end2.side) {
      case 'top':
        gRelationLine.path({
          d: this.formatPath([
            ["M", p2.x, p2.y],
            ["L", p2.x, p1.y + r],
            ["A", r, r, 0, 0, 1, p2.x + r, p1.y],
            ["L", p1.x, p1.y]
          ]),
          stroke: config.stroke,
          fill: config.fill
        });
        break;
      case 'bottom':
        gRelationLine.path({
          d: this.formatPath([
            ["M", p2.x, p2.y],
            ["L", p2.x, p1.y - r],
            ["A", r, r, 0, 0, 0, p2.x + r, p1.y],
            ["L", p1.x, p1.y]
          ]),
          stroke: config.stroke,
          fill: config.fill
        });
        break;
      case 'left':
        var x = p1.x - config.inheritConnectorOffsetX;
        gRelationLine.path({
          d: this.formatPath([
            ["M", p1.x, p1.y],
            ["L", x + r, p1.y],
            ["A", r, r, 0, 0, 0, x, p1.y + r],
            ["L", x, p2.y - r],
            ["A", r, r, 0, 0, 0, x + r, p2.y],
            ["L", p2.x + r, p2.y]
          ]),
          stroke: config.stroke,
          fill: config.fill
        });
        break;
      }
      break;
    }

    return gRelationLine;
  }
  relationLine.defaults = {
    'class': 'relationLine',
    relationEndLength: 10,
    connectorCornerRadius: 10,
    inheritConnectorOffsetX: 20,
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
    kozwER: {
      erDiagram: erDiagram
    }
  };
})());
