/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Layers = require('../../../../utils/openlayers/Layers');
var ol = require('openlayers');
var objectAssign = require('object-assign');
const CoordinatesUtils = require('../../../../utils/CoordinatesUtils');
const ProxyUtils = require('../../../../utils/ProxyUtils');
const { isArray, isEqual} = require('lodash');
const SecurityUtils = require('../../../../utils/SecurityUtils');
const mapUtils = require('../../../../utils/MapUtils');

const { getStyleParser, getStyle, isVector } = require('../../../../utils/VectorTileUtils');
const styleParser = getStyleParser('ol');

function wmsToOpenlayersOptions(options) {
    // NOTE: can we use opacity to manage visibility?
    return objectAssign({}, options.baseParams, {
        LAYERS: options.name,
        STYLES: options.style || "",
        FORMAT: options.format || 'image/png',
        TRANSPARENT: options.transparent !== undefined ? options.transparent : true,
        SRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        CRS: CoordinatesUtils.normalizeSRS(options.srs || 'EPSG:3857', options.allowedSRS),
        TILED: options.tiled || false,
        VERSION: options.version || "1.3.0"
    }, options.params || {});
}

function getWMSURLs( urls ) {
    return urls.map((url) => url.split("\?")[0]);
}

// Works with geosolutions proxy
function proxyTileLoadFunction(imageTile, src) {
    var newSrc = src;
    if (ProxyUtils.needProxy(src)) {
        let proxyUrl = ProxyUtils.getProxyUrl();
        newSrc = proxyUrl + encodeURIComponent(src);
    }
    imageTile.getImage().src = newSrc;
}

function addTileLoadFunction(sourceOptions, options) {
    if (options.forceProxy) {
        return objectAssign({}, sourceOptions, { tileLoadFunction: proxyTileLoadFunction });
    }
    return sourceOptions;
}

const applyStyle = (options, layer) => {
    getStyle(options, (data) => {
        const styleFunc = data.format === 'css' ? styleParser.sld : styleParser[data.format] || styleParser.mapstore;
        if (styleFunc) styleFunc({ ...data, styleBody: data.code }, options, layer);
    });
};

function create(options, map) {
    const urls = getWMSURLs(isArray(options.url) ? options.url : [options.url]);
    const queryParameters = wmsToOpenlayersOptions(options) || {};
    urls.forEach(url => SecurityUtils.addAuthenticationParameter(url, queryParameters));
    if (options.singleTile) {
        return new ol.layer.Image({
            extent: map.getView().getProjection().getExtent(),
            opacity: options.opacity !== undefined ? options.opacity : 1,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            source: new ol.source.ImageWMS({
                crossOrigin: "Anonymous",
                url: urls[0],
                params: queryParameters
            })
        });
    }
    const mapSrs = map && map.getView() && map.getView().getProjection() && map.getView().getProjection().getCode() || 'EPSG:3857';
    const extent = ol.proj.get(CoordinatesUtils.normalizeSRS(options.srs || mapSrs, options.allowedSRS)).getExtent();

    const sourceOptions = addTileLoadFunction({
        urls: urls,
        params: queryParameters,
        crossOrigin: "Anonymous",
        tileGrid: new ol.tilegrid.TileGrid({
            extent: extent,
            resolutions: mapUtils.getResolutions(),
            tileSize: options.tileSize ? options.tileSize : 256,
            origin: options.origin ? options.origin : [extent[0], extent[1]]
        })
    }, options);

    const wmsSource = new ol.source.TileWMS({ ...sourceOptions });
    let vectorSource;
    const vectorFormat = isVector(options);
    if (vectorFormat && vectorFormat.name && ol.format[vectorFormat.name]) {
        vectorSource = new ol.source.VectorTile({
            ...sourceOptions,
            format: new ol.format[vectorFormat.name]({
                layerName: '_layer_'
            }),
            tileUrlFunction: (tileCoord, pixelRatio, projection) => wmsSource.tileUrlFunction(tileCoord, pixelRatio, projection)
        });
    }
    const layer = new ol.layer[vectorSource ? 'VectorTile' : 'Tile']({
        opacity: options.opacity !== undefined ? options.opacity : 1,
        visible: options.visibility !== false,
        zIndex: options.zIndex,
        source: vectorSource || wmsSource
    });

    layer.set('map', map);
    if (vectorSource) {
        layer.set('wmsSource', wmsSource);
        applyStyle(options, layer);
    }
    return layer;
}

Layers.registerType('wms', {
    create,
    update: (layer, newOptions, oldOptions) => {
        const newVectorFormat = isVector(newOptions);
        const oldVectorFormat = isVector(oldOptions);
        if (!isEqual(oldVectorFormat, newVectorFormat) || newVectorFormat) {
            if (oldOptions.singleTile !== newOptions.singleTile
                || oldOptions.securityToken !== newOptions.securityToken
                || oldOptions.ratio !== newOptions.ratio
                || !isEqual(oldVectorFormat, newVectorFormat)) {
                return create(newOptions, map);
            } else if (isEqual(oldVectorFormat, newVectorFormat)
                && (oldOptions.style !== newOptions.style
                    || oldOptions._v_ !== newOptions._v_)) {
                applyStyle(newOptions, layer);
            }
        } else if (oldOptions && layer && layer.getSource() && layer.getSource().updateParams) {
            let changed = false;
            if (oldOptions.params && newOptions.params) {
                changed = Object.keys(oldOptions.params).reduce((found, param) => {
                    if (newOptions.params[param] !== oldOptions.params[param]) {
                        return true;
                    }
                    return found;
                }, false);
            } else if (!oldOptions.params && newOptions.params) {
                changed = true;
            }
            let oldParams = wmsToOpenlayersOptions(oldOptions);
            let newParams = wmsToOpenlayersOptions(newOptions);
            changed = changed || ["LAYERS", "STYLES", "FORMAT", "TRANSPARENT", "TILED", "VERSION" ].reduce((found, param) => {
                if (oldParams[param] !== newParams[param]) {
                    return true;
                }
                return found;
            }, false);
            if (oldOptions.srs !== newOptions.srs) {
                const extent = ol.proj.get(CoordinatesUtils.normalizeSRS(newOptions.srs, newOptions.allowedSRS)).getExtent();
                if (newOptions.singleTile) {
                    layer.setExtent(extent);
                } else {
                    layer.getSource().tileGrid = new ol.tilegrid.TileGrid({
                        extent: extent,
                        resolutions: mapUtils.getResolutions(),
                        tileSize: newOptions.tileSize ? newOptions.tileSize : 256,
                        origin: newOptions.origin ? newOptions.origin : [extent[0], extent[1]]
                    });
                }
            }
            if (changed) {
                layer.getSource().updateParams(objectAssign(newParams, newOptions.params));
            }
        }
    }
});
