import debug, {IDebugger} from "debug";

export interface ILogger {
	verbose: IDebugger;
	info: IDebugger;
	warn: IDebugger;
	err: IDebugger;
	log: (level: LogLevel, formatter: any, ...args: any) => void;
}

export enum LogLevel {
	VERBOSE = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
}

export function LogLevelToString(level: LogLevel): string {
	switch (level) {
		case LogLevel.VERBOSE:
			return "verbose";
		case LogLevel.INFO:
			return "info";
		case LogLevel.WARN:
			return "warn";
		case LogLevel.ERROR:
			return "err";
	}
}

export let logLevel = LogLevel.INFO;

window.debug = debug
debug.log = console.info.bind(console);
debug.enable("bk:info:*,bk:warn:*,bk:err:*");

export function createLoggerInstance(scope: string, level: LogLevel, color: string): debug.IDebugger {
	const ret = debug(`bk:${LogLevelToString(level)}:${scope}`);
	ret.color = color;
	return ret;
}

export function LOG(scope: string): ILogger {
	const logger: ILogger = {
		verbose: createLoggerInstance(scope, LogLevel.VERBOSE, "#333333"),
		info: createLoggerInstance(scope, LogLevel.INFO, "#7d9fd9"),
		warn: createLoggerInstance(scope, LogLevel.WARN, "#d7a670"),
		err: createLoggerInstance(scope, LogLevel.ERROR, "#de8080"),
		log: () => {},
	};
	logger.log = (level: LogLevel, formatter: any, ...args: any) => {
		(logger as any)[LogLevelToString(level)](formatter, ...args);
	};
	return logger;
}




