define([],
    function () {
      return {
        parse_query: function () {
          // From http://stackoverflow.com/a/8486188
          var query = location.search.substr(1);
          var result = {};
          query.split("&").forEach(function (part) {
            if (!part) return;
            part = part.split("+").join(" ");
            var eq = part.indexOf("=");
            var key = eq > -1 ? part.substr(0, eq) : part;
            var val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : "";
            var from = key.indexOf("[");
            if (from == -1) result[decodeURIComponent(key)] = val;
            else {
              var to = key.indexOf("]");
              var index = decodeURIComponent(key.substring(from + 1, to));
              key = decodeURIComponent(key.substring(0, from));
              if (!result[key]) result[key] = [];
              if (!index) result[key].push(val);
              else result[key][index] = val;
            }
          });
          return result;
        },
        node: function (_uuid) {
          return new Promise(function (resolve, _reject) { /* global Promise */
            var matrix = [['gene', 'cond-a', 'cond-b', 'cond-c', 'cond-d']];
            for (var i = 0; i < 40000; ++i) {
              var a = Math.asin((Math.random() - 0.5) * 2);
              var b = Math.asin((Math.random() - 0.5) * 2);
              var c = 0.5 * a + b + 0.1 * (Math.random() - 0.5);
              var d = a + 0.5 * b + 0.1 * (Math.random() - 0.5);
              matrix.push(["gene-" + i, a, b, c, d]);
            }
            var data_uri = "data:text/tab-separated-values," + encodeURIComponent(
                    matrix.map(function (row) {
                      return row.join("\t")
                    }).join("\n"));
            var clustered_uri = "data:text/tab-separated-values," + encodeURIComponent(
                    [
                        ['gene', 'TODO:', 'Return', 'clustered', 'data!'],
                        ['gene-0', 0, 1, 2, 3],
                        ['gene-1', 1, 2, 3, 4],
                        ['gene-2', 2, 3, 4, 5],
                        ['gene-3', 3, 4, 5, 6],
                    ].map(function (row) {
                      return row.join("\t")
                    }).join("\n"));
            resolve({
              // This is the only one that matters, for now.
              "relative_file_store_item_url": data_uri,
              // This doesn't necessarily come from the same API: Perhaps it is merged into the hash?
              "clustered_url": clustered_uri
            })
          });
        }
      };
    }
);

