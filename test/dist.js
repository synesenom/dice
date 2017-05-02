var assert = require('assert');
var utils = require('../test/test-utils').test_uils;
var math = require('mathjs');
var jstat = require('jstat');
var dist = require('../src/dice').dist;

var LAPS = 1000;

describe('dice', function() {
    describe('dist', function() {
        /// Continuous distributions ///
        describe('uniform', function () {
            it('should return an array of uniformly distributed values', function () {
                utils.trials(function() {
                    const xmin = Math.random()*100 - 50;
                    const xmax = xmin + Math.random()*50;
                    return utils.ks_test(dist.uniform(xmin, xmax, LAPS), function (x) {
                        return (x-xmin) / (xmax-xmin);
                    });
                });
            });
        });

        describe('exponential', function () {
            it('should return an array of exponentially distributed values', function () {
                utils.trials(function() {
                    const lambda = Math.random()*10 + 1;
                    return utils.ks_test(dist.exponential(lambda, LAPS), function (x) {
                        return 1 - Math.exp(-lambda * x);
                    });
                });
            });
        });

        describe('pareto', function () {
            it('should return an array of Pareto distributed values', function () {
                utils.trials(function() {
                    const xmin = Math.random()*10 + 1;
                    const alpha = Math.random()*5 + 1;
                    return utils.ks_test(dist.pareto(xmin, alpha, LAPS), function (x) {
                        return 1 - Math.pow(xmin / x, alpha);
                    });
                });
            });
        });

        describe('boundedPareto', function () {
            it('should return an array of bounded Pareto distributed values', function () {
                utils.trials(function() {
                    const xmin = Math.random()*10 + 1;
                    const xmax = xmin + Math.random()*20 + 2;
                    const alpha = Math.random()*5 + 1;
                    return utils.ks_test(dist.boundedPareto(xmin, xmax, alpha, LAPS), function (x) {
                        return (1 - Math.pow(xmin / x, alpha)) / (1 - Math.pow(xmin / xmax, alpha));
                    });
                });
            });
        });

        describe('normal', function () {
            it('should return an array of normally distributed values', function () {
                utils.trials(function() {
                    const mu = Math.random()*10 + 1;
                    const sigma = Math.random()*10 + 1;
                    return utils.ks_test(dist.normal(mu, sigma, LAPS), function (x) {
                        return 0.5 * (1 + math.erf((x-mu)/(sigma*Math.sqrt(2))));
                    });
                });
            });
        });

        describe('lognormal', function () {
            it('should return an array of log-normally distributed values', function () {
                utils.trials(function() {
                    const mu = Math.random()*10 + 1;
                    const sigma = Math.random()*10 + 1;
                    return utils.ks_test(dist.lognormal(mu, sigma, LAPS), function (x) {
                        return 0.5 * (1 + math.erf((Math.log(x)-mu)/(sigma*Math.sqrt(2))));
                    });
                });
            });
        });

        describe('weibull', function () {
            it('should return an array of Weibull distributed values', function () {
                utils.trials(function() {
                    const lambda = Math.random()*10 + 0.1;
                    const k = Math.random()*10 + 0.1;
                    return utils.ks_test(dist.weibull(lambda, k, LAPS), function (x) {
                        return 1 - Math.exp(-Math.pow(x/lambda, k));
                    });
                });
            });
        });

        /// Descrete distributions ///
        describe('poisson', function () {
            it('should return an array of Poisson distributed values', function () {
                utils.trials(function() {
                    const lambda = Math.random()*10 + 1;
                    return utils.chi_test(dist.poisson(lambda, LAPS), function (x) {
                        return Math.pow(lambda, x) * Math.exp(-lambda) / math.factorial(x);
                    }, 1);
                });
            });
        });
    });
});
