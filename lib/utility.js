"use strict";

const pickupFirstTags = function(resource) {
  if (resource.Instances) {
    resource.Instances.forEach(function(x) {
      // for Reservation. ignore non-Reservation as like as AutoScalingGroup.
      x.acitags = pickupFirstTags(x);
    });
  }
  const newTags = {};
  if (!resource.Tags) {
    return newTags;
  }
  resource.Tags.forEach(function(x) {
    if (!newTags[x.Key]) {
      newTags[x.Key] = x.Value;
    }
  });
  return newTags;
};

class Utility {
  static addACIKey(type, pk) {
    return x => {
      x.acitype = type;
      x.acipk = x[pk];
      x.acitags = pickupFirstTags(x);
      return x;
    };
  }
  static addACIKeyForScalar(type) {
    return x => {
      return {
        acitype: type,
        acipk: x,
        acitags: {}
      };
    };
  }
}

module.exports = Utility;
