requirejs.default_paths({ /* global requirejs */
  "d3": "https://cdnjs.cloudflare.com/ajax/libs/d3/4.4.0/d3.min"
});
define(['refinery', 'd3', 'heatmap_scatterplot'],
    function (refinery, d3, heatmap_scatterplot) {
      return function (query) {
        var uuids = query.uuids;
        if (!uuids) {
          throw new Error('"uuids" param is missing')
        } else if (uuids.length != 1) {
          throw new Error('Expected exactly one "uuids" param, not ' + uuids.length);
        }
        refinery.node(uuids[0]).then(function (node) {
          var url = node.relative_file_store_item_url;
          var clustered_url = node.clustered_url;
          var target = d3.select('body');
          target.append('button')
              .text('Cluster')
              .on('click', function () {
                d3.selectAll('#container *').remove();
                render(clustered_url);
              });
          target.append('div')
              .attr('id', 'container');
          render(url);

          function render(data_url, _selector) {
            d3.tsv(data_url, function (error, matrix) {
              if (error) throw error;
              d3.select('#container')
                  .data([matrix])
                  .call(heatmap_scatterplot());
            });
          }
        });
      }
    }
);