[![Build Status](https://travis-ci.org/synesenom/dice.svg?branch=master)](https://travis-ci.org/synesenom/dice)

# Description
Library for generating various random entities.

# API reference
- [core](#core)
- [css](#css)


## core
The core functionality, contains very basic numeric generators, random selectors and shuffles.

- [int](#core_int)
- [float](#core_float)
- [choice](#core_choice)
- [char](#core_char)
- [shuffle](#core_shuffle)


### core.int
```
dice.core.int(min[, max[, k]])
```
Generates some uniformly distributed random integers. If `max` is not specified, an integer between 0 and `min` is returned. If `k` is not specified, a single integer is returned.

| argument | description |
| --- | --- |
| `min` | Lower boundary. |
| `max` | Upper boundary. |
| `k` | Number of integers to generate. |


### float
```
dice.core.float([min[, max[, k]]])
```
Generates some uniformly distributed random floats. If no parameters are passed, a float between 0 and 1 is returned. If  only `min` is specified, a float between 0 and `min` is returned. If `k` is not specified, a single float is returned.

| argument | description |
| --- | --- |
| `min` | Lower boundary. |
| `max` | Upper boundary. |
| `k` | Number of floats to generate. |


### core.choice
```
dice.core.choice(values[, k])
```
Returns some random element of an array. If `k` is not specified, a single element is picked.

| argument | description |
| --- | --- |
| `values` | Array of values. |
| `k` | Number of elements to pick. |


### core.char
```
dice.core.char(string[, k])
```
Returns some random characters of a string. If `k` is not specified, a single character is picked.

| argument | description |
| --- | --- |
| `string` | String of characters. |
| `k` | Number of characters to pick. |


### core.shuffle
```
dice.core.shuffle(values)
```
Shuffles an array.

| argument | description |
| --- | --- |
| `values` | Array to shuffle. |


## css
Methods to generate CSS related entities.
TODO

- [integer](#css.integer)
- [number](#css.float)
- [length](#css.length)
- [color](#css.color)
- [opacityValue](#css.opacityValue)
