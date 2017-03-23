#!/usr/bin/env python

from __future__ import print_function
from scipy.cluster.hierarchy import linkage, leaves_list

class Cluster:
    # Good tutorial on hierarchical clustering:
    # https://joernhees.de/blog/2015/08/26/scipy-hierarchical-clustering-and-dendrogram-tutorial/

    def __init__(self, data):
        self.data = data

    def cluster(self):
        Z = linkage(self.data, 'ward')
        return leaves_list(Z).tolist()

if __name__ == "__main__":
    import cgi
    import json
    import cgitb

    cgitb.enable()

    form = cgi.FieldStorage()
    matrix_json = form.getfirst('matrix')
    matrix = json.loads(matrix_json)
    cluster_order = Cluster(matrix).cluster()

    print('Content-type: application/json')
    print()
    print(json.dumps(cluster_order), end='')
