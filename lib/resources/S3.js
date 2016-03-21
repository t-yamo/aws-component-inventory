"use strict";

const AWS = require("aws-sdk-promise");
const co = require("co");
const Utility = require("../utility");

class S3 {
  constructor(opts) {
    this.resource = new AWS.S3(opts);
  }
  describe() {
    const self = this;
    return co(function*() {
      return {
        Buckets: (yield self.resource.listBuckets().promise()).data.Buckets.map(Utility.addACIKey("S3_Buckets", "Name"))
      };
    });
  }
}

module.exports = S3;
