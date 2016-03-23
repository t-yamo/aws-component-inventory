"use strict";

const AWS = require("aws-sdk-promise");
const co = require("co");
const elasticsearch = require("elasticsearch");

const getClient = function(ea) {
  return new Promise(function(resolve, reject) {
    ea.awsconfig.getCredentials(function(err) {
      if (err) {
        reject(err);
        return;
      }
      const client = new elasticsearch.Client({
        hosts: ea.endpoint,
        connectionClass: require("http-aws-es"),
        amazonES: {
          region: ea.awsconfig.region,
          credentials: ea.awsconfig.credentials
        }
      });
      resolve(client);
    });
  });
};

class ElasticsearchAppender {
  constructor(type, opts) {
    this.endpoint = opts.endpoint;
    this.index = opts.indexes[type].name;
    this.recreate = opts.indexes[type].recreate;
    this.awsconfig = new AWS.Config(opts.awsopts);
    this.client = null;
  }
  init() {
    const self = this;
    return co(function*() {
      self.client = yield getClient(self);
      const exists = yield self.client.indices.exists({ index: self.index });
      if (exists && self.recreate) {
        yield self._truncate();
      }
    });
  }
  _truncate() {
    const self = this;
    return co(function*() {
      yield self.client.indices.delete({ index: self.index });
    });
  }
  output(result) {
    const self = this;
    return co(function*() {
      const body = [];
      for (const key in result) {
        body.push({ index: { _index: self.index, _type: result[key].acitype, _id: result[key].acipk } });
        body.push(result[key]);
      }
      yield self.client.bulk({ body: body });
    });
  }
}

module.exports = ElasticsearchAppender;
