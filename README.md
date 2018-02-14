# resource-scaler [![npm version](https://badge.fury.io/js/resource-scaler.svg)](https://badge.fury.io/js/resource-scaler)
A simple node utility to resize images including sprite sheets and spine animations.

**Beta Features:**

- Sprite sheet scaling by manipulating the data in JSON files.
- Spine scaling by manipulating the data in atlas files. JSON data is not manipulated so users need to rely on runtime scaling. More info in the below links.
	- [Spine scaling](http://esotericsoftware.com/spine-using-runtimes#Scaling)
	- [Pixi Spine](https://github.com/pixijs/pixi-spine/blob/master/examples/choose_skeleton_scale.md)

Image resizing can be done using Jimp or Sharp.

### Installation

`npm install -g resource-scaler`

### Usage

`resource-scaler -i resources/scale-8 -o resources/scale-4 -s 0.5`

| Option                 | Description                         | Default  |
|------------------------|-------------------------------------|----------|
| -t, --tool             | `jimp` or `sharp`                   |  `sharp` |
| -i, --input            | input folder                        |          |
| -o, --output           | output folder                       |          |
| -s, --scale            | scale factor                        |     1    |
| -sa, --sharp_algorithm | 1-4<sup>1</sup>                     |          |
| -ja, --jimp_algorithm  | 1-5<sup>2</sup>                     |          |
| -n, --normalize        | normalize the channels in the image |          |
| -q, --quality          | quality (0-100, PNG and JPEG only)  |    100   |
| -v, --verbose          | verbose                             |          |
| -h, --help             | help                                |          |

**<sup>1</sup>Sharp Algorithms**

- 1 - nearest
- 2 - cubic
- 3 - lanczos2
- 4 - lanczos3

**<sup>2</sup>Jimp Algorithms**

- 1 - bilinear
- 2 - nearest
- 3 - bicubic
- 4 - hermite
- 5 - bezier

### Formats

- jpg
- png
- webp (sharp only)
- tiff (sharp only)
- bmp (jimp only)
- json (texture packer and spine)
- atlas (spine)

Any issues please [report](https://github.com/adireddy/resource-scaler/issues/new).

### Licensing Information

<a rel="license" href="http://opensource.org/licenses/MIT">
<img alt="MIT license" height="40" src="http://upload.wikimedia.org/wikipedia/commons/c/c3/License_icon-mit.svg" /></a>

This content is released under the [MIT](http://opensource.org/licenses/MIT) license.

Jimp is licensed under the [MIT](http://opensource.org/licenses/MIT) license.

Sharp is licensed under the [Apache License](http://www.apache.org/licenses/LICENSE-2.0.html), Version 2.0 (the "License").

### Contributor Code of Conduct

[Code of Conduct](https://github.com/CoralineAda/contributor_covenant) is adapted from [Contributor Covenant, version 1.4](http://contributor-covenant.org/version/1/4/)
