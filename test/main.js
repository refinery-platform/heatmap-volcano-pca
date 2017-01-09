require.config({
  // Karma serves files under /base, and our default is src
  baseUrl: '/base/src',

  paths: {
    test: '../test', // ie, up and over from src
    d3: "https://cdnjs.cloudflare.com/ajax/libs/d3/4.4.0/d3"
  },

  // dynamically load all test files
  deps: Object.keys(window.__karma__.files).filter(function(file) {
    return file.match(/test\.js$/);
  }).map(function(file) {
    return file.replace(/\.js$/g, '');
  }),

  // start test run, once Require.js is done
  callback: window.__karma__.start
});
