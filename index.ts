'use strict';

import { ArgumentParser } from 'argparse';
import * as fs from 'fs';
import * as path from 'path';
const { version } = require("./package.json");


const parser = new ArgumentParser({
    description: 'Combine multiple jupyter notebooks'
})

parser.add_argument('-v', '--version', { action: 'version', version });
let group = parser.add_mutually_exclusive_group({ required: true })
group.add_argument('-i', '--files', { nargs: "+", help: "The input files to merge", default: undefined });
group.add_argument('-d', '--directory', { help: "A directory to get the input files from", default: undefined });
parser.add_argument('-o', '--out', { help: 'The name of the output file', default: "out.ipynb" });


type noteBookData = { cells: any, metadata: any, nbformat: any, nbformat_minor: any };
type args = {
    files: string[] | undefined,
    directory: string | undefined,
    out: string
}


const arguments_: args = parser.parse_args();

function getFilesToMerge() {
    const filesToMerge: string[] = [];
    if (arguments_.directory !== undefined) {
        let files = fs.readdirSync(arguments_.directory, { withFileTypes: true });
        files.forEach((file) => {
            console.log(`Checking file ${file.name} in ${file.parentPath}`);
            var filename = path.join(file.parentPath, file.name);
            if (path.extname(file.name).toLowerCase() === ".ipynb") {
                filesToMerge.push(filename);
            }
        })
    }
    return filesToMerge;
}

function parseFiles(files: string[]) {
    const dataToMerge: noteBookData[] = [];
    const stringDataToMerge: string[] = [];
    try {
        files.forEach(filesForEachCallback);
    } catch (err) {
        console.error(err);
    }
    function filesForEachCallback(file: string) {
        console.log(file);
        const stringData = fs.readFileSync(file, 'utf-8');
        const data: noteBookData = JSON.parse(stringData);
        dataToMerge.push(data);
        stringDataToMerge.push(stringData);
    };

    console.log(dataToMerge.length);

    return dataToMerge;
}




function mergeData(data: noteBookData[]) {
    const merged: { cells: object[], metadata: object, nbformat: number, nbformat_minor: number } = {
        cells: [],
        metadata: { },
        nbformat: 0,
        nbformat_minor: 0
    };

    data.forEach((data) => {
        merged.cells = merged.cells.concat(data.cells);
        if (Math.random() > 0.5) {
            merged.metadata = data.metadata;
            merged.nbformat = data.nbformat;
            merged.nbformat_minor = data.nbformat_minor;
        }
    });

    return merged;
}

function saveToOutput(data: object) {
    const filename = arguments_.out;
    const toWrite = JSON.stringify(data);

    fs.writeFileSync(filename, toWrite, 'utf-8');
}


function main() {
    const files = getFilesToMerge();
    console.log(`Files: ${files}`);
    const dataToMerge = parseFiles(files);
    const dataToWrite = mergeData(dataToMerge)
    saveToOutput(dataToWrite);
}

main()