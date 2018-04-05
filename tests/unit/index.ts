const { after, before, describe, it } = intern.getInterface('bdd');
const { expect } = intern.getPlugin('chai');

import * as yargs from 'yargs';
import { stub, SinonStub } from 'sinon';

const packageJson: { version: string } = require('../../package.json');

interface YargsMock {
	[method: string]: SinonStub;
	pkgConf: SinonStub;
	usage: SinonStub;
	commandDir: SinonStub;
	demandCommand: SinonStub;
	version: SinonStub;
	alias: SinonStub;
	help: SinonStub;
	wrap: SinonStub;
	argv: any;
}

describe('src/index', () => {
	const yargsMethods = ['pkgConf', 'usage', 'commandDir', 'demandCommand', 'version', 'alias', 'help', 'wrap'];
	const yargsMock = {} as YargsMock;
	const argvStub = stub();

	let consoleLogStub: SinonStub;
	let yargsStub: SinonStub;

	before(() => {
		yargsStub = stub(yargs, 'pkgConf').returns(yargsMock);

		yargsMethods.forEach((method) => (yargsMock[method] = stub().returns(yargsMock)));
		Object.defineProperty(yargsMock, 'argv', {
			get() {
				argvStub();
			}
		});
	});

	it('should log to the console', async () => {
		consoleLogStub = stub(console, 'log');
		expect(consoleLogStub).to.have.callCount(0);
		await import('../../src/index');
		expect(consoleLogStub).to.have.callCount(3);
		consoleLogStub.restore();
	});

	it('should operate on yargs properly', async () => {
		expect(yargsStub).to.have.been.calledOnce;
		expect(yargsStub).to.have.been.calledWith('icj');
		expect(yargsMock.usage).to.have.been.calledOnce;
		expect(yargsMock.usage).to.have.been.calledWith('usage: $0 <command>');
		expect(yargsMock.commandDir).to.have.been.calledOnce;
		expect(yargsMock.commandDir).to.have.been.calledWith('commands', {
			extensions: ['js', 'ts']
		});
		expect(yargsMock.demandCommand).to.have.been.calledOnce;
		expect(yargsMock.demandCommand).to.have.been.calledWith(1, 'At least one command required\n');
		expect(yargsMock.version).to.have.been.calledOnce;
		expect(yargsMock.version).to.have.been.calledWith(
			'version',
			'Show version information',
			`Version ${packageJson.version}\n`
		);
		expect(yargsMock.alias).to.have.been.calledOnce;
		expect(yargsMock.alias).to.have.been.calledWith('version', 'v');
		expect(yargsMock.help).to.have.been.calledOnce;
		expect(yargsMock.wrap).to.have.been.calledOnce;
		expect(yargsMock.wrap).to.have.been.calledWith(80);
		expect(argvStub).to.have.been.calledOnce;
	});

	after(() => {
		yargsStub.restore();
	});
});
