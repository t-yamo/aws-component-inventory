"use strict";

const AWS = require("aws-sdk-promise");
const co = require("co");
const Utility = require("../utility");

class ECS {
  constructor(opts) {
    this.resource = new AWS.ECS(opts);
  }
  describe() {
    const self = this;
    return co(function*() {
      return {
        clusterArns: (yield self.resource.listClusters().promise()).data.clusterArns.map(Utility.addACIKeyForScalar("ECS_clusterArns"))
      };
    });
  }
}

module.exports = ECS;
