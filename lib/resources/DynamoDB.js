"use strict";

const AWS = require("aws-sdk-promise");
const co = require("co");
const Utility = require("../utility");

class DynamoDB {
  constructor(opts) {
    this.resource = new AWS.DynamoDB(opts);
  }
  describe() {
    const self = this;
    return co(function*() {
      return {
        TableNames: (yield self.resource.listTables().promise()).data.TableNames.map(Utility.addACIKeyForScalar("DynamoDB_TableNames"))
      };
    });
  }
}

module.exports = DynamoDB;
