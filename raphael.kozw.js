Raphael.fn.kozw = (function() {
  var ConnectorEndLen = 10,
      ConnectorWidthRatio = 0.6,
      ConnectorMarginRatio = 0.3,
      ConnectorEndFirstOffset = 8,
      OneConnectorEndPosRatio = 0.4,
      InheritConnectorEndRadiusRatio = 0.3,
      ColumnMargin = 6,
      PKeyLinePaddingRight = 4;

  function grid(t) {
    return t;
//    return Math.floor(t) + 0.5;
  }
  function gridL(len) {
    return len;
//    return Math.floor(len);
  }
    
  function table(x, y, tbl) {
    var nameText = this.text(x, y, tbl.name);
    nameText.attr({font: tbl.nameFont, 'text-anchor': 'start'});
    var nameBox = tbl.nameBox = Geom2d.rect.inset(nameText.getBBox(), -tbl.namePadding);
    var nameRect = this.rect(grid(nameBox.x), grid(nameBox.y), gridL(nameBox.width), gridL(nameBox.height));

    var x1 = grid(nameBox.x + nameBox.width + tbl.nameMargin),
      y1 = grid(nameBox.y + nameBox.height / 2),
      columnTexts = [],
      dataTexts = [];
      columnCount = tbl.columns.length;
    for (var j = 0; j < columnCount; j++) {
      var column = j < columnCount - 1 ? tbl.columns[j] + '、' : tbl.columns[j];
      var text = columnTexts[j] = this.text(x1, y1, column);
      text.attr({font: tbl.columnNameFont, 'text-anchor': 'start'});
      var bbox = text.getBBox(),
        width = bbox.width,
        y2 = grid(y1 + bbox.height + tbl.columnRowMargin);
      if (tbl.data && tbl.data.length > 0) {
        for (var i = 0, len = tbl.data.length; i < len; i++) {
          var row = tbl.data[i];
          if (j < row.length) {
            var value = row[j];
            text = this.text(x1, y2, value);
            text.attr({font: tbl.dataFont, 'text-anchor': 'start'});
            dataTexts.push(text);
            bbox = text.getBBox();
            width = Math.max(bbox.width + ColumnMargin, width);
          }
          y2 += bbox.height + tbl.dataRowMargin;
        }
      }

      x1 += width;
    }
    var pkeyFirstColumnText = columnTexts[0],
      pkeyLastColumnText = columnTexts[tbl.pkeyColumnCount - 1];
    x1 = grid(pkeyFirstColumnText.getBBox().x);
    bbox = pkeyLastColumnText.getBBox();
    x2 = grid(bbox.x + bbox.width - PKeyLinePaddingRight);
    y1 = grid(bbox.y + bbox.height);
    //var line = this.path().absolutely().moveTo(x1, y1).lineTo(x2, y1);
    var line = this.path([["M", x1, y1], ["H", x2]]);
    var elems = [nameRect, nameText].concat(columnTexts, [line], dataTexts);
    tbl.node = this.set(elems);
    return tbl.node;
  }

  function connectorEndPoint(ce) {
//    var nameRectElem = ce.table.node.items[0];
    var box = ce.table.nameBox,
        cew = ConnectorEndLen * ConnectorWidthRatio,
        cem = ConnectorEndLen * ConnectorMarginRatio,
        x, y;
    switch (ce.side) {
    case 'top':
      x = box.x + ConnectorEndFirstOffset + ce.index * (cew + cem);
      y = box.y;
      break;
    case 'bottom':
      x = box.x + ConnectorEndFirstOffset + ce.index * (cew + cem);
      y = box.y + box.height;
      break;
    case 'left':
      x = box.x;
      var c = ce.table.connectorEnds[ce.side].length,
          wtotal = cew * c + cem * (c - 1);
      y = box.y + box.height / 2 - wtotal / 2 + ce.index * (cew + cem) + cew / 2;
      break;
    }
    return {x: x, y: y};
  }

  function connector(model) {
    var paper = this;
    var elems = $.map(model.ends, function(ce) {
      var ep = ce.endPoint = connectorEndPoint(ce),
          sp;
      switch (ce.side) {
      case 'top':
        sp = {x: ep.x, y: ep.y - ConnectorEndLen};
        break;
      case 'bottom':
        sp = {x: ep.x, y: ep.y + ConnectorEndLen};
        break;
      case 'left':
        sp = {x: ep.x - ConnectorEndLen, y: ep.y};
        break;
      }
      ce.startPoint = sp;
      return connectorEnd.call(paper, sp.x, sp.y, ep.x, ep.y, ce.type);
    });

    var end0 = model.ends[0],
        end1 = model.ends[1],
        p0 = end0.startPoint,
        p1 = end1.startPoint,
        r = ConnectorEndLen,
        path;
    switch (end0.side) {
    case 'top':
      switch (end1.side) {
      case 'top':
        break;
      case 'bottom':
        break;
      case 'left':
        path = this.path([["M", p0.x, p0.y],
            ["L", p0.x, p1.y + r],
            ["A", r, r, 0, 0, 1, p0.x + r, p1.y],
            ["L", p1.x, p1.y]]);
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
        path = this.path([["M", p0.x, p0.y],
            ["L", p0.x, p1.y - r],
            ["A", r, r, 0, 0, 0, p0.x + r, p1.y],
            ["L", p1.x, p1.y]]);
        break;
      }
      break;
    case 'left':
      break;
    }

    return this.set(elems);
  }

  function connectorEnd(x1, y1, xe, ye, type) {
    var line = this.path([["M", x1, y1], ["L", xe, ye]]);
    if (type == 'ref') {
      line.attr({"stroke-dasharray": ". "});
    }
    else if (type == 'multi') {
      var dx = xe - x1,
          dy = ye - y1,
          len = Math.sqrt(dx * dx + dy * dy),
          ux = dx / len,
          uy = dy / len,
          cx = x1 + dx * OneConnectorEndPosRatio,
          cy = y1 + dy * OneConnectorEndPosRatio,
          r = len * ConnectorWidthRatio / 2,
          wx = uy * r,
          wy = -ux * r,
          path2 = this.path([["M", xe + wx, ye + wy],
              ["L", cx + wx, cy + wy],
              ["A", r, r, 0, 0, 0, cx - wx, cy - wy],
              ["L", xe - wx, ye - wy]]);
    }
    else if (type == 'one' || type == 'inherit') {
      var dx = xe - x1,
          dy = ye - y1,
          len = Math.sqrt(dx * dx + dy * dy),
          ux = dx / len,
          uy = dy / len,
          cx = x1 + dx * OneConnectorEndPosRatio,
          cy = y1 + dy * OneConnectorEndPosRatio,
          wx = uy * len * ConnectorWidthRatio / 2,
          wy = -ux * len * ConnectorWidthRatio / 2,
          sx = cx + wx,
          sy = cy + wy,
          ex = cx - wx,
          ey = cy - wy,
          line2 = this.path([["M", sx, sy], ["L", ex, ey]]);
      if (type == 'inherit') {
        var r = Math.abs(len * InheritConnectorEndRadiusRatio / 2),
            c = this.circle(x1, y1, r);
        c.attr({fill: c.attr('stroke')});
      }
    }
    else {
      throw "Unsupported type for connetorEnd";
    }
  }

  return {
    table: table,
    connector: connector,
    connectorEnd: connectorEnd
  }
})();
