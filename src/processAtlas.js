var fs = require("fs");
var lineByLine = require("n-readlines");

module.exports = function (file, scale, inputFolder, outputFolder, callback, log) {
    log("Processing spine atlas " + file);
    var modifiedData = "";
    var liner = new lineByLine(file);
    var line;
    while (line = liner.next()) {
        line = line.toString();
        if (/.*xy:.*/g.test(line) || /.*orig:.*/g.test(line) || /.*size:.*/g.test(line)) {
            var modified = line.replace(/ /g, "");
            var dataVal = modified.split(":");

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
            else modifiedData += line + "\n";
        }
        else {
            modifiedData += line.toString() + "\n";
        }
    }

    fs.writeFileSync(file.replace(inputFolder, outputFolder), modifiedData);
    callback();
}