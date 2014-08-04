/*jslint
    stupid: true, node: true, indent: 2
*/

function run(files) {
  'use strict';

  var jslint = require('jslint'),
    fs = require('fs'),
    result = [],
    jslintOptions = {
      browser: true,
      predef: ['$', 'jQuery', 'summarize', 'exports']
    };

  function validate(filePath) {
    function status(ok) {
      return ok ? null : jslint.errors;
    }

    var file = fs.readFileSync(filePath, 'utf8'),
      errors = status(jslint(file.replace(/^\#\!\.*/, ''), jslintOptions));

    if (errors === null) {
      return true;
    }

    errors.forEach(function (error) {
      if (error === null) {
        return;
      }

      result.push('file: ' + filePath + ', line: ' + error.line + ', character: ' + error.character + ': ' + error.reason.replace(/\'/gi, '"'));
    });
  }

  files.forEach(function (file) {
    validate(file);
  });

  return result;
}

exports.run = run;