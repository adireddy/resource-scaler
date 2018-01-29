var fs = require("fs");
var processImage = require("./processImage");
var processJson = require("./processJson");
var processAtlas = require("./processAtlas");
var winston = require("winston");

module.exports = function () {

    var IMAGE_EXTENSIONS = [
        /(.jpg)$/i,
        /(.jpeg)$/i,
        /(.png)$/i,
        /(.bmp)$/i
    ];

    var DATA_EXTENSIONS = [
        /(.json)$/i,
        /(.atlas)$/i
    ];

    var ALGORITHMS = [
        "default",
        "bilinearInterpolation",
        "nearestNeighbor",
        "bicubicInterpolation",
        "hermiteInterpolation",
        "bezierInterpolation"
    ];

    var opts = arguments[0];
    var inputFolder = opts.input;
    var outputFolder = opts.output;
    var scale = opts.scale;
    var quality = opts.quality;
    var normalize = opts.normalize;
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

        winston.info("Using '" + algorithm.replace("Interpolation", "") + "' resizing algorithm.");
        winston.info((imageFiles.length + dataFiles.length) + " files to process...");

        try {
            processImageFiles();
            processDataFiles();
        }
        catch (e) {
            if (opts.error && typeof opts.error === "function") opts.error();
            winston.error(e);
        }
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
            processImage(file, algorithm, scale, quality, normalize, inputFolder, outputFolder, checkCount, log);
        });
    }

    function processDataFiles() {
        dataFiles.forEach(function (file) {
            if (/(.json)$/i.test(file)) {
                processJson(file, scale, inputFolder, outputFolder, checkCount, log);
            }
            else if (/(.atlas)$/i.test(file)) {
                processAtlas(file, scale, inputFolder, outputFolder, checkCount, log);
            }
        });
    }

    function checkCount() {
        count++;
        if (imageFiles.length + dataFiles.length === count) {
            winston.info("Done.");
            if (opts.complete && typeof opts.complete === "function") opts.complete();
        }
    }

    function log(msg) {
        if (opts.verbose) winston.info(msg);
    }
}