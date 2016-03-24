"use strict";

const co = require("co");

module.exports = function(config) {
  const log4js = require("log4js");
  log4js.configure(config.log4js);
  const logger = log4js.getLogger();

  co(function*() {
    const AWS = require("aws-sdk-promise");
    const db = new AWS.DynamoDB.DocumentClient(config.check.opts);
    const req = yield db.scan({
      TableName: "components",
      FilterExpression: "contains(#tags.#key, :value)",
      ExpressionAttributeNames: { "#tags": config.check.tags, "#key": config.check.key },
      ExpressionAttributeValues: { ":value": config.check.value }
    }).promise();
    logger.info(req.data);
  }).catch(function(err) {
    logger.error(err);
    process.exit(1);
  });
};
