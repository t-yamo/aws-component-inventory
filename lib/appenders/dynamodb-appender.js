"use strict";

const AWS = require("aws-sdk-promise");
const co = require("co");

const waitTable = function(resource, tableName, callbackWait) {
  return new Promise(function(resolve, reject) {
    var timer = setInterval(function() {
      try {
        if (callbackWait) callbackWait();
        resource.describeTable({
          TableName: tableName
        }).promise().then(function(req) {
          if (req && req.data && req.data.Table && req.data.Table[tableName]) {
            var status = req.data.Table[tableName].TableStatus;
            if (status === "ACTIVE") {
              clearInterval(timer);
              resolve(true);
            }
          } else {
            clearInterval(timer);
            resolve(false);
          }
        }).catch(function(err) {
          clearInterval(timer);
          resolve(false);
        });
      } catch(err) {
        clearInterval(timer);
        resolve(false);
      }
    }, 5000);
  });
};

// https://github.com/aws/aws-sdk-js/issues/833
const blankToNull = function(obj) {
  traverse(obj, function(key, item, element) {
    if (item === "") {
      element[key] = null;
    }
  });
};

const traverse = function(obj, func) {
  for (const key in obj) {
    func.apply(this, [key, obj[key], obj]);
    if (obj[key] !== null && typeof(obj[key]) === "object") {
      traverse(obj[key], func);
    }
  }
};

class DynamoDBAppender {
  constructor(type, opts) {
    this.table = opts.tables[type].name;
    this.recreate = opts.tables[type].recreate;
    this.dynamodb = new AWS.DynamoDB(opts.awsopts);
    this.docclient = new AWS.DynamoDB.DocumentClient(opts.awsopts);
  }
  init() {
    const self = this;
    return co(function*() {
      const req = yield self.dynamodb.listTables().promise();
      if (req.data.TableNames.indexOf(self.table) === -1) {
        yield self.dynamodb.createTable({
          TableName: self.table,
          KeySchema: [
            { AttributeName: "acitype", KeyType: "HASH"}, // Partition key
            { AttributeName: "acipk", KeyType: "RANGE" }  // Sort key
          ],
          AttributeDefinitions: [
            { AttributeName: "acitype", AttributeType: "S" },
            { AttributeName: "acipk", AttributeType: "S" }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }).promise();
        yield waitTable(self.dynamodb, self.table);
      } else {
        if (self.recreate) {
          yield self._truncate();
        }
      }
    });
  }
  _truncate(lastEvaluatedKey) {
    const self = this;
    return co(function*() {
      const params = {
        TableName: self.table,
        Select: "SPECIFIC_ATTRIBUTES",
        AttributesToGet: [ "acitype", "acipk" ]
      };
      if (lastEvaluatedKey) {
        params["ExclusiveStartKey"] = lastEvaluatedKey;
      }
      const scanReq = yield self.dynamodb.scan(params).promise();
      for (const key in scanReq.data.Items) {
        const item = scanReq.data.Items[key];
        yield self.dynamodb.deleteItem({
          TableName: self.table,
          Key: item
        }).promise();
      }
      if (scanReq.data.LastEvaluatedKey) {
        yield self._truncate(scanReq.data.LastEvaluatedKey);
      }
    });
  }
  output(result) {
    const self = this;
    return co(function*() {
      for (const item in result) {
        const clone = JSON.parse(JSON.stringify(result[item]));
        blankToNull(clone);
        yield self.docclient.put({
          TableName: self.table,
          Item: clone
        }).promise();
      }
    });
  }
}

module.exports = DynamoDBAppender;
