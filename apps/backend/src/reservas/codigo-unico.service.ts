import { Injectable } from '@nestjs/common';

@Injectable()
export class CodigoUnicoService {
  /**
   * Genera un código único para reservas: TZN-XXXX (4 dígitos aleatorios)
   */
  generar(): string {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TZN-${random}`;
  }
}
