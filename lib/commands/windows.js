"use strict";

const co = require("co");
const instance = require("ec2-instance-data");
const iconv = require("iconv-lite");
const os = require("os");
const path = require("path");
const spawn = require("child_process").spawn;

const getResourceName =  function() {
  return new Promise(function(resolve, reject) {
    instance.init(function(err) {
      if (err) {
        resolve([ os.hostname() ]);
      } else {
        resolve([ instance.instanceId ]);
      }
    });
  });
};

module.exports = function(config, args) {
  const log4js = require("log4js");
  log4js.configure(config.log4js);
  const logger = log4js.getLogger();

  const proc = spawn(
    "powershell.exe",
    [
      "-command",
      "& {Get-WmiObject -Class Win32_Product | Select @{n='Name';e={$_.Name + ',' + $_.Version}} | Format-Table -HideTableHeaders}"
    ],
    {
      stdio: [ "ignore", "pipe", "pipe" ]
    }
  );

  const stdout = [];
  proc.stdout.on("data", function(data) {
    stdout.push(data);
  });

  proc.stderr.on("data", function(data) {
    logger.error(data);
  });

  proc.on("exit", function(code) {
    if (code !== 0) {
      logger.error("command windows Failed.");
      process.exit(1);
    } else {
      const middleware =
        iconv.decode(Buffer.concat(stdout), "Shift_JIS")
        .replace(/\r/g, "")
        .replace(/\n+/g, "\n")
        .replace(/ +\n/g, "\n")
        .replace(/\n +/g, "\n")
        .split("\n")
        .filter(function(x) { return x.length !== 0; });

      co(function*() {
        const Appenders = require(path.join(__dirname, "..", "appenders"));
        const appenders = new Appenders("middleware", config.appenders, logger);
        const resources = args.resource ? args.resource.split(",") : (yield getResourceName());
        const result = [];
        for (const key in resources) {
          result.push({ acitype: "windows", acipk: resources[key], middleware: { win32product: middleware } });
        }
        yield appenders.output(result);
      }).catch(function(err) {
        logger.error(err);
        process.exit(1);
      });
    }
  });
};
