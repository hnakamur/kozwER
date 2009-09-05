Raphael.fn.kozw = (function() {
  function erDiagram(config) {
    var models = buildModels({
      tables: config.tables,
      connectors: config.connectors
    });

    var viewConfig = def(def({}, erDiagram.DefaultViewConfig), config.view);
    var elements = buildElements.call(this, models, viewConfig);
//    elements.attr('stroke-width', 0.5);
    return {
      models: models,
      elements: elements
    };
  }
  def(erDiagram, {
    DefaultViewConfig: {
      nameFont: "10pt Arial",
      nameBoxPadding: 4,
      nameMargin: 8,
      columnNameFont: "10pt Arial",
      columnMargin: 4,
      columnSeparator: ',',
      columnRowMargin: 8,
      dataFont: "10pt Arial",
      dataRowMargin: 2,
      connectorEndLen: 10,
      connectorWidthRatio: 0.6,
      connectorMarginRatio: 0.3,
      connectorEndFirstOffset: 8,
      oneConnectorEndPosRatio: 0.4,
      inheritConnectorEndRadiusRatio: 0.3,
      inheritConnectorOffsetX: 30
    }
  });

  function buildElements(models, viewConfig) {
    log('buildElements start');
    var tableHash = {},
        elements = [],
        y = 0;
    models.tables.forEach(function(tableModel) {
      var offset = tableModel.offset;
      var x = offset.x || 0;
      y += offset.y || 0;
log('calling table');
log(viewConfig);
      var tableElem = table.call(this, x, y, tableModel, viewConfig);
      tableHash[tableModel.id] = tableElem;
      elements.push(tableElem);
      y += tableElem.getBBox().height;
    }, this);
    models.connectors.forEach(function(connectorModel) {
      elements.push(
          connector.call(this, connectorModel, tableHash, viewConfig));
    }, this);
    return this.set(elements);
  }
    
  function table(x, y, tableModel, viewConfig) {
    log('table start x=' + x + ', y=' + y);
    log('tableModel:');
    log(tableModel);
    log('viewConfig:');
    log(viewConfig);

    var nameText = this.text(x, y, tableModel.name);
    nameText.attr({font: viewConfig.nameFont, 'text-anchor': 'start'});
    var nameBox = insetRect(nameText.getBBox(), -viewConfig.nameBoxPadding);
    nameText.translate(x - nameBox.x, y - nameBox.y);
    var nameRect = this.rect(x, y, nameBox.width, nameBox.height),
        x1 = xj = x + nameBox.width + viewConfig.nameMargin,
        y1 = nameText.attr('y'),
        columnTexts = [],
        line,
        dataTexts = [];
        columnCount = tableModel.columns.length;
    for (var j = 0; j < columnCount; j++) {
      var column = tableModel.columns[j];
      var text = this.text(xj, y1, column);
      text.attr({font: viewConfig.columnNameFont, 'text-anchor': 'start'});
      if (j > 0) {
        alignElements(columnTexts[0], 'bottom', text);
      }
      columnTexts.push(text);
      var columnBox = text.getBBox();

      var sepText,
          sepWidth;
      if (j < columnCount - 1) {
        sepText = this.text(columnBox.x + columnBox.width, y1,
            viewConfig.columnSeparator);
        sepText.attr({font: viewConfig.columnNameFont, 'text-anchor': 'start'});
        columnTexts.push(sepText);
        sepWidth = sepText.getBBox().width;
      }
      else {
        sepText = null;
        sepWidth = 0;
      }
        
      var width = columnBox.width,
          yi = y1 + nameBox.height / 2 + viewConfig.columnRowMargin,
          dataType = tableModel.getType(j);
      if (tableModel.data && tableModel.data.length > 0) {
        var dataTextsInColumn = [];
        for (var i = 0, len = tableModel.data.length; i < len; i++) {
          var row = tableModel.data[i];
          if (j < row.length) {
            var value = dataType == "currency" ?
                formatCurrency(row[j]) : row[j];
            text = this.text(xj, yi, value);
            text.attr({
              font: viewConfig.dataFont,
              'text-anchor': dataType == "currency" ? 'end' : 'start'
            });
            dataTextsInColumn.push(text);
            dataTexts.push(text);
            var box = text.getBBox();
            width = Math.max(box.width, width);
            yi += box.height + viewConfig.dataRowMargin;
          }
        }
        if (dataType == "currency") {
          dataTextsInColumn.forEach(function(text) {
            text.attr('x', xj + width);
          });
        }
      }

      if (j == tableModel.pkeyColumnCount - 1) {
        line = this.path([
          ["M", x1, columnBox.y + columnBox.height],
          ["H", xj + width]
        ]);
      }

      xj += width + sepWidth + viewConfig.columnMargin;
    }
    var elems = [nameRect, nameText].concat(columnTexts, [line], dataTexts);
    return this.set(elems);
  }

  function connector(connectorModel, tableHash, viewConfig) {
    log('connector start');
    log('connectorModel:');
    log(connectorModel);

    var elems = [],
        paper = this;
    connectorModel.ends.forEach(function(connectorEndModel) {
log('connector for each connctorEnd');
      if (isArray(connectorEndModel)) {
log("connector end isArray");
        connectorEndModel.forEach(createEnd, this);
      }
      else {
        createEnd(connectorEndModel);
      }
    }, this);

    var end0 = connectorModel.ends[0],
        end1 = connectorModel.ends[1];
    if (isArray(end1)) {
log('createEnd is Array');
      end1.forEach(function(subEnd, i) {
log('subEnd');
log(subEnd);
        createPath(end0, subEnd);
      }, this);
    }
    else {
      createPath(end0, end1);
    }

    return this.set(elems);

    function createEnd(connectorEndModel) {
log('createEnd start');
log(connectorEndModel);
      var ep = connectorEndPoint(connectorEndModel, tableHash, viewConfig),
          sp;
      switch (connectorEndModel.side) {
      case 'top':
        sp = {x: ep.x, y: ep.y - viewConfig.connectorEndLen};
        break;
      case 'bottom':
        sp = {x: ep.x, y: ep.y + viewConfig.connectorEndLen};
        break;
      case 'left':
        sp = {x: ep.x - viewConfig.connectorEndLen, y: ep.y};
        break;
      }
      connectorEndModel.elem = connectorEnd.call(paper, sp.x, sp.y, ep.x, ep.y,
          connectorEndModel, viewConfig);
      elems.push(connectorEndModel.elem);
    }

    function getStartPoint(connectorEndModel) {
      var m = connectorEndModel.elem[0].attr('path')[0];
      return {x: m[1], y: m[2]};
    }

    function createPath(end0, end1) {
log('createPath start');
log('end0:');
log(end0);
log('end1:');
log(end1);
      var p0 = getStartPoint(end0),
          p1 = getStartPoint(end1),
          r = viewConfig.connectorEndLen;
      if (p0.y > p1.y) {
        return createPath(end1, end0);
      }

      switch (end0.side) {
      case 'top':
        switch (end1.side) {
        case 'top':
          break;
        case 'bottom':
          break;
        case 'left':
          elems.push(paper.path([
            ["M", p0.x, p0.y],
            ["L", p0.x, p1.y + r],
            ["A", r, r, 0, 0, 1, p0.x + r, p1.y],
            ["L", p1.x, p1.y]
          ]));
          break;
        }
        break;
      case 'bottom':
        switch (end1.side) {
        case 'top':
          break;
        case 'bottom':
          break;
        case 'left':
          elems.push(paper.path([
            ["M", p0.x, p0.y],
            ["L", p0.x, p1.y - r],
            ["A", r, r, 0, 0, 0, p0.x + r, p1.y],
            ["L", p1.x, p1.y]
          ]));
          break;
        }
        break;
      case 'left':
        switch (end1.side) {
        case 'top':
          elems.push(paper.path([
            ["M", p1.x, p1.y],
            ["L", p1.x, p0.y + r],
            ["A", r, r, 0, 0, 1, p1.x + r, p0.y],
            ["L", p0.x, p0.y]
          ]));
          break;
        case 'bottom':
          elems.push(paper.path([
            ["M", p1.x, p1.y],
            ["L", p1.x, p0.y - r],
            ["A", r, r, 0, 0, 0, p1.x + r, p0.y],
            ["L", p0.x, p0.y]
          ]));
          break;
        case 'left':
          var x = p0.x - viewConfig.inheritConnectorOffsetX;
          elems.push(paper.path([
            ["M", p0.x, p0.y],
            ["L", x + r, p0.y],
            ["A", r, r, 0, 0, 0, x, p0.y + r],
            ["L", x, p1.y - r],
            ["A", r, r, 0, 0, 0, x + r, p1.y],
            ["L", p1.x + r, p1.y]
          ]));
          break;
        }
        break;
      }
    }
  }

  function connectorEnd(x1, y1, xe, ye, connectorEndModel, viewConfig) {
    log('connectorEnd start x1=' + x1 + ', y1=' + y1 + ', xe=' + xe + ', ye=' + ye);
    log('connectorEndModel:');
    log(connectorEndModel);
    var type = connectorEndModel.type,
        line = this.path([["M", x1, y1], ["L", xe, ye]]),
        elements = [line];
log("line----------------");
log(line);
    if (type == 'ref') {
      line.attr({"stroke-dasharray": ". "});
    }
    else if (type == 'multi') {
      var dx = xe - x1,
          dy = ye - y1,
          len = Math.sqrt(dx * dx + dy * dy),
          ux = dx / len,
          uy = dy / len,
          cx = x1 + dx * viewConfig.oneConnectorEndPosRatio,
          cy = y1 + dy * viewConfig.oneConnectorEndPosRatio,
          r = len * viewConfig.connectorWidthRatio / 2,
          wx = uy * r,
          wy = -ux * r,
          path = this.path([["M", xe + wx, ye + wy],
              ["L", cx + wx, cy + wy],
              ["A", r, r, 0, 0, 0, cx - wx, cy - wy],
              ["L", xe - wx, ye - wy]]);
      elements.push(path);
    }
    else if (type == 'one' || type == 'inherit') {
      var dx = xe - x1,
          dy = ye - y1,
          len = Math.sqrt(dx * dx + dy * dy),
          ux = dx / len,
          uy = dy / len,
          cx = x1 + dx * viewConfig.oneConnectorEndPosRatio,
          cy = y1 + dy * viewConfig.oneConnectorEndPosRatio,
          wx = uy * len * viewConfig.connectorWidthRatio / 2,
          wy = -ux * len * viewConfig.connectorWidthRatio / 2,
          sx = cx + wx,
          sy = cy + wy,
          ex = cx - wx,
          ey = cy - wy,
          line2 = this.path([["M", sx, sy], ["L", ex, ey]]);
      elements.push(line2);
      if (type == 'inherit') {
        var r = Math.abs(len * viewConfig.inheritConnectorEndRadiusRatio / 2),
            c = this.circle(x1, y1, r);
        c.attr({fill: c.attr('stroke')});
        elements.push(c);
      }
    }
    else {
      throw "Unsupported type for connetorEnd";
    }
    return elements;
  }

  function connectorEndPoint(connectorEndModel, tableHash, viewConfig) {
    var table = tableHash[connectorEndModel.table.id],
        box = table.items[0].attr(['x', 'y', 'width', 'height']),
        cew = viewConfig.connectorEndLen * viewConfig.connectorWidthRatio,
        cem = viewConfig.connectorEndLen * viewConfig.connectorMarginRatio,
        x, y;
    switch (connectorEndModel.side) {
    case 'top':
      x = box.x + viewConfig.connectorEndFirstOffset +
          connectorEndModel.index * (cew + cem);
      y = box.y;
      break;
    case 'bottom':
      x = box.x + viewConfig.connectorEndFirstOffset +
          connectorEndModel.index * (cew + cem);
      y = box.y + box.height;
      break;
    case 'left':
      x = box.x;
      var tableModel = connectorEndModel.table;
          c = tableModel.connectorEnds[connectorEndModel.side].length,
          w = cew * c + cem * (c - 1);
      y = box.y + box.height / 2 - w / 2 +
          connectorEndModel.index * (cew + cem) + cew / 2;
      break;
    }
    return {x: x, y: y};
  }


  function buildModels(modelsConfig) {
    var tableHash = {},
        tables = [];
    modelsConfig.tables.forEach(function(tableConfig) {
      var table = new TableModel(tableConfig);
      tableHash[tableConfig.id] = table;
      tables.push(table);
    });
log("tableHash:");
log(tableHash);
    var connectors = (modelsConfig.connectors || []).map(
      function(connectorConfig) {
        function createEnd(endConfig) {
log('endConfig:');
log(endConfig);
          var tableModel = tableHash[endConfig.table];
          return tableModel.addConnectorEnd(endConfig.type, endConfig.side,
              endConfig.index);
        };
        var ends = connectorConfig.ends.map(function(endConfig) {
log('endConfig#2:');
log(endConfig);
          if (isArray(endConfig)) {
log('endConfig is Array');
            return endConfig.map(function(endElemConfig) {
              return createEnd(endElemConfig);
            });
          }
          else {
log('endConfig is not Array');
            return createEnd(endConfig);
          }
        });
        return new ConnectorModel(ends);
      }
    );
    return {
      tableHash: tableHash,
      tables: tables,
      connectors: connectors
    };
  }

  function TableModel(config) {
    def(this, TableModel.DefaultConfig);
    def(this, config);
    this.connectorEnds = {top: [], left: [], bottom: []};
  }
  def(TableModel, {
    DefaultConfig: {
      pkeyColumnCount: 1
    }
  });
  def(TableModel.prototype, {
    getType: function(columnIndex) {
      return this.types && columnIndex < this.types.length ?
          this.types[columnIndex] : "string";
    },
    addConnectorEnd: function(type, side, index) {
      if (!/top|left|bottom/.test(side)) {
        throw new Error('Invalid side parameter.');
      }
      var endsAtSide = this.connectorEnds[side],
        ce = new ConnectorEndModel(this, type, side,
          typeof index == 'undefined' ? endsAtSide.length : index);
      endsAtSide.push(ce);
      return ce;
    }
  });

  function ConnectorEndModel(table, type, side, index) {
    this.table = table;
    this.type = type;
    this.side = side;
    this.index = index;
  }

  function ConnectorModel(ends) {
    this.ends = ends;
  }

  function insetRect(rect, offset) {
    return {
      x: rect.x + offset,
      y: rect.y + offset,
      width: rect.width - 2 * offset,
      height: rect.height - 2 * offset
    };
  }

  function alignElements(base, side, target) {
    var baseBox = base.getBBox(),
        box = target.getBBox(),
        dx, dy;
    switch (side) {
    case 'top':
      dx = 0;
      dy = baseBox.y - box.y;
      break;
    case 'bottom':
      dx = 0;
      dy = (baseBox.y + baseBox.height) - (box.y + box.height);
      break;
    case 'left':
      dx = baseBox.x - box.x;
      dy = 0;
      break;
    case 'right':
      dx = (baseBox.x + baseBox.height) - (box.x + box.height);
      dy = 0;
      break;
    }
    target.translate(dx, dy);
  }

  function def(target, src) {
    for (var k in src)
      target[k] = src[k];
    return target;
  }

	function isArray(obj) {
		return (obj instanceof Array) || (toString.call(obj) === "[object Array]");
	}

  function log(arg) {
//    console.log(arg);
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

  return {
    erDiagram: erDiagram
  }
})();
