import * as yargs from 'yargs';
import chalk from 'chalk';

const { bold } = chalk;

const packageJson: { version: string } = require('../package.json');

console.log();
console.log(bold('icj – A juggler for Istanbul coverage files'));
console.log();

yargs
	.usage('usage: $0 <command>')
	.commandDir('commands', {
		extensions: ['js', 'ts']
	})
	.demandCommand(1, 'At least one command required\n')
	.version('version', 'Show version information', `Version ${packageJson.version}\n`)
	.alias('version', 'v')
	.help()
	.wrap(80).argv;

export = {};
