var er = (function($) {
  function Table(id, settings) {
    this.id = id;
    $.extend(this, Table.Defaults, settings);
/*
    this.name = config.name;
    this.columns = config.columns;
    this.pkeyColumnCount = config.pkeyColumnCount;
    this.data = config.data;
*/
    this.connectorEnds = {top: [], left: [], bottom: []};
  }
  $.extend(Table, {
    Defaults: {
      pkeyColumnCount: 1,
      nameFont: "10pt Arial",
      namePadding: 4,
      nameMargin: 4,
      columnNameFont: "10pt Arial",
      columnRowMargin: 4,
      dataFont: "10pt Arial",
      dataRowMargin: 2
    }
  });
  $.extend(Table.prototype, {
    generateDivHtml: function() {
      var chunks = [
        '<div class="table" id="', this.id, '">',
        '<div>', this.name, '</div>',
        '<table><thead><tr>'
      ];
      var columnCount = this.columns.length;
      for (var j = 0; j < columnCount; j++) {
        chunks.push(j < this.pkeyColumnCount ? '<th class="key">' : '<th>');
        chunks.push(this.columns[j]);
        if (j < columnCount - 1) {
          chunks.push('、');
        }
        chunks.push('</th>');
      }
      chunks.push('</tr></thead><tbody>');
      for (var i = 0, rowCount = this.data.length; i < rowCount; i++) {
        chunks.push('<tr>');
        var row = this.data[i],
          rowValueCount = row.length;
        for (j = 0; j < columnCount; j++) {
          chunks.push('<td>');
          chunks.push(j < rowValueCount ? row[j] : '&nbsp;');
          chunks.push('</td>');
        }
        chunks.push('</tr>');
      }
      chunks.push('</tbody></table></div>');
      return chunks.join('');
    },
    div: function() {
      return $('#' + this.id + ' div');
    },
    addConnectorEnd: function(type, side, index) {
      if (!/top|left|bottom/.test(side)) {
        throw new Error('Invalid side parameter.');
      }
      var endsAtSide = this.connectorEnds[side],
        count = endsAtSide.length,
        ce = new ConnectorEnd(this, type, side,
          typeof index == 'undefined' ? count : index);
      endsAtSide.push(ce);
      return ce;
    }
  });

  function ConnectorEnd(table, type, side, index) {
    this.table = table;
    this.type = type;
    this.side = side;
    this.index = index;
  }
  $.extend(ConnectorEnd, {
    FirstOffsetRatio: 0.3,
    Width: 8,
    Height: 12,
    Margin: 3
  });
  $.extend(ConnectorEnd.prototype, {
    point: function() {
      var div = this.table.div(),
        rect = rectOfElem(div),
        wm = ConnectorEnd.Width + ConnectorEnd.Margin,
        x, y;
      switch (this.side) {
      case 'top':
        x = rect.x + ConnectorEnd.FirstOffsetRatio * rect.w + this.index * wm;
        y = rect.y;
        break;
      case 'bottom':
        x = rect.x + ConnectorEnd.FirstOffsetRatio * rect.w + this.index * wm;
        y = rect.y + rect.h +
          cssFloat(div, 'padding-top') +
          cssFloat(div, 'padding-bottom');
        break;
      case 'left':
        x = rect.x;
        y = rect.y + cssFloat(div, 'padding-top') + 0.5 * rect.h;
        var c = this.table.connectorEnds[this.side].length,
          wtotal = ConnectorEnd.Width * c + ConnectorEnd.Margin * (c - 1);
        y += wm * this.index + ConnectorEnd.Width / 2 - wtotal / 2;
        break;
      }
      return {x: x, y: y};
    },
    draw: function(ctx) {
      var div = this.table.div(),
        divRect = rectOfElem(div),
        p = this.point(),
        w = ConnectorEnd.Width,
        h = ConnectorEnd.Height;
      switch (this.type) {
      case 'one':
        switch (this.side) {
        case 'bottom':
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + h);
          ctx.moveTo(p.x - w / 2, p.y + h / 2);
          ctx.lineTo(p.x + w / 2, p.y + h / 2);
          ctx.stroke();
          break;
        }
        break;
      case 'multi':
        var r = w / 2;
        switch (this.side) {
        case 'left':
          ctx.beginPath();
          ctx.moveTo(p.x - h, p.y);
          ctx.lineTo(p.x, p.y);
          ctx.moveTo(p.x, p.y - r);
          ctx.lineTo(p.x - h + r, p.y - r);
          ctx.arc(p.x - h + r, p.y, r, -Math.PI / 2, Math.PI / 2, true);
          ctx.lineTo(p.x, p.y + r);
          ctx.stroke();
          break;
        }
        break;
      case 'ref':
        switch (this.side) {
        case 'left':
          ctx.beginPath();
          var n = 3,
              l = h / n;
          for (var i = 0; i < n; i++) {
            var x = p.x - h + i * l;
            ctx.moveTo(x + l / 2, p.y);
            ctx.lineTo(x + l, p.y);
          }
          ctx.stroke();
          break;
        }
        break;
      }
    }
  });

  function Connector(end1, end2) {
    this.ends = [end1, end2];
  }
  $.extend(Connector, {
    R: 10
  });
  $.extend(Connector.prototype, {
    draw: function(ctx) {
      $.each(this.ends, function() {
        this.draw(ctx);
      });
      var pts = $.map(this.ends, function(end) {
        return end.point();
      });
      var r = Connector.R,
        w = ConnectorEnd.Width,
        h = ConnectorEnd.Height,
        x1, y1, x2, y2;
      switch ($.map(this.ends, function(end) {return end.side;}).join(' ')) {
      case 'bottom left':
        x1 = pts[0].x;
        y1 = pts[0].y;
        x2 = pts[1].x;
        y2 = pts[1].y;
        ctx.beginPath();
        ctx.moveTo(x1, y1 + h);
        ctx.lineTo(x1, y2 - r);
        ctx.arc(x1 + r, y2 - r, r, Math.PI, 0.5 * Math.PI, true);
        ctx.lineTo(x2 - h, y2);
        ctx.stroke();
        break;
      default:
        throw new Error('not yet implemented');
      }
    }
  });

  function rectOfElem(elem) {
    var offset = elem.offset();
    return {
      x: offset.left,
      y: offset.top,
      w: elem.width(),
      h: elem.height()
    };
  }
  function cssFloat(elem, attrName) {
    return parseFloat(elem.css(attrName));
  }

  return {
    Table: Table,
    Connector: Connector
  };
})(jQuery);
