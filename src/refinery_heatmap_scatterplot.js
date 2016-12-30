/*
 refinery.js knows nothing about any of the visualizations,
 and the visualization AMDs should in turn be agnostic to
 the details of the calling environment, so each visualization
 should have a thin wrapper something like this:
 */
define(['refinery', 'd3', 'heatmap_scatterplot'],
    function (refinery, d3, heatmap_scatterplot) {
      return function () {
        var uuid = refinery.parse_query(window.location.search).uuid;
        refinery.node(uuid).then(function (node) {
          var url = node.relative_file_store_item_url;
          var clustered_url = node.clustered_url;
          var target = d3.select('#target');
          target.append('button')
              .text('Cluster')
              .on('click', function() {
                d3.selectAll('#container *').remove();
                render(clustered_url);
              });
          target.append('div')
              .attr('id', 'container');
          render(url);

          function render(data_url, selector) {
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