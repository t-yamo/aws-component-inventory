# AWS Component Inventory

[![npm version][npm-image]][npm-url]

Inventory of AWS components.

## TODO

* Remove old tables.
* Refactor to command line tool.
* Add Test code.

## Instration

```bash
$ npm install -g aws-component-inventory
```

## Usase

In many cases, you must specify config file for selecting appenders you need.

```bash
$ aws-component-inventory <command> [options]
```

* command
    * `componet` get aws resources, truncate and recreate `component` table.
    * `linux` append middleware of linux to `middleware` table.
    * `windows` append middleware of windows to `middleware` table.

* options
    * -c, --config <config js file>  config js file path
    * -r, --resource <resource ids>  (for `windows` / `linux`) comma separeted Instance ID or AMI ID

## Auth for AWS

`~/.aws/credentials`

```
[default]
aws_access_key_id = XXX
aws_secret_access_key = XXX
```

You can use other auth method.

## Config

See [config/default.js](config/default.js).

```
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
```

## License

```
Copyright 2016 t-yamo

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

[npm-image]:https://badge.fury.io/js/aws-component-inventory.svg?t=20160225
[npm-url]:https://badge.fury.io/js/aws-component-inventory
