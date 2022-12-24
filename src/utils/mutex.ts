import {LOG} from "./log";
import * as util from "util";

const logger = LOG("bk.mutex");

export async function waitFor(ms: number = 10): Promise<void> {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

export async function waitForCond(cond: () => boolean, intervalMs: number = 10) {
	while (!cond()) {
		await waitFor(intervalMs)
	}
}

export class easyMutex { // cannot reenter
	private state: boolean;
	private verbose: boolean;

	public async guard<T>(fn: () => Promise<T>): Promise<{ data?: T, err?: Error }>
	public async guard<T>(fn: () => Promise<T>, spinTimeoutMS: number): Promise<{ data?: T, err?: Error }>
	public async guard<T>(fn: () => Promise<T>, spinTimeoutMS?: number, maxRetry?: number): Promise<{ data?: T, err?: Error }> {
		return this.guardExec(fn, spinTimeoutMS, maxRetry);
	}

	protected async guardExec<T>(fn: () => Promise<T>, spinTimeoutMS: number = 50, maxRetry: number = 999, logID: number = 0): Promise<{ data?: T, err?: Error }> {
		function err(e: any): { data?: T, err?: Error } {
			return {
				err: util.types.isNativeError(e) ? e : new Error(e)
			};
		}

		if (!logID) {
			logID = Math.random();
		}

		while (this.state) {
			if (spinTimeoutMS < 10) {
				spinTimeoutMS = 10;
			} else if (spinTimeoutMS > 10000) {
				spinTimeoutMS = 10000;
			}
			await waitForCond(() => {
				if (this.verbose) {
					logger.verbose(`mutex wait lock, logID=${logID}, retryLeft=${maxRetry}`);
				}
				maxRetry--
				return !this.state || maxRetry < 0
			}, spinTimeoutMS)
			if (maxRetry <= 0) {
				return err("retry counts exceeded");
			}
		}

		this.state = true; // lock
		if (this.verbose) {
			logger.info(`mutex lock success, logID=${logID}`);
		}
		let data: T;
		try {
			data = await fn();
		} catch (ex) {
			return err(ex);
		}
		this.state = false; // unlock
		if (this.verbose) {
			logger.info(`guard execute success, logID=${logID}`);
		}
		return {data};
	}
}
