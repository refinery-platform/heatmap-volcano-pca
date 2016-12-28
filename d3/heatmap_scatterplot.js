define(['d3'],
    function (d3) {
      return function () {
        var width = 300,
            height = 300;

        function heatmap_axes(selection) {
          selection.each(function (matrix, i) {
            var columns = matrix.columns.slice(1); // Skip ID column

            var x_scale = d3.scaleOrdinal(
                d3.range(columns.length)
                    .map(function (i) {
                      return i * width / columns.length
                    })
            ).domain(columns);

            var labels = d3.select(this).append("svg")
                .attr("width", width)
                .attr("height", 50)
                .append("g")
                .attr("transform", "translate(0,50)");

            labels.append("g")
                .call(d3.axisTop().scale(x_scale))
                .attr('text-anchor', 'end');

            labels.selectAll('text').style('transform', 'rotate(90deg)');
            labels.selectAll('line').remove();
            labels.selectAll('path').remove();
          });
        }

        function heatmap_body(selection) {
          selection.each(function (matrix, i) {
            var dx = matrix.columns.length - 1,
                dy = matrix.length;

            var canvas_pixel_width = dx;
            var canvas_pixel_height = d3.min([height, dy]);

            d3.select(this).append("canvas")
                .attr("width", canvas_pixel_width)
                .attr("height", canvas_pixel_height)
                .style("width", width + "px")
                .style("height", height + "px")
                .style("image-rendering",
                    (window.navigator.userAgent && window.navigator.userAgent.match('WebKit'))
                        ? "pixelated" : "-moz-crisp-edges") // TODO: works for my particular browser set
                .call(draw_heatmap);

            function draw_heatmap(canvas) {
              var context = canvas.node().getContext("2d"),
                  image = context.createImageData(dx, height);
              // One canvas pixel for data horizontally,
              // but combine data rows into a single canvas pixel row.

              var data_rows_per_pixel_row = dy / height;
              //console.log('data rows / pixel row', data_rows_per_pixel_row);

              var color = d3.scaleLinear()
                  .domain([-20, 0, 20]) // TODO: Set from data
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
                  var c = d3.rgb(color(mean));
                  image.data[++p] = c.r;
                  image.data[++p] = c.g;
                  image.data[++p] = c.b;
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
          var x_axis_column = matrix.columns[1];
          var y_axis_column = matrix.columns[2];

          var x_extent = d3.extent(matrix, function (row) {
            return +row[x_axis_column]
          });
          var y_extent = d3.extent(matrix, function (row) {
            return +row[y_axis_column]
          });

          var x_scale = d3.scaleLinear()
              .domain(x_extent).nice()
              .range([0, width]);
          var y_scale = d3.scaleLinear()
              .domain(y_extent).nice()
              .range([height, 0]);
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
                .attr("width", width + 50)
                .attr("height", height + 50)
                .style("position", "absolute")
                .append("g")
                .attr("transform", "translate(30,10)");
            svg_axes.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(x_axis);
            svg_axes.append("g")
                .call(y_axis);
          });
        }

        function scatterplot_body(selection) {
          selection.each(function (matrix, i) {
            var scales = scatterplot_scales(matrix);
            d3.select(this).append("canvas")
                .attr("width", width)
                .attr("height", height)
                .style("position", "relative")
                .style("left", "30px")
                .style("top", "10px")
                .style("width", width + "px")
                .style("height", height + "px")
                .style("image-rendering", "-moz-crisp-edges")
                .call(draw_scatterplot);

            function draw_scatterplot(canvas) {
              var context = canvas.node().getContext("2d");
              context.fillStyle = "rgba(0,0,0,1)";
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
                .style("width", width + 'px')
                .style("float", "left")
                .call(heatmap_axes)
                .call(heatmap_body);
            d3.select(this).append("div")
                .style("width", width + 'px')
                .style("float", "left")
                .call(scatterplot_axes)
                .call(scatterplot_body);
          });
        }

        return chart;
      };
    }
);

