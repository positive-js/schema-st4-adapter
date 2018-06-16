#!/usr/bin/env node

const program = require('commander');
const runToJson = require('./run-to-json');
const runToXml = require('./run-to-xml');

function list(value) {
    return value.split(',');
}

program
    .version(process.env.npm_package_version)
    .description('Adapter for converting files of localization')

program
    .command('to-json')
    .description('Convertion to JSON files from single XML.')
    .option('-i, --input [path]', 'input XML file')
    .option('-o, --output [path]', 'output directory')
    .option('-p, --product [product]', 'product тame')
    .option('-l, --languages <languages>', 'languages separated by commas', list)
    .action((options) => {
        runToJson(options);
    });

program
    .command('to-xml')
    .description('Convertion to XML file from single JSON.')
    .option('-i, --input [path]', 'input JSON file')
    .option('-o, --output [path]', 'output XML file since last uploading')
    .option('-p, --product [product]', 'product тame')
    .option('-l, --language <language>', 'language')
    .action((options) => {
        runToXml(options);
    });

try {
    program.parse(process.argv);    
} catch(error) {
    console.error(error.message);
}


