import unittest
import requests
#import numpy as np
import os


class ClusterAppTestCase(unittest.TestCase):

    # @staticmethod
    # def random_matrix(means, rows):
    #     """Returns a random matrix
    #     where columns are normal distributions around the corresponding element of "means".
    #     """
    #     cols = len(means)
    #     covariance = np.diagflat([1] * cols)
    #     matrix = np.random.multivariate_normal(means, covariance, rows)
    #     return matrix.round(2).tolist()
    #
    # @staticmethod
    # def random_matrix_concat(row_means, rows, cols):
    #     """Returns a concatenated random matrix
    #     where the total number of rows is len(row_means) * rows.
    #     Within each chunk, all values will be normal distributions around the corresponding element of "means"."""
    #     multi = [ClusterAppTestCase.random_matrix([row_mean] * cols, rows)
    #              for row_mean in row_means]
    #     return reduce(lambda x, y: x + y, multi)

    def test_small_matrix(self):
        url = 'http://localhost:{}/cgi-bin/cluster.py?matrix=[[101],[1],[11],[2],[12],[102]]'.format(
            os.environ['PORT']
        )
        response = requests.get(url)
        self.assertEqual(response.text, '[0, 5, 2, 4, 1, 3]')

    # def test_medium_matrix(self):
    #     np.random.seed(1)
    #     cols = 5
    #     rows = 10
    #     combined = ClusterAppTestCase.random_matrix([10] * cols, rows) + \
    #                ClusterAppTestCase.random_matrix([20] * cols, rows)
    #     r = self.app.get('/cluster?matrix=%s' % combined)
    #     permutation = json.loads(r.data)
    #     # The important part is that the two chunks are segregated;
    #     # precise order will be different with different random seed.
    #     self.assertTrue(all([x >= 10 for x in permutation[:10]]))
    #     self.assertTrue(all([x < 10 for x in permutation[-10:]]))
    #     self.assertEqual(permutation, [13, 14, 15, 11, 12, 16, 17, 19, 10, 18, 0, 2, 1, 6, 3, 5, 7, 8, 4, 9])
    #
    # def test_big_matrix(self):
    #     np.random.seed(1)
    #     means = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    #     concat = ClusterAppTestCase.random_matrix_concat(means, 500, 50)
    #     self.assertEqual(len(concat), len(means) * 500)
    #     self.assertEqual(len(concat[0]), 50)
    #     r = self.app.get('/cluster?matrix=%s' % concat)
    #     permutation = json.loads(r.data)
    #     self.assertEqual(len(permutation), len(means) * 500)
    #     # Again, exact ordering of chunks may vary.
    #     self.assertTrue(all([x >= 1000 and x < 1500 for x in permutation[0:500]]))
    #     self.assertTrue(all([x >= 500 and x < 1000 for x in permutation[500:1000]]))
    #     self.assertTrue(all([x >= 0 and x < 500 for x in permutation[1000:1500]]))
    #
    # def test_bigger_matrix(self):
    #     np.random.seed(1)
    #     chunk = 100 # int(os.environ['CHUNK'])
    #     # chunk * 10: user + sys
    #     # 5000: 4
    #     # 10000: 8
    #     # 15000: 15
    #     # 20000: 24
    #     # 30000: 58
    #     # 40000: 116
    #     means = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    #     concat = ClusterAppTestCase.random_matrix_concat(means, chunk, 50)
    #     self.assertEqual(len(concat), len(means) * chunk)
    #     self.assertEqual(len(concat[0]), 50)
    #     r = self.app.get('/cluster?matrix=%s' % concat)
    #     permutation = json.loads(r.data)
    #     self.assertEqual(len(permutation), len(means) * chunk)


if __name__ == '__main__':
    unittest.main()
