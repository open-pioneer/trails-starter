const LOG_LEVEL = validateLogLevel(__LOG_LEVEL__);

/**
 * Creates and returns a new logger instance for an application wide standardized logging.
 * For available log methods see Logger class.
 * The log level is globally configured (see vite.config.ts).
 *
 * @param prefix Prefix used to prefix all log messages invoked by the created logger instance.
 */
export function createLogger(prefix: string): Logger {
    return new LoggerImpl(prefix, LOG_LEVEL);
}

/**
 * Allowed log levels.
 * Order: DEBUG < INFO < WARN < ERROR
 */
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

// internal representation of log levels as numbers for log level comparison.
const logLevelNumbers: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

export interface LogMethod {
    /**
     * Logger's log method signature
     *
     * @param message Log message to be logged (attached to the prefix). Can be a string or an Error.
     * @param values Arbitrary amount of additional values to be logged (attached to message).
     */
    (message: string | Error, ...values: unknown[]): void;
}

/**
 * Provides a logger for a standardized application wide logging.
 *
 * The logger's log level is configured globally.
 *
 * Use the `createLogger` function to receive a new logger instance for logging.
 */
export interface Logger {
    /**
     * Prefix prepended to all logging messages
     */
    readonly prefix: string;

    /**
     * Returns true if debug log level is enabled.
     */
    isDebug(): boolean;

    /**
     * Logging method for debug log level.
     * Follows normal LogMethod structure but logs in debug level.
     */
    debug: LogMethod;

    /**
     * Logging method for info log level.
     * Follows normal log method structure but logs in info level.
     */
    info: LogMethod;

    /**
     * Logging method for warn log level.
     * Follows normal log method structure but logs in warn level.
     */
    warn: LogMethod;

    /**
     * Logging method for debug error level.
     * Follows normal log method structure but logs in error level.
     */
    error: LogMethod;
}

/**
 * A class implementing a logger with a global log level.
 */
export class LoggerImpl implements Logger {
    prefix: string;
    private readonly enabledLogLevelNumber: number;

    constructor(prefix: string, logLevel: LogLevel) {
        this.prefix = prefix;
        this.enabledLogLevelNumber = logLevelToLogLevelNumber(logLevel);
    }

    isDebug() {
        return this._isLogLevelEnabled("DEBUG");
    }

    /**
     * Performs a debug log with the given message and values if DEBUG level is enabled.
     * @param message
     * @param values
     */
    debug(message: string | Error, ...values: unknown[]) {
        this._doLog("DEBUG", message, values);
    }

    /**
     * Performs an info log with the given message and values if INFO level is enabled.
     * @param message
     * @param values
     */
    info(message: string | Error, ...values: unknown[]) {
        this._doLog("INFO", message, values);
    }

    /**
     * Performs a warning log with the given message and values if WARN level is enabled.
     * @param message
     * @param values
     */
    warn(message: string | Error, ...values: unknown[]) {
        this._doLog("WARN", message, values);
    }

    /**
     * Performs an error log with the given message and values if ERROR level is enabled.
     * @param message
     * @param values
     */
    error(message: string | Error, ...values: unknown[]) {
        this._doLog("ERROR", message, values);
    }

    /**
     * Internal method for performing the log if the specified level is enabled.
     * @param level
     * @param messageOrError
     * @param values
     * @private
     */
    private _doLog(level: LogLevel, messageOrError: string | Error, values: unknown[]) {
        if (this._isLogLevelEnabled(level)) {
            let message = this.prefix + ":";
            if (typeof messageOrError === "string") {
                message += " " + messageOrError;
            } else {
                values.unshift(messageOrError);
            }
            const consoleMethodName = logLevelToConsoleMethodName(level);
            console[consoleMethodName](message, ...values);
        }
    }

    private _isLogLevelEnabled(logLevel: LogLevel) {
        const logLevelNumber = logLevelToLogLevelNumber(logLevel);
        return logLevelNumber >= this.enabledLogLevelNumber;
    }
}

/**
 * Converts a LogLevel to a browser's debugging console method name.
 * @param logLevel
 */
function logLevelToConsoleMethodName(logLevel: LogLevel): "debug" | "info" | "warn" | "error" {
    switch (logLevel) {
        case "DEBUG":
            return "debug";
        case "INFO":
            return "info";
        case "WARN":
            return "warn";
        case "ERROR":
            return "error";
    }
}

function logLevelToLogLevelNumber(logLevel: LogLevel) {
    return logLevelNumbers[logLevel];
}

function validateLogLevel(logLevelString: string): LogLevel {
    if (!logLevelString) {
        return "INFO";
    }

    switch (logLevelString) {
        case "DEBUG":
        case "INFO":
        case "WARN":
        case "ERROR":
            return logLevelString;
        default:
            throw new Error(
                `invalid log level '${logLevelString}'; allowed levels are: DEBUG, INFO, WARN, ERROR`
            );
    }
}
