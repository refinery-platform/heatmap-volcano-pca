var matrix = Caleydo.d3.parser.parseMatrix(
      [[1, 0,  1, 0,  1, 0],
       [0, 1,  0, 1,  0, 1]], 
      ['gene-1', 'gene-2'],
      ['condition-1', 'condition-2',
       'log-fold-change', 'negative-log-p',
       'component-1', 'component-2']
);

var create = Caleydo.core.multiform.create;
var parse = Caleydo.core.range.parse;

create(
  matrix.view(parse('0:-1,0:2')),
  document.getElementById('vis'),
  {initialVis: 'caleydo-vis-heatmap'}
);

create(
  matrix.view(parse('0:-1,2:4')),
  document.getElementById('vis'),
  {initialVis: 'scatterplot'}
);

create(
  matrix.view(parse('0:-1,4:6')),
  document.getElementById('vis'),
  {initialVis: 'scatterplot'}
);
