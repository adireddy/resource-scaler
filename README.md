# resource-scaler [![npm version](https://badge.fury.io/js/resource-scaler.svg)](https://badge.fury.io/js/resource-scaler)
A simple node utility to resize PNG, JPEG and BMP images using Jimp.

**Beta Features:**

- Sprite sheet scaling by manipulating the data in JSON files.
- Spine scaling by manipulating the data in JSON and atlas files.

### Installation

`npm install -g resource-scaler`

### Usage

`resource-scaler -i resources/scale-8 -o resources/scale-4 -s 0.5`

| Option          | Description                         | Default  |
|-----------------|-------------------------------------|----------|
| -i, --input     | input folder                        |          |
| -o, --output    | output folder                       |          |
| -s, --scale     | scale factor                        |     1    |
| -q, --quality   | quality (0-100, PNG and JPEG only)  |    100   |
| -a, --algorithm | 1-5<sup>1</sup>                     |          |
| -n, --normalize | normalize the channels in the image |          |
| -v, --verbose   | verbose                             |          |
| -h, --help      | help                                |          |

**<sup>1</sup>Algorithms**

- 1 - bilinear
- 2 - nearestNeighbor
- 3 - bicubic
- 4 - hermite
- 5 - bezier

### Formats

- jpg
- png
- bmp

Any issues please [report](https://github.com/adireddy/resource-scaler/issues/new).

### Licensing Information

<a rel="license" href="http://opensource.org/licenses/MIT">
<img alt="MIT license" height="40" src="http://upload.wikimedia.org/wikipedia/commons/c/c3/License_icon-mit.svg" /></a>

This content is released under the [MIT](http://opensource.org/licenses/MIT) License.

### Contributor Code of Conduct

[Code of Conduct](https://github.com/CoralineAda/contributor_covenant) is adapted from [Contributor Covenant, version 1.4](http://contributor-covenant.org/version/1/4/)
