import { describe, expect, it } from 'vitest';

import {
  buildServerConfigurationFromEnvironment,
  loadServerConfiguration,
} from './server_configuration_loader';

const DEFAULT_HTTP_SERVER_PORT = 3001;

describe('buildServerConfigurationFromEnvironment', () => {
  it('falls back to the default port when PORT is not set', () => {
    const configuration = buildServerConfigurationFromEnvironment({});

    expect(configuration.httpServerPort).toBe(DEFAULT_HTTP_SERVER_PORT);
  });

  it('reads the port from PORT when it is set', () => {
    const configuration = buildServerConfigurationFromEnvironment({ PORT: '4242' });

    expect(configuration.httpServerPort).toBe(4242);
  });

  it('accepts the lowest and highest assignable port numbers', () => {
    expect(buildServerConfigurationFromEnvironment({ PORT: '1' }).httpServerPort).toBe(1);
    expect(buildServerConfigurationFromEnvironment({ PORT: '65535' }).httpServerPort).toBe(65535);
  });

  it('rejects a PORT that is not a number', () => {
    expect(() => buildServerConfigurationFromEnvironment({ PORT: 'not_a_port' })).toThrow(
      /Invalid PORT environment value/,
    );
  });

  it('rejects an empty PORT', () => {
    expect(() => buildServerConfigurationFromEnvironment({ PORT: '' })).toThrow(
      /Invalid PORT environment value/,
    );
  });

  it('rejects a port number below the assignable range', () => {
    expect(() => buildServerConfigurationFromEnvironment({ PORT: '0' })).toThrow(
      /Invalid PORT environment value/,
    );
  });

  it('rejects a port number above the assignable range', () => {
    expect(() => buildServerConfigurationFromEnvironment({ PORT: '65536' })).toThrow(
      /Invalid PORT environment value/,
    );
  });

  it('rejects a negative port number', () => {
    expect(() => buildServerConfigurationFromEnvironment({ PORT: '-1' })).toThrow(
      /Invalid PORT environment value/,
    );
  });
});

describe('loadServerConfiguration', () => {
  it('produces a configuration with an assignable port from the ambient environment', () => {
    const configuration = loadServerConfiguration();

    expect(Number.isInteger(configuration.httpServerPort)).toBe(true);
    expect(configuration.httpServerPort).toBeGreaterThanOrEqual(1);
    expect(configuration.httpServerPort).toBeLessThanOrEqual(65535);
  });
});
