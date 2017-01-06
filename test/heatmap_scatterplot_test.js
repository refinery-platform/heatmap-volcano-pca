define(['heatmap_scatterplot'], function (chart) {
  describe('matrix_extent', function () {
    var internals = chart().__test__;
    it('works', function () {
      expect(internals.matrix_extent([[-1, 0], [0, 1]])).toEqual([-1, 1]);
    });
  });
});