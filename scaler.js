var fs = require("fs");
var im = require("imagemagick");
var _ = require("underscore")._;

module.exports = function() {
    var _opts = arguments[0];
    var _callback = arguments[1];
    var _inputFolder = _opts.input;
    var _outputFolder = _opts.output;
    var _scale = _opts.scale;
    var _files;

    try {
        _files = fs.readdirSync(_inputFolder);
    }
    catch(e) {
        _callback("inpot folder '" + _inputFolder + "' not found");
    }

    var EXTENSIONS = [/(.jpg)$/i, /(.jpeg)$/i, /(.png)$/i, /(.gif)$/i, /(.tif)$/i, /(.tiff)$/i, /(.bmp)$/i, /(.svg)$/i, /(.webp)$/i, /(.ico)$/i];

    if (_files) {
        if (!fs.existsSync(_outputFolder)) fs.mkdirSync(_outputFolder);
        _files = [];
        _applyScale(_inputFolder);

        _files.forEach(function (file) {
            im.identify(["-format", "%wx%h", file], function (err, output) {
                if (err) _callback("unable to get dimensions: " + file);;
                var dimensions = output.split("x");
                im.resize({
                    srcPath: file,
                    dstPath: file.replace(_inputFolder, _outputFolder),
                    width: Math.round(dimensions[0] * _scale),
                    height: Math.round(dimensions[1] * _scale),
                    quality: 1,
                    sharpening: 0

                }, function (err, stdout, stderr) {
                    if (err) _callback("unable to resize: " + file);
                });
            });
        });
    }

    function _applyScale(folder) {
        var files = fs.readdirSync(folder);
        files.forEach(function (item) {
            var path = folder + "/" + item;
            var stats = fs.statSync(path);
            if (stats.isDirectory()) {
                var newFolder = path.replace(_inputFolder, _outputFolder);
                if (!fs.existsSync(newFolder)) fs.mkdirSync(newFolder);
                _applyScale(path);
            }
            else {
                EXTENSIONS.forEach(function (ext) {
                    if (ext.test(item)) _files.push(path);
                });
            }
        });
    }
}