var fs = require("fs");
var yaml = require("js-yaml");
var Jimp = require("jimp");
var iterator = require("object-recursive-iterator");
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
                    log("Processing multipack texture json " + file);
                    for (var i in json.textures) {
                        var textures = json.textures[i];
                        if (textures["meta"]) updateSize(textures["meta"]);
                        for (var frameData in textures["frames"]) {
                            var data = textures["frames"][frameData];
                            processTextureData(data);
                        }
                    }
                }
                else if (json["frames"]) {
                    log("Processing texture json " + file);
                    if (json["meta"]) updateSize(json["meta"]);
                    for (var frameData in json["frames"]) {
                        var data = json["frames"][frameData];
                        processTextureData(data);
                    }
                }
                else if (json["bones"]) {
                    log("Processing spine json " + file);
                    iterator.forAll(json, function (path, key, obj) {
                        if (path[path.length - 2] !== "scale" && path[path.length - 2] !== "rotate") {
                            switch (key) {
                                case "x":
                                case "y":
                                case "width":
                                case "height":
                                case "length":
                                    obj[key] = obj[key] * scale;
                                    break;
                            }
                        }
                    });
                }
                fs.writeFileSync(file.replace(inputFolder, outputFolder), JSON.stringify(json, null, 2));
            }
            else if (/(.atlas)$/i.test(file)) {
                log("Processing spine atlas " + file);
                var data = fs.readFileSync(process.cwd() + "/" + file);
                data = data.toString().replace(/ /g, "");
                var doc = yaml.safeLoad(data, "utf8");
                var allData = doc.split(" ");

                var modifiedData = allData[0] + "\n";
                for (var i = 1; i < allData.length; i++) {
                    var dataVal = allData[i].split(":");
                    switch (dataVal[0]) {
                        case "xy":
                        case "orig":
                        case "size":
                            var valueData = dataVal[1].split(",");
                            valueData[0] = valueData[0] * scale;
                            valueData[1] = valueData[1] * scale;
                            dataVal[1] = valueData.join(",");
                            break;
                    }
                    if (dataVal[1]) modifiedData += "  " + dataVal.join(":") + "\n";
                    else modifiedData += dataVal.join(":") + "\n";
                }
                fs.writeFileSync(file.replace(inputFolder, outputFolder), modifiedData);
            }
        });
    }

    function scanSpinJson(obj, key) {
        var k;
        if (obj instanceof Object) {
            for (k in obj){
                if (obj.hasOwnProperty(k)){
                    scanSpinJson(obj[k], k);
                }
            }
        }
        else {
            console.log(key + ": " + obj);
        };
    };

    function updateSize(data) {
        data.size.w = data.size.w * scale;
        data.size.h = data.size.h * scale;
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