import chalk from 'chalk';
import * as minimatch from 'minimatch';
import { Arguments, CommandBuilder } from 'yargs';
import { IstanbulCoverageJSON } from '../interfaces';
import { readable, readJSON, writeJSON } from '../util';

const { bold, green, red } = chalk;

export interface FilterArguments extends Arguments {
	input: string;
	output: string;
	pattern: string;
}

export const command = 'filter [input] [output]';

export const describe = 'filter a coverage file';

export const builder: CommandBuilder = function(yargs) {
	return yargs
		.example('$0 filter coverage-final.json', 'filters the coverage contained in "coverage-final.json"')
		.option('pattern', {
			alias: 'p',
			describe: 'the pattern that is used to match files to include in the filtered coverage',
			default: '**/webpack:/src/app/**/!(*.spec).ts',
			type: 'string'
		})
		.positional('input', {
			describe: 'input file to filter',
			default: 'coverage-final.json'
		})
		.positional('output', {
			describe: 'the file to output to',
			default: 'coverage-filter.json'
		});
};

export async function handler({ input, output, pattern }: FilterArguments) {
	console.log(`- Filtering: "${input}"`);
	try {
		await readable(input);
	} catch (e) {
		console.error();
		console.error(red(`Input file "${bold(input)}" missing or not readable.`));
		console.error(e);
		console.error();
		return Object.assign(new Error('test'), { exitCode: 1 });
	}
	console.log(`  Loading: "${input}"`);
	const coverage = await readJSON<IstanbulCoverageJSON>(input);
	const keys = Object.keys(coverage);
	const filteredCoverage: IstanbulCoverageJSON = {};
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (minimatch(keys[i], pattern)) {
			filteredCoverage[key] = coverage[key];
			console.log(`  Including: "${key}"`);
		}
	}
	console.log(`  Writing: "${output}"`);
	try {
		await writeJSON(output, filteredCoverage);
	} catch (e) {
		console.error();
		console.error(red(`Failed writing "${bold(output)}".`));
		console.error(e);
		console.error();
		return 2;
	}
	console.log();
	console.log(green(`Filtered coverage written to "${output}".`));
	console.log();
}
