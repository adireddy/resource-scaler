var fs = require("fs");
var im = require("imagemagick");

//node main.js -i resources/default/1024x648 -o resources/default/480x320 -s 0.46875
var _args = process.argv;
var _inputFolder;
var _outputFolder;
var _scale = 1;
var _files;
var EXTENSIONS = [/(.jpg)$/i, /(.jpeg)$/i, /(.png)$/i, /(.gif)$/i, /(.tif)$/i, /(.tiff)$/i, /(.bmp)$/i, /(.svg)$/i, /(.webp)$/i, /(.ico)$/i];

if (_args.indexOf("-i") > -1 && _args[_args.indexOf("-i") + 1]) _inputFolder = _args[_args.indexOf("-i") + 1];
if (_args.indexOf("-o") > -1 && _args[_args.indexOf("-o") + 1]) _outputFolder = _args[_args.indexOf("-o") + 1];
if (_args.indexOf("-s") > -1 && _args[_args.indexOf("-s") + 1]) _scale = _args[_args.indexOf("-s") + 1];
if (_inputFolder && _outputFolder && _scale) {
    try {
        _files = fs.readdirSync(_inputFolder);
    }
    catch (e) {
        console.log("invalid input folder");
    }
}
else {
    console.log("invalid options");
    return;
}

if (_files) {
    if (!fs.existsSync(_outputFolder)) fs.mkdirSync(_outputFolder);
    _files = [];
    _applyScale(_inputFolder);

    _files.forEach(function (file) {
        im.identify(["-format", "%wx%h", file], function (err, output) {
            if (err) throw err;
            var dimensions = output.split("x");
            im.resize({
                srcPath: file,
                dstPath: file.replace(_inputFolder, _outputFolder),
                width: Math.round(dimensions[0] * _scale),
                height: Math.round(dimensions[1] * _scale)
            }, function (err, stdout, stderr) {
                if (err) throw err;
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