import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './auth.service';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const Auth = () => createParamDecorator(() => {}); // Placeholder para @UseGuards(AuthGuard)
