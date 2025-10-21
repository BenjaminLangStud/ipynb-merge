'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var argparse_1 = require("argparse");
var fs = require("fs");
var path = require("path");
var version = require("./package.json").version;
var parser = new argparse_1.ArgumentParser({
    description: 'Combine multiple jupyter notebooks'
});
parser.add_argument('-v', '--version', { action: 'version', version: version });
var group = parser.add_mutually_exclusive_group({ required: true });
group.add_argument('-i', '--files', { nargs: "+", help: "The input files to merge", default: undefined });
group.add_argument('-d', '--directory', { help: "A directory to get the input files from", default: undefined });
parser.add_argument('-o', '--out', { help: 'The name of the output file', default: "out.ipynb" });
var arguments_ = parser.parse_args();
function getFilesToMerge() {
    var filesToMerge = [];
    if (arguments_.directory !== undefined) {
        var files = fs.readdirSync(arguments_.directory, { withFileTypes: true });
        files.forEach(function (file) {
            console.log("Checking file ".concat(file.name, " in ").concat(file.parentPath));
            var filename = path.join(file.parentPath, file.name);
            if (path.extname(file.name).toLowerCase() === ".ipynb") {
                filesToMerge.push(filename);
            }
        });
    }
    return filesToMerge;
}
function parseFiles(files) {
    var dataToMerge = [];
    var stringDataToMerge = [];
    try {
        files.forEach(filesForEachCallback);
    }
    catch (err) {
        console.error(err);
    }
    function filesForEachCallback(file) {
        console.log(file);
        var stringData = fs.readFileSync(file, 'utf-8');
        var data = JSON.parse(stringData);
        dataToMerge.push(data);
        stringDataToMerge.push(stringData);
    }
    ;
    console.log(dataToMerge.length);
    return dataToMerge;
}
function mergeData(data) {
    var merged = {
        cells: [],
        metadata: {},
        nbformat: 0,
        nbformat_minor: 0
    };
    data.forEach(function (data) {
        merged.cells = merged.cells.concat(data.cells);
        if (Math.random() > 0.5) {
            merged.metadata = data.metadata;
            merged.nbformat = data.nbformat;
            merged.nbformat_minor = data.nbformat_minor;
        }
    });
    return merged;
}
function saveToOutput(data) {
    var filename = arguments_.out;
    var toWrite = JSON.stringify(data);
    fs.writeFileSync(filename, toWrite, 'utf-8');
}
function main() {
    var files = getFilesToMerge();
    console.log("Files: ".concat(files));
    var dataToMerge = parseFiles(files);
    var dataToWrite = mergeData(dataToMerge);
    saveToOutput(dataToWrite);
}
main();
