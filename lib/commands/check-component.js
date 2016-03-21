"use strict";

module.exports = function(config) {
  const co = require("co");
  const log4js = require("log4js");

  const logger = log4js.getLogger(config.log4js);

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
