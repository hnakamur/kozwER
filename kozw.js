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
      dataRowMargin: 2,
      x: undefined,
      y: undefined
    }
  });
  def(Table.prototype, {
    createDom: function() {
      var dom = this.dom = {};
      var frag = vegu.createFragment();
      var g = vegu.createElement('g');
      frag.appendChild(g);

      var nameText = dom.nameText = vegu.createText(this.name);
      vegu.setAttrs(nameText, {
        x: this.x, y: this.y,
        font: this.nameFont, 'text-anchor': 'start'
      });
      g.appendChild(nameText);

      var nameRect = vegu.createElement('rect');
      g.appendChild(nameRect);

      return frag;
    }
  });

  function ConnectorEnd(table, type, side, index) {
    this.table = table;
    this.type = type;
    this.side = side;
    this.index = index;
  }

  return {
    Table: Table,
    ConnectorEnd: ConnectorEnd
  };
})();

