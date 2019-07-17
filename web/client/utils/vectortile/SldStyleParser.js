"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xml2js_1 = require("xml2js");
var _isString = require('lodash/isString');
var _isNumber = require('lodash/isNumber');
var _get = require('lodash/get');
var _set = require('lodash/set');
var _isEmpty = require('lodash/isEmpty');
/**
 * This parser can be used with the GeoStyler.
 * It implements the GeoStyler-Style StyleParser interface.
 *
 * @class SldStyleParser
 * @implements StyleParser
 */
var SldStyleParser = /** @class */ (function () {
    function SldStyleParser(opts) {
        this.title = 'SLD Style Parser';
        /**
         * Array of field / property names in a filter, which are casted to numerics
         * while parsing an SLD.
         */
        this._numericFilterFields = [];
        /**
         * Array of field / property names in a filter, which are casted to boolean
         * while parsing an SLD.
         */
        this._boolFilterFields = [];
        /**
         * Flag to tell if all values should be casted automatically
         */
        this._forceCasting = false;
        /**
         * Flag to tell if the generated output SLD will be prettified
         */
        this._prettyOutput = true;
        /**
         * Create a template string from a TextSymbolizer Label element.
         * Due to the non-bidirectional behaviour of xml2js, we cannot
         * recreate any template configuration. The current behaviour is as follows:
         *
         * Literals and Placeholders will be merge alternating, beginning with the property
         * that comes first. If the number of properties between Literals and Placeholders
         * is not equal, the remaining ones will be appended to the end of the template string.
         *
         * Examples:
         * <Label>
         *  <Literal>foo</Literal>
         *  <PropertyName>bar</PropertyName>
         * </Label>
         * --> "foo{{bar}}"
         *
         * <Label>
         *  <PropertyName>bar</PropertyName>
         *  <Literal>foo</Literal>
         * </Label>
         * --> "{{bar}}foo"
         *
         * <Label>
         *  <PropertyName>bar</PropertyName>
         *  <Literal>foo</Literal>
         *  <PropertyName>john</PropertyName>
         * </Label>
         * --> "{{bar}}foo{{john}}"
         *
         * <Label>
         *  <PropertyName>bar</PropertyName>
         *  <PropertyName>john</PropertyName>
         *  <Literal>foo</Literal>
         * </Label>
         * --> "{{bar}}foo{{john}}"
         *
         * <Label>
         *  <PropertyName>bar</PropertyName>
         *  <PropertyName>john</PropertyName>
         *  <PropertyName>doe</PropertyName>
         *  <Literal>foo</Literal>
         * </Label>
         * --> "{{bar}}foo{{john}}{{doe}}"
         *
         */
        this.getTextSymbolizerLabelFromSldSymbolizer = function (sldLabel) {
            var label = '';
            var literals = _get(sldLabel, 'Literal');
            var placeholders = _get(sldLabel, 'PropertyName');
            var literalIsFirst = Object.keys(sldLabel)[0] === 'Literal';
            if (placeholders && placeholders.length > 0) {
                // if placeholders are being used
                // add braces around placeholders
                var placeholdersBraces_1 = placeholders.map(function (plc) { return "{{" + plc + "}}"; });
                if (literals && literals.length > 0) {
                    // if there are placeholders and literals
                    if (literalIsFirst) {
                        // start with literals
                        literals.forEach(function (lit, idx) {
                            label += "" + lit;
                            if (placeholdersBraces_1[idx]) {
                                label += "" + placeholdersBraces_1[idx];
                            }
                        });
                        // if there are more placeholders than literals,
                        // add the remaining placeholders at the end
                        if (placeholdersBraces_1.length > literals.length) {
                            label += placeholdersBraces_1.join('');
                        }
                    }
                    else {
                        // start with placeholders
                        placeholdersBraces_1.forEach(function (plc, idx) {
                            label += "" + plc;
                            if (literals[idx]) {
                                label += "" + literals[idx];
                            }
                        });
                        // if there are more literals than placeholders,
                        // add the remaining literals at the end
                        if (literals.length > placeholdersBraces_1.length) {
                            label += literals.join('');
                        }
                    }
                }
                else {
                    // if there are placeholders but no literals
                    // set curly braces around placeholders and simply join them with no spaces
                    label = placeholdersBraces_1.join('');
                }
            }
            else if (literals && literals.length > 0) {
                // if no placeholders are being used
                // create a simple string
                label = literals.join('');
            }
            return label;
        };
        /**
         * Get the Label from a TextSymbolizer
         */
        this.getSldLabelFromTextSymbolizer = function (template) {
            // prefix indicating that a template is being used
            var prefix = '\\{\\{';
            // suffix indicating that a template is being used
            var suffix = '\\}\\}';
            // RegExp to match all occurences encapsuled between two curly braces
            // including the curly braces
            var regExp = new RegExp(prefix + '.*?' + suffix, 'g');
            var regExpRes = template.match(regExp);
            // check if a template starts with a placeholder or a literal
            var startsWithPlaceholder = template.startsWith('{{');
            // if no template was used, return as fix string
            if (!regExpRes) {
                return [
                    {
                        'ogc:Literal': [template]
                    }
                ];
                // if templates are being used
            }
            else {
                // split the original string at occurences of placeholders
                // the resulting array will be used for the Literal property
                var literalsWEmptyStrings = template.split(regExp);
                var literals_1 = [];
                // remove empty strings
                literalsWEmptyStrings.forEach(function (lit) {
                    if (lit.length !== 0) {
                        literals_1.push(lit);
                    }
                });
                // slice the curly braces of the placeholder matches
                // and use the resulting array for the PropertyName property
                var propertyName = regExpRes.map(function (reg) {
                    return reg.slice(2, reg.length - 2);
                });
                // if template starts with a placeholder, PropertyName must be set first
                // otherwise Literal must be set first.
                if (startsWithPlaceholder) {
                    return [{
                            'ogc:PropertyName': propertyName,
                            'ogc:Literal': literals_1
                        }];
                }
                else {
                    return [{
                            'ogc:Literal': literals_1,
                            'ogc:PropertyName': propertyName
                        }];
                }
            }
        };
        Object.assign(this, opts);
    }
    Object.defineProperty(SldStyleParser.prototype, "numericFilterFields", {
        /**
         * Getter for _numericFilterFields
         * @return {string[]} The numericFilterFields
         */
        get: function () {
            return this._numericFilterFields;
        },
        /**
         * Setter for _numericFilterFields
         * @param {string[]} numericFilterFields The numericFilterFields to set
         */
        set: function (numericFilterFields) {
            this._numericFilterFields = numericFilterFields;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SldStyleParser.prototype, "boolFilterFields", {
        /**
         * Getter for _boolFilterFields
         * @return {string[]} The boolFilterFields
         */
        get: function () {
            return this._boolFilterFields;
        },
        /**
         * Setter for _boolFilterFields
         * @param {string[]} boolFilterFields The boolFilterFields to set
         */
        set: function (boolFilterFields) {
            this._boolFilterFields = boolFilterFields;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SldStyleParser.prototype, "forceCasting", {
        /**
         * Getter for _forceCasting
         * @return {boolean}
         */
        get: function () {
            return this._forceCasting;
        },
        /**
         * Setter for _forceCasting
         * @param {boolean} forceCasting The forceCasting value to set
         */
        set: function (forceCasting) {
            this._forceCasting = forceCasting;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SldStyleParser.prototype, "prettyOutput", {
        /**
         * Getter for _prettyOutput
         * @return {boolean}
         */
        get: function () {
            return this._prettyOutput;
        },
        /**
         * Setter for _prettyOutput
         * @param {boolean} prettyOutput The _prettyOutput value to set
         */
        set: function (prettyOutput) {
            this._prettyOutput = prettyOutput;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the keys of an object where the value is equal to the passed in
     * value.
     *
     * @param {object} object The object to get the key from.
     * @param {any} value The value to get the matching key from.
     * @return {string[]} The matching keys.
     */
    SldStyleParser.keysByValue = function (object, value) {
        return Object.keys(object).filter(function (key) { return object[key] === value; });
    };
    /**
     * The name Processor is passed as an option to the xml2js parser and modifies
     * the tagName. It strips all namespaces from the tags.
     *
     * @param {string} name The originial tagName
     * @return {string} The modified tagName
     */
    SldStyleParser.prototype.tagNameProcessor = function (name) {
        var prefixMatch = new RegExp(/(?!xmlns)^.*:/);
        return name.replace(prefixMatch, '');
    };
    /**
     * Get the name for the Style from the SLD Object. Returns the Title of the UserStyle
     * if defined or the Name of the NamedLayer if defined or an empty string.
     *
     * @param {object} sldObject The SLD object representation (created with xml2js)
     * @return {string} The name to be used for the GeoStyler Style Style
     */
    SldStyleParser.prototype.getStyleNameFromSldObject = function (sldObject) {
        var userStyleTitle = _get(sldObject, 'StyledLayerDescriptor.NamedLayer[0].UserStyle[0].Title[0]');
        var namedLayerName = _get(sldObject, 'StyledLayerDescriptor.NamedLayer[0].Name[0]');
        return userStyleTitle ? userStyleTitle
            : namedLayerName ? namedLayerName : '';
    };
    /**
     * Creates a GeoStyler-Style StrMatchesFunctionFilterr from a SLD strMatches Function.
     *
     * @param {object} sldFilter The SLD Filter
     * @return {Filter} The GeoStyler-Style FunctionFilter
     */
    SldStyleParser.prototype.getStrMatchesFunctionFilterFromSldFilter = function (sldFilter) {
        var propertyName = _get(sldFilter, 'Function[0].PropertyName[0]');
        var literal = _get(sldFilter, 'Function[0].Literal[0]');
        var regex = new RegExp(literal);
        return [
            'FN_strMatches',
            propertyName,
            regex
        ];
    };
    /**
     * Creates a GeoStyler-Style FunctionFilter from a SLD Function.
     *
     * @param {object} sldFilter The SLD Filter
     * @return {Filter} The GeoStyler-Style FunctionFilter
     */
    SldStyleParser.prototype.getFunctionFilterFromSldFilter = function (sldFilter) {
        var functionName = _get(sldFilter, 'Function[0].$.name');
        switch (functionName) {
            case 'strMatches':
                return this.getStrMatchesFunctionFilterFromSldFilter(sldFilter);
            default:
                return this.getStrMatchesFunctionFilterFromSldFilter(sldFilter);
        }
    };
    /**
     * Creates a GeoStyler-Style Filter from a given operator name and the js
     * SLD object representation (created with xml2js) of the SLD Filter.
     *
     * @param {string} sldOperatorName The Name of the SLD Filter Operator
     * @param {object} sldFilter The SLD Filter
     * @return {Filter} The GeoStyler-Style Filter
     */
    SldStyleParser.prototype.getFilterFromOperatorAndComparison = function (sldOperatorName, sldFilter) {
        var _this = this;
        var filter;
        if (Object.keys(SldStyleParser.comparisonMap).includes(sldOperatorName)) {
            var comparisonOperator = SldStyleParser.comparisonMap[sldOperatorName];
            var propertyIsFilter = !!sldFilter.Function;
            var propertyOrFilter = propertyIsFilter
                ? this.getFunctionFilterFromSldFilter(sldFilter)
                : sldFilter.PropertyName[0];
            var value = null;
            if (sldOperatorName !== 'PropertyIsNull') {
                value = sldFilter.Literal[0];
            }
            var shouldParseFloat = this.forceCasting || propertyIsFilter ||
                this.numericFilterFields.indexOf(propertyOrFilter) !== -1;
            if (shouldParseFloat && !Number.isNaN(parseFloat(value))) {
                value = parseFloat(value);
            }
            if (_isString(value)) {
                var lowerValue = value.toLowerCase();
                var shouldParseBool = this.forceCasting || propertyIsFilter ||
                    this.boolFilterFields.indexOf(propertyOrFilter) !== -1;
                if (shouldParseBool) {
                    if (lowerValue === 'false') {
                        value = false;
                    }
                    if (lowerValue === 'true') {
                        value = true;
                    }
                }
            }
            filter = [
                comparisonOperator,
                propertyOrFilter,
                value
            ];
        }
        else if (Object.keys(SldStyleParser.combinationMap).includes(sldOperatorName)) {
            var combinationOperator = SldStyleParser.combinationMap[sldOperatorName];
            var filters_1 = [];
            Object.keys(sldFilter).forEach(function (op) {
                if (sldFilter[op].length === 1) {
                    filters_1.push(_this.getFilterFromOperatorAndComparison(op, sldFilter[op][0]));
                }
                else {
                    sldFilter[op].forEach(function (el) {
                        filters_1.push(_this.getFilterFromOperatorAndComparison(op, el));
                    });
                }
            });
            filter = [
                combinationOperator
            ].concat(filters_1);
        }
        else if (Object.keys(SldStyleParser.negationOperatorMap).includes(sldOperatorName)) {
            var negationOperator = SldStyleParser.negationOperatorMap[sldOperatorName];
            var negatedOperator = Object.keys(sldFilter)[0];
            var negatedComparison = sldFilter[negatedOperator][0];
            var negatedFilter = this.getFilterFromOperatorAndComparison(negatedOperator, negatedComparison);
            filter = [
                negationOperator,
                negatedFilter
            ];
        }
        else {
            throw new Error('No Filter detected');
        }
        return filter;
    };
    /**
     * Get the GeoStyler-Style Filter from an SLD Rule.
     *
     * Currently only supports one Filter per Rule.
     *
     * @param {object} sldRule The SLD Rule
     * @return {Filter} The GeoStyler-Style Filter
     */
    SldStyleParser.prototype.getFilterFromRule = function (sldRule) {
        var sldFilters = sldRule.Filter;
        if (!sldFilters) {
            return;
        }
        var sldFilter = sldFilters[0];
        var operator = Object.keys(sldFilter).find(function (key, index) {
            return key !== '$';
        });
        if (!operator) {
            return;
        }
        var comparison = sldFilter[operator][0];
        var filter = this.getFilterFromOperatorAndComparison(operator, comparison);
        return filter;
    };
    /**
     * Get the GeoStyler-Style ScaleDenominator from an SLD Rule.
     *
     * @param {object} sldRule The SLD Rule
     * @return {ScaleDenominator} The GeoStyler-Style ScaleDenominator
     */
    SldStyleParser.prototype.getScaleDenominatorFromRule = function (sldRule) {
        var scaleDenominator = {};
        if (sldRule.MinScaleDenominator) {
            scaleDenominator.min = parseFloat(sldRule.MinScaleDenominator[0]);
        }
        if (sldRule.MaxScaleDenominator) {
            scaleDenominator.max = parseFloat(sldRule.MaxScaleDenominator[0]);
        }
        return (scaleDenominator.min || scaleDenominator.max)
            ? scaleDenominator
            : undefined;
    };
    /**
     * Get the GeoStyler-Style MarkSymbolizer from an SLD Symbolizer
     *
     * @param {object} sldSymbolizer The SLD Symbolizer
     * @return {MarkSymbolizer} The GeoStyler-Style MarkSymbolizer
     */
    SldStyleParser.prototype.getMarkSymbolizerFromSldSymbolizer = function (sldSymbolizer) {
        var wellKnownName = _get(sldSymbolizer, 'Graphic[0].Mark[0].WellKnownName[0]');
        var strokeParams = _get(sldSymbolizer, 'Graphic[0].Mark[0].Stroke[0].CssParameter') || [];
        if (strokeParams.length === 0) {
            strokeParams = _get(sldSymbolizer, 'Graphic[0].Mark[0].Stroke[0].SvgParameter') || [];
        }
        var opacity = _get(sldSymbolizer, 'Graphic[0].Opacity[0]');
        var size = _get(sldSymbolizer, 'Graphic[0].Size[0]');
        var rotation = _get(sldSymbolizer, 'Graphic[0].Rotation[0]');
        var fillParams = _get(sldSymbolizer, 'Graphic[0].Mark[0].Fill[0].CssParameter') || [];
        if (fillParams.length === 0) {
            fillParams = _get(sldSymbolizer, 'Graphic[0].Mark[0].Fill[0].SvgParameter') || [];
        }
        var colorIdx = fillParams.findIndex(function (cssParam) {
            return cssParam.$.name === 'fill';
        });
        var color = _get(sldSymbolizer, 'Graphic[0].Mark[0].Fill[0].CssParameter[' + colorIdx + ']._');
        if (!color) {
            var svg = _get(sldSymbolizer, 'Graphic[0].Mark[0].Fill[0].SvgParameter[' + colorIdx + ']._');
            if (svg) {
                color = svg;
            }
        }
        var markSymbolizer = {
            kind: 'Mark',
        };
        if (opacity) {
            markSymbolizer.opacity = parseFloat(opacity);
        }
        if (color) {
            markSymbolizer.color = color;
        }
        if (rotation) {
            markSymbolizer.rotate = parseFloat(rotation);
        }
        if (size) {
            markSymbolizer.radius = parseFloat(size) / 2;
        }
        if (wellKnownName.indexOf('ttf://') === 0) {
            markSymbolizer.wellKnownName = "Circle";
        } else {
            switch (wellKnownName) {
                case 'circle':
                case 'square':
                case 'triangle':
                case 'star':
                case 'cross':
                case 'x':
                    var wkn = wellKnownName.charAt(0).toUpperCase() + wellKnownName.slice(1);
                    markSymbolizer.wellKnownName = wkn;
                    break;
                case 'shape://vertline':
                case 'shape://horline':
                case 'shape://slash':
                case 'shape://backslash':
                case 'shape://dot':
                case 'shape://plus':
                case 'shape://times':
                case 'shape://oarrow':
                case 'shape://carrow':
                    markSymbolizer.wellKnownName = wellKnownName;
                    break;
                default:
                    throw new Error("MarkSymbolizer cannot be parsed. Unsupported WellKnownName.");
            }
        }
        strokeParams.forEach(function (param) {
            switch (param.$.name) {
                case 'stroke':
                    markSymbolizer.strokeColor = param._;
                    break;
                case 'stroke-width':
                    markSymbolizer.strokeWidth = parseFloat(param._);
                    break;
                case 'stroke-opacity':
                    markSymbolizer.strokeOpacity = parseFloat(param._);
                    break;
                default:
                    break;
            }
        });
        return markSymbolizer;
    };
    /**
     * Get the GeoStyler-Style IconSymbolizer from an SLD Symbolizer
     *
     * @param {object} sldSymbolizer The SLD Symbolizer
     * @return {IconSymbolizer} The GeoStyler-Style IconSymbolizer
     */
    SldStyleParser.prototype.getIconSymbolizerFromSldSymbolizer = function (sldSymbolizer) {
        var onlineResource = _get(sldSymbolizer, 'Graphic[0].ExternalGraphic[0].OnlineResource[0]');
        var iconSymbolizer = {
            kind: 'Icon',
            image: onlineResource.$['xlink:href']
        };
        var opacity = _get(sldSymbolizer, 'Graphic[0].Opacity[0]');
        var size = _get(sldSymbolizer, 'Graphic[0].Size[0]');
        var rotate = _get(sldSymbolizer, 'Graphic[0].Rotation[0]');
        if (opacity) {
            iconSymbolizer.opacity = opacity;
        }
        if (size) {
            iconSymbolizer.size = parseFloat(size);
        }
        if (rotate) {
            iconSymbolizer.rotate = parseFloat(rotate);
        }
        return iconSymbolizer;
    };
    /**
     * Get the GeoStyler-Style PointSymbolizer from an SLD Symbolizer.
     *
     * The opacity of the Symbolizer is taken from the <Graphic>.
     *
     * @param {object} sldSymbolizer The SLD Symbolizer
     * @return {PointSymbolizer} The GeoStyler-Style PointSymbolizer
     */
    SldStyleParser.prototype.getPointSymbolizerFromSldSymbolizer = function (sldSymbolizer) {
        var pointSymbolizer = {};
        var wellKnownName = _get(sldSymbolizer, 'Graphic[0].Mark[0].WellKnownName[0]');
        var externalGraphic = _get(sldSymbolizer, 'Graphic[0].ExternalGraphic[0]');
        if (externalGraphic) {
            pointSymbolizer = this.getIconSymbolizerFromSldSymbolizer(sldSymbolizer);
        }
        else {
            // geoserver does not set a wellKnownName for square explicitly since it is the default value.
            // Therefore, we have to set the wellKnownName to square if no wellKownName is given.
            if (!wellKnownName) {
                _set(sldSymbolizer, 'Graphic[0].Mark[0].WellKnownName[0]', 'square');
            }
            pointSymbolizer = this.getMarkSymbolizerFromSldSymbolizer(sldSymbolizer);
        }
        return pointSymbolizer;
    };
    /**
     * Get the GeoStyler-Style LineSymbolizer from an SLD Symbolizer.
     *
     * Currently only the CssParameters are available.
     *
     * @param {object} sldSymbolizer The SLD Symbolizer
     * @return {LineSymbolizer} The GeoStyler-Style LineSymbolizer
     */
    SldStyleParser.prototype.getLineSymbolizerFromSldSymbolizer = function (sldSymbolizer) {
        var _this = this;
        var lineSymbolizer = {
            kind: 'Line'
        };
        var strokeKeys = Object.keys(_get(sldSymbolizer, 'Stroke[0]')) || [];
        if (strokeKeys.length < 1) {
            throw new Error("LineSymbolizer cannot be parsed. No Stroke detected");
        }
        strokeKeys.forEach(function (strokeKey) {
            switch (strokeKey) {
                case 'CssParameter':
                case 'SvgParameter':
                    var cssParameters = _get(sldSymbolizer, 'Stroke[0].CssParameter') || [];
                    if (cssParameters.length === 0) {
                        cssParameters = _get(sldSymbolizer, 'Stroke[0].SvgParameter') || [];
                    }
                    if (cssParameters.length < 1) {
                        throw new Error("LineSymbolizer can not be parsed. No CssParameters detected.");
                    }
                    cssParameters.forEach(function (cssParameter) {
                        var name = cssParameter.$.name, value = cssParameter._;
                        switch (name) {
                            case 'stroke':
                                lineSymbolizer.color = value;
                                break;
                            case 'stroke-width':
                                lineSymbolizer.width = parseFloat(value);
                                break;
                            case 'stroke-opacity':
                                lineSymbolizer.opacity = parseFloat(value);
                                break;
                            case 'stroke-linejoin':
                                // geostyler-style and ol use 'miter' whereas sld uses 'mitre'
                                if (value === 'mitre') {
                                    lineSymbolizer.join = 'miter';
                                }
                                else {
                                    lineSymbolizer.join = value;
                                }
                                break;
                            case 'stroke-linecap':
                                lineSymbolizer.cap = value;
                                break;
                            case 'stroke-dasharray':
                                var dashStringAsArray = value.split(' ').map(function (a) { return parseFloat(a); });
                                lineSymbolizer.dasharray = dashStringAsArray;
                                break;
                            case 'stroke-dashoffset':
                                lineSymbolizer.dashOffset = parseFloat(value);
                                break;
                            default:
                                break;
                        }
                    });
                    break;
                case 'GraphicStroke':
                    lineSymbolizer.graphicStroke = _this.getPointSymbolizerFromSldSymbolizer(sldSymbolizer.Stroke[0].GraphicStroke[0]);
                    break;
                case 'GraphicFill':
                    lineSymbolizer.graphicFill = _this.getPointSymbolizerFromSldSymbolizer(sldSymbolizer.Stroke[0].GraphicFill[0]);
                    break;
                default:
                    break;
            }
        });
        var perpendicularOffset = _get(sldSymbolizer, 'PerpendicularOffset[0]');
        if (perpendicularOffset !== undefined) {
            lineSymbolizer.perpendicularOffset = Number(perpendicularOffset);
        }
        return lineSymbolizer;
    };
    /**
     * Get the GeoStyler-Style FillSymbolizer from an SLD Symbolizer.
     *
     * PolygonSymbolizer Stroke is just partially supported.
     *
     * @param {object} sldSymbolizer The SLD Symbolizer
     * @return {FillSymbolizer} The GeoStyler-Style FillSymbolizer
     */
    SldStyleParser.prototype.getFillSymbolizerFromSldSymbolizer = function (sldSymbolizer) {
        var fillSymbolizer = {
            kind: 'Fill'
        };
        var fillCssParameters = _get(sldSymbolizer, 'Fill[0].CssParameter') || [];
        if (fillCssParameters.length === 0) {
            fillCssParameters = _get(sldSymbolizer, 'Fill[0].SvgParameter') || [];
        }
        var strokeCssParameters = _get(sldSymbolizer, 'Stroke[0].CssParameter') || [];
        if (strokeCssParameters.length === 0) {
            strokeCssParameters = _get(sldSymbolizer, 'Stroke[0].SvgParameter') || [];
        }
        var graphicFill = _get(sldSymbolizer, 'Fill[0].GraphicFill[0]');
        if (graphicFill) {
            fillSymbolizer.graphicFill = this.getPointSymbolizerFromSldSymbolizer(graphicFill);
        }
        fillCssParameters.forEach(function (cssParameter) {
            var name = cssParameter.$.name, value = cssParameter._;
            switch (name) {
                case 'fill':
                    fillSymbolizer.color = value;
                    break;
                case 'fill-opacity':
                    fillSymbolizer.opacity = parseFloat(value);
                    break;
                default:
                    break;
            }
        });
        if (!fillSymbolizer.color) {
            fillSymbolizer.opacity = 0;
        }
        strokeCssParameters.forEach(function (cssParameter) {
            var name = cssParameter.$.name, value = cssParameter._;
            if (name === 'stroke') {
                fillSymbolizer.outlineColor = value;
            }
            else if (name === 'stroke-width') {
                fillSymbolizer.outlineWidth = parseFloat(value);
            }
            else if (name === 'stroke-dasharray') {
                var outlineDasharrayStr = value.split(' ');
                var outlineDasharray_1 = [];
                outlineDasharrayStr.forEach(function (dashStr) {
                    outlineDasharray_1.push(parseFloat(dashStr));
                });
                fillSymbolizer.outlineDasharray = outlineDasharray_1;
            }
        });
        return fillSymbolizer;
    };
    /**
     * Get the GeoStyler-Style ColorMap from a SLD ColorMap.
     *
     * @param {object} sldColorMap The SLD ColorMap
     */
    SldStyleParser.prototype.getColorMapFromSldColorMap = function (sldColorMap) {
        var colorMap = {};
        var type = _get(sldColorMap, '$.type');
        if (type) {
            colorMap.type = type;
        }
        else {
            colorMap.type = 'ramp';
        }
        var extended = _get(sldColorMap, '$.extended');
        if (extended) {
            if (extended === 'true') {
                colorMap.extended = true;
            }
            else {
                colorMap.extended = false;
            }
        }
        var colorMapEntries = _get(sldColorMap, 'ColorMapEntry');
        if (Array.isArray(colorMapEntries)) {
            var cmEntries = colorMapEntries.map(function (cm) {
                var color = _get(cm, '$.color');
                if (!color) {
                    throw new Error("Cannot parse ColorMapEntries. color is undefined.");
                }
                var quantity = _get(cm, '$.quantity');
                if (quantity) {
                    quantity = parseFloat(quantity);
                }
                var label = _get(cm, '$.label');
                var opacity = _get(cm, '$.opacity');
                if (opacity) {
                    opacity = parseFloat(opacity);
                }
                return {
                    color: color,
                    quantity: quantity,
                    label: label,
                    opacity: opacity
                };
            });
            colorMap.colorMapEntries = cmEntries;
        }
        return colorMap;
    };
    /**
     * Get the GeoStyler-Style ContrastEnhancement from a SLD ContrastEnhancement.
     *
     * @param {object} sldContrastEnhancement The SLD ContrastEnhancement
     */
    SldStyleParser.prototype.getContrastEnhancementFromSldContrastEnhancement = function (sldContrastEnhancement) {
        var contrastEnhancement = {};
        // parse enhancementType
        var hasHistogram = typeof sldContrastEnhancement.Histogram !== 'undefined';
        var hasNormalize = typeof sldContrastEnhancement.Normalize !== 'undefined';
        if (hasHistogram && hasNormalize) {
            throw new Error("Cannot parse ContrastEnhancement. Histogram and Normalize\n      are mutually exclusive.");
        }
        else if (hasHistogram) {
            contrastEnhancement.enhancementType = 'histogram';
        }
        else if (hasNormalize) {
            contrastEnhancement.enhancementType = 'normalize';
        }
        // parse gammavalue
        var gammaValue = _get(sldContrastEnhancement, 'GammaValue[0]');
        if (gammaValue) {
            gammaValue = parseFloat(gammaValue);
        }
        contrastEnhancement.gammaValue = gammaValue;
        return contrastEnhancement;
    };
    /**
     * Get the GeoStyler-Style Channel from a SLD Channel.
     *
     * @param {object} sldChannel The SLD Channel
     */
    SldStyleParser.prototype.getChannelFromSldChannel = function (sldChannel) {
        var channel = {
            sourceChannelName: _get(sldChannel, 'SourceChannelName[0]'),
        };
        var contrastEnhancement = _get(sldChannel, 'ContrastEnhancement[0]');
        if (contrastEnhancement) {
            channel.contrastEnhancement = this.getContrastEnhancementFromSldContrastEnhancement(contrastEnhancement);
        }
        return channel;
    };
    /**
     * Get the GeoStyler-Style ChannelSelection from a SLD ChannelSelection.
     *
     * @param {object} sldChannelSelection The SLD ChannelSelection
     */
    SldStyleParser.prototype.getChannelSelectionFromSldChannelSelection = function (sldChannelSelection) {
        var channelSelection;
        var red = _get(sldChannelSelection, 'RedChannel[0]');
        var blue = _get(sldChannelSelection, 'BlueChannel[0]');
        var green = _get(sldChannelSelection, 'GreenChannel[0]');
        var gray = _get(sldChannelSelection, 'GrayChannel[0]');
        if (gray && red && blue && green) {
            throw new Error("Cannot parse ChannelSelection. RGB and Grayscale are mutually exclusive");
        }
        if (gray) {
            var grayChannel = this.getChannelFromSldChannel(gray);
            channelSelection = {
                grayChannel: grayChannel
            };
        }
        else if (red && green && blue) {
            var redChannel = this.getChannelFromSldChannel(red);
            var blueChannel = this.getChannelFromSldChannel(blue);
            var greenChannel = this.getChannelFromSldChannel(green);
            channelSelection = {
                redChannel: redChannel,
                blueChannel: blueChannel,
                greenChannel: greenChannel
            };
        }
        else {
            throw new Error("Cannot parse ChannelSelection. Red, Green and Blue channels must be defined.");
        }
        return channelSelection;
    };
    /**
     * Get the GeoStyler-Style RasterSymbolizer from a SLD Symbolizer.
     *
     * @param {object} sldSymbolizer The SLD Symbolizer
     */
    SldStyleParser.prototype.getRasterSymbolizerFromSldSymbolizer = function (sldSymbolizer) {
        var rasterSymbolizer = {
            kind: 'Raster'
        };
        // parse Opacity
        var opacity = _get(sldSymbolizer, 'Opacity[0]');
        if (opacity) {
            opacity = parseFloat(opacity);
            rasterSymbolizer.opacity = opacity;
        }
        // parse ColorMap
        var sldColorMap = _get(sldSymbolizer, 'ColorMap') || [];
        if (sldColorMap.length > 0) {
            var colormap = this.getColorMapFromSldColorMap(sldColorMap[0]);
            rasterSymbolizer.colorMap = colormap;
        }
        // parse ChannelSelection
        var sldChannelSelection = _get(sldSymbolizer, 'ChannelSelection') || [];
        if (sldChannelSelection.length > 0) {
            var channelSelection = this.getChannelSelectionFromSldChannelSelection(sldChannelSelection[0]);
            rasterSymbolizer.channelSelection = channelSelection;
        }
        // parse ContrastEnhancement
        var sldContrastEnhancement = _get(sldSymbolizer, 'ContrastEnhancement') || [];
        if (sldContrastEnhancement.length > 0) {
            var contrastEnhancement = this.getContrastEnhancementFromSldContrastEnhancement(sldContrastEnhancement[0]);
            rasterSymbolizer.contrastEnhancement = contrastEnhancement;
        }
        return rasterSymbolizer;
    };
    /**
     * Get the GeoStyler-Style TextSymbolizer from an SLD Symbolizer.
     *
     * @param {object} sldSymbolizer The SLD Symbolizer
     * @return {TextSymbolizer} The GeoStyler-Style TextSymbolizer
     */
    SldStyleParser.prototype.getTextSymbolizerFromSldSymbolizer = function (sldSymbolizer) {
        var textSymbolizer = {
            kind: 'Text'
        };
        var fontCssParameters = _get(sldSymbolizer, 'Font[0].CssParameter') || [];
        if (fontCssParameters.length === 0) {
            fontCssParameters = _get(sldSymbolizer, 'Font[0].SvgParameter') || [];
        }
        var label = _get(sldSymbolizer, 'Label[0]');
        if (label) {
            textSymbolizer.label = this.getTextSymbolizerLabelFromSldSymbolizer(label);
        }
        var color = _get(sldSymbolizer, 'Fill[0].CssParameter[0]._');
        if (!color) {
            color = _get(sldSymbolizer, 'Fill[0].SvgParameter[0]._');
        }
        var haloColorCssParameter = _get(sldSymbolizer, 'Halo[0].Fill[0].CssParameter') || [];
        if (haloColorCssParameter.length === 0) {
            haloColorCssParameter = _get(sldSymbolizer, 'Halo[0].Fill[0].SvgParameter') || [];
        }
        var haloRadius = _get(sldSymbolizer, 'Halo[0].Radius[0]');
        if (color) {
            textSymbolizer.color = color;
        }
        if (haloRadius) {
            textSymbolizer.haloWidth = parseFloat(haloRadius);
        }
        haloColorCssParameter.forEach(function (cssParameter) {
            var name = cssParameter.$.name, value = cssParameter._;
            switch (name) {
                case 'fill':
                    textSymbolizer.haloColor = value;
                    break;
                case 'fill-opacity':
                default:
                    break;
            }
        });
        var displacement = _get(sldSymbolizer, 'LabelPlacement[0].PointPlacement[0].Displacement[0]');
        if (displacement) {
            var x = displacement.DisplacementX[0];
            var y = displacement.DisplacementY[0];
            textSymbolizer.offset = [
                x ? parseFloat(x) : 0,
                y ? parseFloat(y) : 0,
            ];
        }
        var rotation = _get(sldSymbolizer, 'LabelPlacement[0].PointPlacement[0].Rotation[0]');
        if (rotation) {
            textSymbolizer.rotate = parseFloat(rotation);
        }
        fontCssParameters.forEach(function (cssParameter) {
            var name = cssParameter.$.name, value = cssParameter._;
            switch (name) {
                case 'font-family':
                    textSymbolizer.font = [value];
                    break;
                case 'font-style':
                    textSymbolizer.fontStyle = value;
                    break;
                case 'font-weight':
                    textSymbolizer.fontWeight = value;
                    break;
                case 'font-size':
                    textSymbolizer.size = parseFloat(value);
                    break;
                default:
                    break;
            }
        });
        return textSymbolizer;
    };
    /**
     * Get the GeoStyler-Style Symbolizers from an SLD Rule.
     *
     * @param {object} sldRule The SLD Rule
     * @return {Symbolizer[]} The GeoStyler-Style Symbolizer Array
     */
    SldStyleParser.prototype.getSymbolizersFromRule = function (sldRule) {
        var _this = this;
        var symbolizers = [];
        var symbolizerNames = Object.keys(sldRule).filter(function (key) { return key.endsWith('Symbolizer'); });
        symbolizerNames.forEach(function (sldSymbolizerName) {
            sldRule[sldSymbolizerName].forEach(function (sldSymbolizer) {
                var symbolizer;
                switch (sldSymbolizerName) {
                    case 'PointSymbolizer':
                        symbolizer = _this.getPointSymbolizerFromSldSymbolizer(sldSymbolizer);
                        break;
                    case 'LineSymbolizer':
                        symbolizer = _this.getLineSymbolizerFromSldSymbolizer(sldSymbolizer);
                        break;
                    case 'TextSymbolizer':
                        symbolizer = _this.getTextSymbolizerFromSldSymbolizer(sldSymbolizer);
                        break;
                    case 'PolygonSymbolizer':
                        symbolizer = _this.getFillSymbolizerFromSldSymbolizer(sldSymbolizer);
                        break;
                    case 'RasterSymbolizer':
                        symbolizer = _this.getRasterSymbolizerFromSldSymbolizer(sldSymbolizer);
                        break;
                    default:
                        throw new Error('Failed to parse SymbolizerKind from SldRule');
                }
                symbolizers.push(symbolizer);
            });
        });
        return symbolizers;
    };
    /**
     * Get the GeoStyler-Style Rule from an SLD Object (created with xml2js).
     *
     * @param {object} sldObject The SLD object representation (created with xml2js)
     * @return {Rule} The GeoStyler-Style Rule
     */
    SldStyleParser.prototype.getRulesFromSldObject = function (sldObject) {
        var _this = this;
        var layers = sldObject.StyledLayerDescriptor.NamedLayer;
        var rules = [];
        layers.forEach(function (layer) {
            layer.UserStyle.forEach(function (userStyle) {
                userStyle.FeatureTypeStyle.forEach(function (featureTypeStyle) {
                    featureTypeStyle.Rule.forEach(function (sldRule) {
                        var filter = _this.getFilterFromRule(sldRule);
                        var scaleDenominator = _this.getScaleDenominatorFromRule(sldRule);
                        var symbolizers = _this.getSymbolizersFromRule(sldRule);
                        var name = sldRule.Title ? sldRule.Title[0]
                            : (sldRule.Name ? sldRule.Name[0] : '');
                        var rule = {
                            name: name
                        };
                        if (filter) {
                            rule.filter = filter;
                        }
                        if (scaleDenominator) {
                            rule.scaleDenominator = scaleDenominator;
                        }
                        if (symbolizers) {
                            rule.symbolizers = symbolizers;
                        }
                        rules.push(rule);
                    });
                });
            });
        });
        return rules;
    };
    /**
     * Get the GeoStyler-Style Style from an SLD Object (created with xml2js).
     *
     * @param {object} sldObject The SLD object representation (created with xml2js)
     * @return {Style} The GeoStyler-Style Style
     */
    SldStyleParser.prototype.sldObjectToGeoStylerStyle = function (sldObject) {
        var rules = this.getRulesFromSldObject(sldObject);
        var name = this.getStyleNameFromSldObject(sldObject);
        return {
            name: name,
            rules: rules
        };
    };
    /**
     * The readStyle implementation of the GeoStyler-Style StyleParser interface.
     * It reads a SLD as a string and returns a Promise.
     * The Promise itself resolves with a GeoStyler-Style Style.
     *
     * @param {string} sldString A SLD as a string.
     * @return {Promise} The Promise resolving with the GeoStyler-Style Style
     */
    SldStyleParser.prototype.readStyle = function (sldString) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var options = {
                tagNameProcessors: [_this.tagNameProcessor]
            };
            try {
                xml2js_1.parseString(sldString, options, function (err, result) {
                    if (err) {
                        reject("Error while parsing sldString: " + err);
                    }
                    var geoStylerStyle = _this.sldObjectToGeoStylerStyle(result);
                    resolve(geoStylerStyle);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    };
    /**
     * The writeStyle implementation of the GeoStyler-Style StyleParser interface.
     * It reads a GeoStyler-Style Style and returns a Promise.
     * The Promise itself resolves with a SLD string.
     *
     * @param {Style} geoStylerStyle A GeoStyler-Style Style.
     * @return {Promise} The Promise resolving with the SLD as a string.
     */
    SldStyleParser.prototype.writeStyle = function (geoStylerStyle) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var builderOpts = {
                    renderOpts: { pretty: _this.prettyOutput }
                };
                var builder = new xml2js_1.Builder(builderOpts);
                var sldObject = _this.geoStylerStyleToSldObject(geoStylerStyle);
                var sldString = builder.buildObject(sldObject);
                resolve(sldString);
            }
            catch (error) {
                reject(error);
            }
        });
    };
    /**
     * Get the SLD Object (readable with xml2js) from an GeoStyler-Style Style
     *
     * @param {Style} geoStylerStyle A GeoStyler-Style Style.
     * @return {object} The object representation of a SLD Style (readable with xml2js)
     */
    SldStyleParser.prototype.geoStylerStyleToSldObject = function (geoStylerStyle) {
        var rules = this.getSldRulesFromRules(geoStylerStyle.rules);
        // add the ogc namespace to the filter element, if a filter is present
        rules.forEach(function (rule) {
            if (rule.Filter && !rule.Filter.$) {
                rule.Filter.$ = { 'xmlns': 'http://www.opengis.net/ogc' };
            }
        });
        return {
            StyledLayerDescriptor: {
                '$': {
                    'version': '1.0.0',
                    'xsi:schemaLocation': 'http://www.opengis.net/sld StyledLayerDescriptor.xsd',
                    'xmlns': 'http://www.opengis.net/sld',
                    'xmlns:ogc': 'http://www.opengis.net/ogc',
                    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
                },
                'NamedLayer': [{
                        'Name': [geoStylerStyle.name || ''],
                        'UserStyle': [{
                                'Name': [geoStylerStyle.name || ''],
                                'Title': [geoStylerStyle.name || ''],
                                'FeatureTypeStyle': [{
                                        'Rule': rules
                                    }]
                            }]
                    }]
            }
        };
    };
    /**
     * Get the SLD Object (readable with xml2js) from an GeoStyler-Style Rule.
     *
     * @param {Rule[]} rules An array of GeoStyler-Style Rules.
     * @return {object} The object representation of a SLD Rule (readable with xml2js)
     */
    SldStyleParser.prototype.getSldRulesFromRules = function (rules) {
        var _this = this;
        return rules.map(function (rule) {
            var sldRule = {
                Name: [rule.name]
            };
            if (rule.filter) {
                var filter = _this.getSldFilterFromFilter(rule.filter);
                sldRule.Filter = filter;
            }
            if (rule.scaleDenominator) {
                var _a = rule.scaleDenominator, min = _a.min, max = _a.max;
                if (min && _isNumber(min)) {
                    sldRule.MinScaleDenominator = [min.toString()];
                }
                if (max && _isNumber(max)) {
                    sldRule.MaxScaleDenominator = [max.toString()];
                }
            }
            // Remove empty Symbolizers and check if there is at least 1 symbolizer
            var symbolizers = _this.getSldSymbolizersFromSymbolizers(rule.symbolizers);
            var symbolizerKeys = [];
            if (symbolizers.length > 0) {
                symbolizerKeys = Object.keys(symbolizers[0]);
            }
            symbolizerKeys.forEach(function (key) {
                if (symbolizers[0][key].length === 0) {
                    delete symbolizers[0][key];
                }
            });
            if (symbolizers.length > 0 && Object.keys(symbolizers[0]).length !== 0) {
                sldRule = Object.assign(sldRule, symbolizers[0]);
            }
            return sldRule;
        });
    };
    /**
     * Get the SLD Object (readable with xml2js) from GeoStyler-Style Symbolizers.
     *
     * @param {Symbolizer[]} symbolizers A GeoStyler-Style Symbolizer array.
     * @return {object} The object representation of a SLD Symbolizer (readable with xml2js)
     */
    SldStyleParser.prototype.getSldSymbolizersFromSymbolizers = function (symbolizers) {
        var _this = this;
        var sldSymbolizers = [];
        var sldSymbolizer = {};
        symbolizers.forEach(function (symb) {
            var sldSymb;
            switch (symb.kind) {
                case 'Mark':
                    if (!sldSymbolizer.PointSymbolizer) {
                        sldSymbolizer.PointSymbolizer = [];
                    }
                    sldSymb = _this.getSldPointSymbolizerFromMarkSymbolizer(symb);
                    if (_get(sldSymb, 'PointSymbolizer[0]')) {
                        sldSymbolizer.PointSymbolizer.push(_get(sldSymb, 'PointSymbolizer[0]'));
                    }
                    break;
                case 'Icon':
                    if (!sldSymbolizer.PointSymbolizer) {
                        sldSymbolizer.PointSymbolizer = [];
                    }
                    sldSymb = _this.getSldPointSymbolizerFromIconSymbolizer(symb);
                    if (_get(sldSymb, 'PointSymbolizer[0]')) {
                        sldSymbolizer.PointSymbolizer.push(_get(sldSymb, 'PointSymbolizer[0]'));
                    }
                    break;
                case 'Text':
                    if (!sldSymbolizer.TextSymbolizer) {
                        sldSymbolizer.TextSymbolizer = [];
                    }
                    sldSymb = _this.getSldTextSymbolizerFromTextSymbolizer(symb);
                    if (_get(sldSymb, 'TextSymbolizer[0]')) {
                        sldSymbolizer.TextSymbolizer.push(_get(sldSymb, 'TextSymbolizer[0]'));
                    }
                    break;
                case 'Line':
                    if (!sldSymbolizer.LineSymbolizer) {
                        sldSymbolizer.LineSymbolizer = [];
                    }
                    sldSymb = _this.getSldLineSymbolizerFromLineSymbolizer(symb);
                    if (_get(sldSymb, 'LineSymbolizer[0]')) {
                        sldSymbolizer.LineSymbolizer.push(_get(sldSymb, 'LineSymbolizer[0]'));
                    }
                    break;
                case 'Fill':
                    if (!sldSymbolizer.PolygonSymbolizer) {
                        sldSymbolizer.PolygonSymbolizer = [];
                    }
                    sldSymb = _this.getSldPolygonSymbolizerFromFillSymbolizer(symb);
                    if (_get(sldSymb, 'PolygonSymbolizer[0]')) {
                        sldSymbolizer.PolygonSymbolizer.push(_get(sldSymb, 'PolygonSymbolizer[0]'));
                    }
                    break;
                case 'Raster':
                    if (!sldSymbolizer.RasterSymbolizer) {
                        sldSymbolizer.RasterSymbolizer = [];
                    }
                    sldSymb = _this.getSldRasterSymbolizerFromRasterSymbolizer(symb);
                    if (_get(sldSymb, 'RasterSymbolizer[0]')) {
                        sldSymbolizer.RasterSymbolizer.push(_get(sldSymb, 'RasterSymbolizer[0]'));
                    }
                    break;
                default:
                    break;
            }
            sldSymbolizers.push(sldSymbolizer);
        });
        return sldSymbolizers;
    };
    /**
     * Get the SLD Object (readable with xml2js) from an GeoStyler-Style TextSymbolizer.
     *
     * @param {TextSymbolizer} textSymbolizer A GeoStyler-Style TextSymbolizer.
     * @return {object} The object representation of a SLD TextSymbolizer (readable with xml2js)
     */
    SldStyleParser.prototype.getSldTextSymbolizerFromTextSymbolizer = function (textSymbolizer) {
        var sldTextSymbolizer = [{
                'Label': textSymbolizer.label ? this.getSldLabelFromTextSymbolizer(textSymbolizer.label) : undefined
            }];
        var fontPropertyMap = {
            font: 'font-family',
            size: 'font-size',
            fontStyle: 'font-style',
            fontWeight: 'font-weight'
        };
        var fontCssParameters = Object.keys(textSymbolizer)
            .filter(function (property) { return property !== 'kind' && fontPropertyMap[property]; })
            .map(function (property) {
            return {
                '_': property === 'font'
                    ? textSymbolizer[property][0]
                    : textSymbolizer[property],
                '$': {
                    'name': fontPropertyMap[property]
                }
            };
        });
        if (fontCssParameters.length > 0) {
            sldTextSymbolizer[0].Font = [{
                    'CssParameter': fontCssParameters
                }];
        }
        if (textSymbolizer.offset || textSymbolizer.rotate !== undefined) {
            var pointPlacement = [{}];
            if (textSymbolizer.offset) {
                pointPlacement[0].Displacement = [{
                        'DisplacementX': [
                            textSymbolizer.offset[0].toString()
                        ],
                        'DisplacementY': [
                            textSymbolizer.offset[1].toString()
                        ]
                    }];
            }
            if (textSymbolizer.rotate !== undefined) {
                pointPlacement[0].Rotation = [textSymbolizer.rotate.toString()];
            }
            sldTextSymbolizer[0].LabelPlacement = [{
                    PointPlacement: pointPlacement
                }];
        }
        if (textSymbolizer.color) {
            sldTextSymbolizer[0].Fill = [{
                    'CssParameter': [{
                            '_': textSymbolizer.color,
                            '$': {
                                'name': 'fill'
                            }
                        }]
                }];
        }
        if (textSymbolizer.haloWidth || textSymbolizer.haloColor) {
            var halo = {};
            var haloCssParameter = [];
            if (textSymbolizer.haloWidth) {
                halo.Radius = [textSymbolizer.haloWidth.toString()];
            }
            if (textSymbolizer.haloColor) {
                haloCssParameter.push({
                    '_': textSymbolizer.haloColor,
                    '$': {
                        'name': 'fill'
                    }
                });
            }
            if (haloCssParameter.length > 0) {
                halo.Fill = [{
                        CssParameter: haloCssParameter
                    }];
            }
            sldTextSymbolizer[0].Halo = [halo];
        }
        return {
            'TextSymbolizer': sldTextSymbolizer
        };
    };
    /**
     * Get the SLD Object (readable with xml2js) from an GeoStyler-Style FillSymbolizer.
     *
     * @param {FillSymbolizer} fillSymbolizer A GeoStyler-Style FillSymbolizer.
     * @return {object} The object representation of a SLD PolygonSymbolizer (readable with xml2js)
     */
    SldStyleParser.prototype.getSldPolygonSymbolizerFromFillSymbolizer = function (fillSymbolizer) {
        var strokePropertyMap = {
            outlineColor: 'stroke',
            outlineWidth: 'stroke-width',
            outlineDasharray: 'stroke-dasharray'
        };
        var fillPropertyMap = {
            color: 'fill',
            opacity: 'fill-opacity'
        };
        var strokeCssParameters = [];
        var fillCssParameters = [];
        var graphicFill;
        if (_get(fillSymbolizer, 'graphicFill')) {
            if (_get(fillSymbolizer, 'graphicFill.kind') === 'Mark') {
                graphicFill = this.getSldPointSymbolizerFromMarkSymbolizer(fillSymbolizer.graphicFill);
            }
            else if (_get(fillSymbolizer, 'graphicFill.kind') === 'Icon') {
                graphicFill = this.getSldPointSymbolizerFromIconSymbolizer(fillSymbolizer.graphicFill);
            }
        }
        Object.keys(fillSymbolizer)
            .filter(function (property) { return property !== 'kind'; })
            .filter(function (property) { return fillSymbolizer[property] !== undefined && fillSymbolizer[property] !== null; })
            .forEach(function (property) {
            if (Object.keys(fillPropertyMap).includes(property)) {
                fillCssParameters.push({
                    '_': fillSymbolizer[property],
                    '$': {
                        'name': fillPropertyMap[property]
                    }
                });
            }
            else if (Object.keys(strokePropertyMap).includes(property)) {
                var transformedValue_1 = '';
                if (property === 'outlineDasharray') {
                    var paramValue_1 = fillSymbolizer[property];
                    transformedValue_1 = '';
                    paramValue_1.forEach(function (dash, idx) {
                        transformedValue_1 += dash;
                        if (idx < paramValue_1.length - 1) {
                            transformedValue_1 += ' ';
                        }
                    });
                }
                else if (property === 'outlineWidth') {
                    transformedValue_1 = fillSymbolizer[property] + '';
                }
                else {
                    transformedValue_1 = fillSymbolizer[property];
                }
                strokeCssParameters.push({
                    '_': transformedValue_1,
                    '$': {
                        'name': strokePropertyMap[property]
                    }
                });
            }
        });
        var polygonSymbolizer = [{}];
        if (fillCssParameters.length > 0 || graphicFill) {
            polygonSymbolizer[0].Fill = [{}];
            if (graphicFill) {
                polygonSymbolizer[0].Fill[0].GraphicFill = [graphicFill.PointSymbolizer[0]];
            }
            if (fillCssParameters.length > 0) {
                polygonSymbolizer[0].Fill[0].CssParameter = fillCssParameters;
            }
        }
        if (strokeCssParameters.length > 0) {
            polygonSymbolizer[0].Stroke = [{
                    'CssParameter': strokeCssParameters
                }];
        }
        return {
            'PolygonSymbolizer': polygonSymbolizer
        };
    };
    /**
     * Get the SLD Object (readable with xml2js) from an GeoStyler-Style LineSymbolizer.
     *
     * @param {LineSymbolizer} lineSymbolizer A GeoStyler-Style LineSymbolizer.
     * @return {object} The object representation of a SLD LineSymbolizer (readable with xml2js)
     */
    SldStyleParser.prototype.getSldLineSymbolizerFromLineSymbolizer = function (lineSymbolizer) {
        var propertyMap = {
            color: 'stroke',
            width: 'stroke-width',
            opacity: 'stroke-opacity',
            join: 'stroke-linejoin',
            cap: 'stroke-linecap',
            dasharray: 'stroke-dasharray',
            dashOffset: 'stroke-dashoffset'
        };
        var result = {
            'LineSymbolizer': [{
                    'Stroke': [{}]
                }]
        };
        var cssParameters = Object.keys(lineSymbolizer)
            .filter(function (property) { return property !== 'kind' && propertyMap[property] &&
            lineSymbolizer[property] !== undefined && lineSymbolizer[property] !== null; })
            .map(function (property) {
            var value = lineSymbolizer[property];
            if (property === 'dasharray') {
                value = lineSymbolizer.dasharray ? lineSymbolizer.dasharray.join(' ') : undefined;
            }
            // simple transformation since geostyler-style uses prop 'miter' whereas sld uses 'mitre'
            if (property === 'join' && value === 'miter') {
                value = 'mitre';
            }
            return {
                '_': value,
                '$': {
                    'name': propertyMap[property]
                }
            };
        });
        var perpendicularOffset = lineSymbolizer.perpendicularOffset;
        if (_get(lineSymbolizer, 'graphicStroke')) {
            if (_get(lineSymbolizer, 'graphicStroke.kind') === 'Mark') {
                var graphicStroke = this.getSldPointSymbolizerFromMarkSymbolizer(lineSymbolizer.graphicStroke);
                result.LineSymbolizer[0].Stroke[0].GraphicStroke = [graphicStroke.PointSymbolizer[0]];
            }
            else if (_get(lineSymbolizer, 'graphicStroke.kind') === 'Icon') {
                var graphicStroke = this.getSldPointSymbolizerFromIconSymbolizer(lineSymbolizer.graphicStroke);
                result.LineSymbolizer[0].Stroke[0].GraphicStroke = [graphicStroke.PointSymbolizer[0]];
            }
        }
        if (_get(lineSymbolizer, 'graphicFill')) {
            if (_get(lineSymbolizer, 'graphicFill.kind') === 'Mark') {
                var graphicFill = this.getSldPointSymbolizerFromMarkSymbolizer(lineSymbolizer.graphicFill);
                result.LineSymbolizer[0].Stroke[0].GraphicFill = [graphicFill.PointSymbolizer[0]];
            }
            else if (_get(lineSymbolizer, 'graphicFill.kind') === 'Icon') {
                var graphicFill = this.getSldPointSymbolizerFromIconSymbolizer(lineSymbolizer.graphicFill);
                result.LineSymbolizer[0].Stroke[0].GraphicFill = [graphicFill.PointSymbolizer[0]];
            }
        }
        if (cssParameters.length !== 0) {
            result.LineSymbolizer[0].Stroke[0].CssParameter = cssParameters;
        }
        if (perpendicularOffset) {
            result.LineSymbolizer[0].PerpendicularOffset = [perpendicularOffset];
        }
        return result;
    };
    /**
     * Get the SLD Object (readable with xml2js) from an GeoStyler-Style MarkSymbolizer.
     *
     * @param {MarkSymbolizer} markSymbolizer A GeoStyler-Style MarkSymbolizer.
     * @return {object} The object representation of a SLD PointSymbolizer with a
     * Mark (readable with xml2js)
     */
    SldStyleParser.prototype.getSldPointSymbolizerFromMarkSymbolizer = function (markSymbolizer) {
        var mark = [{
                'WellKnownName': [
                    markSymbolizer.wellKnownName.toLowerCase()
                ]
            }];
        if (markSymbolizer.color) {
            mark[0].Fill = [{
                    'CssParameter': [{
                            '_': markSymbolizer.color,
                            '$': {
                                'name': 'fill'
                            }
                        }]
                }];
        }
        if (markSymbolizer.strokeColor || markSymbolizer.strokeWidth || markSymbolizer.strokeOpacity) {
            mark[0].Stroke = [{}];
            var strokeCssParameters = [];
            if (markSymbolizer.strokeColor) {
                strokeCssParameters.push({
                    '_': markSymbolizer.strokeColor,
                    '$': {
                        'name': 'stroke'
                    }
                });
            }
            if (markSymbolizer.strokeWidth) {
                strokeCssParameters.push({
                    '_': markSymbolizer.strokeWidth.toString(),
                    '$': {
                        'name': 'stroke-width'
                    }
                });
            }
            if (markSymbolizer.strokeOpacity) {
                strokeCssParameters.push({
                    '_': markSymbolizer.strokeOpacity.toString(),
                    '$': {
                        'name': 'stroke-opacity'
                    }
                });
            }
            mark[0].Stroke[0].CssParameter = strokeCssParameters;
        }
        var graphic = [{
                'Mark': mark
            }];
        if (markSymbolizer.opacity) {
            graphic[0].Opacity = [markSymbolizer.opacity.toString()];
        }
        if (markSymbolizer.radius) {
            graphic[0].Size = [(markSymbolizer.radius * 2).toString()];
        }
        if (markSymbolizer.rotate) {
            graphic[0].Rotation = [markSymbolizer.rotate.toString()];
        }
        return {
            'PointSymbolizer': [{
                    'Graphic': graphic
                }]
        };
    };
    /**
     * Get the SLD Object (readable with xml2js) from an GeoStyler-Style IconSymbolizer.
     *
     * @param {IconSymbolizer} iconSymbolizer A GeoStyler-Style IconSymbolizer.
     * @return {object} The object representation of a SLD PointSymbolizer with
     * en "ExternalGraphic" (readable with xml2js)
     */
    SldStyleParser.prototype.getSldPointSymbolizerFromIconSymbolizer = function (iconSymbolizer) {
        var onlineResource = [{
                '$': {
                    'xlink:type': 'simple',
                    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                    'xlink:href': iconSymbolizer.image
                }
            }];
        var graphic = [{
                'ExternalGraphic': [{
                        'OnlineResource': onlineResource
                    }]
            }];
        if (iconSymbolizer.image) {
            var iconExt = iconSymbolizer.image.split('.').pop();
            switch (iconExt) {
                case 'png':
                case 'jpeg':
                case 'gif':
                    graphic[0].ExternalGraphic[0].Format = ["image/" + iconExt];
                    break;
                case 'jpg':
                    graphic[0].ExternalGraphic[0].Format = ['image/jpeg'];
                    break;
                case 'svg':
                    graphic[0].ExternalGraphic[0].Format = ['image/svg+xml'];
                    break;
                default:
                    break;
            }
        }
        if (iconSymbolizer.opacity) {
            graphic[0].Opacity = iconSymbolizer.opacity;
        }
        if (iconSymbolizer.size) {
            graphic[0].Size = iconSymbolizer.size;
        }
        if (iconSymbolizer.rotate) {
            graphic[0].Rotation = iconSymbolizer.rotate;
        }
        return {
            'PointSymbolizer': [{
                    'Graphic': graphic
                }]
        };
    };
    /**
     * Get the SLD Object (readable with xml2js) from an GeoStyler-Style RasterSymbolizer.
     *
     * @param {RasterSymbolizer} RasterSymbolizer A GeoStyler-Style RasterSymbolizer.
     * @return {object} The object representation of a SLD RasterSymbolizer (readable with xml2js)
     */
    SldStyleParser.prototype.getSldRasterSymbolizerFromRasterSymbolizer = function (rasterSymbolizer) {
        var sldRasterSymbolizer = [{}];
        var opacity;
        if (typeof rasterSymbolizer.opacity !== 'undefined') {
            opacity = [rasterSymbolizer.opacity.toString()];
            sldRasterSymbolizer[0].Opacity = opacity;
        }
        var colorMap;
        if (rasterSymbolizer.colorMap) {
            colorMap = this.getSldColorMapFromColorMap(rasterSymbolizer.colorMap);
            if (!_isEmpty(colorMap[0])) {
                sldRasterSymbolizer[0].ColorMap = colorMap;
            }
        }
        var channelSelection;
        if (rasterSymbolizer.channelSelection) {
            channelSelection = this.getSldChannelSelectionFromChannelSelection(rasterSymbolizer.channelSelection);
            if (!_isEmpty(channelSelection[0])) {
                sldRasterSymbolizer[0].ChannelSelection = channelSelection;
            }
        }
        var contrastEnhancement;
        if (rasterSymbolizer.contrastEnhancement) {
            contrastEnhancement = this.getSldContrastEnhancementFromContrastEnhancement(rasterSymbolizer.contrastEnhancement);
            if (!_isEmpty(contrastEnhancement[0])) {
                sldRasterSymbolizer[0].ContrastEnhancement = contrastEnhancement;
            }
        }
        return {
            'RasterSymbolizer': sldRasterSymbolizer
        };
    };
    /**
     * Get the SLD Object (readable with xml2js) from an GeoStyler-Style ColorMap.
     *
     * @param {ColorMap} colorMap A GeoStyler-Style ColorMap.
     * @return {object} The object representation of a SLD ColorMap (readable with xml2js)
     */
    SldStyleParser.prototype.getSldColorMapFromColorMap = function (colorMap) {
        var sldColorMap = [{
                '$': {}
            }];
        // parse colorMap.type
        if (colorMap.type) {
            var type = colorMap.type;
            sldColorMap[0].$.type = type;
        }
        // parse colorMap.extended
        if (typeof colorMap.extended !== 'undefined') {
            var extended = colorMap.extended.toString();
            sldColorMap[0].$.extended = extended;
        }
        // parse colorMap.colorMapEntries
        if (colorMap.colorMapEntries && colorMap.colorMapEntries.length > 0) {
            var colorMapEntries = colorMap.colorMapEntries.map(function (entry) {
                var result = {
                    '$': {}
                };
                if (entry.color) {
                    result.$.color = entry.color;
                }
                if (typeof entry.quantity !== 'undefined') {
                    result.$.quantity = entry.quantity.toString();
                }
                if (entry.label) {
                    result.$.label = entry.label;
                }
                if (typeof entry.opacity !== 'undefined') {
                    result.$.opacity = entry.opacity.toString();
                }
                return result;
            }).filter(function (entry) {
                // remove empty colorMapEntries
                return Object.keys(entry.$).length > 0;
            });
            sldColorMap[0].ColorMapEntry = colorMapEntries;
        }
        return sldColorMap;
    };
    /**
     * Get the SLD Object (readable with xml2js) from an GeoStyler-Style ChannelSelection.
     *
     * @param {ChannelSelection} channelSelection A GeoStyler-Style ChannelSelection.
     * @return {object} The object representation of a SLD ChannelSelection (readable with xml2js)
     */
    SldStyleParser.prototype.getSldChannelSelectionFromChannelSelection = function (channelSelection) {
        var _this = this;
        var propertyMap = {
            'redChannel': 'RedChannel',
            'blueChannel': 'BlueChannel',
            'greenChannel': 'GreenChannel',
            'grayChannel': 'GrayChannel'
        };
        var keys = Object.keys(channelSelection);
        var sldChannelSelection = [{}];
        keys.forEach(function (key) {
            var channel = [{}];
            // parse sourceChannelName
            var sourceChannelName = _get(channelSelection, key + ".sourceChannelName");
            // parse contrastEnhancement
            var contrastEnhancement = _get(channelSelection, key + ".contrastEnhancement");
            if (sourceChannelName || contrastEnhancement) {
                if (sourceChannelName) {
                    channel[0].SourceChannelName = [sourceChannelName];
                }
                if (contrastEnhancement) {
                    channel[0].ContrastEnhancement = _this.getSldContrastEnhancementFromContrastEnhancement(contrastEnhancement);
                }
                sldChannelSelection[0][propertyMap[key]] = channel;
            }
        });
        return sldChannelSelection;
    };
    /**
     * Get the SLD Object (readable with xml2js) from an GeoStyler-Style ContrastEnhancement.
     *
     * @param {ContrastEnhancement} contrastEnhancement A GeoStyler-Style ContrastEnhancement.
     * @return {object} The object representation of a SLD ContrastEnhancement (readable with xml2js)
     */
    SldStyleParser.prototype.getSldContrastEnhancementFromContrastEnhancement = function (contrastEnhancement) {
        var sldContrastEnhancement = [{}];
        var enhancementType = _get(contrastEnhancement, 'enhancementType');
        if (enhancementType === 'normalize') {
            // parse normalize
            sldContrastEnhancement[0].Normalize = [''];
        }
        else if (enhancementType === 'histogram') {
            // parse histogram
            sldContrastEnhancement[0].Histogram = [''];
        }
        // parse gammaValue
        if (typeof contrastEnhancement.gammaValue !== 'undefined') {
            sldContrastEnhancement[0].GammaValue = [contrastEnhancement.gammaValue.toString()];
        }
        return sldContrastEnhancement;
    };
    /**
     * Get the SLD Object (readable with xml2js) from a GeoStyler-Style StrMatchesFunctionFilter.
     *
     * @param {StrMatchesFunctionFilter} functionFilter A GeoStyler-Style StrMatchesFunctionFilter.
     * @return {object} The object representation of a SLD strMatches Function Expression.
     */
    SldStyleParser.prototype.getSldStrMatchesFunctionFromFunctionFilter = function (functionFilter) {
        var property = functionFilter[1];
        var regex = functionFilter[2];
        return {
            '$': {
                'name': 'strMatches'
            },
            'PropertyName': [property],
            'Literal': [regex.toString().replace(/\//g, '')]
        };
    };
    /**
     * Get the SLD Object (readable with xml2js) from a GeoStyler-Style FunctionFilter.
     *
     * @param {FunctionFilter} functionFilter A GeoStyler-Style FunctionFilter.
     * @return {object} The object representation of a SLD Function Expression.
     */
    SldStyleParser.prototype.getSldFunctionFilterFromFunctionFilter = function (functionFilter) {
        var functionName = functionFilter[0].split('FN_')[1];
        switch (functionName) {
            case 'strMatches':
                return this.getSldStrMatchesFunctionFromFunctionFilter(functionFilter);
            default:
                break;
        }
    };
    /**
     * Get the SLD Object (readable with xml2js) from an GeoStyler-Style ComparisonFilter.
     *
     * @param {ComparisonFilter} comparisonFilter A GeoStyler-Style ComparisonFilter.
     * @return {object} The object representation of a SLD Filter Expression with a
     * comparison operator (readable with xml2js)
     */
    SldStyleParser.prototype.getSldComparisonFilterFromComparisonFilter = function (comparisonFilter) {
        var _a, _b, _c;
        var sldComparisonFilter = {};
        var operator = comparisonFilter[0];
        var key = comparisonFilter[1];
        var value = comparisonFilter[2];
        var sldOperators = SldStyleParser.keysByValue(SldStyleParser.comparisonMap, operator);
        var sldOperator = (sldOperators.length > 1 && value === null)
            ? sldOperators[1] : sldOperators[0];
        var propertyKey = 'PropertyName';
        if (Array.isArray(key) && key[0].startsWith('FN_')) {
            key = this.getSldFunctionFilterFromFunctionFilter(key);
            propertyKey = 'Function';
        }
        if (sldOperator === 'PropertyIsNull') {
            // empty, selfclosing Literals are not valid in a propertyIsNull filter
            sldComparisonFilter[sldOperator] = [(_a = {},
                    _a[propertyKey] = [key],
                    _a)];
        }
        else if (sldOperator === 'PropertyIsLike') {
            sldComparisonFilter[sldOperator] = [(_b = {
                        '$': {
                            'wildCard': '*',
                            'singleChar': '.',
                            'escape': '!'
                        }
                    },
                    _b[propertyKey] = [key],
                    _b['Literal'] = [value],
                    _b)];
        }
        else {
            sldComparisonFilter[sldOperator] = [(_c = {},
                    _c[propertyKey] = [key],
                    _c['Literal'] = [value],
                    _c)];
        }
        return sldComparisonFilter;
    };
    /**
     * Get the SLD Object (readable with xml2js) from an GeoStyler-Style Filter.
     *
     * @param {Filter} filter A GeoStyler-Style Filter.
     * @return {object} The object representation of a SLD Filter Expression (readable with xml2js)
     */
    SldStyleParser.prototype.getSldFilterFromFilter = function (filter) {
        var _this = this;
        var sldFilter = {};
        var operator = filter[0], args = filter.slice(1);
        if (Object.values(SldStyleParser.comparisonMap).includes(operator)) {
            sldFilter = this.getSldComparisonFilterFromComparisonFilter(filter);
        }
        else if (Object.values(SldStyleParser.combinationMap).includes(operator)) {
            var sldOperators = SldStyleParser.keysByValue(SldStyleParser.combinationMap, operator);
            // TODO Implement logic for "PropertyIsBetween" filter
            var combinator_1 = sldOperators[0];
            sldFilter[combinator_1] = [{}];
            args.forEach(function (subFilter, subFilterIdx) {
                var sldSubFilter = _this.getSldFilterFromFilter(subFilter);
                var filterName = Object.keys(sldSubFilter)[0];
                var isCombinationFilter = function (fName) { return ['And', 'Or'].includes(fName); };
                if (subFilter[0] === '||' || subFilter[0] === '&&') {
                    if (isCombinationFilter(filterName)) {
                        if (!(sldFilter[combinator_1][0][filterName])) {
                            sldFilter[combinator_1][0][filterName] = [];
                        }
                        sldFilter[combinator_1][0][filterName][subFilterIdx] = {};
                    }
                    else {
                        sldFilter[combinator_1][0][filterName] = {};
                    }
                    var parentFilterName_1 = Object.keys(sldSubFilter)[0];
                    subFilter.forEach(function (el, index) {
                        if (index > 0) {
                            var sldSubFilter2 = _this.getSldFilterFromFilter(el);
                            var filterName2 = Object.keys(sldSubFilter2)[0];
                            if (!(sldFilter[combinator_1][0][parentFilterName_1][subFilterIdx])) {
                                sldFilter[combinator_1][0][parentFilterName_1][subFilterIdx] = {};
                            }
                            if (!sldFilter[combinator_1][0][parentFilterName_1][subFilterIdx][filterName2]) {
                                sldFilter[combinator_1][0][parentFilterName_1][subFilterIdx][filterName2] = [];
                            }
                            sldFilter[combinator_1][0][parentFilterName_1][subFilterIdx][filterName2]
                                .push(sldSubFilter2[filterName2][0]);
                        }
                    });
                }
                else {
                    if (Array.isArray(sldFilter[combinator_1][0][filterName])) {
                        sldFilter[combinator_1][0][filterName].push(sldSubFilter[filterName][0]);
                    }
                    else {
                        sldFilter[combinator_1][0][filterName] = sldSubFilter[filterName];
                    }
                }
            });
        }
        else if (Object.values(SldStyleParser.negationOperatorMap).includes(operator)) {
            sldFilter.Not = args.map(function (subFilter) { return _this.getSldFilterFromFilter(subFilter); });
        }
        return sldFilter;
    };
    /**
     * The name of the SLD Style Parser.
     */
    SldStyleParser.title = 'SLD Style Parser';
    SldStyleParser.negationOperatorMap = {
        Not: '!'
    };
    SldStyleParser.combinationMap = {
        And: '&&',
        Or: '||',
        PropertyIsBetween: '&&'
    };
    SldStyleParser.comparisonMap = {
        PropertyIsEqualTo: '==',
        PropertyIsNotEqualTo: '!=',
        PropertyIsLike: '*=',
        PropertyIsLessThan: '<',
        PropertyIsLessThanOrEqualTo: '<=',
        PropertyIsGreaterThan: '>',
        PropertyIsGreaterThanOrEqualTo: '>=',
        PropertyIsNull: '=='
    };
    return SldStyleParser;
}());
exports.SldStyleParser = SldStyleParser;
exports.default = SldStyleParser;
//# sourceMappingURL=SldStyleParser.js.map