import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token no encontrado');
    }

    const user = await this.authService.getCurrentUser(token);
    if (!user) {
      throw new UnauthorizedException('Token inválido o usuario inactivo');
    }

    request.user = user;
    return true;
  }

  private extractToken(request: any): string | null {
    const auth = request.headers.authorization;
    if (!auth) return null;
    const parts = auth.split(' ');
    return parts.length === 2 ? parts[1] : null;
  }
}
