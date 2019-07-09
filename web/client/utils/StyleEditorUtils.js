/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const { isString } = require('lodash');

/**
 * Utility functions for Share tools.
 * @memberof utils
 */
const StyleEditorUtils = {
    /**
     * Get name and workspace from a goeserver name
     * @param  {string} name function name
     * @return  {object}
     */
    getNameParts(name) {
        const layerPart = isString(name) && name.split(':') || [];
        return {
            workspace: layerPart[1] && layerPart[0],
            name: layerPart[1] || layerPart[0]
        };
    },
    getStyleBaseUrl: ({ geoserverBaseUrl, workspace, name, fileName }) => `${geoserverBaseUrl}rest/${workspace && `workspaces/${workspace}/` || ''}styles/${fileName ? fileName : `${encodeURIComponent(name)}.json`}`
};

module.exports = StyleEditorUtils;
