const DEFAULT_ENV_VALUE = 'SIN COMPLETAR';

type RequiredEnvKey = 'AMBIENTE' | 'API_KEY';

const REQUIRED_ENV_KEYS: RequiredEnvKey[] = ['AMBIENTE', 'API_KEY'];

export type StartupLogger = {
  warn(message: string): void;
};

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim() === '';
}

export function normalizeRequiredEnvVars(logger: StartupLogger): void {
  for (const key of REQUIRED_ENV_KEYS) {
    if (isBlank(process.env[key])) {
      process.env[key] = DEFAULT_ENV_VALUE;
      logger.warn(
        `La variable de entorno ${key} esta vacia o no definida. Se usara el valor por defecto ${DEFAULT_ENV_VALUE}.`,
      );
    }
  }
}
