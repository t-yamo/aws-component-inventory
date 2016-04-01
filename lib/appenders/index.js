"use strict";

const co = require("co");

class Appenders {
  constructor(opts, logger) {
    this.appenders = opts;
    this.logger = logger;
  }
  output(type, result) {
    const self = this;
    return co(function*() {
      for (const key in self.appenders) {
        const item = self.appenders[key];
        self.logger.info("Output to " + item.type + "...");
        const Appender = require("./" + item.type + ".js");
        const appender = new Appender(type, item.opts);
        yield appender.init();
        yield appender.output(result);
        self.logger.info("Done.");
      }
    });
  }
  cleanup(baseType, targetType) {
    const self = this;
    return co(function*() {
      for (const key in self.appenders) {
        const item = self.appenders[key];
        self.logger.info("Cleanup " + item.type + "...");
        const Appender = require("./" + item.type + ".js");
        const baseAppender = new Appender(baseType, item.opts);
        yield baseAppender.init();
        const activeResources = yield baseAppender.getFlatPKs();
        const targetAppender = new Appender(targetType, item.opts);
        yield targetAppender.init();
        yield targetAppender.cleanup(activeResources);
        self.logger.info("Done.");
      }
    });
  }
}

module.exports = Appenders;
