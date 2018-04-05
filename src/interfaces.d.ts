export interface IstanbulCoverageJSON {
	[key: string]: {
		path: string;
		statementMap: {
			[id: string]: IstanbulCoverageLocation;
		};
		fnMap: {
			[id: string]: {
				name: string;
				decl: IstanbulCoverageLocation;
				loc: IstanbulCoverageLocation;
			};
		};
		branchMap: {
			[id: string]: {
				loc: IstanbulCoverageLocation;
				type: string;
				locations: IstanbulCoverageLocation[];
			};
		};
		s: {
			[id: string]: number;
		};
		f: {
			[id: string]: number;
		};
		b: {
			[id: string]: number[];
		};
	};
}

export interface IstanbulCoveragePosition {
	line: number | null;
	column: number;
}

export interface IstanbulCoverageLocation {
	start: IstanbulCoveragePosition;
	end: IstanbulCoveragePosition;
}
