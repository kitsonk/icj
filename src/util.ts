import { access, constants, PathLike, readFile, writeFile } from 'fs';

/**
 * Check to see if a file is readable.  Resolves to `true` if readable, otherwise rejects.
 * @param path The path to check to see if the file is readable
 */
export function readable(path: PathLike) {
	return new Promise<true>((resolve, reject) => {
		access(path, constants.R_OK, (err) => {
			if (err) {
				return reject(err);
			}
			resolve(true);
		});
	});
}

export function readJSON<T>(path: PathLike): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		readFile(path, 'utf8', (err, res) => {
			if (err) {
				reject(err);
			}
			let result: T;
			try {
				result = JSON.parse(res);
			} catch (e) {
				reject(e);
			}
			resolve(result!);
		});
	});
}

export function writeJSON(path: PathLike, content: object): Promise<true> {
	return new Promise<true>((resolve, reject) => {
		writeFile(path, JSON.stringify(content), 'utf8', (err) => {
			if (err) {
				reject(err);
			}
			resolve(true);
		});
	});
}
