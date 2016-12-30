define([],
    function () {
      return {
        parse_query: function () {
          // TODO
          return {
            uuid: 'mock-uuid',
            vis: 'refinery_heatmap_scatterplot'
          }
        },
        node: function (uuid) {
          return new Promise(function (resolve, _reject) {
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
            resolve({
              "uuid": "0dbf0d3d-6f11-4d14-ba7f-4f7c50e14420",
              "name": "http://stemcellcommons.org/sites/default/files/chipseq/11610/GATA6%20ChIP-seq%20in%20differentiated%20cells%20+%20Caco2%20cell%20input%20DNA.bed",
              "type": "Derived Data File",
              "analysis_uuid": null,
              "subanalysis": null,
              "assay": "Measurement: transcription factor binding site identification; Technology: nucleotide sequencing; Platform: Illumina Genome Analyzer II; File: a_11610.txt",
              "study": "11610: Transcription factor binding during intestinal cell differentiation [TFB]",
              "relative_file_store_item_url": data_uri, // This is the only one that matters, for now.
              "parent_nodes": [
                "ac0cdf9f-abb9-46b1-9b46-27c6be27be05"
              ],
              "child_nodes": [],
              "auxiliary_nodes": [],
              "is_auxiliary_node": false,
              "file_extension": "bed",
              "auxiliary_file_generation_task_state": null,
              "ready_for_igv_detail_view": true,
              "file_uuid": "528120a0-374b-42a4-977c-c25c0608c93b"
            })
          });
        }
      };
    }
);

