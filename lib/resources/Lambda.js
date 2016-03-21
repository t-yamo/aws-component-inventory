"use strict";

const AWS = require("aws-sdk-promise");
const co = require("co");
const Utility = require("../utility");

class Lambda {
  constructor(opts) {
    this.resource = new AWS.Lambda(opts);
  }
  describe() {
    const self = this;
    return co(function*() {
      return {
        Functions: (yield self.resource.listFunctions().promise()).data.Functions.map(Utility.addACIKey("Lambda_Functions", "FunctionName"))
      };
    });
  }
}

module.exports = Lambda;
