import {
    readdir,
    writeFile,
} from "node:fs";
import {
    join,
    resolve,
} from "node:path";
import chalk from "chalk";

function currentTime(): string {
    const dateObj = new Date();
    const date = dateObj.getDate();
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();

    return `${date}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function getLastLogTimeFromFileName(fileName: string): string {
    const date = fileName.split(".")[0];
    const time = fileName.split(".")[1];

    return `${date}-${time}`;
}

const logFiles = () => {
    const logFiles: string[] = [];
    readdir(resolve(join(__dirname, "..", "logs")), (err, files) => {
        if (err) throw err;
        files.forEach((file) => {
            logFiles.push(file);
        });
    });
    return logFiles;
};

const lastLogTime = () =>{ return getLastLogTimeFromFileName(logFiles()[logFiles().length - 1]).toString(); }

namespace consoleHelper {
    /**
     * @description This class parses the message
     * and sends it to the console for quick debugging.
     */
    export class stdout {
        /**
         * @description This method logs the message to the console.
         * @alias console.log
         * @param {String} message
         * @param {Object} optionalParams 
         * @returns {void}
         */
        static log (message: string, ...optionalParams: any[]) : void {
            if (optionalParams.length > 0) {
                console.log(
                    `${chalk.greenBright("[LOG]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`,
                    ...optionalParams
                );
            } else {
                console.log(
                    `${chalk.greenBright("[LOG]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`
                );
            }
        }

        /**
         * @description This method logs the message to the console.
         * @alias console.info  
         * @param {String} message
         * @param {Object} optionalParams
         * @returns {void}
         */
        static info (message: string, ...optionalParams: any[]) : void {
            if (optionalParams.length > 0) {
                console.info(
                    `${chalk.blueBright("[INFO]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`,
                    ...optionalParams
                );
            } else {
                console.info(
                    `${chalk.blueBright("[INFO]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`
                );
            }
        }

        /**
         * @description This method logs the message to the console.
         * @alias console.warn  
         * @param {String} message
         * @param {Object} optionalParams
         * @returns {void}
         */
        static warn (message: string, ...optionalParams: any[]) : void {
            if (optionalParams.length > 0) {
                console.warn(
                    `${chalk.yellowBright("[WARN]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`,
                    ...optionalParams
                );
            } else {
                console.warn(
                    `${chalk.yellowBright("[WARN]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`
                );
            }
        }

        /**
         * @description This method logs the message to the console.
         * @alias console.error  
         * @param {String} message
         * @param {Object} optionalParams
         * @returns {void}
         */
        static error (message: string, ...optionalParams: any[]) : void {
            if (optionalParams.length > 0) {
                console.error(
                    `${chalk.redBright("[ERROR]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`,
                    ...optionalParams
                );
            } else {
                console.error(
                    `${chalk.redBright("[ERROR]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`
                );
            }
        }

        /**
         * @description This method logs the message to the console.
         * @alias console.debug  
         * @param {String} message
         * @param {Object} optionalParams
         * @returns {void}
         */
        static debug (message: string, ...optionalParams: any[]) : void {
            if (optionalParams.length > 0) {
                console.debug(
                    `${chalk.magentaBright("[DEBUG]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`,
                    ...optionalParams
                );
            } else {
                console.debug(
                    `${chalk.magentaBright("[DEBUG]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`
                );
            }
        }

        /**
         * @description This method logs the message to the console.
         * @param {String} message
         * @param {Object} optionalParams
         * @returns {void}
         */
        static trace (message: string, ...optionalParams: any[]) : void{
            if (optionalParams.length > 0) {
                console.trace(
                    `${chalk.cyanBright("[TRACE]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`,
                    ...optionalParams
                );
            } else {
                console.trace(
                    `${chalk.cyanBright("[TRACE]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`
                );
            }
        }
    }

    /**
     * @description This class parses the message 
     * and sends it to the appropriate file - For Debugging.
     */
    export class stdin {
        /**
         * @description This method logs the message to the console.
         * @alias console.log
         * @param {String} message
         * @param {Object} optionalParams 
         * @returns {void}
         */
        static log(message: string, ...optionalParams: any[]) : void {
            if (optionalParams.length > 0) {
                console.log(
                    `${chalk.greenBright("[LOG]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`,
                    ...optionalParams
                );
                if (lastLogTime.toString() === currentTime()) {
                    writeFile(
                        resolve(join(__dirname, "..", "logs", `${currentTime()}.copy.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                } else {
                    writeFile(
                        resolve(join(__dirname, "..", "logs", `${currentTime()}.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                }
            } else {
                console.log(
                    `${chalk.greenBright("[LOG]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`
                );
                if (lastLogTime.toString() === currentTime()) {
                    writeFile(
                        resolve(join(__dirname, "..", "logs", `${currentTime()}.copy.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                } else {
                    writeFile(
                        resolve(join(__dirname, "..", "logs", `${currentTime()}.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                }
            }
        }

        /**
         * @description This method logs the message to the console.
         * @alias console.info
         * @param {String} message
         * @param {Object} optionalParams 
         * @returns {void}
         */
        static info(message: string, ...optionalParams: any[]) : void {
            if (optionalParams.length > 0) {
                console.info(
                    `${chalk.blueBright("[INFO]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`,
                    ...optionalParams
                );
                if (lastLogTime.toString() === currentTime()) {
                    writeFile(
                        resolve(join(__dirname, "..", "info", `${currentTime()}.copy.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                } else {
                    writeFile(
                        resolve(join(__dirname, "..", "info", `${currentTime()}.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                }
            } else {
                console.info(
                    `${chalk.blueBright("[INFO]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`
                );
                if (lastLogTime.toString() === currentTime()) {
                    writeFile(
                        resolve(join(__dirname, "..", "info", `${currentTime()}.copy.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                } else {
                    writeFile(
                        resolve(join(__dirname, "..", "info", `${currentTime()}.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                }
            }
        }

        /**
         * @description This method logs the message to the console.
         * @alias console.warn
         * @param {String} message
         * @param {Object} optionalParams 
         * @returns {void}
         */
        static warn(message: string, ...optionalParams: any[]) : void {
            if (optionalParams.length > 0) {
                console.warn(
                    `${chalk.yellowBright("[WARN]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`,
                    ...optionalParams
                );
                if (lastLogTime.toString() === currentTime()) {
                    writeFile(
                        resolve(join(__dirname, "..", "warns", `${currentTime()}.copy.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                } else {
                    writeFile(
                        resolve(join(__dirname, "..", "warns", `${currentTime()}.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                }
            } else {
                console.warn(
                    `${chalk.yellowBright("[WARN]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`
                );
                if (lastLogTime.toString() === currentTime()) {
                    writeFile(
                        resolve(join(__dirname, "..", "warns", `${currentTime()}.copy.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                } else {
                    writeFile(
                        resolve(join(__dirname, "..", "warns", `${currentTime()}.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                }
            }
        }

        /**
         * @description This method logs the message to the console.
         * @alias console.error
         * @param {String} message
         * @param {Object} optionalParams 
         * @returns {void}
         */
        static error(message: string, ...optionalParams: any[]) : void {
            if (optionalParams.length > 0) {
                console.error(
                    `${chalk.redBright("[ERROR]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`,
                    ...optionalParams
                );
                if (lastLogTime.toString() === currentTime()) {
                    writeFile(
                        resolve(join(__dirname, "..", "errors", `${currentTime()}.copy.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                } else {
                    writeFile(
                        resolve(join(__dirname, "..", "errors", `${currentTime()}.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                }
            } else {
                console.error(
                    `${chalk.redBright("[ERROR]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`
                );
                if (lastLogTime.toString() === currentTime()) {
                    writeFile(
                        resolve(join(__dirname, "..", "errors", `${currentTime()}.copy.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                } else {
                    writeFile(
                        resolve(join(__dirname, "..", "errors", `${currentTime()}.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                }
            }
        }

        /**
         * @description This method logs the message to the console.
         * @alias console.log
         * @param {String} debug
         * @param {Object} optionalParams 
         * @returns {void}
         */
        static debug(message: string, ...optionalParams: any[]) : void {
            if (optionalParams.length > 0) {
                console.debug(
                    `${chalk.magentaBright("[DEBUG]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`,
                    ...optionalParams
                );
                if (lastLogTime.toString() === currentTime()) {
                    writeFile(
                        resolve(join(__dirname, "..", "debug", `${currentTime()}.copy.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                } else {
                    writeFile(
                        resolve(join(__dirname, "..", "debug", `${currentTime()}.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                }
            } else {
                console.debug(
                    `${chalk.magentaBright("[DEBUG]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`
                );
                if (lastLogTime.toString() === currentTime()) {
                    writeFile(
                        resolve(join(__dirname, "..", "debug", `${currentTime()}.copy.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                } else {
                    writeFile(
                        resolve(join(__dirname, "..", "debug", `${currentTime()}.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                }
            }
        }

        /**
         * @description This method logs the message to the console.
         * @alias console.log
         * @param {String} message
         * @param {Object} optionalParams 
         * @returns {void}
         */
        static trace(message: string, ...optionalParams: any[]) : void {
            if (optionalParams.length > 0) {
                console.trace(
                    `${chalk.cyanBright("[TRACE]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`,
                    ...optionalParams
                );
                if (lastLogTime.toString() === currentTime()) {
                    writeFile(
                        resolve(join(__dirname, "..", "traces", `${currentTime()}.copy.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                } else {
                    writeFile(
                        resolve(join(__dirname, "..", "traces", `${currentTime()}.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                }
            } else {
                console.trace(
                    `${chalk.cyanBright("[TRACE]")} ${chalk.underline(chalk.whiteBright(`[${currentTime()}]`))} ${message}`
                );
                if (lastLogTime.toString() === currentTime()) {
                    writeFile(
                        resolve(join(__dirname, "..", "traces", `${currentTime()}.copy.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                } else {
                    writeFile(
                        resolve(join(__dirname, "..", "traces", `${currentTime()}.log`)),
                        message, (err) => {
                            if (err) throw new Error("Error writing to file: " + err);
                        }
                    );
                }
            }
        }
    }
}

export default consoleHelper;