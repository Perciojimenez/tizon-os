import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { CurrentUser as CurrentUserType } from './auth.service';

/**
 * Decorador de parámetro para obtener el usuario autenticado en los controladores.
 * Uso: metodo(@CurrentUser() user: CurrentUserType) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserType => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
