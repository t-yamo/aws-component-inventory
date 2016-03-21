"use strict";

const AWS = require("aws-sdk-promise");
const co = require("co");
const Utility = require("../utility");

class ELB {
  constructor(opts) {
    this.resource = new AWS.ELB(opts);
  }
  describe() {
    const self = this;
    return co(function*() {
      return {
        LoadBalancerDescriptions: (yield self.resource.describeLoadBalancers().promise()).data.LoadBalancerDescriptions.map(Utility.addACIKey("ELB_LoadBalancerDescriptions", "LoadBalancerName"))
      };
    });
  }
}

module.exports = ELB;
