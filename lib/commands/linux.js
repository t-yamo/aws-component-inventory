"use strict";

const co = require("co");
const log4js = require("log4js");
const path = require("path");
const spawn = require("child_process").spawn;

const getMiddleware = function(command, opts, logger) {
  return new Promise(function(resolve, reject) {
    const proc = spawn(command, opts, { stdio: [ "ignore", "pipe", "pipe" ] });
    const stdout = [];
    proc.stdout.on("data", function(data) {
      stdout.push(data);
    });
    proc.stderr.on("data", function(data) {
      logger.error(data);
    });
    proc.on("exit", function(code) {
      if (code !== 0) {
        reject(code);
      } else {
        resolve(stdout);
      }
    });
  });
};

module.exports = function(config, args) {
  const logger = log4js.getLogger(config.log4js);
  const middleware = {};

  co(function*() {
    for (const key in config.linux.middleware) {
      const param = config.linux.middleware[key];
      middleware[key] = (yield getMiddleware(param.command, param.opts, logger))
        .split("\n")
        .filter(function(x) { return x.length !== 0; });
    }
    const Appenders = require(path.join(__dirname, "..", "appenders"));
    const appenders = new Appenders("middleware", config.appenders, logger);
    const resources = args.resource.split(",");
    const result = [];
    for (const key in resources) {
      result.push({ acitype: "linux", acipk: resources[key], middleware: middleware });
    }
    yield appenders.output(result);
  }).catch(function(err) {
    logger.error(err);
    process.exit(1);
  });
};
