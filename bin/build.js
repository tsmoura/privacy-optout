/*jslint stupid:true, node:true indent:2, plusplus:true*/

(function () {
  'use strict';

  var cli = require('commander'),
    colorize = require('colorize'),
    cconsole = colorize.console,
    TRANSLATIONS = [{
      source: "./src/pandgv2/html",
      locale: "./locale/pandgv2",
      target: "./build/pandgv2",
      languages: "en,fr,nl,lt,lv,pt,da,se,pl,es,ro"
    }];

  function jslint(filesToCheck) {
    cconsole.log('#blue[Running JSLint....]');

    var JSLintRunner = require('./lib/JSLintWrapper.js'),
      errors = JSLintRunner.run(filesToCheck);

    errors.forEach(function (error) {
      cconsole.log(error);
    });

    if (errors.length > 0) {
      cconsole.log('#red[JSLint Failed :-(]');
      return false;
    }

    cconsole.log('#green[JSLint Passed]');

    return true;
  }

  function stitchFiles(filesToStitch, outPutFile) {
    cconsole.log('#blue[Stitching Files...]');
    var fs = require('fs'),
      path = require('path'),
      wrench = require('wrench'),
      fileContents = '';

    filesToStitch.forEach(function (fileToStitch) {
      fileContents += fs.readFileSync(fileToStitch, 'utf8') + '\n';
    });

    wrench.mkdirSyncRecursive(path.dirname(outPutFile), "0777");
    fs.writeFileSync(outPutFile, fileContents, 'utf8');
    cconsole.log('#green[Files Stitched]');
  }

  function Aggregator() {
    this.notifyStart = function (iterations, callback) {
      this.collectedResponses = 0;
      this.callback = callback;
      this.maxResponses = iterations;
    };

    this.notifyComplete = function () {
      this.collectedResponses++;
      if (this.collectedResponses === this.maxResponses) {
        this.callback();
      }
    };
  }

  function makeMessages(translations, onError) {
    cconsole.log('#blue[Making Messages...]');
    var error = false,
      util = require('util'),
      exec = require('child_process').exec,
      aggregator = new Aggregator();

    function verify() {
      if (error) {
        cconsole.log('#red[Making Messages Failed :-(]');
        if (onError) {
          onError();
        }
      } else {
        cconsole.log('#green[Messages Made]');
      }
    }

    aggregator.notifyStart(Object.keys(translations).length, verify);
    translations.forEach(function (translation) {
      var result,
        command = util.format(
          "python ./bin/static_gettext.py --input %s --locale %s --languages %s --make-messages",
          translation.source,
          translation.locale,
          translation.languages
        );

      result = exec(command, function (err, stdout, stderr) {
        error = error || (err !== null);
        aggregator.notifyComplete();
      });
    });
  }

  function translate(translations, onError, onSuccess) {
    cconsole.log('#blue[Translating Files...]');
    var error = false,
      util = require('util'),
      exec = require('child_process').exec,
      aggregator = new Aggregator();

    function verify() {
      if (error) {
        cconsole.log('#red[Translation Failed :-(]');
        if (onError) {
          onError();
        }
      } else {
        cconsole.log('#green[Files Translated]');
        if (onSuccess) {
          onSuccess();
        }
      }
    }

    aggregator.notifyStart(translations.length, verify);
    translations.forEach(function (translation) {
      var result,
        command = util.format(
          "python ./bin/static_gettext.py --input %s --locale %s --output %s --languages %s --build",
          translation.source,
          translation.locale,
          translation.target,
          translation.languages
        );

      result = exec(command, function (err, stdout, stderr) {
        error = error || (err !== null);
        aggregator.notifyComplete();
      });
    });
  }

  function minify(scriptConversions) {
    cconsole.log('#blue[Minifying Scripts...]');

    var i, currentPair, orig_code, ast, final_code,
      jsp = require("uglify-js").parser,
      pro = require("uglify-js").uglify,
      fs = require("fs");

    for (i = 0; i < scriptConversions.length; i = i + 1) {
      currentPair = scriptConversions[i];
      orig_code = fs.readFileSync(currentPair.source, 'utf8');
      ast = jsp.parse(orig_code); // parse code and get the initial AST
      ast = pro.ast_mangle(ast); // get a new AST with mangled names
      ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
      final_code = pro.gen_code(ast); // compressed code here
      fs.writeFileSync(currentPair.target, final_code, 'utf8');
    }

    cconsole.log('#green[Scripts Minified]');
  }

  function copyDirectories(dirsToCopy) {
    cconsole.log('#blue[Copying Directories...]');

    var wrench = require('wrench');

    dirsToCopy.forEach(function (dirToCopy) {
      wrench.copyDirSyncRecursive(dirToCopy.source, dirToCopy.target);
    });

    cconsole.log('#green[Directories Copied]');
  }

  function copyFiles(filesToCopy) {
    cconsole.log('#blue[Copying Files...]');
    var wrench = require('wrench'),
      path = require('path'),
      fs = require("fs");

    filesToCopy.forEach(function (fileToCopy) {
      wrench.mkdirSyncRecursive(path.dirname(fileToCopy.target), "0777");
      fs.writeFileSync(fileToCopy.target, fs.readFileSync(fileToCopy.source));
    });

    cconsole.log('#green[Files Copied]');
  }

  function buildDeploy() {
    if (!jslint([
        './bin/lib/JSLintWrapper.js',
        './bin/build.js',
        './src/api/cookieSetter.js',
        './src/api/btprivacy.core.js',
        './src/truste/listener.js',
        './src/pandgv2/js/cookie-controller.js',
        './src/pandgv2/js/connector.js',
        './src/pandgv2/js/event-manager.js'
      ])) {
      process.exit(1);
    }

    stitchFiles([
      "./src/api/btprivacy.core.js",
      "./src/api/cookieSetter.js"
    ], "./build/api/btprivacy.js");

    stitchFiles([
      "./build/api/btprivacy.js",
      "./src/truste/listener.js"
    ], "./build/truste/bt-truste-connector.js");

    copyDirectories([{
      source: "./src/nordstrom",
      target: "./build/nordstrom"
    }, {
      source: "./src/skoobatest",
      target: "./build/skoobatest"
    }, {
      // copy for pre-localization legacy support
      // remove once all P&G sites are using localized versions
      source: "./src/pandg",
      target: "./build/pandg"
    }]);

    minify([{
      source: "./build/api/btprivacy.js",
      target: "./build/api/btprivacy.min.js"
    }, {
      source: "./build/pandg/js/cookie-opt-in.js",
      target: "./build/pandg/js/cookie-opt-in.min.js"
    }, {
      source: "./build/truste/bt-truste-connector.js",
      target: "./build/truste/bt-truste-connector.min.js"
    }]);

    copyFiles([{
      source: "./src/privacy-dialog.js",
      target: "./build/privacy-dialog.js"
    }, {
      source: "./src/pandgv2/sample.html",
      target: "./build/pandgv2/sample.html"
    }]);

    function copyNonLocalizedFiles() {
      copyDirectories([{
        source: "./src/pandgv2/css",
        target: "./build/pandgv2/css"
      }, {
        source: "./src/pandgv2/img",
        target: "./build/pandgv2/img"
      }, {
        source: "./src/pandgv2/js",
        target: "./build/pandgv2/js"
      }]);

      // for P&G pages (parent)
      stitchFiles([
        "./build/api/btprivacy.js",
        "./src/pandgv2/js/modernizr.custom.js",
        "./src/pandgv2/js/easyXDM.js",
        "./src/pandgv2/js/emile.js",
        "./src/pandgv2/js/event-manager.js",
        "./src/pandgv2/js/cookie-controller.js"
      ], "./build/pandgv2/js/mrcookie.js");

      // for the P&G iframes
      stitchFiles([
        "./src/pandgv2/js/easyXDM.js",
        "./src/pandgv2/js/connector.js"
      ], "./build/pandgv2/js/cookieframe.js");

      minify([{
        source: "./build/pandgv2/js/mrcookie.js",
        target: "./build/pandgv2/js/mrcookie.min.js"
      }, {
        source: "./build/pandgv2/js/cookieframe.js",
        target: "./build/pandgv2/js/cookieframe.min.js"
      }]);
    }

    // Don't try to translate during --deploy, since
    // gettext isn't installed on build machines
    if (!cli.deploy) {
      translate(TRANSLATIONS, function () {
        process.exit(2);
      }, copyNonLocalizedFiles);
    }
  }

  function buildMessages() {
    makeMessages(TRANSLATIONS, function () {
      process.exit(1);
    });
  }

  cli.option('-d, --deploy', 'build in a deploy environment (no translation)');

  cli.command('build')
    .description('Build site for deploy')
    .action(buildDeploy);

  cli.command('messages')
    .description('Update message files for localization')
    .action(buildMessages);

  cli.parse(process.argv);

  // Execute default command: build
  if (process.argv.length === 2) {
    buildDeploy();
  }

}());
