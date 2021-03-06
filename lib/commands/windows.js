"use strict";

const co = require("co");
const instance = require("ec2-instance-data");
instance.timeout = 30000;
const iconv = require("iconv-lite");
const os = require("os");
const path = require("path");
const spawn = require("child_process").spawn;

const getMiddleware = function(command, opts, encoding, logger) {
  return new Promise(function(resolve, reject) {
    const proc = spawn(command, opts, { stdio: [ "ignore", "pipe", "pipe" ] });
    const stdout = [];
    const stderr = [];
    proc.stdout.on("data", function(data) {
      stdout.push(data);
    });
    proc.stderr.on("data", function(data) {
      stderr.push(data);
    });
    proc.on("error", function(err) {
      logger.error(err);
    });
    proc.on("close", function(code) {
      if (stderr.length > 0) {
        logger.error(iconv.decode(Buffer.concat(stderr), encoding).toString());
      }
      if (code !== 0) {
        reject(code);
      } else {
        resolve(iconv.decode(Buffer.concat(stdout), encoding).toString());
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
    for (const key in config.windows.middleware) {
      const param = config.windows.middleware[key];
      middleware[key] = (yield getMiddleware(param.command, param.opts, param.encoding||"Shift_JIS", logger))
        .replace(/\r/g, "")
        .replace(/\n+/g, "\n")
        .replace(/ +\n/g, "\n")
        .replace(/\n +/g, "\n")
        .split("\n")
        .filter(function(x) { return x.length !== 0; });
    }
    const Appenders = require(path.join(__dirname, "..", "appenders"));
    const appenders = new Appenders(config.appenders, logger);
    const resources = args.resource ? args.resource.split(",") : (yield getResourceName());
    const result = [];
    for (const key in resources) {
      result.push({ acitype: "windows", acipk: resources[key], middleware: middleware });
    }
    yield appenders.output("middleware", result);
  }).catch(function(err) {
    logger.error(err);
    process.exit(1);
  });
};
