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
          d3.tsv(url, function (error, matrix) {
            if (error) throw error;
            d3.select("#target")
                .data([matrix])
                .call(heatmap_scatterplot());
          });
        });
      }
    }
);