/**
 * Module for generating various random numbers and objects.
 * @module dice
 *
 * @todo add some more distributions: https://en.wikipedia.org/wiki/List_of_probability_distributions
 * @todo add alias table
 * @todo add jsdoc to CSS
 * @todo add jsdoc to SVG
 * @todo make SVG methods return object
 * @todo go through documentation and finalize
 * @todo add processes: https://en.wikipedia.org/wiki/Stochastic_process
 */
// UMD
(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        // Common JS
        factory(exports);
    } else if (typeof define === 'function' && define['amd']) {
        // AMD
        define(['exports'], factory);
    } else {
        // Browser
        factory((global.dice = global['dice'] || {}));
    }
} (this, (function (exports) { "use strict";
    /**
     * The main random number generator.
     * If min > max, a random number in (max, min) is generated.
     *
     * @method r
     * @memberOf dice
     * @param {number} min Lower boundary.
     * @param {number} max Upper boundary.
     * @returns {number} Random number.
     * @private
     */
    function _r(min, max) {
        return min < max ? Math.random() * (max - min) + min : Math.random() * (min - max) + max;
    }

    /**
     * Runs a generator once or several times to return a single value or an array of values.
     *
     * @method some
     * @memberOf dice
     * @param {function} generator Random generator to use.
     * @param {number=} k Number of values to generate.
     * @returns {(number|string|Array)} Single value or array of generated values.
     * @private
     */
    function _some(generator, k) {
        if (k === null || k === undefined || k < 2)
            return generator();
        else {
            var values = new Array(k);
            for (var i = 0; i < k; i++)
                values[i] = generator();
            return values;
        }
    }

    /**
     * Some special functions.
     *
     * @namespace special
     * @memberOf dice
     * @private
     */
    var special = (function(){
        /**
         * Maximum number of iterations in function approximations.
         *
         * @var {number} _MAX_ITER
         * @memberOf dice.special
         * @private
         */
        var _MAX_ITER = 100;

        /**
         * Error tolerance in function approximations.
         *
         * @var {number} _EPSILON
         * @memberOf dice.special
         * @private
         */
        var _EPSILON = 1e-10;

        /**
         * Gamma function, using the Lanczos approximation.
         *
         * @method gamma
         * @memberOf dice.special
         * @param {number} z Value to evaluate Gamma function at.
         * @returns {number} Gamma function value.
         * @private
         */
        var gamma = (function() {
            // Coefficients
            var _p = [
                676.5203681218851,
                -1259.1392167224028,
                771.32342877765313,
                -176.61502916214059,
                12.507343278686905,
                -0.13857109526572012,
                9.9843695780195716e-6,
                1.5056327351493116e-7
            ];

            // Lanczos approximation
            function _gamma(z) {
                var y = 0;
                if (z < 0.5) {
                    y = Math.PI / (Math.sin(Math.PI*z) * _gamma(1-z));
                } else {
                    z--;
                    var x = 0.99999999999980993;
                    var l = _p.length;
                    _p.forEach(function (p, i) {
                        x += p / (z+i+1);
                        var t = z + l - 0.5;
                        y = Math.sqrt(2*Math.PI) * Math.pow(t, (z+0.5)) * Math.exp(-t) * x;
                    });
                }
                return y;
            }

            return _gamma;
        })();

        /**
         * Lower incomplete gamma function, using the series expansion and continued fraction approximations.
         *
         * @method gammaLowerIncomplete
         * @memberOf dice.special
         * @param {number} a Parameter of the integrand in the integral definition.
         * @param {number} x Lower boundary of the integral.
         * @returns {number} Value of the lower incomplete gamma function.
         * @private
         */
        var gammaLowerIncomplete = (function() {
            var _DELTA = 1e-30;

            // Lower incomplete gamma generator using the series expansion
            function _gli_series(s, x) {
                if (x < 0) {
                    return 0;
                } else {
                    var si = s,
                        y = 1/s;
                    var f = 1/s;
                    for (var i=0; i<_MAX_ITER; i++) {
                        si++;
                        y *= x/si;
                        f += y;
                        if (y < f*_EPSILON)
                            break;
                    }
                    return Math.exp(-x) * Math.pow(x, s) * f;
                }
            }

            // Upper incomplete gamma generator using the continued fraction expansion
            function _gui_continued_fraction(s, x) {
                var b = x + 1 - s,
                    c = 1 / _DELTA;
                var d = 1 / b;
                var f = d,
                    fi, y;
                for (var i=1; i<=_MAX_ITER; i++) {
                    fi = i * (s-i);
                    b += 2;
                    d = fi * d + b;
                    if (Math.abs(d) < _DELTA)
                        d = _DELTA;
                    d = 1 / d;
                    c = b + fi / c;
                    if (Math.abs(c) < _DELTA)
                        c = _DELTA;
                    y = c * d;
                    f *= y;
                    if (Math.abs(y-1) < _EPSILON)
                        break;
                }
                return Math.exp(-x) * Math.pow(x, s) * f;
            }

            return function(s, x) {
                if (x < s+1)
                    return _gli_series(s, x);
                else
                    return gamma(s) - _gui_continued_fraction(s, x);
            };
        })();

        return {
            gamma: gamma,
            gammaLowerIncomplete: gammaLowerIncomplete
        };
    })();

    /**
     * Core functionality: basic generators and manipulators.
     *
     * @namespace core
     * @memberOf dice
     */
    var core = (function() {
        /**
         * Generates some uniformly distributed random floats in (min, max).
         * If min > max, a random float in (max, min) is generated.
         * If no parameters are passed, generates a single random float between 0 and 1.
         * If only min is specified, generates a single random float between 0 and min.
         *
         * @method float
         * @memberOf dice.core
         * @param {number=} min Lower boundary, or upper if max is not given.
         * @param {number=} max Upper boundary.
         * @param {number=} n Number of floats to generate.
         * @returns {(number|Array)} Single float or array of random floats.
         */
        function float(min, max, n) {
            if (arguments.length == 0)
                return _r(0, 1);
            if (arguments.length == 1)
                return _r(0, min);
            return _some(function () {
                return _r(min, max);
            }, n);
        }

        /**
         * Generates some uniformly distributed random integers in (min, max).
         * If min > max, a random integer in (max, min) is generated.
         * If only min is specified, generates a single random integer between 0 and min.
         *
         * @method int
         * @memberOf dice.core
         * @param {number} min Lower boundary, or upper if max is not specified.
         * @param {number=} max Upper boundary.
         * @param {number=} n Number of integers to generate.
         * @returns {(number|Array)} Single integer or array of random integers.
         */
        function int(min, max, n) {
            if (arguments.length == 1)
                return Math.floor(_r(0, min + 1));
            return _some(function () {
                return Math.floor(_r(min, max + 1));
            }, n);
        }

        /**
         * Samples some elements with replacement from an array with uniform distribution.
         *
         * @method choice
         * @memberOf dice.core
         * @param {Array} values Array to sample from.
         * @param {number=} n Number of elements to sample.
         * @returns {(object|Array)} Single element or array of sampled elements. If array is invalid, null pointer is
         * returned.
         */
        function choice(values, n) {
            if (values === null || values === undefined || values.length == 0)
                return null;
            return _some(function () {
                return values[Math.floor(_r(0, values.length))];
            }, n);
        }

        /**
         * Samples some characters with replacement from a string with uniform distribution.
         *
         * @method char
         * @memberOf dice.core
         * @param {string} string String to sample characters from.
         * @param {number=} n Number of characters to sample.
         * @returns {(string|Array)} Random character if k is not given or less than 2, an array of random characters otherwise.
         */
        function char(string, n) {
            if (string === null || string === undefined || string.length == 0)
                return "";
            return _some(function () {
                return string.charAt(Math.floor(_r(0, string.length)));
            }, n);
        }

        /**
         * Shuffles an array in-place using the Fisher--Yates algorithm.
         *
         * @method shuffle
         * @memberOf dice.core
         * @param {Array} values Array to shuffle.
         */
        function shuffle(values) {
            var i, temp, l = values.length;
            while (l) {
                i = Math.floor(Math.random() * l--);
                temp = values[l];
                values[l] = values[i];
                values[i] = temp;
            }
        }

        /**
         * Flips a biased coin several times and returns the associated head/tail value or array of values.
         *
         * @method coin
         * @memberOf dice.core
         * @param {number} p Bias (probability of head).
         * @param {object} head Head value.
         * @param {object} tail Tail value.
         * @param {number=} n Number of coins to flip.
         * @returns {(object|Array)} Object of head/tail value or an array of head/tail values.
         */
        function coin(p, head, tail, n) {
            return _some(function () {
                return Math.random() < p ? head : tail;
            }, n);
        }

        return {
            float: float,
            int: int,
            choice: choice,
            char: char,
            shuffle: shuffle,
            coin: coin
        };
    })();

    /**
     * A collection of generators for well-known distributions.
     *
     * @namespace dist
     * @memberOf dice
     */
    var dist = (function(){
        /**
         * Generates some uniformly distributed random values.
         *
         * @method uniform
         * @memberOf dice.dist
         * @param {number} min Lower boundary.
         * @param {number} max Upper boundary.
         * @param {number=} n Number of values to return.
         * @returns {(number|Array)} Single value or array of random values.
         */
        function uniform(min, max, n) {
            return _some(function () {
                return Math.random() * (max - min) + min;
            }, n);
        }

        /**
         * Generates some exponentially distributed random values.
         *
         * @method exponential
         * @memberOf dice.dist
         * @param {number} lambda Rate parameter.
         * @param {number=} n Number of values to return.
         * @returns {number|Array} Single value or array of random values.
         */
        function exponential(lambda, n) {
            return _some(function () {
                return -Math.log(Math.random()) / lambda;
            }, n);
        }

        /**
         * Generates some normally distributed random values.
         *
         * @method normal
         * @memberOf dice.dist
         * @param {number} mu Location parameter (mean).
         * @param {number} sigma Squared scale parameter (variance).
         * @param {number=} n Number of values to return.
         * @returns {(number|Array)} Single value or array of random values.
         */
        function normal(mu, sigma, n) {
            return _some(function () {
                var u = Math.random(),
                    v = Math.random();
                return sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) + mu;
            }, n);
        }

        /**
         * Generates some log-normally distributed random values.
         *
         * @method lognormal
         * @memberOf dice.dist
         * @param {number} mu Location parameter.
         * @param {number} sigma Scale parameter.
         * @param {number=} n Number of values to return.
         * @returns {(number|Array)} Single value or array of random values.
         */
        function lognormal(mu, sigma, n) {
            return _some(function () {
                var u = Math.random(),
                    v = Math.random();
                return Math.exp(sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) + mu);
            }, n);
        }

        /**
         * Generates some Pareto distributed random values.
         *
         * @method pareto
         * @memberOf dice.dist
         * @param {number} xmin Scale parameter.
         * @param {number} alpha Shape parameter.
         * @param {number=} n Number of values to return.
         * @returns {(number|Array)} Single value or array of random values.
         */
        function pareto(xmin, alpha, n) {
            return _some(function () {
                return xmin / Math.pow(Math.random(), 1 / alpha);
            }, n);
        }

        /**
         * Generates some bounded Pareto distributed random values.
         *
         * @method boundedPareto
         * @memberOf dice.dist
         * @param {number} xmin Lower boundary.
         * @param {number} xmax Upper boundary.
         * @param {number} alpha Shape parameter.
         * @param {number=} n Number of values to return.
         * @returns {(number|Array)} Single value or array of random values.
         */
        function boundedPareto(xmin, xmax, alpha, n) {
            var l = Math.pow(xmin, alpha);
            var h = Math.pow(xmax, alpha);
            return _some(function () {
                return Math.pow((h + Math.random() * (l - h)) / (l * h), -1 / alpha);
            }, n);
        }

        /**
         * Generates some Weibull distributed random values.
         *
         * @method weibull
         * @memberOf dice.dist
         * @param {number} lambda Scale parameter.
         * @param {number} k Shape parameter.
         * @param {number=} n Number of values to return.
         * @returns {(number|Array)} Single value or array of random values.
         */
        function weibull(lambda, k, n) {
            return _some(function () {
                return lambda * Math.pow(-Math.log(Math.random()), 1 / k);
            }, n);
        }

        /**
         * Generates some gamma distributed random values according to the rate parametrization.
         *
         * @method gamma
         * @memberOf dice.dist
         * @param {number} alpha Shape parameter.
         * @param {number} beta Rate parameter.
         * @param {number=} n Number of values to return.
         * @returns {(number|Array)} Single value or array of random values.
         */
        var gamma = (function() {
            function _gamma(alpha, beta) {
                if (alpha > 1) {
                    var d = alpha - 1 / 3;
                    var c = 1 / Math.sqrt(9 * d),
                        Z, V, U;
                    while (true) {
                        Z = normal(0, 1);
                        if (Z > -1 / c) {
                            V = Math.pow(1 + c * Z, 3);
                            U = Math.random();
                            if (Math.log(U) < 0.5 * Z * Z + d * (1 - V + Math.log(V)))
                                return d * V / beta;
                        }
                    }
                } else {
                    return _gamma(alpha + 1, beta) * Math.pow(Math.random(), 1 / alpha);
                }
            }

            return function (alpha, beta, n) {
                return _some(function () {
                    return _gamma(alpha, beta);
                }, n);
            };
        })();

        /**
         * Generates some Poisson distributed random values.
         * FIXME use different methods for small/large lambda
         *
         * @method poisson
         * @memberOf dice.dist
         * @param {number} lambda Mean of the distribution.
         * @param {number=} n Number of values to return.
         * @returns {(number|Array)} Single value or array of random values.
         */
        function poisson(lambda, n) {
            return _some(function () {
                var l = Math.exp(-lambda),
                    k = 0,
                    p = 1;
                do {
                    k++;
                    p *= Math.random();
                } while (p > l);
                return k - 1;
            }, n);
        }

        /**
         * Class implementing the alias table method for custom distribution.
         *
         * @class Alias
         * @memberOf dice.dist
         * @param {Array} weights Array of weights to init the alias table with.
         * @constructor
         */
        function Alias(weights) {
            var _n = 0;
            var _prob = [0];
            var _alias = [0];

            /**
             * Resets alias table weights.
             *
             * @method reset
             * @memberOf dice.dist.Alias
             * @param {Array} w Array of weights to reset the alias table to.
             */
            this.reset = function(w) {
                // Single element
                if (w.length < 1) {
                    _prob = [0];
                    _alias = [0];
                    return;
                }
                // Get sum (for normalization)
                _n = w.length;
                var sum = 0;
                for (var i = 0; i < _n; i++)
                    sum += w[i];

                // Fill up small and large work lists
                var p = [];
                var small = [];
                var large = [];
                for (i = 0; i < _n; i++) {
                    p.push(_n * w[i] / sum);
                    if (p[i] < 1.0)
                        small.push(i);
                    else
                        large.push(i);
                }

                // Init tables
                _prob = [];
                _alias = [];
                for (i = 0; i < _n; i++) {
                    _prob.push(1.0);
                    _alias.push(i);
                }

                // Fill up alias table
                var s = 0,
                    l = 0;
                while (small.length > 0 && large.length > 0) {
                    s = small.shift();
                    l = large.shift();

                    _prob[s] = p[s];
                    _alias[s] = l;

                    p[l] += p[s] - 1.0;
                    if (p[l] < 1.0)
                        small.push(l);
                    else
                        large.push(l);
                }
                while (large.length > 0) {
                    l = large.shift();
                    _prob[l] = 1.0;
                    _alias[l] = l;
                }
                while (small.length > 0) {
                    s = small.shift();
                    _prob[s] = 1.0;
                    _alias[s] = s;
                }
            };
            this.reset(weights);

            /**
             * Samples some values from the alias table.
             *
             * @method sample
             * @memberOf dice.dist.Alias
             * @param {number=} n Number of values to return.
             * @returns {(number|Array)} Single value or array of random values.
             */
            this.sample = function(n) {
                return _some(function () {
                    if (_n <= 1) {
                        return 0;
                    }

                    var i = Math.floor(Math.random() * _n);
                    if (Math.random() < _prob[i])
                        return i;
                    else
                        return _alias[i];
                }, n);
            };
        }

        return {
            uniform: uniform,
            exponential: exponential,
            normal: normal,
            lognormal: lognormal,
            pareto: pareto,
            boundedPareto: boundedPareto,
            weibull: weibull,
            gamma: gamma,
            poisson: poisson,
            Alias: Alias
        };
    })();

    /**
     * A collection of methods to generate CSS content types.
     *
     * @namespace css
     * @memberOf dice
     */
    var css = (function() {
        /**
         * Class describing a random CSS content.
         *
         * @class CSSContent
         * @memberOf dice.css
         * @property {object} o Object corresponding to the CSS content. Can be a single string, an array, etc.
         * @property {string} s String representation of the CSS content. This is the final value that is put after the
         * colon in a property:value pair.
         * @constructor
         */
        function CSSContent(o, s) {
            return {o: o, s: s};
        }

        /**
         * Generates a random CSS integer.
         *
         * @method integer
         * @memberOf dice.css
         * @returns {CSSContent} Random CSS integer.
         */
        function integer() {
            var s = core.char("+- ") + core.int(10);
            return this.CSSContent(
                parseInt(s),
                s.trim()
            );
        }

        /**
         * Generates a random CSS number.
         *
         * @method number
         * @memberOf dice.css
         * @returns {CSSContent} Random CSS number.
         */
        function number() {
            var s = core.char("+- ") + core.coin(0.5, core.int(100), "") + "." + core.int(100);
            return this.CSSContent(
                parseFloat(s),
                s.trim()
            );
        }

        /**
         * Generates a random CSS length.
         *
         * @method length
         * @memberOf dice.css
         * @returns {CSSContent} Random CSS length.
         */
        function length() {
            var s = core.coin(0.5, core.int(100), "") + "." + core.int(100);
            if (parseFloat(s) != 0) {
                s += core.choice(["em", "ex", "px", "in", "cm", "mm", "pt", "pc", "%"]);
            } else {
                s = "0";
            }
            return this.CSSContent(
                parseFloat(s),
                s.trim()
            );
        }

        /**
         * Generates a random CSS opacity-value.
         *
         * @method opacityValue
         * @memberOf dice.css
         * @returns {CSSContent} Random CSS opacityValue.
         */
        function opacityValue() {
            var s = core.choice([
                "1", "0",
                core.int(9) + "." + core.int(1, 1000) + core.char("Ee") + core.int(-10, -1),
                core.char(" 0") + "." + core.int(1, 1000)
            ]);
            return this.CSSContent(
                parseFloat(s),
                s.trim()
            );
        }

        /**
         * Generates a random CSS color.
         *
         * @method color
         * @memberOf dice.css
         * @returns {CSSContent} Random CSS color.
         */
        function color() {
            var o = {
                r: core.int(255),
                g: core.int(255),
                b: core.int(255)
            };

            // 6 digit hex
            if (Math.random() < 1/5) {
                return this.CSSContent(
                    o,
                    "#" + Math.floor(o.r/16).toString(16) + (o.r%16).toString(16)
                    + Math.floor(o.g/16).toString(16) + (o.g%16).toString(16)
                    + Math.floor(o.b/16).toString(16) + (o.b%16).toString(16)
                );
            }
            // 3 digits hex
            if (Math.random() < 1/4) {
                o = {
                    r: Math.floor(o.r/16),
                    g: Math.floor(o.g/16),
                    b: Math.floor(o.b/16)
                };
                return this.CSSContent(
                    o,
                    "#" + o.r.toString(16) + o.g.toString(16) + o.b.toString(16)
                );
            }
            // rgb with integers
            if (Math.random() < 1/3) {
                return this.CSSContent(
                    o,
                    "rgb(" + o.r + "," + o.g + "," + o.b + ")"
                );
            }
            // rgb with percentages
            if (Math.random() < 1/2) {
                return this.CSSContent(
                    o,
                    "rgb(" + Math.floor(o.r/2.55) + "%," + Math.floor(o.g/2.55) + "%," + Math.floor(o.b/2.55) + "%)"
                );
            } else {
                var index = core.int(146);
                var s = ["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black",
                    "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse",
                    "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan",
                    "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta",
                    "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
                    "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink",
                    "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen",
                    "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow",
                    "grey", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender",
                    "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan",
                    "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey", "lightpink", "lightsalmon",
                    "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue",
                    "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine",
                    "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue",
                    "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream",
                    "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange",
                    "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred",
                    "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "red", "rosybrown",
                    "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver",
                    "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan",
                    "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow",
                    "yellowgreen"][index];
                var c = ["#F0F8FF", "#FAEBD7", "#00FFFF", "#7FFFD4", "#F0FFFF", "#F5F5DC", "#FFE4C4", "#000000",
                    "#FFEBCD", "#0000FF", "#8A2BE2", "#A52A2A", "#DEB887", "#5F9EA0", "#7FFF00", "#D2691E",
                    "#FF7F50", "#6495ED", "#FFF8DC", "#DC143C", "#00FFFF", "#00008B", "#008B8B", "#B8860B",
                    "#A9A9A9", "#006400", "#A9A9A9", "#BDB76B", "#8B008B", "#556B2F", "#FF8C00", "#9932CC",
                    "#8B0000", "#E9967A", "#8FBC8F", "#483D8B", "#2F4F4F", "#2F4F4F", "#00CED1", "#9400D3",
                    "#FF1493", "#00BFFF", "#696969", "#696969", "#1E90FF", "#B22222", "#FFFAF0", "#228B22",
                    "#FF00FF", "#DCDCDC", "#F8F8FF", "#FFD700", "#DAA520", "#808080", "#008000", "#ADFF2F",
                    "#808080", "#F0FFF0", "#FF69B4", "#CD5C5C", "#4B0082", "#FFFFF0", "#F0E68C", "#E6E6FA",
                    "#FFF0F5", "#7CFC00", "#FFFACD", "#ADD8E6", "#F08080", "#E0FFFF", "#FAFAD2", "#D3D3D3",
                    "#90EE90", "#D3D3D3", "#FFB6C1", "#FFA07A", "#20B2AA", "#87CEFA", "#778899", "#778899",
                    "#B0C4DE", "#FFFFE0", "#00FF00", "#32CD32", "#FAF0E6", "#FF00FF", "#800000", "#66CDAA",
                    "#0000CD", "#BA55D3", "#9370DB", "#3CB371", "#7B68EE", "#00FA9A", "#48D1CC", "#C71585",
                    "#191970", "#F5FFFA", "#FFE4E1", "#FFE4B5", "#FFDEAD", "#000080", "#FDF5E6", "#808000",
                    "#6B8E23", "#FFA500", "#FF4500", "#DA70D6", "#EEE8AA", "#98FB98", "#AFEEEE", "#DB7093",
                    "#FFEFD5", "#FFDAB9", "#CD853F", "#FFC0CB", "#DDA0DD", "#B0E0E6", "#800080", "#FF0000",
                    "#BC8F8F", "#4169E1", "#8B4513", "#FA8072", "#F4A460", "#2E8B57", "#FFF5EE", "#A0522D",
                    "#C0C0C0", "#87CEEB", "#6A5ACD", "#708090", "#708090", "#FFFAFA", "#00FF7F", "#4682B4",
                    "#D2B48C", "#008080", "#D8BFD8", "#FF6347", "#40E0D0", "#EE82EE", "#F5DEB3", "#FFFFFF",
                    "#F5F5F5", "#FFFF00", "#9ACD32"][index].replace('#', '');
                return this.CSSContent(
                    {r: parseInt(c[0] + c[1], 16), g: parseInt(c[2] + c[3], 16), b: parseInt(c[4] + c[5], 16)},
                    s
                );
            }
        }

        return {
            CSSContent: CSSContent,
            integer: integer,
            number: number,
            length: length,
            opacityValue: opacityValue,
            color: color
        };
    })();

    /**
     * A collection of methods to generate SVG content types.
     *
     * @namespace svg
     * @memberOf dice
     */
    var svg = (function() {
        /**
         * Class describing a random SVG content.
         * This is an alias for CSSContent.
         *
         * @class SVGContent
         * @memberOf dice.svg
         * @property {object} i Object corresponding to the SVG content. Can be a single string, an array, etc.
         * @property {string} o String representation of the SVG content. This is the final value that is put after the
         * colon in a property:value pair.
         * @constructor
         */
        function SVGContent(o, s) {
            return css.CSSContent(o, s);
        }

        /**
         * Generates a random SVG integer.
         *
         * @method integer
         * @memberOf dice.svg
         * @returns {SVGContent} Random SVG integer.
         */
        function integer() {
            return css.integer();
        }

        /**
         * Generates a random SVG number.
         *
         * @method number
         * @memberOf dice.svg
         * @returns {SVGContent} Random SVG number.
         */
        function number() {
            var s = core.char("+- ")
                + core.coin(0.5, core.int(10) + ".", "")
                + core.int(1, 1000)
                + core.coin(0.5, core.char("Ee") + core.int(4), "");
            return this.SVGContent(
                parseFloat(s),
                s.trim()
            );
        }

        /**
         * Generates a random SVG length.
         *
         * @method length
         * @memberOf dice.svg
         * @returns {SVGContent} Random SVG length.
         */
        function length() {
            var r = this.number();
            if (r.s.charAt(0) == "-")
                r.s.replace("-", "");
            return this.SVGContent(
                r.o,
                r.s + core.choice(["", "em", "ex", "px", "in", "cm", "mm", "pt", "pc", "%"])
            );
        }

        /**
         * Generates a random SVG coordinate.
         *
         * @method coordinate
         * @memberOf dice.svg
         * @returns {SVGContent} Random SVG coordinate.
         */
        function coordinate() {
            return this.length();
        }

        /**
         * Generates a random SVG opacity-value.
         *
         * @method opacityValue
         * @memberOf dice.svg
         * @returns {SVGContent} Random SVG opacity-value.
         */
        function opacityValue() {
            return css.opacityValue();
        }

        /**
         * Generates a random SVG color.
         *
         * @method color
         * @memberOf dice.svg
         * @returns {SVGContent} Random SVG color.
         */
        function color() {
            return css.color();
        }

        /**
         * Generates a random SVG transform-list.
         *
         * @method transformList
         * @memberOf dice.svg
         * @returns {SVGContent} Random SVG transform-list.
         */
        function transformList() {
            var o = [];
            var s = "";
            while (s == "") {
                ["matrix", "translate", "scale", "rotate", "skewX", "skewY"].forEach(function(t) {
                    if (Math.random() < 0.5)
                        return;

                    var m = null;
                    switch (t) {
                        case "matrix":
                            m = core.float(-10, 10, 6);
                            s += m.join(",");
                            break;
                        case "translate":
                            m = [1, 0, 0, 1, core.float(-10, 10), 0];
                            s += m[4];
                            if (Math.random() < 0.5) {
                                m[5] = core.float(-10, 10);
                                s += "," + m[5];
                            }
                            break;
                        case "scale":
                            m = [core.float(-10, 10), 0, 0, 0, 0, 0];
                            s += m[0];
                            if (Math.random() < 0.5) {
                                m[3] = core.float(-10, 10);
                                s += "," + m[3];
                            } else {
                                m[3] = m[0];
                            }
                            break;
                        case "rotate":
                            s += core.float(-10, 10)
                                + (Math.random() < 0.5 ? "," + core.float(-10, 10, 2).join(",") : "");
                            break;
                        case "skewX":
                        case "skewY":
                            s += core.float(-10, 10);
                            break;
                        default:
                            break;
                    }
                    o.push(m);
                    s = "(" + s + ") ";
                });
            }
            return this.SVGContent(
                o,
                s.trim()
            );
        }

        /**
         * Generates a random point.
         *
         * @method point
         * @memberOf dice.svg
         * @returns {SVGContent} Random SVG point.
         */
        function point() {
            return core.float(-10, 10, 2).join(",");
        }

        /**
         * Generates a random path.
         *
         * @method path
         * @memberOf dice.svg
         * @returns {SVGContent} Random SVG path.
         */
        function path() {
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
    })();

    // Exports
    exports._special = special;
    exports.core = core;
    exports.dist = dist;
    exports.css = css;
    exports.svg = svg;
})));
