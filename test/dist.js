var assert = require('assert');
var math = require('mathjs');
var dist = require('../src/dice').dist;

var TRIALS = 1;
var LAPS = 1000000;
function ks_test(values, model) {
    var D = 0;
    values.sort(function (a, b) {
        return a-b;
    });
    for (var i=0; i<values.length; i++) {
        D = Math.max(D, Math.abs((i+1)/values.length - model(values[i])));
    }
    assert.equal(D < 1.628/Math.sqrt(LAPS), true);
}

describe('dice', function() {
    describe('dist', function() {
        describe('uniform(min, max, k)', function () {
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

        describe('exponential(lambda, k)', function () {
            it('should return an array of exponentially distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    var lambda = Math.random()*10 + 1;
                    ks_test(dist.exponential(lambda, LAPS), function (x) {
                        return 1 - Math.exp(-lambda * x);
                    });
                }
            });
        });

        describe('pareto(xmin, alpha, k)', function () {
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

        describe('boundedPareto(xmin, xmax, alpha, k)', function () {
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

        describe('normal(mu, sigma, k)', function () {
            it('should return an array of normally distributed values', function () {
                for (var t=0; t<TRIALS; t++) {
                    var mu = Math.random()*10 + 1;
                    var sigma = Math.random()*10 + 1;
                    ks_test(dist.normal(mu, sigma,LAPS), function (x) {
                        return 0.5 * (1 + math.erf((x-mu)/(sigma*Math.sqrt(2))));
                    });
                }
            });
        });
    });
});
