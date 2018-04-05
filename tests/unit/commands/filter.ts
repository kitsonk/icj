const { after, afterEach, before, beforeEach, describe, it } = intern.getInterface('bdd');
const { expect } = intern.getPlugin('chai');

import { stub, SinonStub } from 'sinon';

import * as f from '../../../src/commands/filter';
type Filter = typeof f;
import * as u from '../../../src/util';
type Util = typeof u;
import { IstanbulCoverageJSON } from '../../../src/interfaces';

interface YargsMock {
	[method: string]: SinonStub;
	example: SinonStub;
	option: SinonStub;
	positional: SinonStub;
}

describe('src/commands/filter', () => {
	let filter: Filter;
	let util: Util;
	let readableStub: SinonStub;
	let readJSONStub: SinonStub;
	let writeJSONStub: SinonStub;
	let fixture: IstanbulCoverageJSON;

	before(async () => {
		util = await import('../../../src/util');
		fixture = await util.readJSON<IstanbulCoverageJSON>('tests/fixtures/coverage-final.json');
		readableStub = stub(util, 'readable');
		readJSONStub = stub(util, 'readJSON');
		writeJSONStub = stub(util, 'writeJSON');
		filter = await import('../../../src/commands/filter');
	});

	it('should export a command', () => {
		expect(filter.command).to.equal('filter [input] [output]');
	});

	it('should export a description', () => {
		expect(filter.describe).to.equal('filter a coverage file');
	});

	it('command builder should call yargs properly', () => {
		const yargsMock = {} as YargsMock;
		['example', 'option', 'positional'].forEach((method) => {
			yargsMock[method] = stub().returns(yargsMock);
		});
		if (typeof filter.builder !== 'function') {
			throw new TypeError('filter.builder is not a function');
		}
		const result = filter.builder(yargsMock as any);
		expect(result).to.equal(yargsMock);
		expect(yargsMock.example).to.have.been.calledOnce;
		expect(yargsMock.example).to.have.been.calledWith(
			'$0 filter coverage-final.json',
			'filters the coverage contained in "coverage-final.json"'
		);
		expect(yargsMock.option).to.have.been.calledOnce;
		expect(yargsMock.option).to.have.been.calledWith('pattern', {
			alias: 'p',
			describe: 'the pattern that is used to match files to include in the filtered coverage',
			default: '**/webpack:/src/app/**/!(*.spec).ts',
			type: 'string'
		});
		expect(yargsMock.positional).to.have.been.calledTwice;
		expect(yargsMock.positional.getCall(0)).to.have.been.calledWith('input', {
			describe: 'input file to filter',
			default: 'coverage-final.json'
		});
		expect(yargsMock.positional.getCall(1)).to.have.been.calledWith('output', {
			describe: 'the file to output to',
			default: 'coverage-filter.json'
		});
	});

	describe('#handler', () => {
		let consoleLogStub: SinonStub;
		let consoleErrorStub: SinonStub;
		// const consoleLog = console.log;

		beforeEach(() => {
			consoleLogStub = stub(console, 'log');
			consoleErrorStub = stub(console, 'error');
		});

		it('should filter coverage', async () => {
			readableStub.resolves(true);
			readJSONStub.resolves(fixture);
			writeJSONStub.resolves(true);
			await filter.handler({
				input: 'foobar.json',
				output: 'barbaz.json',
				pattern: '**/webpack:/src/app/**/!(*.spec).ts',
				_: [],
				$0: ''
			});
			expect(consoleLogStub).to.have.callCount(7);
			expect(readableStub).to.have.been.calledOnce;
			expect(readableStub).to.have.been.calledWith('foobar.json');
			expect(readJSONStub).to.have.been.calledOnce;
			expect(readJSONStub).to.have.been.calledWith('foobar.json');
			const expected = {
				'/output/testing/webpack:/src/app/app.component.ts':
					fixture['/output/testing/webpack:/src/app/app.component.ts']
			};
			expect(writeJSONStub).to.have.been.calledOnce;
			expect(writeJSONStub).to.have.been.calledWith('barbaz.json', expected);
		});

		it('should log error when cannot read input', async () => {
			readableStub.rejects({ error: 'error' });
			expect(consoleErrorStub).to.not.have.been.called;
			await filter.handler({
				input: 'foobar.json',
				output: 'barbaz.json',
				pattern: '**/webpack:/src/app/**/!(*.spec).ts',
				_: [],
				$0: ''
			});
			expect(consoleErrorStub).to.have.callCount(4);
			expect(consoleLogStub).to.have.callCount(1);
		});

		it('should log error when unable to write output', async () => {
			readableStub.resolves(true);
			writeJSONStub.rejects({ error: 'error' });
			await filter.handler({
				input: 'foobar.json',
				output: 'barbaz.json',
				pattern: '**/webpack:/src/app/**/!(*.spec).ts',
				_: [],
				$0: ''
			});
			expect(consoleErrorStub).to.have.callCount(4);
			expect(consoleLogStub).to.have.callCount(4);
		});

		afterEach(() => {
			consoleLogStub.restore();
			consoleErrorStub.restore();
		});
	});

	after(() => {
		readableStub.restore();
		readJSONStub.restore();
		writeJSONStub.restore();
	});
});
