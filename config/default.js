"use strict";

module.exports = {
  appenders: [
    { type: "file-appender", opts: { files: { component: "out_component.log", middleware: "out_middleware.log" } } },
    { type: "dynamodb-appender", opts: { tables: { component: "component", middleware: "middleware" }, awsopts: { region: "ap-northeast-1" } } },
    { type: "elasticsearch-appender", opts: { endpoint: "search-cmdb-xxxx.ap-northeast-1.es.amazonaws.com", indexes: { component: "component", middleware: "middleware" }, awsopts: { region: "ap-northeast-1" } } }
  ],
  aws: {
    opts: {
      region: "ap-northeast-1"
    }
  },
  log4js: {
    appenders: [
      { type: "console", layout: { type: "basic" } }
    ]
  },
  linux: {
    middleware: {
      rpm: { command: "rpm", opts: [ "-qa" ] }
    }
  },
  check: {
    opts: {
      region: "ap-northeast-1"
    },
    tags: "acitags",
    key: "BuildNo",
    value: "20160309122820"
  }
};
