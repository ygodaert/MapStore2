/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../../libs/ajax');
const assign = require('object-assign');
const { getNameParts, getStyleBaseUrl } = require('../../utils/StyleEditorUtils');

var Api = {
    saveStyle: function(geoserverBaseUrl, styleName, body, options) {
        let url = geoserverBaseUrl + "styles/" + encodeURI(styleName);
        let opts = assign({}, options);
        opts.headers = assign({}, opts.headers, {"Content-Type": "application/vnd.ogc.sld+xml"});
        return axios.put(url, body, opts);
    },
    /**
    * Get style code
    * @memberof api.geoserver
    * @param {object} params {baseUrl, styleName, workspace}
    * @param {string} params.baseUrl base url of GeoServer eg: /geoserver/
    * @param {string} params.styleName style name
    * @return {object} GeoServer style object with code params eg: {...otherStyleParams, code: '* { stroke: #ff0000; }'}
    */
    getStyleCodeByName: ({ baseUrl: geoserverBaseUrl, styleName, options, format, token }) => {
        const { name, workspace } = getNameParts(styleName);
        const url = getStyleBaseUrl({ name, workspace, geoserverBaseUrl }) + '?authkey=' + token;
        return axios.get(url, options)
            .then(response => {
                return response.data && response.data.style && response.data.style.filename ?
                    axios.get(getStyleBaseUrl({ workspace, geoserverBaseUrl, fileName: `${response.data.style.name}.${format || response.data.style.format}` }) + '?authkey=' + token).then(({ data: code }) => ({ ...response.data.style, code }))
                    : null;
            });
    }
};

module.exports = Api;
