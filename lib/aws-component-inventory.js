#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const program = require("commander");

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
const defaultConfigFile = path.join(__dirname, "..", "config", "default.js");

const readConfig = function(action, args) {
  const configFile = program.config || defaultConfigFile;
  const config = require(configFile);
  action(config, args);
};

program
  .version(packageJson.version)
  .option("-c, --config <config js file>", "config js file path")
  .option("-r, --resource <resource ids>", "(for `windows` / `linux`) comma separeted Instance ID or AMI ID")
  .usage("<command> [options]");

program
  .command("component")
  .action(function(args) { readConfig(require("./commands/component.js")); });

program
  .command("linux")
  .action(function(args) {
    readConfig(require("./commands/linux.js"), { resource: program.resource });
  });

program
  .command("windows")
  .action(function(args) {
    readConfig(require("./commands/windows.js"), { resource: program.resource });
  });

program
  .command("cleanup")
  .action(function(args) { readConfig(require("./commands/cleanup.js")); });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
  process.exit(1);
}
