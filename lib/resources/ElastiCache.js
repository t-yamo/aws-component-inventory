"use strict";

const AWS = require("aws-sdk-promise");
const co = require("co");
const Utility = require("../utility");

class ElastiCache {
  constructor(opts) {
    this.resource = new AWS.ElastiCache(opts);
  }
  describe() {
    const self = this;
    return co(function*() {
      return {
        CacheClusters: (yield self.resource.describeCacheClusters().promise()).data.CacheClusters.map(Utility.addACIKey("ElastiCache_CacheClusters", "CacheClusterId")),
        ReservedCacheNodes: (yield self.resource.describeReservedCacheNodes().promise()).data.ReservedCacheNodes.map(Utility.addACIKey("ElastiCache_ReservedCacheNodes", "ReservedCacheNodeId"))
      };
    });
  }
}

module.exports = ElastiCache;
