/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const url = require('url');
const {endsWith, isString, isArray, random} = require('lodash');

const createWPSUrl = (urlToParse, options) => {
    const parsed = url.parse(urlToParse, true);
    let newPathname = parsed.pathname;
    if (endsWith(parsed.pathname, "wfs") || endsWith(parsed.pathname, "wms")) {
        newPathname = parsed.pathname.replace(/(wms|ows|wfs|wps)$/, "wps");
    }
    return url.format({
        ...parsed,
        search: null,
        pathname: newPathname,
        query: {
            service: "WPS",
            ...options,
            ...parsed.query
        }
    });
};

module.exports = {
    getWPSURL: (urlToParse, options) => {
        if (urlToParse && isString(urlToParse)) {
            return createWPSUrl(urlToParse, options);

        }
        if (isArray(urlToParse)) {
            const randomIndex = random(0, urlToParse.length - 1);
            return createWPSUrl(urlToParse[randomIndex], options);
        }
        return urlToParse;
    }
};
