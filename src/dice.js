/**
 * Class for generating various random entities.
 */
// UMD
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
     * Generates a single value or an array of values.
     *
     * @param {function} generator Random generator to use.
     * @param {number=} k Number of values to generate.
     * @returns {number|string|Array} Single value or array of values.
     */
    function some(generator, k) {
        if (k === null || k === undefined || k < 2)
            return generator();
        else {
            var values = new Array(k);
            for (var i=0; i<k; i++)
                values[i] = generator();
            return values;
        }
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
         * @param {number=} k Number of floats to return.
         * @returns {number|Array} Random float in (min, max) if min < max, otherwise a random float in (max, min). If max
         * is not specified, random float in (0, min) if min > 0, otherwise in (min, 0). If none is specified, a random
         * float in (0, 1). If k is specified, an Array of floats between min and max is returned.
         */
        float: function (min, max, k) {
            if (arguments.length == 0)
                return r(0, 1);
            if (arguments.length == 1)
                return r(0, min);
            return some(function() {
                return r(min, max);
            }, k);
        },

        /**
         * Generates a random integer in (min, max).
         * If min > max, a random number in (max, min) is generated.
         * If max is not given, a random number in (0, min) is generated.
         *
         * @param {number} min Lower boundary.
         * @param {number=} max Upper boundary.
         * @param {number=} k Number of integers to return.
         * @returns {number|Array} Random integer in (min, max) if min < max, otherwise a random integer in (max, min). If max
         * is not specified, random integer in (0, min) if min > 0, otherwise in (min, 0). If k is specified, an Array
         * of integers between min and max is returned.
         */
        int: function (min, max, k) {
            if (arguments.length == 1)
                return Math.floor(r(0, min+1));
            return some(function () {
                return Math.floor(r(min, max+1));
            }, k);
        },

        /**
         * Selects a random element from an array.
         *
         * @param {Array} values Array of values.
         * @param {number=} k Number of characters to sample.
         * @returns {object} Random element if k is not given or less than 2, an array of random elements otherwise,
         * null pointer if array is invalid.
         */
        choice: function (values, k) {
            // Return null if values is invalid
            if (values === null || values === undefined || values.length == 0)
                return null;
            return some(function () {
                return values[Math.floor(r(0, values.length))];
            }, k);
        },

        /**
         * Samples some random characters of a string.
         *
         * @param {string} string String to select character from.
         * @param {number=} k Number of characters to sample.
         * @returns {object} Random character if k is not given or less than 2, an array of random characters otherwise.
         */
        char: function (string, k) {
            if (string === null || string === undefined || string.length == 0)
                return "";
            return some(function () {
                return string.charAt(Math.floor(r(0, string.length)));
            }, k);
        },

        /**
         * Shuffles an array using the Fisher--Yates algorithm.
         *
         * @param {Array} values Array of values to shuffle.
         */
        shuffle: function (values) {
            var i, temp, l = values.length;
            while (l) {
                i = Math.floor(Math.random() * l--);
                temp = values[l];
                values[l] = values[i];
                values[i] = temp;
            }
        }
    };

    /**
     * Generators of CSS related entities.
     */
    var css = {
        /**
         * Returns a random CSS <integer> string.
         *
         * @returns {string} Random integer.
         */
        integer: function() {
            return (core.char("+- ") + core.int(10)).trim();
        },

        /**
         * Returns a random CSS <number> string.
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
         * Returns a random CSS <length> string.
         *
         * @param {boolean=} positive Whether to generate strictly positive length.
         * @returns {string} Random length.
         */
        length: function(positive) {
            var length = this.number() + core.choice(["em", "ex", "px", "in", "cm", "mm", "pt", "pc", "%"]);
            return (positive && length.charAt(0) == "-") ? length.replace("-", "") : length;
        },

        /**
         * Returns a random CSS <color> string.
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
                return "rgb(" + core.int(0, 255, 3).join(",") + ")";
            if (Math.random() < 1/3)
                return "rgb(" + core.int(0, 255, 3).join(",") + "," + core.float() + ")";
            if (Math.random() < 1/2)
                return "rgb(" + core.int(0, 100, 3).join("%,") + "%)";
            else
                return "rgb(" + core.int(0, 100, 3).join("%,") + "%," + core.float()
                    + ")";
        },

        /**
         * Returns a random CSS <opacity-value> string.
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
         * Returns a random SVG <integer> string.
         *
         * @returns {string} Random integer.
         */
        integer: function() {
            return css.integer();
        },

        /**
         * Returns a random SVG <number> string.
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
         * Returns a random SVG <length> string.
         *
         * @param positive Whether to generate strictly positive length.
         * @returns {string} Random length.
         */
        length: function(positive) {
            var length = this.number() + core.choice(["", "em", "ex", "px", "in", "cm", "mm", "pt", "pc", "%"]);
            return (positive && length.charAt(0) == "-") ? length.replace("-", "") : length;
        },

        /**
         * Returns a random SVG <coordinate> string.
         *
         * @returns {string} Random coordinate.
         */
        coordinate: function() {
            return this.length();
        },

        /**
         * Returns a random SVG <color> string.
         *
         * @returns {string} Random color.
         */
        color: function() {
            return css.color();
        },

        /**
         * Returns a random SVG <opacity-value> string.
         *
         * @returns {string} Random opacity-value.
         */
        opacityValue: function() {
            return css.opacityValue();
        },

        /**
         * Returns a random SVG <transform-list> string.
         *
         * @returns {string} Random transform-list.
         */
        transformList: function() {
            var transform = "";
            while (transform == "") {
                ["matrix", "translate", "scale", "rotate", "skewX", "skewY"].forEach(function(t) {
                    if (Math.random() < 0.5)
                        return;

                    transform += t + "(";
                    switch (t) {
                        case "matrix":
                            transform += core.float(-10, 10, 6).join(",");
                            break;
                        case "translate":
                            transform += core.float(-10, 10)
                                + (Math.random() < 0.5 ? "," + core.float(-10, 10) : "");
                            break;
                        case "scale":
                            transform += core.float(0, 10)
                                + (Math.random() < 0.5 ? "," + core.float(0, 10) : "");
                            break;
                        case "rotate":
                            transform += core.float(-10, 10)
                                + (Math.random() < 0.5 ? "," + core.float(-10, 10, 2).join(",") : "");
                            break;
                        case "skewX":
                        case "skewY":
                            transform += core.float(-10, 10);
                            break;
                        default:
                            break;
                    }
                    transform += ") ";
                });
            }
            return transform.trim();
        },

        /**
         * Returns a random <point> string.
         *
         * @returns {string} Random point.
         */
        point: function() {
            return core.float(-10, 10, 2).join(",");
        },

        /**
         * Returns a random <path> string.
         *
         * @returns {string} Random path.
         */
        path: function() {
            var length = core.int(10);
            var path = "M " + core.float(-10, 10, 2).join(" ");
            for (var i=0; i<length; i++) {
                var p = core.choice(["m", "l", "h", "v", "c", "s", "q", "t", "a", "z"]);
                path += " " + core.choice([p, p.toUpperCase()]);

                switch (p) {
                    case "a":
                        path += " " +core.float(-10, 10, 2).join(" ")
                            + " " + core.float(-90, 90)
                            + " " + core.int(0, 1, 2).join(" ")
                            + " " + core.float(-10, 10, 2).join(" ");
                        break;
                    case "c":
                        path += " " + core.float(-10, 10, 2).join(" ")
                            + ", " + core.float(-10, 10, 2).join(" ")
                            + ", " + core.float(-10, 10, 2).join(" ");
                        break;
                    case "s":
                    case "q":
                        path += " " + core.float(-10, 10, 2).join(" ")
                            + ", " + core.float(-10, 10, 2).join(" ");
                        break;
                    case "m":
                    case "l":
                    case "t":
                        path += " " + core.float(-10, 10, 2).join(" ");
                        break;
                    case "h":
                    case "v":
                        path += " " + core.float(-10, 10);
                        break;
                    case "z":
                    default:
                        break;
                }
            }
            return path.trim();
        }
    };

    var dist = {
        /**
         * Returns some uniformly distributed random values.
         *
         * @param {number} min Lower boundary.
         * @param {number} max Upper boundary.
         * @param {number=} k Number of values to return.
         * @returns {number|Array} Single value or array of random values.
         */
        uniform: function (min, max, k) {
            return some(function() {
                return Math.random() * (max - min) + min;
            }, k);
        },

        /**
         * Returns some exponentially distributed random values.
         *
         * @param {number} lambda Rate parameter.
         * @param {number=} k Number of values to return.
         * @returns {number|Array} Single value or array of random values.
         */
        exponential: function (lambda, k) {
            return some(function () {
                return -Math.log(Math.random()) / lambda;
            }, k);
        },

        /**
         * Returns some Pareto distributed random values.
         *
         * @param {number} xmin Scale parameter.
         * @param {number} alpha Shape parameter.
         * @param {number=} k Number of values to return.
         * @returns {number|Array} Single value or array of random values.
         */
        pareto: function (xmin, alpha, k) {
            return some(function() {
                return xmin / Math.pow(Math.random(), 1 / alpha);
            }, k);
        },

        // TODO unit test
        boundedPareto: function (xmin, xmax, alpha, k) {
            var l = Math.pow(xmin, alpha);
            var h = Math.pow(xmax, alpha);
            return some(function () {
                return Math.pow((h + Math.random() * (l - h)) / (l * h), -1 / alpha);
            }, k);
        }
    };
/*        custom: function() {
            /!**
             * Parameters of the generator: population, biased coins and aliases.
             *!/
            var n = 0;
            var prob = [];
            var alias = [];

            return {
                /!**
                 * Initializes alias table with the given weights.
                 * Weigts need not to be normalized.
                 *
                 * @param weights Weights to use in the alias table.
                 *!/
                init: function (weights) {
                    // Single element
                    if (weights.length == 0 || !(weights instanceof Array)) {
                        prob = [0];
                        alias = [0];
                        return;
                    }

                    // Get sum (for normalization)
                    n = weights.length;
                    var sum = 0;
                    for (var i = 0; i < n; i++)
                        sum += weights[i];

                    // Fill up small and large work lists
                    var p = [];
                    var small = [];
                    var large = [];
                    for (i = 0; i < n; i++) {
                        p.push(this._n * weights[i] / sum);
                        if (p[i] < 1.0)
                            small.push(i);
                        else
                            large.push(i);
                    }

                    // Init tables
                    prob = [];
                    alias = [];
                    for (i = 0; i < this._n; i++) {
                        prob.push(1.0);
                        alias.push(i);
                    }

                    // Fill up alias table
                    var s = 0,
                        l = 0;
                    while (small.length > 0 && large.length > 0) {
                        s = small.shift();
                        l = large.shift();

                        prob[s] = p[s];
                        alias[s] = l;

                        p[l] += p[s] - 1.0;
                        if (p[l] < 1.0)
                            small.push(l);
                        else
                            large.push(l);
                    }
                    while (large.length > 0) {
                        l = large.shift();
                        prob[l] = 1.0;
                        alias[l] = l;
                    }
                    while (small.length > 0) {
                        s = small.shift();
                        prob[s] = 1.0;
                        alias[s] = s;
                    }
                },

                /!**
                 * Returns an integer value according to the current alias table.
                 *
                 * @returns {number} Random integer.
                 *!/
                sample: function () {
                    if (n <= 1) {
                        return 0;
                    }

                    var i = Math.floor(Math.random() * n);
                    if (Math.random() < prob[i])
                        return i;
                    else
                        return alias[i];
                }
            };
        };*/

    exports.core = core;
    exports.css = css;
    exports.svg = svg;
    exports.dist = dist;
})));
