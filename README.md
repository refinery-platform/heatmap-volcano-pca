# heatmap-volcano-pca

Basic heatmap + scatterplot + PCA visualization.

## Setup
The core of the project is pure, old-fashioned javascript.
Visit [index.html](to see a demonstration).

## Test
On the other hand, NPM is required to run the tests.
At the moment you can run them on the commandline with:
```
$ npm install
$ karma start --single-run --browsers Firefox 
$ node_modules/.bin/eslint {src,test}/*"
```

## Release
```
$ npm version patch
$ git push --follow-tags origin master
```
