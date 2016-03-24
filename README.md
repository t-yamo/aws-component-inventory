# AWS Component Inventory

[![npm version][npm-image]][npm-url]

Inventory of AWS components.

## TODO

* Remove old middleware.
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
    * `-c, --config` <config js file>  config js file path
    * `-r, --resource` <resource ids>  (for `windows` / `linux`) comma separeted Instance ID or AMI ID

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
      // Append your custom command that output string as one line include name and version.
      rpm: { command: "rpm", opts: [ "-qa" ] }
    }
  }
};
```

## Commands

### component

#### Output

* acitype: Resource Type (e.g. `EC2_Subnets`, `EC2_RouteTables`, `CloudFormation_Stacks`).
* acipk: ID of Resource Type (e.g. `i-xxx`, `sg-xxx`, `rtb-xxx`).
* acitags: Flatten Key-Value pair of Tags.
* other data: JSON of describe/list.

#### Output Sample

```
[
  {
    "SubnetId": "subnet-xxx",
    "State": "available",
    "VpcId": "vpc-xxx",
    "CidrBlock": "x.x.x.x/x",
    "Tags": [
      {
        "Key": "System",
        "Value": "xxx"
      },
    ],
    "acitype": "EC2_Subnets",
    "acipk": "subnet-xxx",
    "acitags": {
      "System": "xxx"
    }
  },
  {
    "SubnetId": "subnet-xxx",
    "State": "available",
    "VpcId": "vpc-xxx",
    "CidrBlock": "x.x.x.x/x",
    "Tags": [
      {
        "Key": "System",
        "Value": "xxx"
      },
    ],
    "acitype": "EC2_Subnets",
    "acipk": "subnet-xxx",
    "acitags": {
      "System": "xxx"
    }
  }
]
```

### linux

#### Output

* acitype: `linux`
* acipk: Resource ID. (Instance ID or AMI ID or hostname)
* other data: array strings of middleware name and version.

#### Output Sample

```
[
  {
    "acitype": "linux",
    "acipk": "i-xxx",
    "middleware": {
      "rpm": [
        "java-1.7.0-openjdk-1.7.0.95-2.6.4.0.65.amzn1.x86_64",
        "sqlite-3.7.17-6.13.amzn1.x86_64"
      ]
    }
  },
  {
    "acitype": "linux",
    "acipk": "i-xxx",
    "middleware": {
      "rpm": [
        "java-1.7.0-openjdk-1.7.0.95-2.6.4.0.65.amzn1.x86_64",
        "sqlite-3.7.17-6.13.amzn1.x86_64"
      ]
    }
  }
]

```

### windows

#### Output

* acitype: `windows`
* acipk: Resource ID. (Instance ID or AMI ID or hostname)
* other data: array strings of middleware name and version.

#### Output Sample

```
[
  {
    "acitype": "windows",
    "acipk": "i-xxx",
    "middleware": {
      "win32product": [
        "IIS 8.0 Express,8.0.1557",
        "Microsoft Office Visio Standard 2007,12.0.6215.1000"
      ]
    }
  },
  {
    "acitype": "windows",
    "acipk": "i-xxx",
    "middleware": {
      "win32product": [
        "IIS 8.0 Express,8.0.1557",
        "Microsoft Office Visio Standard 2007,12.0.6215.1000"
      ]
    }
  }
]
```

## Appenders

### file-appender

### Configuration options

* `opts` {}
    * `files` {}
        * key : `component` or `middleware`.
        * value : file name.

### dynamodb-appender

The principle needs permission Create Table, Delete Table, and Update Item.   

### Configuration options

* `opts` {}
    * `tables` {}
        * key : `component` or `middleware`.
        * value {}
            * `name` : index name.
            * `recreate` : If this value is `true`, clear table before register component data.
    * `awsopts` {} AWS SDK options.

### elasticsearch-appender

The principle needs permission Access to Elasticsearch.   
You should create index for component and middleware manually.   

### Configuration options

* `opts` {}
    * `endpoint` : endpoint of Elasticsearch.
    * `indexes` {}
        * key : `component` or `middleware`.
        * value {}
            * `name` : table name.
            * `recreate` : If this value is `true`, clear table before register component data.
    * `awsopts` {} AWS SDK options.

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
