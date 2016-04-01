"use strict";

const co = require("co");
const instance = require("ec2-instance-data");
const os = require("os");
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
        resolve(Buffer.concat(stdout).toString());
      }
    });
  });
};

const getResourceName =  function() {
  return new Promise(function(resolve, reject) {
    instance.init(function(err) {
      if (err) {
        resolve([ os.hostname() ]);
      } else {
        resolve([ instance.instanceId() ]);
      }
    });
  });
};

module.exports = function(config, args) {
  const log4js = require("log4js");
  log4js.configure(config.log4js);
  const logger = log4js.getLogger();
  const middleware = {};

  co(function*() {
    for (const key in config.linux.middleware) {
      const param = config.linux.middleware[key];
      middleware[key] = (yield getMiddleware(param.command, param.opts, logger))
        .split("\n")
        .filter(function(x) { return x.length !== 0; });
    }
    const Appenders = require(path.join(__dirname, "..", "appenders"));
    const appenders = new Appenders(config.appenders, logger);
    const resources = args.resource ? args.resource.split(",") : (yield getResourceName());
    const result = [];
    for (const key in resources) {
      result.push({ acitype: "linux", acipk: resources[key], middleware: middleware });
    }
    yield appenders.output("middleware", result);
  }).catch(function(err) {
    logger.error(err);
    process.exit(1);
  });
};
