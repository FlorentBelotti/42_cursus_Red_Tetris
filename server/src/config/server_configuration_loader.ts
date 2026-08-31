import dotenv from 'dotenv';

const DEFAULT_HTTP_SERVER_PORT = 3001;
const LOWEST_ASSIGNABLE_PORT_NUMBER = 1;
const HIGHEST_ASSIGNABLE_PORT_NUMBER = 65535;
const DECIMAL_PARSING_RADIX = 10;

export interface ServerConfiguration {
  httpServerPort: number;
}

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
 * Derives the server configuration from a given environment variables map.
 *
 * @param environment - Source of environment variables (e.g. `process.env`).
 * @returns The resolved server configuration.
 */
export function buildServerConfigurationFromEnvironment(
  environment: NodeJS.ProcessEnv,
): ServerConfiguration {
  return {
    httpServerPort: readHttpServerPortFromEnvironment(environment),
  };
}

/**
 * Loads `.env` variables and builds the server configuration from `process.env`.
 *
 * @returns The resolved server configuration.
 */
export function loadServerConfiguration(): ServerConfiguration {
  dotenv.config();

  return buildServerConfigurationFromEnvironment(process.env);
}
