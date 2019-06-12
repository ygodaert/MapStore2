/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/openlayers/Layers');
var ol = require('openlayers');


Layers.registerType('graticule', {
    create: (options, map) => {
        let graticule = new ol.Graticule({
          strokeStyle: options.style || new ol.style.Stroke({
            color: 'rgba(255,120,0,0.9)',
            width: 2,
            lineDash: [0.5, 4]
          }),
          showLabels: true,
          latLabelPosition: 0.02,
          lonLabelPosition: 0.07,
          lonLabelFormatter: function(lon) {
            var str = "";
            var l = Math.floor(lon * 100) / 100;
            if (l === 0) {
              str = l;
            } else if (l > 0) {
              str = l + " E";
            } else {
              str = Math.abs(l) + " W";
            }
            return str;
          },
          latLabelFormatter: function(lat) {
            var str = "";
            var l = Math.floor(lat * 100) / 100;
            if (l === 0) {
              str = l;
            } else if (lat > 0) {
              str = l + " N";
            } else {
              str = Math.abs(l) + " S";
            }
            return str;
          }
        });
        graticule.setMap(map);

        return {
            detached: true,
            remove: () => {
                graticule.setMap(null);
            }
        };
    }
});
