/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { head, trim, get } = require('lodash');
const url = require('url');
const axios = require('../libs/ajax');
const StyleAPI = require('../api/geoserver/Styles');
const LayersAPI = require('../api/geoserver/Layers');
const { normalizeUrl } = require('./PrintUtils');
const uuidv1 = require('uuid/v1');

const styles = {};
const originalStyles = {};

const VECTOR_FORMAT = [
    {
        formats: ['application/vnd.mapbox-vector-tile'],
        name: 'MVT'
    },
    {
        formats: ['application/json;type=geojson'],
        name: 'GeoJSON'
    }
];
const styleParser = {
    ol: require('./vectortile/olStyleParser')
};

const isVector = ({ format }) => head(VECTOR_FORMAT.filter(vector => vector.formats.indexOf(format) !== -1));
const getStyle = (options, callback = () => { }) => {
    /*const availableStyles = options.availableStyles || [];
    const currenStyle = !options.style
        ? availableStyles[0]
        : head(availableStyles.filter(style => style.name === options.style));
    if (!currenStyle) return callback('');
    const styleName = currenStyle.name;*/

    if (!styles[`${options.url}:${options.name}`]) {
        const normalizedUrl = normalizeUrl(options.url);
        const parsedUrl = url.parse(normalizedUrl);
        const path = parsedUrl.path.split('/')[1];

        LayersAPI.getLayer(`${parsedUrl.protocol}//${parsedUrl.host}/${path}/rest/`, options.name, options).then((layer) => {
            const styleUrl = layer.defaultStyle.href;
            axios.get(styleUrl).then((response) => { 
                const fileName = response.data.style.filename;
                axios.get(styleUrl.substring(0, styleUrl.lastIndexOf('/')) + '/' + fileName + '?authkey=' + options.params.authkey)
                    .then(resp => {
                        const styleObj = { ...response.data.style, code: resp.data};
                        styles[`${options.url}:${options.name}`] = styleObj;
                        callback(styleObj);
                    });
            });
        });
    } else {
        callback(styles[`${options.url}:${options.name}`]);
    }

    return null;
};

const splitCode = (format, styleBody) => {
    if (format === 'sld') {
        const styledLayerDescriptor = sldReader(styleBody);
        const layerNames = sldGetLayerNames(styledLayerDescriptor);
        const splittedCode = styleBody.split('<sld:NamedLayer>')
            .filter((str) => str.indexOf('?xml') === -1)
            .map((str) => trim(str.replace(/\<\/sld\:NamedLayer\>|<\/sld\:StyledLayerDescriptor\>/g, '')));

        return splittedCode.map(code => {
            const layer = head(layerNames.filter((name) => code.indexOf(name) !== -1));
            if (!layer) {
                return null;
            }
            return {
                layer,
                code,
                format
            };
        }).filter(val => val);
    }
    return [];
};

const wrapSplittedStyle = (format, splittedStyles, layerName) => {
    if (format === 'sld') {
        const namedLayers = splittedStyles.reduce((body, { code, layer }) => {
            const str = code.replace(/\<sld\:Name>[\s\S]*?<\/sld\:Name>/g, '');
            return body + `<sld:NamedLayer><sld:Name>${layer}</sld:Name>${str}</sld:NamedLayer>`;
        }, '');
        const xml = `<?xml version="1.0" encoding="ISO-8859-1"?><sld:StyledLayerDescriptor xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0">${namedLayers}</sld:StyledLayerDescriptor>`;
        return xml;
    }
    if (format === 'mbstyle') {
        const allLayers = splittedStyles.reduce((body, { code, layer }) => [...body, ...code.map((ly) => ({ ...ly, id: uuidv1(), source: layerName, 'source-layer': layer }))], '');
        const sprite = get(splittedStyles[0] || {}, 'sprite');
        return {
            version: 8,
            name: layerName,
            ...(sprite ? { sprite } : {}),
            sources: {
                [layerName]: {
                    type: 'vector'
                }
            },
            layers: allLayers
        };
    }
    return '';
};

const getOriginalStyle = (options) => {
    const availableStyles = options.availableStyles || [];
    const currenStyle = !options.style
        ? availableStyles[0]
        : head(availableStyles.filter(style => style.name === options.style));
    const styleName = currenStyle.name;
    return originalStyles[`${options.url}:${styleName}`] || {};
};

const getStyleParser = (type) => styleParser[type] || {};

const isValid = (options, style) => {
    return new Promise((resolve, reject) => {
        try {
            const parser = getStyleParser('ol');
            const styleFunc = style.format === 'css' ? parser.sld : parser[style.format] || parser.mapstore;
            styleFunc({ ...style, styleBody: style.code }, options);
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

const updateStyle = (options, code) => {
    const availableStyles = options.availableStyles || [];
    const currenStyle = !options.style
        ? availableStyles[0]
        : head(availableStyles.filter(style => style.name === options.style));
    const styleName = currenStyle.name;
    styles[`${options.url}:${styleName}`] = code;
};

module.exports = {
    VECTOR_FORMAT,
    getStyleParser,
    isVector,
    getStyle,
    updateStyle,
    isValid,
    getOriginalStyle,
    splitCode,
    wrapSplittedStyle
};
