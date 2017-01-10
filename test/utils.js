define([],
    function () {

      // TODO: If JSON diffs turn out to be hard to read, could serialize it back to XML before comparison.

      function xml_node_to_json(xml) {
        var json = xml_node_to_json_with_attributes(xml);
        delete json['@attributes'];
        return json;
      }

      // From https://davidwalsh.name/convert-xml-json
      function xml_node_to_json_with_attributes(xml) {

        // Create the return object
        var obj = {};

        if (xml.nodeType == 1) { // element
          // do attributes
          if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
              var attribute = xml.attributes.item(j);
              obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
          }
        } else if (xml.nodeType == 4) { // cdata section
          obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes()) {
          for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof obj[nodeName] == "undefined") {
              obj[nodeName] = xml_node_to_json(item);
            } else {
              if (typeof obj[nodeName].length == "undefined") {
                var old = obj[nodeName];
                obj[nodeName] = [];
                obj[nodeName].push(old);
              }
              if (typeof obj[nodeName] === 'object') {
                obj[nodeName].push(xml_node_to_json(item));
              }
            }
          }
        }
        return obj;
      }

      function xml_string_to_json(xml_string) {
        var node = new DOMParser().parseFromString(xml_string, 'text/xml');
        return xml_node_to_json(node);
      }

      return {
        xml_node_to_json: xml_node_to_json,
        xml_string_to_json: xml_string_to_json
      }
    }
);

