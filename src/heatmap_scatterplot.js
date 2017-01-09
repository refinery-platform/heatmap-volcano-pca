define(['d3'],
    function (d3) {
      return function () {
        var chart_width = 300,
            chart_height = 300,
            gutter_width = 50,
            header_height = 50,
            x_axis_index = 1,
            y_axis_index = 2,
            x_axis_extent = [null, null],
            y_axis_extent = [null, null];

        function crisp() {
          // TODO: browser sniffing is bad, but this works for my particular browser set
          if (window.navigator.userAgent && window.navigator.userAgent.match('WebKit')) {
            return "pixelated"
          } else {
            return "-moz-crisp-edges"
          }
        }

        function matrix_extent(matrix) {
          // There might be gains here if we can avoid excess array construction.
          function num_extent(row) {
            return d3.extent(d3.values(row).map(function (str) {
              return +str
            }));
          }

          return matrix.reduce(function (extent_acc, row) {
            var row_extent = num_extent(row);
            return [
              d3.min([extent_acc[0], row_extent[0]]),
              d3.max([extent_acc[1], row_extent[1]])
            ];
          }, num_extent(matrix[0]));
        }

        function heatmap_axes(selection) {
          selection.each(function (matrix, i) {
            var columns = matrix.columns.slice(1); // Skip ID column

            var x_scale = d3.scaleOrdinal(
                d3.range(columns.length)
                    .map(function (i) {
                      return i * chart_width / columns.length
                    })
            ).domain(columns);

            var container_node = this;
            var labels = d3.select(container_node).append("svg")
                .attr("width", chart_width)
                .attr("height", header_height)
                .append("g")
                .attr("transform", "translate(0," + header_height + ")");

            labels.append("g")
                .call(d3.axisTop().scale(x_scale))
                .attr('text-anchor', 'end');

            labels.selectAll('text').style('transform', 'rotate(90deg)');
            labels.selectAll('line').remove();
            labels.selectAll('path').remove();

            labels.selectAll('text')
                .each(function (d, i) {
                  if (i == (x_axis_index - 1) || i == (y_axis_index - 1)) {
                    // Currently selected columns are bold...
                    d3.select(this)
                        .style('font-weight', 'bold')
                        .style('cursor', 'default');
                  } else {
                    // all other columns can be clicked on.
                    d3.select(this)
                        .style('cursor', 'pointer')
                        .on('click', function () {
                          if (d3.event.altKey) {
                            x_axis_index = i + 1;
                          } else {
                            y_axis_index = i + 1;
                          }

                          var root = d3.select(container_node.parentNode);
                          root.selectAll('*').remove();
                          root.call(chart); // Though we don't actually need to redraw everything.
                        })
                        .append('title')
                        .text('alt-click to change x-axis');
                  }
                });
          });
        }

        function heatmap_body(selection) {
          selection.each(function (matrix, i) {
            var canvas_pixel_width = matrix.columns.length - 1;
            var canvas_pixel_height = d3.min([chart_height, matrix.length]);

            var row_scale = d3.scaleLinear()
                .domain([0, matrix.length])
                .range([0, canvas_pixel_height]);

            d3.select(this).append("canvas")
                .attr("width", canvas_pixel_width)
                .attr("height", canvas_pixel_height)
                .style("width", chart_width + "px")
                .style("height", chart_height + "px")
                .style("image-rendering", crisp())
                .call(draw_heatmap);

            function draw_heatmap(canvas) {
              var context = canvas.node().getContext("2d"),
                  image = context.createImageData(canvas_pixel_width, chart_height);
              // One canvas pixel for data horizontally,
              // but combine data rows into a single canvas pixel row.

              var data_rows_per_pixel_row = canvas_pixel_height / chart_height;

              var extreme = d3.max(matrix_extent(matrix).map(function (minmax) {
                return Math.abs(minmax)
              }));

              var map_color = d3.scaleLinear()
                  .domain([-extreme, 0, extreme])
                  .range(['blue', 'white', 'red']);

              for (var y = 0, p = -1; y < canvas_pixel_height; ++y) {
                var matrix_y = Math.floor(row_scale.invert(y));
                var row = matrix[matrix_y];
                var x_axis_value = row[matrix.columns[x_axis_index]];
                var y_axis_value = row[matrix.columns[y_axis_index]];
                var brushed = x_axis_value > x_axis_extent[0]
                    && x_axis_value < x_axis_extent[1]
                    && y_axis_value > y_axis_extent[0]
                    && y_axis_value < y_axis_extent[1];

                for (var x = 0; x < canvas_pixel_width; ++x) {
                  // TODO: For larger matrices, values will be sampled. Better to take a mean?
                  var value = row[matrix.columns[x + 1]]; // 0-column is row ID

                  var color = map_color(value);
                  if (brushed) {
                    color = d3.color(color).darker().rgb();
                  }
                  var rgb = d3.rgb(color);
                  image.data[++p] = rgb.r;
                  image.data[++p] = rgb.g;
                  image.data[++p] = rgb.b;
                  image.data[++p] = 255;
                }
              }

              context.putImageData(image, 0, 0);
            }
          });
        }

        function scatterplot_scales(matrix) {
          // TODO: only run this once
          // column-0 is ID
          var x_axis_column = matrix.columns[x_axis_index];
          var y_axis_column = matrix.columns[y_axis_index];

          var x_extent = d3.extent(matrix, function (row) {
            return +row[x_axis_column]
          });
          var y_extent = d3.extent(matrix, function (row) {
            return +row[y_axis_column]
          });

          var x_scale = d3.scaleLinear()
              .domain(x_extent).nice()
              .range([0, chart_width]);
          var y_scale = d3.scaleLinear()
              .domain(y_extent).nice()
              .range([chart_height, 0]);
          return {
            x: x_scale,
            y: y_scale,
            x_column: x_axis_column,
            y_column: y_axis_column
          }
        }

        function scatterplot_axes(selection) {
          selection.each(function (matrix, i) {
            var container_node = this;
            var scales = scatterplot_scales(matrix);

            var x_axis = d3.axisBottom().scale(scales.x);
            var y_axis = d3.axisLeft().scale(scales.y);

            var svg_axes = d3.select(this).append("svg")
            // "2 *" because axes need a little extra room on both ends.
                .attr("width", chart_width + 2 * gutter_width)
                .attr("height", chart_height + 2 * header_height)
                .style("position", "absolute")
                .append("g")
                .attr("transform", "translate(" + gutter_width + "," + header_height + ")");
            svg_axes.append("g")
                .attr("transform", "translate(0," + chart_height + ")")
                .call(x_axis);
            svg_axes.append("g")
                .call(y_axis);
            svg_axes.append("text")
                .attr("transform", "translate(" + chart_width / 2 + "," + (chart_height + header_height * 0.75) + ")")
                .text(matrix.columns[x_axis_index])
                .style("text-anchor", "middle");
            svg_axes.append("text")
                .attr("transform", "translate(" + gutter_width * -0.75 + "," + chart_height / 2 + ") rotate(90)")
                .text(matrix.columns[y_axis_index])
                .style("text-anchor", "middle");
            svg_axes.selectAll('text')
                .style('cursor', 'default');

            var brush = d3.brush()
                .extent([[0, 0], [chart_width, chart_height]])
                .on("end", function () {
                  var x_y_extents = d3.transpose(d3.event.selection);
                  x_axis_extent = x_y_extents[0].map(scales.x.invert);
                  y_axis_extent = x_y_extents[1].map(scales.y.invert).reverse();
                  var root = d3.select(container_node.parentNode);
                  // Normally I would just redraw everything,
                  // but can't figure out how to set the brush position on reload.
                  //root.selectAll('*').remove();
                  //root.call(chart);
                  var heatmap = d3.select(container_node.parentNode).selectAll('.heatmap-container');
                  heatmap.selectAll('canvas').remove();
                  heatmap.call(heatmap_body);
                });
            svg_axes.append("g")
                .attr("class", "brush")
                .call(brush);
          });
        }

        function scatterplot_body(selection) {
          selection.each(function (matrix, i) {
            var scales = scatterplot_scales(matrix);
            d3.select(this).append("canvas")
                .attr("width", chart_width)
                .attr("height", chart_height)
                .style("position", "relative")
                .style("left", gutter_width + "px")
                .style("top", header_height + "px")
                .style("width", chart_width + "px")
                .style("height", chart_height + "px")
                .style("image-rendering", crisp())
                .style("z-index", -1) // beneath axes and brush
                .call(draw_scatterplot);

            function draw_scatterplot(canvas) {
              var context = canvas.node().getContext("2d");
              context.fillStyle = "rgba(0,0,0,0.5)";
              // Use alpha to avoid immediately over-saturating,
              // but it really depends on your data whether this makes sense.
              matrix.forEach(function (row) {
                var x = scales.x(+row[scales.x_column]);
                var y = scales.y(+row[scales.y_column]);
                context.fillRect(x, y, 1, 1);
              })
            }
          });
        }

        function chart(selection) {
          selection.each(function (matrix, i) {
            d3.select(this).append("div")
                .classed('heatmap-container', true)
                .style("width", chart_width + 'px')
                .style("float", "left")
                .call(heatmap_axes)
                .call(heatmap_body);
            d3.select(this).append("div")
                .classed('scatterplot-container', true)
                .style("width", chart_width + 'px')
                .style("float", "left")
                .call(scatterplot_axes)
                .call(scatterplot_body);
          });
        }

        chart.__internals__ = {
          matrix_extent: matrix_extent,
          heatmap_axes: heatmap_axes,
          heatmap_body: heatmap_body,
          scatterplot_axes: scatterplot_axes,
          scatterplot_body: scatterplot_body
        };

        return chart;
      };
    }
);

