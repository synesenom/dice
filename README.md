[![Build Status](https://travis-ci.org/synesenom/dice.svg?branch=master)](https://travis-ci.org/synesenom/dice)

# Description
Library for generating various random entities.

# API reference
- [core](#core)


## core
The core functionality, contains very basic numeric generators, random selectors and shuffles.

Methods:

- [int](#int)
- [float](#float)
- [choice](#choice)
- [char](#char)


### int
```
dice.core.int(min[, max])
```
Generates a uniformly distributed random integer. If `max` is not specified, an integer between 0 and `min` is returned.

| argument | description |
| --- | --- |
| `min` | Lower boundary. |
| `max` | Upper boundary. |


### float
```
dice.core.float([min[, max]])
```
Generates a uniformly distributed random float. If no parameters are passed, a float between 0 and 1 is returned. If  only `min` is specified, a float between 0 and `min` is returned.

| argument | description |
| --- | --- |
| `min` | Lower boundary. |
| `max` | Upper boundary. |


### choice
```
dice.core.choice(values[, k])
```
Returns some random element of an array. If `k` is not specified, a single element is picked.

| argument | description |
| --- | --- |
| `values` | Array of values. |
| `max` | Number of elements to pick. |


### char
```
dice.core.char(string[, k])
```
Returns some random characters of a string. If `k` is not specified, a single character is picked.

| argument | description |
| --- | --- |
| `string` | String of characters. |
| `max` | Number of characters to pick. |