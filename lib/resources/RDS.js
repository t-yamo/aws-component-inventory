"use strict";

const AWS = require("aws-sdk-promise");
const co = require("co");
const Utility = require("../utility");

class RDS {
  constructor(opts) {
    this.resource = new AWS.RDS(opts);
  }
  describe() {
    const self = this;
    return co(function*() {
      return {
        DBInstances: (yield self.resource.describeDBInstances().promise()).data.DBInstances.map(Utility.addACIKey("RDS_DBInstances", "DBInstanceIdentifier"))
      };
    });
  }
}

module.exports = RDS;
