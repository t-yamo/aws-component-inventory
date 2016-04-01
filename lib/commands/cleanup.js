"use strict";

const co = require("co");
const path = require("path");

module.exports = function(config, args) {
  const log4js = require("log4js");
  log4js.configure(config.log4js);
  const logger = log4js.getLogger();
  const result = {};

  co(function*() {
    const Appenders = require(path.join(__dirname, "..", "appenders"));
    const appenders = new Appenders(config.appenders, logger);
    yield appenders.cleanup("component", "middleware");
  }).catch(function(err) {
    logger.error(err);
    process.exit(1);
  });

};
