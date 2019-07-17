"use strict";
var __assign = (this && this.__assign) || function() {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Style_1 = require("ol/style/Style");
var Image_1 = require("ol/style/Image");
var Fill_1 = require("ol/style/Fill");
var Stroke_1 = require("ol/style/Stroke");
var Text_1 = require("ol/style/Text");
var Circle_1 = require("ol/style/Circle");
var Icon_1 = require("ol/style/Icon");
var RegularShape_1 = require("ol/style/RegularShape");
var OlStyleUtil_1 = require("./OlStyleUtil");
var MapUtil_1 = require("@terrestris/ol-util/dist/MapUtil/MapUtil");
var util_1 = require("util");
var _get = require('lodash/get');
/**
 * This parser can be used with the GeoStyler.
 * It implements the GeoStyler-Style Parser interface to work with OpenLayers styles.
 *
 * @class OlStyleParser
 * @implements StyleParser
 */
var OlStyleParser = /** @class */ (function() {
    function OlStyleParser(ol) {
        this.title = 'OpenLayers Style Parser';
        this.OlStyleConstructor = Style_1.default;
        this.OlStyleImageConstructor = Image_1.default;
        this.OlStyleFillConstructor = Fill_1.default;
        this.OlStyleStrokeConstructor = Stroke_1.default;
        this.OlStyleTextConstructor = Text_1.default;
        this.OlStyleCircleConstructor = Circle_1.default;
        this.OlStyleIconConstructor = Icon_1.default;
        this.OlStyleRegularshapeConstructor = RegularShape_1.default;
        this.isOlParserStyleFct = function(x) {
            return typeof x === 'function';
        };
        if (ol) {
            this.OlStyleConstructor = ol.style.Style;
            this.OlStyleImageConstructor = ol.style.Image;
            this.OlStyleFillConstructor = ol.style.Fill;
            this.OlStyleStrokeConstructor = ol.style.Stroke;
            this.OlStyleTextConstructor = ol.style.Text;
            this.OlStyleCircleConstructor = ol.style.Circle;
            this.OlStyleIconConstructor = ol.style.Icon;
            this.OlStyleRegularshapeConstructor = ol.style.RegularShape;
        }
    }
    /**
     * Get the GeoStyler-Style PointSymbolizer from an OpenLayers Style object.
     *
     * @param {object} olStyle The OpenLayers Style object
     * @return {PointSymbolizer} The GeoStyler-Style PointSymbolizer
     */
    OlStyleParser.prototype.getPointSymbolizerFromOlStyle = function(olStyle) {
        var pointSymbolizer;
        if (olStyle.getImage() instanceof this.OlStyleCircleConstructor) {
            // circle
            var olCircleStyle = olStyle.getImage();
            var olFillStyle = olCircleStyle.getFill();
            var olStrokeStyle = olCircleStyle.getStroke();
            var circleSymbolizer = {
                kind: 'Mark',
                wellKnownName: 'Circle',
                color: olFillStyle ? OlStyleUtil_1.default.getHexColor(olFillStyle.getColor()) : undefined,
                opacity: olFillStyle ? OlStyleUtil_1.default.getOpacity(olFillStyle.getColor()) : undefined,
                radius: (olCircleStyle.getRadius() !== 0) ? olCircleStyle.getRadius() : 5,
                strokeColor: olStrokeStyle ? olStrokeStyle.getColor() : undefined,
                strokeOpacity: olStrokeStyle ? OlStyleUtil_1.default.getOpacity(olStrokeStyle.getColor()) : undefined,
                strokeWidth: olStrokeStyle ? olStrokeStyle.getWidth() : undefined
            };
            pointSymbolizer = circleSymbolizer;
        }
        else if (olStyle.getImage() instanceof this.OlStyleRegularshapeConstructor) {
            // square, triangle, star, cross or x
            var olRegularStyle = olStyle.getImage();
            var olFillStyle = olRegularStyle.getFill();
            var olStrokeStyle = olRegularStyle.getStroke();
            var radius = olRegularStyle.getRadius();
            var radius2 = olRegularStyle.getRadius2();
            var points = olRegularStyle.getPoints();
            var angle = olRegularStyle.getAngle();
            var markSymbolizer = {
                kind: 'Mark',
                color: olFillStyle ? OlStyleUtil_1.default.getHexColor(olFillStyle.getColor()) : undefined,
                opacity: olFillStyle ? OlStyleUtil_1.default.getOpacity(olFillStyle.getColor()) : undefined,
                strokeColor: olStrokeStyle ? olStrokeStyle.getColor() : undefined,
                strokeOpacity: olStrokeStyle ? OlStyleUtil_1.default.getOpacity(olStrokeStyle.getColor()) : undefined,
                strokeWidth: olStrokeStyle ? olStrokeStyle.getWidth() : undefined,
                radius: (radius !== 0) ? radius : 5,
                // Rotation in openlayers is radians while we use degree
                rotate: olRegularStyle.getRotation() / Math.PI * 180
            };
            switch (points) {
                case 2:
                    switch (angle) {
                        case 0:
                            markSymbolizer.wellKnownName = 'shape://vertline';
                            break;
                        case Math.PI / 2:
                            markSymbolizer.wellKnownName = 'shape://horline';
                            break;
                        case Math.PI / 4:
                            markSymbolizer.wellKnownName = 'shape://slash';
                            break;
                        case 2 * Math.PI - (Math.PI / 4):
                            markSymbolizer.wellKnownName = 'shape://backslash';
                            break;
                        default:
                            break;
                    }
                    break;
                case 3:
                    switch (angle) {
                        case 0:
                            markSymbolizer.wellKnownName = 'Triangle';
                            break;
                        case Math.PI / 2:
                            markSymbolizer.wellKnownName = 'shape://carrow';
                            break;
                        default:
                            break;
                    }
                    break;
                case 4:
                    if (util_1.isNumber(radius2)) {
                        // cross or x
                        if (olRegularStyle.getAngle() === 0) {
                            // cross
                            markSymbolizer.wellKnownName = 'Cross';
                        }
                        else {
                            // x
                            markSymbolizer.wellKnownName = 'X';
                        }
                    }
                    else {
                        // square
                        markSymbolizer.wellKnownName = 'Square';
                    }
                    break;
                case 5:
                    // star
                    markSymbolizer.wellKnownName = 'Star';
                    break;
                default:
                    throw new Error("Could not parse OlStyle. Only 2, 3, 4 or 5 point regular shapes are allowed");
            }
            pointSymbolizer = markSymbolizer;
        }
        else {
            // icon
            var olIconStyle = olStyle.getImage();
            var iconSymbolizer = {
                kind: 'Icon',
                image: olIconStyle.getSrc() ? olIconStyle.getSrc() : undefined,
                opacity: olIconStyle.getOpacity(),
                size: (olIconStyle.getScale() !== 0) ? olIconStyle.getScale() : 5,
                // Rotation in openlayers is radians while we use degree
                rotate: olIconStyle.getRotation() / Math.PI * 180
            };
            pointSymbolizer = iconSymbolizer;
        }
        return pointSymbolizer;
    };
    /**
     * Get the GeoStyler-Style LineSymbolizer from an OpenLayers Style object.
     *
     * @param {object} olStyle The OpenLayers Style object
     * @return {LineSymbolizer} The GeoStyler-Style LineSymbolizer
     */
    OlStyleParser.prototype.getLineSymbolizerFromOlStyle = function(olStyle) {
        var olStrokeStyle = olStyle.getStroke();
        return {
            kind: 'Line',
            color: olStrokeStyle ? OlStyleUtil_1.default.getHexColor(olStrokeStyle.getColor()) : undefined,
            opacity: olStrokeStyle ? OlStyleUtil_1.default.getOpacity(olStrokeStyle.getColor()) : undefined,
            width: olStrokeStyle ? olStrokeStyle.getWidth() : undefined,
            cap: olStrokeStyle ? olStrokeStyle.getLineCap() : 'butt',
            join: olStrokeStyle ? olStrokeStyle.getLineJoin() : 'miter',
            dasharray: olStrokeStyle ? olStrokeStyle.getLineDash() : undefined,
            dashOffset: olStrokeStyle ? olStrokeStyle.getLineDashOffset() : undefined
        };
    };
    /**
     * Get the GeoStyler-Style FillSymbolizer from an OpenLayers Style object.
     *
     * PolygonSymbolizer Stroke is just partially supported.
     *
     * @param {OlStyle} olStyle The OpenLayers Style object
     * @return {FillSymbolizer} The GeoStyler-Style FillSymbolizer
     */
    OlStyleParser.prototype.getFillSymbolizerFromOlStyle = function(olStyle) {
        var olFillStyle = olStyle.getFill();
        var olStrokeStyle = olStyle.getStroke();
        return {
            kind: 'Fill',
            color: olFillStyle ? OlStyleUtil_1.default.getHexColor(olFillStyle.getColor()) : undefined,
            opacity: olFillStyle ? OlStyleUtil_1.default.getOpacity(olFillStyle.getColor()) : undefined,
            outlineColor: olStrokeStyle ? olStrokeStyle.getColor() : undefined,
            outlineWidth: olStrokeStyle ? olStrokeStyle.getWidth() : undefined
        };
    };
    /**
     * Get the GeoStyler-Style TextSymbolizer from an OpenLayers Style object.
     *
     *
     * @param {OlStyle} olStyle The OpenLayers Style object
     * @return {TextSymbolizer} The GeoStyler-Style TextSymbolizer
     */
    OlStyleParser.prototype.getTextSymbolizerFromOlStyle = function(olStyle) {
        var olTextStyle = olStyle.getText();
        var olFillStyle = olTextStyle.getFill();
        var olStrokeStyle = olTextStyle.getStroke();
        var offsetX = olTextStyle.getOffsetX();
        var offsetY = olTextStyle.getOffsetY();
        var font = olTextStyle.getFont();
        var rotation = olTextStyle.getRotation();
        var text = olTextStyle.getText();
        var fontStyleWeightSize;
        var fontSizePart;
        var fontSize = Infinity;
        var fontFamily = undefined;
        if (font) {
            var fontSplit = font.split('px');
            // font-size is always the first part of font-size/line-height
            fontStyleWeightSize = fontSplit[0].trim();
            fontSizePart = fontStyleWeightSize.split(' ');
            // The last element contains font size
            fontSize = parseInt(fontSizePart[fontSizePart.length - 1], 10);
            var fontFamilyPart = fontSplit.length === 2 ?
                fontSplit[1] : fontSplit[2];
            fontFamily = fontFamilyPart.split(',').map(function(fn) {
                return fn.startsWith(' ') ? fn.slice(1) : fn;
            });
        }
        return {
            kind: 'Text',
            label: text,
            color: olFillStyle ? OlStyleUtil_1.default.getHexColor(olFillStyle.getColor()) : undefined,
            size: isFinite(fontSize) ? fontSize : undefined,
            font: fontFamily,
            offset: (offsetX !== undefined) && (offsetY !== undefined) ? [offsetX, offsetY] : [0, 0],
            haloColor: olStrokeStyle && olStrokeStyle.getColor() ?
                OlStyleUtil_1.default.getHexColor(olStrokeStyle.getColor()) : undefined,
            haloWidth: olStrokeStyle ? olStrokeStyle.getWidth() : undefined,
            rotate: (rotation !== undefined) ? rotation / Math.PI * 180 : undefined
        };
    };
    /**
     * Get the GeoStyler-Style Symbolizer from an OpenLayers Style object.
     *
     * @param {OlStyle} olStyle The OpenLayers Style object
     * @return {Symbolizer[]} The GeoStyler-Style Symbolizer array
     */
    OlStyleParser.prototype.getSymbolizersFromOlStyle = function(olStyles) {
        var _this = this;
        var symbolizers = [];
        olStyles.forEach(function(olStyle) {
            var symbolizer;
            var styleType = _this.getStyleTypeFromOlStyle(olStyle);
            switch (styleType) {
                case 'Point':
                    if (olStyle.getText()) {
                        symbolizer = _this.getTextSymbolizerFromOlStyle(olStyle);
                    }
                    else {
                        symbolizer = _this.getPointSymbolizerFromOlStyle(olStyle);
                    }
                    break;
                case 'Line':
                    symbolizer = _this.getLineSymbolizerFromOlStyle(olStyle);
                    break;
                case 'Fill':
                    symbolizer = _this.getFillSymbolizerFromOlStyle(olStyle);
                    break;
                default:
                    throw new Error('Failed to parse SymbolizerKind from OpenLayers Style');
            }
            symbolizers.push(symbolizer);
        });
        return symbolizers;
    };
    /**
     * Get the GeoStyler-Style Rule from an OpenLayers Style object.
     *
     * @param {OlStyle} olStyle The OpenLayers Style object
     * @return {Rule} The GeoStyler-Style Rule
     */
    OlStyleParser.prototype.getRuleFromOlStyle = function(olStyles) {
        var rule;
        var symbolizers;
        var name = 'OL Style Rule 0';
        if (Array.isArray(olStyles)) {
            symbolizers = this.getSymbolizersFromOlStyle(olStyles);
        }
        else {
            symbolizers = this.getSymbolizersFromOlStyle([olStyles]);
        }
        rule = {
            name: name, symbolizers: symbolizers
        };
        return rule;
    };
    /**
     * Get the GeoStyler-Style Symbolizer from an OpenLayers Style object.
     *
     * @param {OlStyle} olStyle The OpenLayers Style object
     * @return {Symbolizer} The GeoStyler-Style Symbolizer
     */
    OlStyleParser.prototype.getStyleTypeFromOlStyle = function(olStyle) {
        var styleType;
        if (olStyle.getImage() instanceof this.OlStyleImageConstructor) {
            styleType = 'Point';
        }
        else if (olStyle.getText() instanceof this.OlStyleTextConstructor) {
            styleType = 'Point';
        }
        else if (olStyle.getFill() instanceof this.OlStyleFillConstructor) {
            styleType = 'Fill';
        }
        else if (olStyle.getStroke() && !olStyle.getFill()) {
            styleType = 'Line';
        }
        else {
            throw new Error('StyleType could not be detected');
        }
        return styleType;
    };
    /**
     * Get the GeoStyler-Style Style from an OpenLayers Style object.
     *
     * @param {object} olStyle The OpenLayers Style object
     * @return {Style} The GeoStyler-Style Style
     */
    OlStyleParser.prototype.olStyleToGeoStylerStyle = function(olStyle) {
        var name = 'OL Style';
        var rule = this.getRuleFromOlStyle(olStyle);
        return {
            name: name,
            rules: [rule]
        };
    };
    /**
     * The readStyle implementation of the GeoStyler-Style StyleParser interface.
     * It reads an OpenLayers Style, an array of OpenLayers Styles or an olParserStyleFct and returns a Promise.
     *
     * The Promise itself resolves with a GeoStyler-Style Style.
     *
     * @param {OlStyle|OlStyle[]|OlParserStyleFct} olStyle The style to be parsed
     * @return {Promise} The Promise resolving with the GeoStyler-Style Style
     */
    OlStyleParser.prototype.readStyle = function(olStyle) {
        var _this = this;
        return new Promise(function(resolve, reject) {
            try {
                if (_this.isOlParserStyleFct(olStyle)) {
                    resolve(olStyle.__geoStylerStyle);
                }
                else {
                    var geoStylerStyle = _this.olStyleToGeoStylerStyle(olStyle);
                    resolve(geoStylerStyle);
                }
            }
            catch (error) {
                reject(error);
            }
        });
    };
    /**
     * The writeStyle implementation of the GeoStyler-Style StyleParser interface.
     * It reads a GeoStyler-Style Style and returns a Promise.
     * The Promise itself resolves one of three types
     *
     * 1. OlStyle if input Style consists of
     *    one rule with one symbolizer, no filter, no scaleDenominator, no TextSymbolizer
     * 2. OlStyle[] if input Style consists of
     *    one rule with multiple symbolizers, no filter, no scaleDenominator, no TextSymbolizer
     * 3. OlParserStyleFct for everything else
     *
     * @param {Style} geoStylerStyle A GeoStyler-Style Style.
     * @return {Promise} The Promise resolving with one of above mentioned style types.
     */
    OlStyleParser.prototype.writeStyle = function(geoStylerStyle) {
        var _this = this;
        return new Promise(function(resolve, reject) {
            try {
                var olStyle = _this.getOlStyleTypeFromGeoStylerStyle(geoStylerStyle);
                resolve(olStyle);
            }
            catch (error) {
                reject(error);
            }
        });
    };
    /**
     * Decides which OlStyleType should be returned depending on given geoStylerStyle.
     * Three OlStyleTypes are possible:
     *
     * 1. OlStyle if input Style consists of
     *    one rule with one symbolizer, no filter, no scaleDenominator, no TextSymbolizer
     * 2. OlStyle[] if input Style consists of
     *    one rule with multiple symbolizers, no filter, no scaleDenominator, no TextSymbolizer
     * 3. OlParserStyleFct for everything else
     *
     * @param {geoStylerStyle} A GeoStyler-Style Style
     * @return {OlStyle|OlStyle[]|OlParserStyleFct}
     */
    OlStyleParser.prototype.getOlStyleTypeFromGeoStylerStyle = function(geoStylerStyle) {
        var rules = geoStylerStyle.rules;
        var nrRules = rules.length;
        if (nrRules === 1) {
            var hasFilter = typeof _get(geoStylerStyle, 'rules[0].filter') !== 'undefined' ? true : false;
            var hasMinScale = typeof _get(geoStylerStyle, 'rules[0].scaleDenominator.min') !== 'undefined' ? true : false;
            var hasMaxScale = typeof _get(geoStylerStyle, 'rules[0].scaleDenominator.max') !== 'undefined' ? true : false;
            var hasScaleDenominator = hasMinScale || hasMaxScale ? true : false;
            var nrSymbolizers = geoStylerStyle.rules[0].symbolizers.length;
            var hasTextSymbolizer = rules[0].symbolizers.some(function(symbolizer) {
                return symbolizer.kind === 'Text';
            });
            if (!hasFilter && !hasScaleDenominator && !hasTextSymbolizer) {
                if (nrSymbolizers === 1) {
                    return this.geoStylerStyleToOlStyle(geoStylerStyle);
                }
                else {
                    return this.geoStylerStyleToOlStyleArray(geoStylerStyle);
                }
            }
            else {
                return this.geoStylerStyleToOlParserStyleFct(geoStylerStyle);
            }
        }
        else {
            return this.geoStylerStyleToOlParserStyleFct(geoStylerStyle);
        }
    };
    /**
     * Parses the first symbolizer of the first rule of a GeoStyler-Style Style.
     *
     * @param {geoStylerStyle} A GeoStyler-Style Style
     * @return {OlStyle} An OpenLayers Style Object
     */
    OlStyleParser.prototype.geoStylerStyleToOlStyle = function(geoStylerStyle) {
        var rule = geoStylerStyle.rules[0];
        var symbolizer = rule.symbolizers[0];
        var olSymbolizer = this.getOlSymbolizerFromSymbolizer(symbolizer);
        return olSymbolizer;
    };
    /**
     * Parses all symbolizers of the first rule of a GeoStyler-Style Style.
     *
     * @param {geoStylerStyle} A GeoStyler-Style Style
     * @return {OlStyle[]} An array of OpenLayers Style Objects
     */
    OlStyleParser.prototype.geoStylerStyleToOlStyleArray = function(geoStylerStyle) {
        var _this = this;
        var rule = geoStylerStyle.rules[0];
        var olStyles = [];
        rule.symbolizers.forEach(function(symbolizer) {
            var olSymbolizer = _this.getOlSymbolizerFromSymbolizer(symbolizer);
            olStyles.push(olSymbolizer);
        });
        return olStyles;
    };
    /**
     * Get the OpenLayers Style object from an GeoStyler-Style Style
     *
     * @param {Style} geoStylerStyle A GeoStyler-Style Style.
     * @return {OlParserStyleFct} An OlParserStyleFct
     */
    OlStyleParser.prototype.geoStylerStyleToOlParserStyleFct = function(geoStylerStyle) {
        var _this = this;
        var rules = geoStylerStyle.rules;
        var olStyle = function(feature, resolution, scale) {
            var styles = [];
            if (!scale) {
                scale = MapUtil_1.default.getScaleForResolution(resolution, 'm');
            }
            rules.forEach(function(rule) {
                // handling scale denominator
                var minScale = _get(rule, 'scaleDenominator.min');
                var maxScale = _get(rule, 'scaleDenominator.max');
                var isWithinScale = true;
                if (typeof minScale !== 'undefined' || typeof maxScale !== 'undefined') {
                    if (typeof minScale !== 'undefined' && scale < minScale) {
                        isWithinScale = false;
                    }
                    if (typeof maxScale !== 'undefined' && scale >= maxScale) {
                        isWithinScale = false;
                    }
                }
                // handling filter
                var matchesFilter = false;
                if (!rule.filter) {
                    matchesFilter = true;
                }
                else {
                    try {
                        matchesFilter = _this.geoStylerFilterToOlParserFilter(feature, rule.filter);
                    }
                    catch (e) {
                        matchesFilter = false;
                    }
                }
                if (isWithinScale && matchesFilter) {
                    rule.symbolizers.forEach(function(symb) {
                        var olSymbolizer = _this.getOlSymbolizerFromSymbolizer(symb);
                        // this.getOlTextSymbolizerFromTextSymbolizer returns
                        // either an OlStyle or an ol.StyleFunction. OpenLayers only accepts an array
                        // of OlStyles, not ol.StyleFunctions.
                        // So we have to check it and in case of an ol.StyleFunction call that function
                        // and add the returned style to const styles.
                        if (typeof olSymbolizer !== 'function') {
                            styles.push(olSymbolizer);
                        }
                        else {
                            var styleFromFct = olSymbolizer(feature, resolution);
                            styles.push(styleFromFct);
                        }
                    });
                }
            });
            return styles;
        };
        var olStyleFct = olStyle;
        olStyleFct.__geoStylerStyle = geoStylerStyle;
        return olStyleFct;
    };
    /**
     * Checks if a feature matches given filter expression(s)
     * @param feature ol.Feature
     * @param filter Filter
     * @return boolean true if feature matches filter expression
     */
    OlStyleParser.prototype.geoStylerFilterToOlParserFilter = function(feature, filter) {
        var _this = this;
        var operatorMapping = {
            '&&': true,
            '||': true,
            '!': true
        };
        var matchesFilter = true;
        var operator = filter[0];
        var isNestedFilter = false;
        if (operatorMapping[operator]) {
            isNestedFilter = true;
        }
        try {
            if (isNestedFilter) {
                switch (filter[0]) {
                    case '&&':
                        var intermediate_1 = true;
                        var restFilter = filter.slice(1);
                        restFilter.forEach(function(f) {
                            if (!_this.geoStylerFilterToOlParserFilter(feature, f)) {
                                intermediate_1 = false;
                            }
                        });
                        matchesFilter = intermediate_1;
                        break;
                    case '||':
                        intermediate_1 = false;
                        restFilter = filter.slice(1);
                        restFilter.forEach(function(f) {
                            if (_this.geoStylerFilterToOlParserFilter(feature, f)) {
                                intermediate_1 = true;
                            }
                        });
                        matchesFilter = intermediate_1;
                        break;
                    case '!':
                        matchesFilter = !this.geoStylerFilterToOlParserFilter(feature, filter[1]);
                        break;
                    default:
                        throw new Error("Cannot parse Filter. Unknown combination or negation operator.");
                }
            }
            else {
                var prop = feature.get(filter[1]);
                switch (filter[0]) {
                    case '==':
                        matchesFilter = ('' + prop) === ('' + filter[2]);
                        break;
                    case '*=':
                        // inspired by
                        // https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/String/includes#Polyfill
                        if (typeof filter[2] === 'string' && typeof prop === 'string') {
                            if (filter[2].length > prop.length) {
                                matchesFilter = false;
                            }
                            else {
                                matchesFilter = prop.indexOf(filter[2]) !== -1;
                            }
                        }
                        break;
                    case '!=':
                        matchesFilter = ('' + prop) !== ('' + filter[2]);
                        break;
                    case '<':
                        matchesFilter = parseFloat(prop) < parseFloat(filter[2]);
                        break;
                    case '<=':
                        matchesFilter = parseFloat(prop) <= parseFloat(filter[2]);
                        break;
                    case '>':
                        matchesFilter = parseFloat(prop) > parseFloat(filter[2]);
                        break;
                    case '>=':
                        matchesFilter = parseFloat(prop) >= parseFloat(filter[2]);
                        break;
                    default:
                        throw new Error("Cannot parse Filter. Unknown comparison operator.");
                }
            }
        }
        catch (e) {
            throw new Error("Cannot parse Filter. Invalid structure.");
        }
        return matchesFilter;
    };
    /**
     * Get the OpenLayers Style object or an OL StyleFunction from an
     * GeoStyler-Style Symbolizer.
     *
     * @param {Symbolizer} symbolizer A GeoStyler-Style Symbolizer.
     * @return {object} The OpenLayers Style object or a StyleFunction
     */
    OlStyleParser.prototype.getOlSymbolizerFromSymbolizer = function(symbolizer) {
        var olSymbolizer;
        switch (symbolizer.kind) {
            case 'Mark':
                olSymbolizer = this.getOlPointSymbolizerFromMarkSymbolizer(symbolizer);
                break;
            case 'Icon':
                olSymbolizer = this.getOlIconSymbolizerFromIconSymbolizer(symbolizer);
                break;
            case 'Text':
                olSymbolizer = this.getOlTextSymbolizerFromTextSymbolizer(symbolizer);
                break;
            case 'Line':
                olSymbolizer = this.getOlLineSymbolizerFromLineSymbolizer(symbolizer);
                break;
            case 'Fill':
                olSymbolizer = this.getOlPolygonSymbolizerFromFillSymbolizer(symbolizer);
                break;
            default:
                // Return the OL default style since the TS type binding does not allow
                // us to set olSymbolizer to undefined
                var fill = new this.OlStyleFillConstructor({
                    color: 'rgba(255,255,255,0.4)'
                });
                var stroke = new this.OlStyleStrokeConstructor({
                    color: '#3399CC',
                    width: 1.25
                });
                olSymbolizer = new this.OlStyleConstructor({
                    image: new this.OlStyleCircleConstructor({
                        fill: fill,
                        stroke: stroke,
                        radius: 5
                    }),
                    fill: fill,
                    stroke: stroke
                });
                break;
        }
        return olSymbolizer;
    };
    /**
     * Get the OL Style object  from an GeoStyler-Style MarkSymbolizer.
     *
     * @param {MarkSymbolizer} markSymbolizer A GeoStyler-Style MarkSymbolizer.
     * @return {object} The OL Style object
     */
    OlStyleParser.prototype.getOlPointSymbolizerFromMarkSymbolizer = function(markSymbolizer) {
        var stroke;
        if (markSymbolizer.strokeColor || markSymbolizer.strokeWidth !== undefined) {
            stroke = new this.OlStyleStrokeConstructor({
                color: (markSymbolizer.strokeColor && (markSymbolizer.strokeOpacity !== undefined)) ?
                    OlStyleUtil_1.default.getRgbaColor(markSymbolizer.strokeColor, markSymbolizer.strokeOpacity) :
                    markSymbolizer.strokeColor,
                width: markSymbolizer.strokeWidth,
            });
        }
        var fill = new this.OlStyleFillConstructor({
            color: (markSymbolizer.color && markSymbolizer.opacity !== undefined) ?
                OlStyleUtil_1.default.getRgbaColor(markSymbolizer.color, markSymbolizer.opacity) : markSymbolizer.color
        });
        var olStyle;
        var shapeOpts = {
            fill: fill,
            opacity: markSymbolizer.opacity || 1,
            radius: markSymbolizer.radius || 5,
            rotation: markSymbolizer.rotate ? markSymbolizer.rotate * Math.PI / 180 : undefined,
            stroke: stroke
        };
        switch (markSymbolizer.wellKnownName) {
            case 'shape://dot':
            case 'Circle':
                olStyle = new this.OlStyleConstructor({
                    image: new this.OlStyleCircleConstructor(shapeOpts)
                });
                break;
            case 'Square':
                shapeOpts.points = 4;
                shapeOpts.angle = 45 * Math.PI / 180;
                olStyle = new this.OlStyleConstructor({
                    image: new this.OlStyleRegularshapeConstructor(shapeOpts)
                });
                break;
            case 'Triangle':
                shapeOpts.points = 3;
                shapeOpts.angle = 0;
                olStyle = new this.OlStyleConstructor({
                    image: new this.OlStyleRegularshapeConstructor(shapeOpts)
                });
                break;
            case 'Star':
                shapeOpts.points = 5;
                shapeOpts.radius2 = shapeOpts.radius / 2.5;
                shapeOpts.angle = 0;
                olStyle = new this.OlStyleConstructor({
                    image: new this.OlStyleRegularshapeConstructor(shapeOpts)
                });
                break;
            case 'shape://plus':
            case 'Cross':
                shapeOpts.points = 4;
                shapeOpts.radius2 = 0;
                shapeOpts.angle = 0;
                // openlayers does not seem to set a default stroke color,
                // which is needed for regularshapes with radius2 = 0
                if (shapeOpts.stroke === undefined) {
                    shapeOpts.stroke = new this.OlStyleStrokeConstructor({
                        color: '#000'
                    });
                }
                olStyle = new this.OlStyleConstructor({
                    image: new this.OlStyleRegularshapeConstructor(shapeOpts)
                });
                break;
            case 'shape://times':
            case 'X':
                shapeOpts.points = 4;
                shapeOpts.radius2 = 0;
                shapeOpts.angle = 45 * Math.PI / 180;
                // openlayers does not seem to set a default stroke color,
                // which is needed for regularshapes with radius2 = 0
                if (shapeOpts.stroke === undefined) {
                    shapeOpts.stroke = new this.OlStyleStrokeConstructor({
                        color: '#000'
                    });
                }
                olStyle = new this.OlStyleConstructor({
                    image: new this.OlStyleRegularshapeConstructor(shapeOpts)
                });
                break;
            case 'shape://backslash':
                shapeOpts.points = 2;
                shapeOpts.angle = 2 * Math.PI - (Math.PI / 4);
                // openlayers does not seem to set a default stroke color,
                // which is needed for regularshapes with radius2 = 0
                if (shapeOpts.stroke === undefined) {
                    shapeOpts.stroke = new this.OlStyleStrokeConstructor({
                        color: '#000'
                    });
                }
                olStyle = new this.OlStyleConstructor({
                    image: new this.OlStyleRegularshapeConstructor(shapeOpts)
                });
                break;
            case 'shape://horline':
                shapeOpts.points = 2;
                shapeOpts.angle = Math.PI / 2;
                // openlayers does not seem to set a default stroke color,
                // which is needed for regularshapes with radius2 = 0
                if (shapeOpts.stroke === undefined) {
                    shapeOpts.stroke = new this.OlStyleStrokeConstructor({
                        color: '#000'
                    });
                }
                olStyle = new this.OlStyleConstructor({
                    image: new this.OlStyleRegularshapeConstructor(shapeOpts)
                });
                break;
            // so far, both arrows are closed arrows. Also, shape is a regular triangle with
            // all sides of equal length. In geoserver arrows only have two sides of equal length.
            // TODO redefine shapes of arrows?
            case 'shape://oarrow':
            case 'shape://carrow':
                shapeOpts.points = 3;
                shapeOpts.angle = Math.PI / 2;
                olStyle = new this.OlStyleConstructor({
                    image: new this.OlStyleRegularshapeConstructor(shapeOpts)
                });
                break;
            case 'shape://slash':
                shapeOpts.points = 2;
                shapeOpts.angle = Math.PI / 4;
                // openlayers does not seem to set a default stroke color,
                // which is needed for regularshapes with radius2 = 0
                if (shapeOpts.stroke === undefined) {
                    shapeOpts.stroke = new this.OlStyleStrokeConstructor({
                        color: '#000'
                    });
                }
                olStyle = new this.OlStyleConstructor({
                    image: new this.OlStyleRegularshapeConstructor(shapeOpts)
                });
                break;
            case 'shape://vertline':
                shapeOpts.points = 2;
                shapeOpts.angle = 0;
                // openlayers does not seem to set a default stroke color,
                // which is needed for regularshapes with radius2 = 0
                if (shapeOpts.stroke === undefined) {
                    shapeOpts.stroke = new this.OlStyleStrokeConstructor({
                        color: '#000'
                    });
                }
                olStyle = new this.OlStyleConstructor({
                    image: new this.OlStyleRegularshapeConstructor(shapeOpts)
                });
                break;
            default:
                throw new Error("MarkSymbolizer cannot be parsed. Unsupported WellKnownName.");
        }
        return olStyle;
    };
    /**
     * Get the OL Style object  from an GeoStyler-Style IconSymbolizer.
     *
     * @param {IconSymbolizer} symbolizer  A GeoStyler-Style IconSymbolizer.
     * @return {object} The OL Style object
     */
    OlStyleParser.prototype.getOlIconSymbolizerFromIconSymbolizer = function(symbolizer) {
        return new this.OlStyleConstructor({
            image: new this.OlStyleIconConstructor({
                src: symbolizer.image,
                crossOrigin: 'anonymous',
                opacity: symbolizer.opacity,
                scale: symbolizer.size || 1,
                // Rotation in openlayers is radians while we use degree
                rotation: symbolizer.rotate ? symbolizer.rotate * Math.PI / 180 : undefined
            })
        });
    };
    /**
     * Get the OL Style object from an GeoStyler-Style LineSymbolizer.
     *
     * @param {LineSymbolizer} lineSymbolizer A GeoStyler-Style LineSymbolizer.
     * @return {object} The OL Style object
     */
    OlStyleParser.prototype.getOlLineSymbolizerFromLineSymbolizer = function(symbolizer) {
        return new this.OlStyleConstructor({
            stroke: new this.OlStyleStrokeConstructor({
                color: (symbolizer.color && symbolizer.opacity !== null && symbolizer.opacity !== undefined) ?
                    OlStyleUtil_1.default.getRgbaColor(symbolizer.color, symbolizer.opacity) : symbolizer.color,
                width: symbolizer.width,
                lineCap: symbolizer.cap,
                lineJoin: symbolizer.join,
                lineDash: symbolizer.dasharray,
                lineDashOffset: symbolizer.dashOffset
            })
        });
    };
    /**
     * Get the OL Style object from an GeoStyler-Style FillSymbolizer.
     *
     * @param {FillSymbolizer} fillSymbolizer A GeoStyler-Style FillSymbolizer.
     * @return {object} The OL Style object
     */
    OlStyleParser.prototype.getOlPolygonSymbolizerFromFillSymbolizer = function(symbolizer) {
        var fill = symbolizer.color ? new this.OlStyleFillConstructor({
            color: (symbolizer.color && symbolizer.opacity !== null && symbolizer.opacity !== undefined) ?
                OlStyleUtil_1.default.getRgbaColor(symbolizer.color, symbolizer.opacity) : symbolizer.color
        }) : null;
        if (symbolizer.outlineColor || symbolizer.outlineWidth) {
            return new this.OlStyleConstructor({
                stroke: new this.OlStyleStrokeConstructor({
                    color: symbolizer.outlineColor,
                    width: symbolizer.outlineWidth
                }),
                fill: fill
            });
        }
        return new this.OlStyleConstructor({
            fill: fill
        });
    };
    /**
     * Get the OL StyleFunction object from an GeoStyler-Style TextSymbolizer.
     *
     * @param {TextSymbolizer} textSymbolizer A GeoStyler-Style TextSymbolizer.
     * @return {object} The OL StyleFunction
     */
    OlStyleParser.prototype.getOlTextSymbolizerFromTextSymbolizer = function(symbolizer) {
        var _this = this;
        var baseProps = {
            font: OlStyleUtil_1.default.getTextFont(symbolizer),
            fill: new this.OlStyleFillConstructor({
                color: (symbolizer.color && symbolizer.opacity !== null && symbolizer.opacity !== undefined) ?
                    OlStyleUtil_1.default.getRgbaColor(symbolizer.color, symbolizer.opacity) : symbolizer.color
            }),
            stroke: new this.OlStyleStrokeConstructor({
                color: (symbolizer.haloColor && symbolizer.opacity !== null && symbolizer.opacity !== undefined) ?
                    OlStyleUtil_1.default.getRgbaColor(symbolizer.haloColor, symbolizer.opacity) : symbolizer.haloColor,
                width: symbolizer.haloWidth ? symbolizer.haloWidth : 0
            }),
            offsetX: symbolizer.offset ? symbolizer.offset[0] : 0,
            offsetY: symbolizer.offset ? symbolizer.offset[1] : 0,
            rotation: symbolizer.rotate ? symbolizer.rotate * Math.PI / 180 : undefined
            // TODO check why props match
            // textAlign: symbolizer.pitchAlignment,
            // textBaseline: symbolizer.anchor
        };
        // check if TextSymbolizer.label contains a placeholder
        var prefix = '\\{\\{';
        var suffix = '\\}\\}';
        var regExp = new RegExp(prefix + '.*?' + suffix, 'g');
        var regExpRes = symbolizer.label ? symbolizer.label.match(regExp) : null;
        if (regExpRes) {
            // if it contains a placeholder
            // return olStyleFunction
            var olPointStyledLabelFn = function(feature, res) {
                var text = new _this.OlStyleTextConstructor(__assign({ text: OlStyleUtil_1.default.resolveAttributeTemplate(feature, symbolizer.label, '') }, baseProps));
                var style = new _this.OlStyleConstructor({
                    text: text
                });
                return style;
            };
            return olPointStyledLabelFn;
        }
        else {
            // if TextSymbolizer does not contain a placeholder
            // return OlStyle
            return new this.OlStyleConstructor({
                text: new this.OlStyleTextConstructor(__assign({ text: symbolizer.label }, baseProps))
            });
        }
    };
    /**
     * The name of the OlStyleParser.
     */
    OlStyleParser.title = 'OpenLayers Style Parser';
    return OlStyleParser;
}());
exports.OlStyleParser = OlStyleParser;
exports.default = OlStyleParser;
//# sourceMappingURL=OlStyleParser.js.map