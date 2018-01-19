var fs = require("fs");
var Jimp = require("jimp");
var winston = require("winston");

module.exports = function () {

    var IMAGE_EXTENSIONS = [
        /(.jpg)$/i,
        /(.jpeg)$/i,
        /(.png)$/i,
        /(.bmp)$/i
    ];

    var DATA_EXTENSIONS = [
        /(.json)$/i
    ];

    var ALGORITHMS = [
        "bilinear",
        "nearestNeighbor",
        "bilinearInterpolation",
        "bicubicInterpolation",
        "hermiteInterpolation",
        "bezierInterpolation"
    ];

    var opts = arguments[0];
    var inputFolder = opts.input;
    var outputFolder = opts.output;
    var scale = opts.scale;
    var quality = opts.quality;
    var algorithm = ALGORITHMS[opts.algorithm];
    var files = [];
    var imageFiles = [];
    var dataFiles = [];
    var count = 0;

    try {
        files = fs.readdirSync(inputFolder);
    }
    catch (e) {
        winston.error("input folder '" + inputFolder + "' not found");
    }

    if (files) {
        if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);
        addFiles(inputFolder);

        winston.info("Using " + algorithm.toLocaleUpperCase() + " resizing algorithm.");
        winston.info((imageFiles.length + dataFiles.length) + " files to process...");
        processImageFiles();
        processDataFiles();
    }

    function addFiles(folder) {
        var folderFiles = fs.readdirSync(folder);
        folderFiles.forEach(function (item) {
            var path = folder + "/" + item;
            var stats = fs.statSync(path);
            if (stats.isDirectory()) {
                var newFolder = path.replace(inputFolder, outputFolder);
                if (!fs.existsSync(newFolder)) fs.mkdirSync(newFolder);
                addFiles(path);
            }
            else {
                IMAGE_EXTENSIONS.forEach(function (ext) {
                    if (ext.test(item)) imageFiles.push(path);
                });
                DATA_EXTENSIONS.forEach(function (ext) {
                    if (ext.test(item)) dataFiles.push(path);
                });
            }
        });
    }

    function processImageFiles() {
        imageFiles.forEach(function (file) {
            Jimp.read(file, function (err, im) {
                log("Processing " + file);
                count++;
                if (err) throw err;
                if (algorithm === ALGORITHMS[0]) {
                    im.resize(Math.round(im.bitmap.width * scale), Math.round(im.bitmap.height * scale))
                        .quality(quality)
                        .write(file.replace(inputFolder, outputFolder));
                }
                else {
                    im.resize(Math.round(im.bitmap.width * scale), Math.round(im.bitmap.height * scale), algorithm)
                        .quality(quality)
                        .write(file.replace(inputFolder, outputFolder));
                }
                checkCount();
            });
        });
    }
    
    function processDataFiles() {
        dataFiles.forEach(function (file) {
            if (/(.json)$/i.test(file)) {
                var json = require(process.cwd() + "/" + file);
                if (json.multipack) {
                    for (var i in json.textures) {
                        var textures = json.textures[i];
                        textures["meta"].size.w = textures["meta"].size.w * scale;
                        textures["meta"].size.h = textures["meta"].size.h * scale;
                        for (var frameData in textures["frames"]) {
                            var data = textures["frames"][frameData];
                            processTextureData(data);
                        }
                    }
                }
                else {
                    json["meta"].size.w = json["meta"].size.w * scale;
                    json["meta"].size.h = json["meta"].size.h * scale;
                    for (var frameData in json["frames"]) {
                        var data = json["frames"][frameData];
                        processTextureData(data);
                    }
                }
                fs.writeFileSync(file.replace(inputFolder, outputFolder), JSON.stringify(json, null, 2));
            }
        });
    }

    function processTextureData(data) {
        for (var key in data) {
            switch (key) {
                case "frame":
                case "spriteSourceSize":
                case "sourceSize":
                    applyDataScale(data[key]);
                    break;
            }
        }
    }

    function applyDataScale(data) {
        for (var key in data) {
            switch (key) {
                case "x":
                case "y":
                case "w":
                case "h":
                    data[key] = data[key] * scale;
                    break;
            }
        }
    }
    
    function checkCount() {
        if (imageFiles.length + dataFiles.length === count) winston.info("Done.");
    }

    function log(msg) {
        if (opts.verbose) winston.info(msg);
    }
}