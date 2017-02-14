var fs = require("fs");
var Jimp = require("jimp");

module.exports = function() {
    var _opts = arguments[0];
    var _callback = arguments[1];
    var _inputFolder = _opts.input;
    var _outputFolder = _opts.output;
    var _scale = _opts.scale;
    var _quality = _opts.quality;
    var _files;

    try {
        _files = fs.readdirSync(_inputFolder);
    }
    catch(e) {
        _callback("input folder '" + _inputFolder + "' not found");
    }

    var EXTENSIONS = [/(.jpg)$/i, /(.jpeg)$/i, /(.png)$/i, /(.bmp)$/i];

    if (_files) {
        if (!fs.existsSync(_outputFolder)) fs.mkdirSync(_outputFolder);
        _files = [];
        _applyScale(_inputFolder);

        _files.forEach(function (file) {
            Jimp.read(file, function (err, im) {
                if (err) throw err;
                im.resize(Math.round(im.bitmap.width * _scale), Math.round(im.bitmap.height * _scale)) // resize
                    .quality(_quality)
                    .write(file.replace(_inputFolder, _outputFolder)); // save
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