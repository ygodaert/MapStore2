/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/openlayers/Layers');
var SecurityUtils = require('../../../../utils/SecurityUtils');
var markerIcon = require('../img/marker-icon.png');
var markerShadow = require('../img/marker-shadow.png');
var ol = require('openlayers');
var url = require('url');

const assign = require('object-assign');
const {isEqual} = require('lodash');

const image = new ol.style.Circle({
  radius: 5,
  fill: null,
  stroke: new ol.style.Stroke({color: 'red', width: 1})
});

const defaultStyles = {
  'Point': [new ol.style.Style({
      image: image
  })],
  'LineString': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'green',
      width: 1
    })
  })],
  'MultiLineString': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'green',
      width: 1
    })
  })],
  'MultiPoint': [new ol.style.Style({
    image: image
  })],
  'MultiPolygon': [new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: 'blue',
        lineDash: [4],
        width: 3
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 255, 0.1)'
    })
  })],
  'Polygon': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'blue',
      lineDash: [4],
      width: 3
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 255, 0.1)'
    })
  })],
  'GeometryCollection': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'magenta',
      width: 2
    }),
    fill: new ol.style.Fill({
      color: 'magenta'
    }),
    image: new ol.style.Circle({
      radius: 10,
      fill: null,
      stroke: new ol.style.Stroke({
        color: 'magenta'
      })
    })
  })],
  'Circle': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'red',
      width: 2
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255,0,0,0.2)'
    })
})],
  'marker': [new ol.style.Style({
    image: new ol.style.Icon(({
      anchor: [14, 41],
      anchorXUnits: 'pixels',
      anchorYUnits: 'pixels',
      src: markerShadow
    }))
}), new ol.style.Style({
    image: new ol.style.Icon(({
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: markerIcon
    }))
    })]
};

var styleFunction = function(feature) {
    return defaultStyles[feature.getGeometry().getType()];
};

var getSource = function(opts) {
    if (opts.wfs) {
        const source = new ol.source.Vector({
            loader: function(extent, resolution, projection) {
                const options = this.get('options');
                const proj = projection.getCode();
                let queryParameters = assign({
                    service: 'WFS',
                    version: '1.0.0',
                    request: 'GetFeature',
                    typeName: options.name,
                    outputFormat: 'application/json',
                    proj: proj
                }, options.params);
                queryParameters.cql_filter += ' AND BBOX(geom,' + extent.join(',') + ')';
                const wfsurl = options.wfs[0] + '/wfs' + url.format({
                    query: queryParameters
                });
                const xhr = new XMLHttpRequest();
                xhr.open('GET', wfsurl);
                const onError = function() {
                    source.removeLoadedExtent(extent);
                };
                xhr.onerror = onError;
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        source.addFeatures(
                            source.getFormat().readFeatures(xhr.responseText));
                    } else {
                        onError();
                    }
                };
                xhr.send();
            },
            strategy: function(extent) {
                return [extent];
            },
            format: new ol.format.GeoJSON()
        });
        source.set('options', opts);
        if (opts.cluster) {
            return new ol.source.Cluster({
                distance: 30,
                source: source
            });
        }
        return source;
    }
    let features;
    let featuresCrs = opts.featuresCrs || 'EPSG:4326';
    let layerCrs = opts.crs || 'EPSG:3857';
    if (opts.features) {
        let featureCollection = opts.features;
        if (Array.isArray(opts.features)) {
            featureCollection = { "type": "FeatureCollection", features: featureCollection };
        }
        features = (new ol.format.GeoJSON()).readFeatures(featureCollection);
        if (featuresCrs !== layerCrs) {
            features.forEach((f) => f.getGeometry().transform(featuresCrs, layerCrs));
        }
    }

    return new ol.source.Vector({
        features: features
    });
};

Layers.registerType('vector', {
    create: (options) => {
        const source = getSource(options);
        let style = options.nativeStyle;
        if (!style && options.style) {
            style = {
                stroke: new ol.style.Stroke( options.style.stroke ? options.style.stroke : {
                    color: 'blue',
                    width: 1
                }),
                fill: new ol.style.Fill(options.style.fill ? options.style.fill : {
                    color: 'blue'
                })
            };

            if (options.style.type === "Point") {
                style = {
                    image: new ol.style.Circle(assign({}, style, {radius: options.style.radius || 5}))
                };
            }

            if (options.style.iconUrl) {
                style = {
                    image: new ol.style.Icon(({
                      anchor: [0.5, 1],
                      anchorXUnits: 'fraction',
                      anchorYUnits: 'fraction',
                      src: options.style.iconUrl
                    }))
                };
            }

            style = new ol.style.Style(style);
        }
        const styleCache = {};
        if (!style && options.cluster) {
            style = function(feature) {
                const size = feature.get('features').length;
                let currentStyle = styleCache[size];
                if (!currentStyle) {
                    currentStyle = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 15,
                            stroke: new ol.style.Stroke({
                                color: '#C64145',
                                opacity: 0.3,
                                width: 5
                            }),
                            fill: new ol.style.Fill({
                                color: '#BA2536'
                            })
                        }),
                        text: new ol.style.Text({
                            text: size.toString(),
                            fill: new ol.style.Fill({
                                color: '#fff'
                            })
                        })
                    });
                    styleCache[size] = currentStyle;
                }
                return currentStyle;
            };
        }

        return new ol.layer.Vector({
            msId: options.id,
            source: source,
            zIndex: options.zIndex,
            style: (options.styleName && !options.overrideOLStyle) ? () => {return defaultStyles[options.styleName]; } : style || styleFunction
        });
    },
    update: (layer, newOptions, oldOptions) => {
        const oldCrs = oldOptions.crs || 'EPSG:3857';
        const newCrs = newOptions.crs || 'EPSG:3857';
        if (newCrs !== oldCrs) {
            layer.getSource().forEachFeature((f) => {
                f.getGeometry().transform(oldCrs, newCrs);
            });
        }
        if (!isEqual(newOptions.params, oldOptions.params)) {
            layer.getSource().set('options', newOptions);
            layer.getSource().clear();
            layer.getSource().refresh();
        }
    },
    render: () => {
        return null;
    }
});
