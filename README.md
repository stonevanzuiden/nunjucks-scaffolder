# nunjucks-scaffolder

Simple code scaffolding using nunjucks templates.

## Installation

    $ npm install nunjucks-scaffolder

## Usage

    Usage: njscaffold [options] <source> <dest>

    Options:

      -h, --help                 output usage information
      -V, --version              output the version number
      -c, --context-file <file>  Path to jsonnet context file

`nunjucks-scaffolder` recursively copies files & directories from a source
directory to a destination directory, using [ncp](https://github.com/AvianFlu/ncp)
under the hood. Each file is rendered as a [nunjucks template](https://mozilla.github.io/nunjucks/templating.html) with the contents of the context file passed as context
to each template. The context file is parsed as [jsonnet](http://jsonnet.org).

If the destination directory doesn't exist, the scaffolder will create it (but only
one level - the parent directory must exist). To copy into the current directory use
`.` as the destination.


