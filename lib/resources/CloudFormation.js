"use strict";

const AWS = require("aws-sdk-promise");
const co = require("co");
const Utility = require("../utility");

class CloudFormation {
  constructor(opts) {
    this.resource = new AWS.CloudFormation(opts);
  }
  describe() {
    const self = this;
    return co(function*() {
      return {
        Stacks: (yield self.resource.describeStacks().promise()).data.Stacks.map(Utility.addACIKey("CloudFormation_Stacks", "StackName"))
      };
    });
  }
}

module.exports = CloudFormation;
