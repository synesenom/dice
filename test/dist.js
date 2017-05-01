var assert = require('assert');
var math = require('mathjs');
var jstat = require('jstat');
var dist = require('../src/dice').dist;

var TRIALS = 1;
var LAPS = 1000000;
var CHI_TABLE_LOW = [0, 6.635, 9.210, 11.345, 13.277, 15.086, 16.812, 18.475, 20.090, 21.666, 23.209, 24.725, 26.217,
    27.688, 29.141, 30.578, 32.000, 33.409, 34.805, 36.191, 37.566, 38.932, 40.289, 41.638, 42.980, 44.314, 45.642,
    46.963, 48.278, 49.588, 50.892, 52.191, 53.486, 54.776, 56.061, 57.342, 58.619, 59.893, 61.162, 62.428, 63.691,
    64.950, 66.206, 67.459, 68.710, 69.957, 71.201, 72.443, 73.683, 74.919, 76.154, 77.386, 78.616, 79.843, 81.069,
    82.292, 83.513, 84.733, 85.950, 87.166, 88.379, 89.591, 90.802, 92.010, 93.217, 94.422, 95.626, 96.828, 98.028,
    99.228, 100.425, 101.621, 102.816, 104.010, 105.202, 106.393, 107.583, 108.771, 109.958, 111.144, 112.329, 113.512,
    114.695, 115.876, 117.057, 118.236, 119.414, 120.591, 121.767, 122.942, 124.116, 125.289, 126.462, 127.633, 128.803,
    129.973, 131.141, 132.309, 133.476, 134.642, 135.807, 136.971, 138.134, 139.297, 140.459, 141.620, 142.780, 143.940,
    145.099, 146.257, 147.414, 148.571, 149.727, 150.882, 152.037, 153.191, 154.344, 155.496, 156.648, 157.800, 158.950,
    160.100, 161.250, 162.398, 163.546, 164.694, 165.841, 166.987, 168.133, 169.278, 170.423, 171.567, 172.711, 173.854,
    174.996, 176.138, 177.280, 178.421, 179.561, 180.701, 181.840, 182.979, 184.118, 185.256, 186.393, 187.530, 188.666,
    189.802, 190.938, 192.073, 193.208, 194.342, 195.476, 196.609, 197.742, 198.874, 200.006, 201.138, 202.269, 203.400,
    204.530, 205.660, 206.790, 207.919, 209.047, 210.176, 211.304, 212.431, 213.558, 214.685, 215.812, 216.938, 218.063,
    219.189, 220.314, 221.438, 222.563, 223.687, 224.810, 225.933, 227.056, 228.179, 229.301, 230.423, 231.544, 232.665,
    233.786, 234.907, 236.027, 237.147, 238.266, 239.386, 240.505, 241.623, 242.742, 243.860, 244.977, 246.095, 247.212,
    248.329, 249.445, 250.561, 251.677, 252.793, 253.908, 255.023, 256.138, 257.253, 258.367, 259.481, 260.595, 261.708,
    262.821, 263.934, 265.047, 266.159, 267.271, 268.383, 269.495, 270.606, 271.717, 272.828, 273.939, 275.049, 276.159,
    277.269, 278.379, 279.488, 280.597, 281.706, 282.814, 283.923, 285.031, 286.139, 287.247, 288.354, 289.461, 290.568,
    291.675, 292.782, 293.888, 294.994, 296.100, 297.206, 298.311, 299.417, 300.522, 301.626, 302.731, 303.835, 304.940
];
var CHI_TABLE_HIGH = {
    300: 359.906,
    350: 414.474,
    400: 468.724,
    450: 522.717,
    500: 576.493,
    550: 630.084,
    600: 683.516,
    650: 736.807,
    700: 789.974,
    750: 843.029,
    800: 895.984,
    850: 948.848,
    900: 1001.630,
    950: 1054.334,
    1000: 1106.969
};

/**
 * Performs a Kolmogorov-Smirnov test with significance level of 99%.
 *
 * @param values Sample of continuous random values.
 * @param model Theoretical cumulative distribution function.
 */
function ks_test(values, model) {
    var D = 0;
    values.sort(function (a, b) {
        return a-b;
    });
    for (var i=0; i<values.length; i++) {
        //console.log((i+1)/values.length, model(values[i]));
        D = Math.max(D, Math.abs((i+1)/values.length - model(values[i])));
    }
    assert.equal(D <= 1.628/Math.sqrt(LAPS), true);
}

/**
 * Performs a chi-square test with significance level of 99%.
 *
 * @param values Sample of discrete random values.
 * @param model Theoretical cumulative mass function.
 * @param c Number of model parameters.
 */
function chi_test(values, model, c) {
    // Calculate distribution first
    var p = {};
    for (var i=0; i<values.length; i++) {
        if (!p[values[i]])
            p[values[i]] = 0;
        p[values[i]]++;
    }

    // Calculate chi-square
    var chi2 = 0;
    for (var x in p) {
        var m = model(x) * values.length;
        chi2 += Math.pow(p[x] - m, 2) / m;
    }

    // Find critical value
    var df = Object.keys(p).length - c - 1;
    var crit = df <= 250 ? CHI_TABLE_LOW[df] : CHI_TABLE_HIGH[Math.floor(df/50) * 50];
    assert.equal(chi2 <= crit, true);
}

describe('dice', function() {
    describe('dist', function() {
        /// Continuous distributions ///
        describe('uniform(min, max, n)', function () {
            it('should return an array of uniformly distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    const xmin = Math.random()*100 - 50;
                    const xmax = xmin + Math.random()*50;
                    ks_test(dist.uniform(xmin, xmax, LAPS), function (x) {
                        return (x-xmin) / (xmax-xmin);
                    });
                }
            });
        });

        describe('exponential(lambda, n)', function () {
            it('should return an array of exponentially distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    const lambda = Math.random()*10 + 1;
                    ks_test(dist.exponential(lambda, LAPS), function (x) {
                        return 1 - Math.exp(-lambda * x);
                    });
                }
            });
        });

        describe('pareto(xmin, alpha, n)', function () {
            it('should return an array of Pareto distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    const xmin = Math.random()*10 + 1;
                    const alpha = Math.random()*5 + 1;
                    ks_test(dist.pareto(xmin, alpha, LAPS), function (x) {
                        return 1 - Math.pow(xmin / x, alpha);
                    });
                }
            });
        });

        describe('boundedPareto(xmin, xmax, alpha, n)', function () {
            it('should return an array of bounded Pareto distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    const xmin = Math.random()*10 + 1;
                    const xmax = xmin + Math.random()*20 + 2;
                    const alpha = Math.random()*5 + 1;
                    ks_test(dist.boundedPareto(xmin, xmax, alpha, LAPS), function (x) {
                        return (1 - Math.pow(xmin / x, alpha)) / (1 - Math.pow(xmin / xmax, alpha));
                    });
                }
            });
        });

        describe('normal(mu, sigma, n)', function () {
            it('should return an array of normally distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    const mu = Math.random()*10 + 1;
                    const sigma = Math.random()*10 + 1;
                    ks_test(dist.normal(mu, sigma, LAPS), function (x) {
                        return 0.5 * (1 + math.erf((x-mu)/(sigma*Math.sqrt(2))));
                    });
                }
            });
        });

        describe('lognormal(mu, sigma, n)', function () {
            it('should return an array of log-normally distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    const mu = Math.random()*10 + 1;
                    const sigma = Math.random()*10 + 1;
                    ks_test(dist.lognormal(mu, sigma, LAPS), function (x) {
                        return 0.5 * (1 + math.erf((Math.log(x)-mu)/(sigma*Math.sqrt(2))));
                    });
                }
            });
        });

        describe('weibull(mu, sigma, n)', function () {
            it('should return an array of Weibull distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    const lambda = Math.random()*10 + 0.1;
                    const k = Math.random()*10 + 0.1;
                    ks_test(dist.weibull(lambda, k, LAPS), function (x) {
                        return 1 - Math.exp(-Math.pow(x/lambda, k));
                    });
                }
            });
        });

        /// Descrete distributions ///
        describe('poisson(mu, sigma, n)', function () {
            it('should return an array of Poisson distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    const lambda = Math.random()*10 + 1;
                    chi_test(dist.poisson(lambda, LAPS), function (x) {
                        return Math.pow(lambda, x) * Math.exp(-lambda) / math.factorial(x);
                    }, 1);
                }
            });
        });
    });
});
