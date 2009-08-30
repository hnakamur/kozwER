var kozw = (function() {
  var def = minj.def,
    configs = minj.configs;

  function Table(settings) {
    def(this, configs(Table.Defaults, settings));
  }
  def(Table, {
    Defaults: {
      name: undefined,
      columns: undefined,
      pkeyColumnCount: 1,
      data: undefined,
      nameFont: "10pt Arial",
      namePadding: 4,
      nameMargin: 4,
      columnNameFont: "10pt Arial",
      columnRowMargin: 4,
      dataFont: "10pt Arial",
      dataRowMargin: 2
    }
  });

  return {
    Table: Table
  };
})();

Raphael.fn.kozw = (function() {
  function table(x, y, tbl) {
    var nameText = this.text(x, y, tbl.name);
    nameText.attr({font: tbl.nameFont, 'text-anchor': 'start'});
    var nameBox = Geom2d.rect.inset(nameText.getBBox(), -tbl.namePadding);
    this.rect(nameBox.x, nameBox.y, nameBox.width, nameBox.height);

    var x1 = nameBox.x + nameBox.width + tbl.nameMargin,
      y1 = nameBox.y + nameBox.height / 2,
      columnTexts = [],
      dataTexts = [];
      columnCount = tbl.columns.length;
    for (var j = 0; j < columnCount; j++) {
      var column = j < columnCount - 1 ? tbl.columns[j] + '、' : tbl.columns[j];
      var text = columnTexts[j] = this.text(x1, y1, column);
      text.attr({font: tbl.columnNameFont, 'text-anchor': 'start'});
      var bbox = text.getBBox(),
        width = bbox.width,
        y2 = y1 + bbox.height + tbl.columnRowMargin;
      for (var i = 0, len = tbl.data.length; i < len; i++) {
        var row = tbl.data[i];
        if (j < row.length) {
          var value = row[j];
          text = this.text(x1, y2, value);
          text.attr({font: tbl.dataFont, 'text-anchor': 'start'});
          dataTexts.push(text);
          bbox = text.getBBox();
          width = Math.max(bbox.width + tbl.dataRowMargin, width);
        }
        y2 += bbox.height + tbl.dataRowMargin;
      }

      x1 += width;
    }
    var pkeyFirstColumnText = columnTexts[0],
      pkeyLastColumnText = columnTexts[tbl.pkeyColumnCount - 1];
    x1 = pkeyFirstColumnText.getBBox().x;
    bbox = pkeyLastColumnText.getBBox();
    x2 = bbox.x + bbox.width;
    y1 = bbox.y + bbox.height;
    var line = this.path().absolutely().moveTo(x1, y1).lineTo(x2, y1);
    return this.set([nameText, nameBox].concat(columnTexts, [line], dataTexts));
  }

  return {
    table: table
  }
})();
