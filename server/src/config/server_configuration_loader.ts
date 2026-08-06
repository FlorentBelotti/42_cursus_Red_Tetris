/**
 * Centralises every environment-derived setting the server needs, so that no
 * other module reads `process.env` directly. Reading, validating and defaulting
 * all happen here; the rest of the server receives a plain, already-validated
 * `ServerConfiguration` object.
 */
import dotenv from 'dotenv';

const DEFAULT_HTTP_SERVER_PORT = 3001;
const LOWEST_ASSIGNABLE_PORT_NUMBER = 1;
const HIGHEST_ASSIGNABLE_PORT_NUMBER = 65535;
const DECIMAL_PARSING_RADIX = 10;

/**
 * Every setting the server derives from its environment.
 */
export interface ServerConfiguration {
  /** TCP port the HTTP server (and the socket.io server attached to it) listens on. */
  httpServerPort: number;
}

/**
 * Tells whether a number can be used as a TCP port, meaning a whole number
 * inside the assignable port range.
 *
 * @param candidatePortNumber - The number to validate.
 * @returns True when the number is a usable TCP port, false otherwise.
 */
function isAssignablePortNumber(candidatePortNumber: number): boolean {
  if (Number.isInteger(candidatePortNumber) === false) {
    return false;
  }

  if (candidatePortNumber < LOWEST_ASSIGNABLE_PORT_NUMBER) {
    return false;
  }

  if (candidatePortNumber > HIGHEST_ASSIGNABLE_PORT_NUMBER) {
    return false;
  }

  return true;
}

/**
 * Reads the HTTP port from an environment map, falling back to the default
 * port when `PORT` is not set. A `PORT` that is set but unusable is treated as
 * a configuration mistake rather than silently ignored, because a server
 * quietly listening on an unexpected port is hard to diagnose.
 *
 * @param environment - The environment variables to read from.
 * @returns The validated port number the server should listen on.
 * @throws Error when `PORT` is present but is not an assignable port number.
 */
function readHttpServerPortFromEnvironment(environment: NodeJS.ProcessEnv): number {
  const rawPortValue = environment.PORT;

  if (rawPortValue === undefined) {
    return DEFAULT_HTTP_SERVER_PORT;
  }

  const parsedPortNumber = Number.parseInt(rawPortValue, DECIMAL_PARSING_RADIX);

  if (isAssignablePortNumber(parsedPortNumber) === false) {
    throw new Error(
      `Invalid PORT environment value "${rawPortValue}": expected a whole number ` +
        `between ${LOWEST_ASSIGNABLE_PORT_NUMBER} and ${HIGHEST_ASSIGNABLE_PORT_NUMBER}.`,
    );
  }

  return parsedPortNumber;
}

/**
 * Builds the server configuration from an explicit environment map. Reads no
 * global state, which is what makes the validation rules directly testable.
 *
 * @param environment - The environment variables to read from.
 * @returns The validated server configuration.
 * @throws Error when one of the environment values is present but invalid.
 */
export function buildServerConfigurationFromEnvironment(
  environment: NodeJS.ProcessEnv,
): ServerConfiguration {
  return {
    httpServerPort: readHttpServerPortFromEnvironment(environment),
  };
}

/**
 * Loads the `.env` file into `process.env`, then builds the server
 * configuration from it. This is the composition root's single configuration
 * call; every other module receives the returned object instead.
 *
 * @returns The validated server configuration.
 * @throws Error when one of the environment values is present but invalid.
 */
export function loadServerConfiguration(): ServerConfiguration {
  dotenv.config();

  return buildServerConfigurationFromEnvironment(process.env);
}
