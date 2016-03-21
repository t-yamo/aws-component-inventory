"use strict";

const AWS = require("aws-sdk-promise");
const co = require("co");
const Utility = require("../utility");

class AutoScaling {
  constructor(opts) {
    this.resource = new AWS.AutoScaling(opts);
  }
  describe() {
    const self = this;
    return co(function*() {
      return {
        AutoScalingGroups: (yield self.resource.describeAutoScalingGroups().promise()).data.AutoScalingGroups.map(Utility.addACIKey("AutoScaling_AutoScalingGroups", "AutoScalingGroupName")),
        LaunchConfigurations: (yield self.resource.describeLaunchConfigurations().promise()).data.LaunchConfigurations.map(Utility.addACIKey("AutoScaling_LaunchConfigurations", "LaunchConfigurationName"))
      };
    });
  }
}

module.exports = AutoScaling;
