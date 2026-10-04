// Integrar en el servicio existente; no sustituye automáticamente el código de la aplicación.
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfiguracionAplicacion {
  readonly ambiente = process.env.AMBIENTE;
  private readonly apiKey = process.env.API_KEY;

  constructor() {
    if (!this.ambiente || !this.apiKey) {
      throw new Error('Faltan AMBIENTE o API_KEY');
    }
  }

  // Ejemplo de uso sin revelar el secreto en respuestas o logs.
  estado() {
    return { ambiente: this.ambiente, apiKeyConfigurada: Boolean(this.apiKey) };
  }
}
