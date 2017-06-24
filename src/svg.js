(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        // Common JS
        factory(exports);
    } else if (typeof define === 'function' && define['amd']) {
        // AMD
        define(['exports'], factory);
    } else {
        // Browser
        factory((global.dice = global.dice || {}));
    }
} (this, (function (exports) {
    "use strict";
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        if (typeof core !== 'object')
            var core = require('../src/core').core;
        if (typeof css !== 'object')
            var css = require('../src/css').css;
    }


    if (!exports.svg)
        exports.svg = {};
    exports.svg.SVGContent = SVGContent;
    exports.svg.integer = integer;
    exports.svg.number = number;
    exports.svg.length = length;
    exports.svg.coordinate = coordinate;
    exports.svg.opacityValue = opacityValue;
    exports.svg.color = color;
    exports.svg.transformList = transformList;
    exports.svg.point = point;
    exports.svg.path = path;
})));