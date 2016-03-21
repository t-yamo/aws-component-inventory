"use strict";

const AWS = require("aws-sdk-promise");
const co = require("co");
const Utility = require("../utility");

class ElasticBeanstalk {
  constructor(opts) {
    this.resource = new AWS.ElasticBeanstalk(opts);
  }
  describe() {
    const self = this;
    return co(function*() {
      return {
        Environments: (yield self.resource.describeEnvironments().promise()).data.Environments.map(Utility.addACIKey("ElasticBeanstalk_Environments", "EnvironmentId"))
      };
    });
  }
}

module.exports = ElasticBeanstalk;
