var er = (function($) {
  function Table(id) {
    this.id = id;
    this.connectorEnds = {top: [], left: [], bottom: []};
  }
  $.extend(Table.prototype, {
    addConnectorEnd: function(side, type) {
      if (!/top|left|bottom/.test(side)) {
        throw new Error('Invalid side parameter.');
      }
      var endsAtSide = this.connectorEnds[side],
        count = endsAtSide.length,
        ce = new ConnectorEnd(this, type, side, count);
      endsAtSide.push(ce);
      return ce;
    },
    div: function() {
      return $('#' + this.id + ' div');
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
    Margin: 2
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
          var n = 2,
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
    this.end1 = end1;
    this.end2 = end2;
  }
  $.extend(Connector, {
    R: 10
  });
  $.extend(Connector.prototype, {
    draw: function(ctx) {
      this.end1.draw(ctx);
      this.end2.draw(ctx);
      var div1 = this.end1.table.div(),
        rect1 = rectOfElem(div1),
        div2 = this.end2.table.div(),
        rect2 = rectOfElem(div2),
        r = Connector.R,
        x1, y1, x2, y2;
      switch (this.end1.side + ' ' + this.end2.side) {
      case 'bottom left':
        x1 = rect1.x + ConnectorEnd.FirstOffsetRatio * rect1.w;
        y1 = rect1.y + rect1.h +
          cssFloat(div1, 'padding-top') +
          cssFloat(div1, 'padding-bottom') +
          ConnectorEnd.Height;
        x2 = rect2.x - ConnectorEnd.Height;
        y2 = rect2.y + cssFloat(div2, 'padding-top') + 0.5 * rect2.h;
        ctx.beginPath();
//        console.log('x1=' + x1 + '(' + typeof x1 + '), y1=' + y1 + '(' + typeof y1 + ')');
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y2 - r);
        ctx.arc(x1 + r, y2 - r, r, Math.PI, 0.5 * Math.PI, true);
        ctx.lineTo(x2, y2);
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
