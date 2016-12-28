define(['d3'],
    function (d3) {
      return function () {
        var chart_width = 300,
            chart_height = 300,
            gutter_width = 50,
            header_height = 50,
            x_axis_index = 1,
            y_axis_index = 2;

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
                    d3.select(this)
                        .style('font-weight', 'bold')
                        .style('cursor', 'default');
                  } else {
                    d3.select(this)
                        .style('cursor', 'pointer')
                        .on('click',function() {
                          if (i > x_axis_index) {
                            // If the selected column is between the two active ones,
                            // take it as the y, and prefer to keep x stable.
                            y_axis_index = i;
                          } else {
                            x_axis_index = i;
                          }
                          d3.select(container_node.parentNode).selectAll('.scatterplot-container')
                              .call(scatterplot_axes)
                              .call(scatterplot_body);
                        });
                  }
                });
          });
        }

        function heatmap_body(selection) {
          selection.each(function (matrix, i) {
            var dx = matrix.columns.length - 1,
                dy = matrix.length;

            var canvas_pixel_width = dx;
            var canvas_pixel_height = d3.min([chart_height, dy]);

            d3.select(this).append("canvas")
                .attr("width", canvas_pixel_width)
                .attr("height", canvas_pixel_height)
                .style("width", chart_width + "px")
                .style("height", chart_height + "px")
                .style("image-rendering", crisp())
                .call(draw_heatmap);

            function draw_heatmap(canvas) {
              var context = canvas.node().getContext("2d"),
                  image = context.createImageData(dx, chart_height);
              // One canvas pixel for data horizontally,
              // but combine data rows into a single canvas pixel row.

              var data_rows_per_pixel_row = dy / chart_height;

              var extreme = d3.max(matrix_extent(matrix).map(function (minmax) {
                return Math.abs(minmax)
              }));

              var color = d3.scaleLinear()
                  .domain([-extreme, 0, extreme])
                  .range(['blue', 'white', 'red']);

              for (var y = 0, p = -1; y < canvas_pixel_height; ++y) {
                for (var x = 1; x <= dx; ++x) { // 0-column is row ID
                  var mean = d3.mean(d3.range(data_rows_per_pixel_row).map(
                      function (i) {
                        return matrix[y + i][matrix.columns[x]];
                        // TODO: If data_rows_per_pixel_row is not an integer, rows may be double counted
                        // --> Use histogram machinery.
                      }
                  ));
                  var rgb = d3.rgb(color(mean));
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

        return chart;
      };
    }
);

