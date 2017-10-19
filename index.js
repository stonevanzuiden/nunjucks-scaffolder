#!/usr/bin/env node
var ncp = require('ncp').ncp;
var nunjucks = require('nunjucks');
var streamToString = require('stream-to-string')
var streamFromString = require('string-to-stream')
var Jsonnet = require('jsonnet');
var jsonnet = new Jsonnet();
var fs = require('fs');
var program = require('commander');
var errno = require('errno')

// https://github.com/rvagg/node-errno
function errmsg(err) {
  var str = ''
  // if it's a libuv error then get the description from errno
  if (errno.errno[err.errno])
    str += errno.errno[err.errno].description
  else
    str += err.message

  // if it's a `fs` error then it'll have a 'path' property
  if (err.path)
    str += ' [' + err.path + ']'

  return str
}

ncp.limit = 16;
ncp.stopOnErr = true;

program
  .version('0.1.0')
  .arguments('<source> <dest>')
  .option('-c, --context-file <file>', 'Path to jsonnet context file')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0)
}

var source = program.args[0];
var dest = program.args[1];
var contextFile = program.contextFile;

var context = {
  foo: 'bar',
  bar: 'foo',
  empty: 'huh'
};

var errorMsg = [];

if (source === undefined || dest === undefined) {
  errorMsg.push('You must provide both source and destination directories')
}

if (errorMsg.length > 0) {
  console.error(errorMsg.join('\n'))
  process.exit(1)
}

if (contextFile !== undefined) {
  try {
    var code = fs.readFileSync(contextFile);
    context = jsonnet.eval(code);
  } catch(e) {
    console.error('Error reading context file: ' + errmsg(e))
    process.exit(1)
  }
}

ncp(source, dest, {
  rename: function(target) {
    return nunjucks.renderString(target, context);
  },
  transform: function(read, write) {
    var readPath = read.path;
    var writePath = write.path;
    streamToString(read).then(function(templateString) {
      var res = nunjucks.renderString(templateString, context);
      streamFromString(res).pipe(write)
      console.log(readPath + ' -> ' + writePath)
    })
  }
}, function(err) {
 if (err) {
   console.error(errmsg(err[0]));
   process.exit(1)
 }
});