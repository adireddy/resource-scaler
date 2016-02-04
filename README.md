# resource-scaler
A simple node utility to resize images using imagemagick.

[![npm version](https://badge.fury.io/js/resource-scaler.svg)](https://badge.fury.io/js/resource-scaler)

Requires `imagemagick` CLI tools to be installed.

| Mac | Windows |
|---|---|---|---|
| `brew install imagemagick` | [Download](http://www.imagemagick.org/script/binary-releases.php#windows) |

### Installation

`npm install -g resource-scaler`

### Usage

`resource-scaler -i resources/480x320 -o resources/240x160 -s 0.5`

| Option | Description   |
|--------|---------------|
| -i     | input folder  |
| -o     | output folder |
| -s     | scale factor  |

### Formats

- jpg
- png
- gif
- tif
- bmp
- svg
- webp
- ico

Tested `.png` and `.jpg` but should work with all the formats listed above.

Any issues please [report](https://github.com/adireddy/resource-scaler/issues/new).

### Licensing Information

<a rel="license" href="http://opensource.org/licenses/MIT">
<img alt="MIT license" height="40" src="http://upload.wikimedia.org/wikipedia/commons/c/c3/License_icon-mit.svg" /></a>

This content is released under the [MIT](http://opensource.org/licenses/MIT) License.

### Contributor Code of Conduct

[Code of Conduct](https://github.com/CoralineAda/contributor_covenant) is adapted from [Contributor Covenant, version 1.3.0](http://contributor-covenant.org/version/1/3/0/)
