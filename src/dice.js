/**
 * Class for generating various random entities.
 */
(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        // Common JS
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['exports'], factory);
    } else {
        // Browser
        factory((global.dice = global.dice || {}));
    }
} (this, (function (exports) { "use strict";
    /**
     * The main random number generator.
     * If min > max, a random number in (max, min) is generated.
     *
     * @param {number} min Lower boundary.
     * @param {number} max Upper boundary.
     * @returns {number} Random number in (min, max) if min < max, otherwise a random number in (max, min).
     * @private
     */
    function r(min, max) {
        if (min >= max)
            return Math.random()*(min-max) + max;
        return Math.random()*(max-min) + min;
    }

    /**
     * Selects a random element from an array.
     *
     * @param {Array} values Array of values.
     * @returns {object} Random element if array has any, null pointer otherwise.
     * @private
     */
    function choice(values) {
        if (values.length == 0)
            return null;
        return values[Math.floor(Math.random() * values.length)];
    }

    /**
     * Core functionality, basic uniform generators.
     */
    var core = {
        /**
         * Generates a random float in (min, max).
         * If min > max, a random number in (max, min) is generated.
         * If max is not given, a random number in (0, min) is generated.
         * If no arguments are given, returns a random float in (0, 1).
         *
         * @param {number=} min Lower boundary, or upper if max is not given.
         * @param {number=} max Upper boundary.
         * @returns {number} Random float in (min, max) if min < max, otherwise a random float in (max, min). If max
         * is not specified, random float in (0, min) if min > 0, otherwise in (min, 0). If none is specified, a random
         * float in (0, 1).
         */
        float: function (min, max) {
            if (arguments.length == 0)
                return r(0, 1);
            if (arguments.length == 1)
                return r(0, min);
            else
                return r(min, max);
        },

        /**
         * Generates a random integer in (min, max).
         * If min > max, a random number in (max, min) is generated.
         * If max is not given, a random number in (0, min) is generated.
         *
         * @param {number} min Lower boundary, or upper if max is not given.
         * @param {number=} max Upper boundary.
         * @returns {number} Random integer in (min, max) if min < max, otherwise a random integer in (max, min). If max
         * is not specified, random integer in (0, min) if min > 0, otherwise in (min, 0).
         */
        int: function (min, max) {
            if (arguments.length == 1)
                return Math.floor(this.float(min));
            else
                return Math.floor(this.float(min, max));
        },

        /**
         * Selects a random element from an array.
         *
         * @param {Array} values Array of values.
         * @param {number=} k Number of characters to sample.
         * @returns {object} Random element if k is not given or less than 2, an array of random elements otherwise.
         */
        choice: function(values, k) {
            if (arguments.length == 1 || k === null || k === undefined || k < 2)
                return choice(values);
            else {
                var elems = [];
                for (var i=0; i<k; i++) {
                    elems.push(choice(values));
                }
                return elems;
            }
        },

        /**
         * Samples some random characters of a string.
         *
         * @param {string} string String to select character from.
         * @param {number=} k Number of characters to sample.
         * @returns {object} Random character if k is not given or less than 2, an array of random characters otherwise.
         */
        char: function(string, k) {
            var charsArray = string.split("");
            if (arguments.length == 1 || k === null || k === undefined || k < 2)
                return choice(charsArray);
            else {
                var chars = [];
                for (var i=0; i<k; i++) {
                    chars.push(choice(charsArray));
                }
                return chars;
            }
        }
    };

    /**
     * Generators of CSS related entities.
     */
    var css = {
        /**
         * Returns a random CSS <integer>.
         *
         * @returns {string} Random integer.
         */
        integer: function() {
            return (core.char("+- ") + core.int(10)).trim();
        },

        /**
         * Returns a random CSS <number>.
         *
         * @returns {string} Random number.
         */
        number: function() {
            if (Math.random() < 1/2) {
                return "" + this.integer();
            } else {
                return (core.char("+- ")
                    + (Math.random() < 0.5 ? core.int(100) : "")
                    + "."
                    + core.int(100)
                ).trim();
            }
        },

        /**
         * Returns a random CSS <length>.
         *
         * @param {boolean=} positive Whether to generate strictly positive length.
         * @returns {string} Random length.
         */
        length: function(positive) {
            var length = this.number() + core.choice(["em", "ex", "px", "in", "cm", "mm", "pt", "pc", "%"]);
            return (positive && length.charAt(0) == "-") ? length.replace("-", "") : length;
        },

        /**
         * Returns a random CSS <color> content type.
         *
         * @returns {string} Random color.
         */
        color: function() {
            if (Math.random() < 1/7)
                return "#" + core.char("0123456789abcdef", 3).join("");
            if (Math.random() < 1/6)
                return "#" + core.char("0123456789abcdef", 6).join("");
            if (Math.random() < 1/5)
                return core.choice(["red", "green", "blue"]);
            if (Math.random() < 1/4)
                return "rgb(" + core.int(255)
                    + "," + core.int(255)
                    + "," + core.int(255)
                    + ")";
            if (Math.random() < 1/3)
                return "rgb(" + core.int(255)
                    + "," + core.int(255)
                    + "," + core.int(255)
                    + "," + core.float()
                    + ")";
            if (Math.random() < 1/2)
                return "rgb(" + core.int(100)
                    + "%," + core.int(100)
                    + "%," + core.int(100)
                    + "%)";
            else
                return "rgb(" + core.int(100)
                    + "%," + core.int(100)
                    + "%," + core.int(100)
                    + "%," + core.float()
                    + ")";
        },

        /**
         * Returns a random CSS <opacity-values>.
         *
         * @returns {string} Random opacity-value.
         */
        opacityValue: function() {
            return "" + core.float();
        }
    };

    /**
     * Generators of SVG related entities.
     */
    var svg = {
        /**
         * Returns a random SVG <integer>.
         *
         * @returns {string} Random integer.
         */
        integer: function() {
            return css.integer();
        },

        /**
         * Returns a random SVG <number>.
         *
         * @returns {string} Random number.
         */
        number: function() {
            if (Math.random() < 0.5) {
                return this.integer()
                    + (Math.random() < 0.5 ? core.char("Ee") + this.integer() : "");
            } else {
                return (core.char("+- ")
                    + (Math.random() < 0.5 ? core.int(100) : "")
                    + "."
                    + core.int(100)
                    + (Math.random() < 0.5 ? core.char("Ee") + this.integer() : "")
                ).trim();
            }
        },

        /**
         * Returns a random SVG <length>.
         *
         * @param positive Whether to generate strictly positive length.
         * @returns {string} Random length.
         */
        length: function(positive) {
            var length = this.number() + core.choice(["", "em", "ex", "px", "in", "cm", "mm", "pt", "pc", "%"]);
            return (positive && length.charAt(0) == "-") ? length.replace("-", "") : length;
        },

        /**
         * Returns a random SVG <coordinate>.
         *
         * @returns {string} Random coordinate.
         */
        coordinate: function() {
            return this.length();
        },

        /**
         * Returns a random SVG <color>.
         *
         * @returns {string} Random color.
         */
        color: function() {
            return css.color();
        },

        /**
         * Returns a random SVG <opacity-values>.
         *
         * @returns {string} Random opacity-value.
         */
        opacityValue: function() {
            return css.opacityValue();
        },

        // TODO unit test
        transformList: function() {

        },

        // TODO unit test
        point: function() {

        },

        // TODO unit test
        movement: function() {

        },

        // TODO unit test
        listOfT: function(t) {

        }
    };

    exports.core = core;
    exports.css = css;
    exports.svg = svg;
})));
