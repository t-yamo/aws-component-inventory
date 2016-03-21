"use strict";

const co = require("co");

class Appenders {
  constructor(type, opts, logger) {
    this.type = type;
    this.appenders = opts;
    this.logger = logger;
  }
  output(result) {
    const self = this;
    return co(function*() {
      for (const key in self.appenders) {
        const item = self.appenders[key];
        self.logger.info("Output to " + item.type + "...");
        const Appender = require("./" + item.type + ".js");
        const appender = new Appender(self.type, item.opts);
        yield appender.init();
        yield appender.output(result);
        self.logger.info("Done.");
      }
    });
  }
}

module.exports = Appenders;
