"use strict";

const co = require("co");
const fs = require("fs");
const path = require("path");

const recursiveRequire = co.wrap(function*(dir, opts, cb) {
  const items = fs.readdirSync(dir);
  for (const key in items) {
    const item = items[key];
    const stat = fs.statSync(path.join(dir, item));
    const fname = item.match(/(.+)\.js$/);
    if (stat.isFile() && fname) {
      const module = require(path.join(dir, item));
      yield cb(fname[1], new module(opts));
    } else if (stat.isDirectory()) {
      recursiveRequire(path.join(dir, item));
    }
  }
});

module.exports = function(config, args) {
  const log4js = require("log4js");
  log4js.configure(config.log4js);
  const logger = log4js.getLogger();
  const result = {};

  recursiveRequire(path.join(__dirname, "..", "resources"), config.aws.opts, function(basename, obj) {
    return co(function*() {
      logger.info("Processing " + basename + "...");
      result[basename] = yield obj.describe();
      logger.info("Done.");
    });
  }).then(function(val) {
    co(function*() {
      const components = [];
      for (const resourceType in result) {
        for (const listType in result[resourceType]) {
          for (const item in result[resourceType][listType]) {
            components.push(result[resourceType][listType][item]);
          }
        }
      }
      const Appenders = require(path.join(__dirname, "..", "appenders"));
      const appenders = new Appenders(config.appenders, logger);
      yield appenders.output("component", components);
    }).catch(function(err) {
      logger.error(err);
      process.exit(1);
    });
  }).catch(function(err) {
    logger.error(err);
    process.exit(1);
  });
};
