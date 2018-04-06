# icj

[![Build Status](https://travis-ci.org/kitsonk/icj.svg?branch=master)](https://travis-ci.org/kitsonk/icj)

An [Istanbul](https://istanbul.js.org/) coverage juggler.  This is a command line tool that allows you to _juggle_ Istanbul coverage files, where for various reasons it is difficult to get the output you desire.

## Installation

To install, simply add to a projects `package.json` or install globally:

```
$ npm install icj -g
```

## Commands

### filter

The `filter` command is designed to filter JSON coverage information from Istanbul JSON coverage files.  By default it would take a `coverage-final.json` file as input and output a `coverage-filter.json` filtering only coverage patterns that match coverage for TypeScript files that are part of a webpack bundle in the `./src/app` path, excluding any `.spec.ts` test files.

The usage for the `filter` command is:

```
icj filter [input] [output]
```

It currently supports the following options:

|Option|Value|Description|
|------|-----|-----------|
|`-p` or `--pattern`|String|A [minimatch](https://github.com/isaacs/minimatch) glob string of the files to include in the filtered coverage data.  Default value is: `**/webpack:/src/app/**/!(*.spec).ts`|

## Configuration

`icj` supports configuration via the `package.json` under the `"icj"` key.  For example, to configure the filter command, it would look something like this:

```json
{
    "icj": {
        "filter": {
            "input": "output/coverage-final.json",
            "output": "output/coverage-filtered.json",
            "pattern": "**/webpack:/src/app/**/!(*.spec).ts"
        }
    }
}
```

## License

`icj` is licensed under the MIT License and Copyright 2018 by Kitson P. Kelly.
