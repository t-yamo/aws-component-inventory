"use strict";

module.exports = {
  appenders: [
    { type: "file-appender", opts: { files: { component: "out_component.log", middleware: "out_middleware.log" } } },
    { type: "dynamodb-appender", opts: { tables: { component: { name: "component", recreate: true }, middleware: { name: "middleware", recreate: false } }, awsopts: { region: "ap-northeast-1" } } },
    { type: "elasticsearch-appender", opts: { endpoint: "search-cmdb-xxxx.ap-northeast-1.es.amazonaws.com", indexes: { component: { name: "component", recreate: true }, middleware: { name: "middleware", recreate: false } }, awsopts: { region: "ap-northeast-1" } } }
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
      // Append your custom command that output string as one line include name and version.
      rpm: { command: "rpm", opts: [ "-qa" ] }
    }
  }
};
