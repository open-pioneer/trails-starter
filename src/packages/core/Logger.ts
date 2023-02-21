const logLevel = validateLogLevel(__LOG_LEVEL__);

// todo write tests
//  (maybe override _doLog method)

/**
 * Creates and returns a new logger instance for an application wide standardized logging.
 * For available log methods see Logger class.
 * The log level is globally configured.
 * @param prefix Prefix used to prefix all log messages invoked by the created logger instance.
 */
export function createLogger(prefix: string): Logger {
    return new LoggerImpl(prefix, logLevel);
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

/**
 * Type for the logger's log methods.
 */
// todo allow Error as message?
export type LogMethod = (message: string, ...values: unknown[]) => void;

// todo move docu to interface
/**
 * Interface for Logger class.
 */
export interface Logger {
    prefix: string;
    isDebug(): boolean;
    debug: LogMethod;
    info: LogMethod;
    warn: LogMethod;
    error: LogMethod;
}

/**
 * A class implementing a logger with a global log level.
 *
 * This logger should be used for a standardized application wide logging.
 *
 * Use the `createLogger` function to receive a new logger instance for logging.
 */
class LoggerImpl implements Logger {
    prefix: string;
    private readonly enabledLogLevelNumber: number;

    constructor(prefix: string, logLevel: LogLevel) {
        this.prefix = prefix;
        this.enabledLogLevelNumber = logLevelToLogLevelNumber(logLevel);
    }

    /**
     * Returns true if debug log level is enabled.
     */
    isDebug() {
        return this.enabledLogLevelNumber === logLevelNumbers.DEBUG;
    }

    /**
     * Performs a debug log with the given message and values if DEBUG level is enabled.
     * @param message
     * @param values
     */
    debug(message: string, ...values: unknown[]) {
        this._doLog("DEBUG", message, values);
    }

    /**
     * Performs an info log with the given message and values if INFO level is enabled.
     * @param message
     * @param values
     */
    info(message: string, ...values: unknown[]) {
        this._doLog("INFO", message, values);
    }

    /**
     * Performs a warning log with the given message and values if WARN level is enabled.
     * @param message
     * @param values
     */
    warn(message: string, ...values: unknown[]) {
        this._doLog("WARN", message, values);
    }

    /**
     * Performs an error log with the given message and values if ERROR level is enabled.
     * @param message
     * @param values
     */
    error(message: string, ...values: unknown[]) {
        this._doLog("ERROR", message, values);
    }

    /**
     * Internal method for performing the log if the specified level is enabled.
     * @param level
     * @param message
     * @param values
     * @private
     */
    private _doLog(level: LogLevel, message: string, values: unknown[]) {
        // todo if dev mode an debug level, do an additional trace log for each log?
        if (this._isLogLevelEnabled(level)) {
            const consoleMethodName = logLevelToConsoleMethodName(level);
            console[consoleMethodName](this.prefix + ": " + message, ...values);
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
function logLevelToConsoleMethodName(logLevel: LogLevel): "info" | "debug" | "warn" | "error" {
    switch (logLevel) {
        case "INFO":
            return "info";
        case "DEBUG":
            return "debug";
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
