const { before, beforeEach, describe, it, after } = intern.getInterface('bdd');
const { expect } = intern.getPlugin('chai');

import * as fs from 'fs';
import { spy, stub, SinonStub, SinonSpy } from 'sinon';

import { readable, readJSON, writeJSON } from '../../src/util';

describe('src/util#readable', () => {
	let spyAccess: SinonSpy;

	before(() => {
		spyAccess = spy(fs, 'access');
	});

	beforeEach(() => {
		spyAccess.resetHistory();
	});

	it('should resolve to `true` when file is present', async () => {
		expect(await readable('./tests/fixtures/coverage-final.json')).to.be.true;
		expect(spyAccess).to.have.been.calledWith('./tests/fixtures/coverage-final.json', fs.constants.R_OK);
	});
	it('should reject when file is not present', async () => {
		await expect(readable('./tests/fixtures/foobar')).to.eventually.be.rejected;
		expect(spyAccess).to.have.been.calledWith('./tests/fixtures/foobar', fs.constants.R_OK);
	});

	after(() => {
		spyAccess.restore();
	});
});

describe('src/util#readJSON', () => {
	let stubReadFile: SinonStub;
	before(() => {
		stubReadFile = stub(fs, 'readFile');
	});

	beforeEach(() => {
		stubReadFile.resetBehavior();
		stubReadFile.resetHistory();
	});

	it('should parse a JSON file', async () => {
		stubReadFile.callsArgWithAsync(2, null, '{ "foo": "bar" }');
		expect(await readJSON('foobar')).to.deep.equal({ foo: 'bar' });
		expect(stubReadFile).to.have.been.calledWith('foobar', 'utf8');
	});

	it('should reject on file read error', async () => {
		stubReadFile.callsArgWithAsync(2, { error: 'error' });
		await expect(readJSON('barbaz')).to.eventually.be.rejected;
		expect(stubReadFile).to.have.been.calledWith('barbaz', 'utf8');
	});

	it('should reject on bad JSON', async () => {
		stubReadFile.callsArgWithAsync(2, null, 'foobar');
		await expect(readJSON('fooqat')).to.eventually.be.rejected;
		expect(stubReadFile).to.have.been.calledWith('fooqat', 'utf8');
	});

	after(() => {
		stubReadFile.restore();
	});
});

describe('src/util#writeJSON', () => {
	let stubWriteFile: SinonStub;
	before(() => {
		stubWriteFile = stub(fs, 'writeFile');
	});

	beforeEach(() => {
		stubWriteFile.resetBehavior();
		stubWriteFile.resetHistory();
	});

	it('should write to a file', async () => {
		stubWriteFile.callsArgWithAsync(3, null);
		expect(await writeJSON('foobar', { foo: 'bar' })).to.be.true;
		expect(stubWriteFile).to.have.been.calledWith('foobar', '{"foo":"bar"}', 'utf8');
	});

	it('should reject when there is an error', async () => {
		stubWriteFile.callsArgWithAsync(3, { error: 'error' });
		await expect(writeJSON('barbaz', { foo: 'bar' })).to.eventually.be.rejected;
		expect(stubWriteFile).to.have.been.calledWith('barbaz', '{"foo":"bar"}', 'utf8');
	});

	after(() => {
		stubWriteFile.restore();
	});
});
