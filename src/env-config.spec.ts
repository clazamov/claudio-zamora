import { normalizeRequiredEnvVars, type StartupLogger } from './env-config';

describe('normalizeRequiredEnvVars', () => {
  const originalAmbiente = process.env.AMBIENTE;
  const originalApiKey = process.env.API_KEY;
  let logger: StartupLogger;
  let warn: jest.Mock;

  beforeEach(() => {
    warn = jest.fn();
    logger = { warn };
  });

  afterEach(() => {
    if (originalAmbiente === undefined) {
      delete process.env.AMBIENTE;
    } else {
      process.env.AMBIENTE = originalAmbiente;
    }

    if (originalApiKey === undefined) {
      delete process.env.API_KEY;
    } else {
      process.env.API_KEY = originalApiKey;
    }
  });

  it('assigns default values and warns when variables are missing', () => {
    delete process.env.AMBIENTE;
    delete process.env.API_KEY;

    normalizeRequiredEnvVars(logger);

    expect(process.env.AMBIENTE).toBe('SIN COMPLETAR');
    expect(process.env.API_KEY).toBe('SIN COMPLETAR');
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('assigns default values and warns when variables are blank', () => {
    process.env.AMBIENTE = '   ';
    process.env.API_KEY = '';

    normalizeRequiredEnvVars(logger);

    expect(process.env.AMBIENTE).toBe('SIN COMPLETAR');
    expect(process.env.API_KEY).toBe('SIN COMPLETAR');
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('keeps provided values without warnings', () => {
    process.env.AMBIENTE = 'produccion';
    process.env.API_KEY = 'api-key-real';

    normalizeRequiredEnvVars(logger);

    expect(process.env.AMBIENTE).toBe('produccion');
    expect(process.env.API_KEY).toBe('api-key-real');
    expect(warn).not.toHaveBeenCalled();
  });
});