"use strict";

const co = require("co");
const fs = require("fs");

class FileAppender {
  constructor(type, opts) {
    this.file = opts.files[type];
  }
  init() {
    const self = this;
    return co(function*() {
    });
  }
  output(result) {
    const self = this;
    return co(function*() {
      fs.writeFileSync(self.file, JSON.stringify(result, null, "  "));
    });
  }
}

module.exports = FileAppender;
