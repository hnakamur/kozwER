svgdom.mixin(svgdom.ElementWrapper.prototype, (function() {
  var mixin = svgdom.mixin,
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
      var tableElem = table.call(gErDiagram, x, y, tableConfig.name,
          tableConfig);
      config.tableHash[tableConfig.id].nodeWrapper = tableElem;
      var tableRect = tableElem.boundingBox;
      y += tableRect.height;
    }

    var connectorConfigs = config.connectors;
    var connectorCount = connectorConfigs.length;
    for (var i = 0; i < connectorCount; i++) {
      var connectorConfig = connectorConfigs[i];
      var endsConfig = connectorConfig.ends;
      for (var j = 0, endCount = endsConfig.length; j < endCount; ++j) {
        var endConfig = endsConfig[j];
        if (svgdom.isArray(endConfig)) {
          for (var k = 0, count = endConfig.length; k < count; ++k)
            setEndConfigCoordAndAngle(config, endConfig[k]);
        }
        else
          setEndConfigCoordAndAngle(config, endConfig);
      }

      if (svgdom.isArray(endsConfig[0])) {
        for (var k = 0, count = endsConfig[0].length; k < count; ++k)
          relationLine.call(gErDiagram, endsConfig[0][k], endsConfig[1]);
      }
      else if (svgdom.isArray(endsConfig[1])) {
        for (var k = 0, count = endsConfig[1].length; k < count; ++k)
          relationLine.call(gErDiagram, endsConfig[0], endsConfig[1][k]);
      }
      else
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
        if (svgdom.isArray(endConfig)) {
          for (var k = 0, count = endConfig.length; k < count; ++k)
            setEndsAtSideOfTable(config, endConfig[k]);
        }
        else
          setEndsAtSideOfTable(config, endConfig);
      }
    }
    return config;
  }

  function setEndsAtSideOfTable(erDiagramConfig, endConfig) {
    var tableId = endConfig.table;
    var tableConfig = erDiagramConfig.tableHash[tableId];
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

  function setEndConfigCoordAndAngle(erDiagramConfig, endConfig) {
    var p = connectorEndPoint(erDiagramConfig, endConfig);
    endConfig.x = p.x;
    endConfig.y = p.y;
    if (endConfig.side === 'left')
      endConfig.angle = 0;
    else if (endConfig.side === 'top')
      endConfig.angle = 90;
    else if (endConfig.side === 'bottom')
      endConfig.angle = 270;
  }

  function table(x, y, name, options) {
    var config = mixin({}, table.defaults, options);
    var gTable = this.g({'class': 'table'});

    var gName = gTable.g({'class': 'tableName'});
    var rect = gName.rect(x, y, 1, 1,
      { stroke: '#000', fill: 'none' }
    );
    var xName = x + config.nameBoxPadding,
        yName = y + config.nameBoxPadding;
    var text = gName.plainText(xName, yName, name);
    var nameTextBox = text.getTextBBox();
    var nameBox = gTable.nameBox =
        geom.insetRect(nameTextBox, -config.nameBoxPadding),
        yOffset = yName - nameTextBox.y;
    text.setAttribute('y', yName + yOffset);
    nameBox.y += yOffset;
    gTable.boundingBox = geom.cloneRect(nameBox);
    rect.setAttributes({ width: nameBox.width, height: nameBox.height });

    var gColumns = gTable.g({'class': 'columns'});
    var dataRowCount = 0;
    var gData;
    if (config.data) {
      dataRowCount = config.data.length;
      gData = gTable.g({'class': 'data'});
    }
    var columnNames = config.columns;
    if (columnNames) {
      var columnCount = columnNames.length;
      var columnTexts = [];
      var pkeyColumnCount = config.pkeyColumnCount || 1;
      var xFirstColumn = x =
          nameBox.x + nameBox.width + config.tableNameColumnNameMargin;
      var pkeyLine;
      var columnWidth;
      for (var i = 0; i < columnCount; i++) {
        var columnName = columnNames[i];
        var dataType = undefined;
        if (config.types && i < config.types.length)
          dataType = config.types[i];

        y = yName + yOffset;
        var columnText = gColumns.plainText(x, y, columnName);
        columnTexts.push(columnText);

        var columnBox = columnText.getTextBBox();
        columnWidth = columnBox.width;

        if (i == pkeyColumnCount - 1) {
          var yLine = y + config.pKeyLineOffset;
          pKeyLine = gColumns.path(
            [
              ['M', xFirstColumn, yLine],
              ['H', x + columnWidth]
            ]
          );
          gColumns.insertBefore(pKeyLine, columnTexts[0]);
        }

        if (i < columnCount - 1) {
          var separatorText = gColumns.plainText(
            x + columnBox.width, y, config.columnSeparator
          );
        }

        if (columnBox.height != nameTextBox.height) {
          y -= columnBox.height - nameTextBox.height;
          columnText.setAttribute('y', y);
        }

        y += columnBox.height;

        if (dataRowCount > 0) {
          y += config.columnDataMargin;
          var dataTexts = [];
          for (var j = 0; j < dataRowCount; j++) {
            var dataRow = config.data[j];
            var dataColumnCount = dataRow.length;
            if (i < dataColumnCount) {
              var textAnchor = dataType === 'currency' ?  'end' : 'start';
              var dataString = dataType === 'currency' ?
                  formatCurrency(dataRow[i]) : dataRow[i];
              var dataText = gData.plainText(x, y, dataString);
              dataTexts[j] = dataText;

              var dataBox = dataText.getTextBBox();
              dataText.width = dataBox.width;
              columnWidth = Math.max(dataBox.width, columnWidth);
              y += dataBox.height;
            }
          }
          if (dataType === 'currency') {
            for (var j = 0; j < dataRowCount; j++) {
              var dataText = dataTexts[j];
              if (dataText)
                dataText.setAttribute('x', x + columnWidth - dataText.width);
            }
          }
        }

        x += columnWidth;
        if (i < columnCount - 1)
          x += config.columnMargin;

        gTable.boundingBox.width = Math.max(gTable.boundingBox.width,
            x - nameBox.x);
        gTable.boundingBox.height = Math.max(gTable.boundingBox.height,
            y - nameBox.y);
      }
    }

    return gTable;
  }
  table.defaults = {
    nameBoxPadding: 4,
    tableNameColumnNameMargin: 8,
    pKeyLineOffset: 4,
    columnSeparator: '、',
    columnMargin: 12,
    columnDataMargin: 6
  }

  function formatCurrency(n) {
    var s = '' + n,
        buf = [],
        j = 0;
    for (var i = s.length - 1; i >= 0; i--) {
      var c = s.charAt(i);
      buf.unshift(c);
      if (/\d/.test(c) && ++j == 3 && i - 1 >= 0 &&
          /\d/.test(s.charAt(i - 1))) {
        buf.unshift(",");
        j = 0;
      }
    }
    return buf.join("");
  }


  function relationLine(end1, end2, options) {
    if (end1.y > end2.y)
      return relationLine.call(this, end2, end1, options);

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
        gRelationLine.path(
          [
            ["M", p1.x, p1.y],
            ["L", p1.x, p2.y - r],
            ["A", r, r, 0, 0, 0, p1.x + r, p2.y],
            ["L", p2.x, p2.y]
          ]
        );
        break;
      }
      break;
    case 'left':
      switch (end2.side) {
      case 'top':
        gRelationLine.path(
          [
            ["M", p2.x, p2.y],
            ["L", p2.x, p1.y + r],
            ["A", r, r, 0, 0, 1, p2.x + r, p1.y],
            ["L", p1.x, p1.y]
          ]
        );
        break;
      case 'bottom':
        break;
      case 'left':
        var x = p1.x - config.inheritConnectorOffsetX;
        gRelationLine.path(
          [
            ["M", p1.x, p1.y],
            ["L", x + r, p1.y],
            ["A", r, r, 0, 0, 0, x, p1.y + r],
            ["L", x, p2.y - r],
            ["A", r, r, 0, 0, 0, x + r, p2.y],
            ["L", p2.x + r, p2.y]
          ]
        );
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
      elem = this.path(
        [
          ['M', 0, 0],
          ['L', -h, 0],
          ['M', -x2, -w / 2],
          ['L', -x2, w / 2]
        ],
        {
          'class': 'relationEnd one',
          transform: transform
        }
      );
      break;
    case 'many':
      var r = w / 2;
      elem = this.path(
        [
          ['M', 0, 0],
          ['L', -h, 0],
          ['M', 0, -r],
          ['L', -h + r, -r],
          ['A', r, r, 0, 0, 0, -h + r, r],
          ['L', 0, r]
        ],
        {
          'class': 'relationEnd many',
          transform: transform
        }
      );
      break;
    case 'ref':
      var dotCount = 3;
      var dotLen = h / (2 * dotCount - 1);
      var pathElems = [];
      for (var i = 0; i < dotCount; i++) {
        pathElems.push(['M', -dotLen * 2 * i, 0]);
        pathElems.push(['L', -dotLen * (2 * i + 1), 0]);
      }
      elem = this.path(
        pathElems,
        {
          'class': 'relationEnd ref',
          transform: transform
        }
      );
      break;
    case 'inherit':
      var x2 = h * config.oneConnectorEndPosRatio;
      var r = h * config.inheritConnectorEndRadiusRatio;
      elem = this.g({
        'class': 'relationEnd inherit',
        transform: transform
      });
      elem.path(
        [
          ['M', 0, 0],
          ['L', -h, 0],
          ['M', -x2, -w / 2],
          ['L', -x2, w / 2]
        ]
      );
      elem.circle(-h, 0, r, { fill: '#000', stroke: 'none' });
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
