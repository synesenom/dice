var assert = require('assert');
var math = require('mathjs');
var jstat = require('jstat');
var dist = require('../src/dice').dist;

var TRIALS = 1;
var LAPS = 1000000;
var CHI_TABLE_LOW = [
    0, 3.841, 5.991, 7.815, 9.488, 11.070, 12.592, 14.067, 15.507, 16.919, 18.307, 19.675, 21.026, 22.362, 23.685,
    24.996, 26.296, 27.587, 28.869, 30.144, 31.410, 32.671, 33.924, 35.172, 36.415, 37.652, 38.885, 40.113, 41.337,
    42.557, 43.773, 44.985, 46.194, 47.400, 48.602, 49.802, 50.998, 52.192, 53.384, 54.572, 55.758, 56.942, 58.124,
    59.304, 60.481, 61.656, 62.830, 64.001, 65.171, 66.339, 67.505, 68.669, 69.832, 70.993, 72.153, 73.311, 74.468,
    75.624, 76.778, 77.931, 79.082, 80.232, 81.381, 82.529, 83.675, 84.821, 85.965, 87.108, 88.250, 89.391, 90.531,
    91.670, 92.808, 93.945, 95.081, 96.217, 97.351, 98.484, 99.617, 100.749, 101.879, 103.010, 104.139, 105.267,
    106.395, 107.522, 108.648, 109.773, 110.898, 112.022, 113.145, 114.268, 115.390, 116.511, 117.632, 118.752, 119.871,
    120.990, 122.108, 123.225, 124.342, 125.458, 126.574, 127.689, 128.804, 129.918, 131.031, 132.144, 133.257, 134.369,
    135.480, 136.591, 137.701, 138.811, 139.921, 141.030, 142.138, 143.246, 144.354, 145.461, 146.567, 147.674, 148.779,
    149.885, 150.989, 152.094, 153.198, 154.302, 155.405, 156.508, 157.610, 158.712, 159.814, 160.915, 162.016, 163.116,
    164.216, 165.316, 166.415, 167.514, 168.613, 169.711, 170.809, 171.907, 173.004, 174.101, 175.198, 176.294, 177.390,
    178.485, 179.581, 180.676, 181.770, 182.865, 183.959, 185.052, 186.146, 187.239, 188.332, 189.424, 190.516, 191.608,
    192.700, 193.791, 194.883, 195.973, 197.064, 198.154, 199.244, 200.334, 201.423, 202.513, 203.602, 204.690, 205.779,
    206.867, 207.955, 209.042, 210.130, 211.217, 212.304, 213.391, 214.477, 215.563, 216.649, 217.735, 218.820, 219.906,
    220.991, 222.076, 223.160, 224.245, 225.329, 226.413, 227.496, 228.580, 229.663, 230.746, 231.829, 232.912, 233.994,
    235.077, 236.159, 237.240, 238.322, 239.403, 240.485, 241.566, 242.647, 243.727, 244.808, 245.888, 246.968, 248.048,
    249.128, 250.207, 251.286, 252.365, 253.444, 254.523, 255.602, 256.680, 257.758, 258.837, 259.914, 260.992, 262.070,
    263.147, 264.224, 265.301, 266.378, 267.455, 268.531, 269.608, 270.684, 271.760, 272.836, 273.911, 274.987, 276.062,
    277.138, 278.213, 279.288, 280.362, 281.437, 282.511, 283.586, 284.660, 285.734, 286.808, 287.882
];
var CHI_TABLE_HIGH = {
    300: 341.395,
    350: 394.626,
    400: 447.632,
    450: 500.456,
    500: 553.127,
    550: 605.667,
    600: 658.094,
    650: 710.421,
    700: 762.661,
    750: 814.822,
    800: 866.911,
    850: 918.937,
    900: 970.904,
    950: 1022.816,
    1000: 1074.679
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
 * Performs a chi-square test with significance level of 95%.
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
                    var xmin = Math.random()*100 - 50;
                    var xmax = xmin + Math.random()*50;
                    ks_test(dist.uniform(xmin, xmax, LAPS), function (x) {
                        return (x-xmin) / (xmax-xmin);
                    });
                }
            });
        });

        describe('exponential(lambda, n)', function () {
            it('should return an array of exponentially distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    var lambda = Math.random()*10 + 1;
                    ks_test(dist.exponential(lambda, LAPS), function (x) {
                        return 1 - Math.exp(-lambda * x);
                    });
                }
            });
        });

        describe('pareto(xmin, alpha, n)', function () {
            it('should return an array of Pareto distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    var xmin = Math.random()*10 + 1;
                    var alpha = Math.random()*5 + 1;
                    ks_test(dist.pareto(xmin, alpha, LAPS), function (x) {
                        return 1 - Math.pow(xmin / x, alpha);
                    });
                }
            });
        });

        describe('boundedPareto(xmin, xmax, alpha, n)', function () {
            it('should return an array of bounded Pareto distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    var xmin = Math.random()*10 + 1;
                    var xmax = xmin + Math.random()*20 + 2;
                    var alpha = Math.random()*5 + 1;
                    ks_test(dist.boundedPareto(xmin, xmax, alpha, LAPS), function (x) {
                        return (1 - Math.pow(xmin / x, alpha)) / (1 - Math.pow(xmin / xmax, alpha));
                    });
                }
            });
        });

        describe('normal(mu, sigma, n)', function () {
            it('should return an array of normally distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    var mu = Math.random()*10 + 1;
                    var sigma = Math.random()*10 + 1;
                    ks_test(dist.normal(mu, sigma, LAPS), function (x) {
                        return 0.5 * (1 + math.erf((x-mu)/(sigma*Math.sqrt(2))));
                    });
                }
            });
        });

        describe('lognormal(mu, sigma, n)', function () {
            it('should return an array of log-normally distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    var mu = Math.random()*10 + 1;
                    var sigma = Math.random()*10 + 1;
                    ks_test(dist.lognormal(mu, sigma, LAPS), function (x) {
                        return 0.5 * (1 + math.erf((Math.log(x)-mu)/(sigma*Math.sqrt(2))));
                    });
                }
            });
        });

        describe('weibull(mu, sigma, n)', function () {
            it('should return an array of Weibull distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    var lambda = Math.random()*10 + 0.1;
                    var k = Math.random()*10 + 0.1;
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
                    var lambda = Math.random()*10 + 1;
                    chi_test(dist.poisson(lambda, LAPS), function (x) {
                        return Math.pow(lambda, x) * Math.exp(-lambda) / math.factorial(x);
                    }, 1);
                }
            });
        });
    });
});
