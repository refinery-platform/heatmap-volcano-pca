# heatmap-volcano-pca

Basic heatmap + scatterplot + PCA visualization.

## Install
For now this is a demonstration of an old-fashioned stack:
Plain Javascript is used for the visualization, and a Python
CGI for backend.

There are extensive Python dependencies: I suggest installing Anaconda,
and then following the steps in [`.travis.yml`](.travis.yml).

For development:
```
$ python -m CGIHTTPServer 8000
```

There is a [preview](https://refinery-platform.github.io/heatmap-volcano-pca/)
online, but it only exercises the Javascript, not the Python.

## Test
The Python tests and the JS are independent of each other

End-to-end Python tests:
```
$ export PORT=8000 && ( python -m CGIHTTPServer $PORT & python test.py )
```

Javascript tests:
```
$ npm install
$ karma start --single-run --browsers Firefox 
```

Javascript lint:
```
$ node_modules/.bin/eslint {js,test}/* 
```
