function heatmap_scatterplot() {
  function chart(selection) {
    selection.each(function (matrix, i) {


      var width = 300,
          height = 300;

      var dx = matrix.columns.length - 1,
          dy = matrix.length;

      var columns = matrix.columns.slice(1); // Skip ID column

      var x = d3.scaleOrdinal(d3.range(columns.length).map(function (i) {
        return i * width / columns.length
      }))
          .domain(columns);

      var axis = d3.axisTop()
          .scale(x);

      var heatmap_container = d3.select(this)
          .style("width", width + 'px');

      var labels = heatmap_container.append("svg")
          .attr("width", width)
          .attr("height", 50)
          .append("g")
          .attr("transform", "translate(0,50)");

      labels.append("g")
          .call(axis)
          .attr('text-anchor', 'end');

      labels.selectAll('text').style('transform', 'rotate(90deg)');
      labels.selectAll('line').remove();
      labels.selectAll('path').remove();

      var canvas_pixel_width = dx;
      var canvas_pixel_height = d3.min([height, dy]);

      heatmap_container.append("canvas")
          .attr("width", canvas_pixel_width)
          .attr("height", canvas_pixel_height)
          .style("width", width + "px")
          .style("height", height + "px")
          .style("image-rendering", "-moz-crisp-edges")
          .call(draw_image);

      function draw_image(canvas) {
        var context = canvas.node().getContext("2d"),
            image = context.createImageData(dx, height);
        // One canvas pixel for data horizontally,
        // but combine data rows into a single canvas pixel row.

        var data_rows_per_pixel_row = dy / height;
        console.log('data rows / pixel row', data_rows_per_pixel_row);

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

  return chart;
}