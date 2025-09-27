import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TokenPayload } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  /**
   * Armazena o token JWT no localStorage
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(environment.tokenKey, token);
    }
  }

  /**
   * Recupera o token JWT do localStorage
   */
  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(environment.tokenKey);
    }
    return null;
  }

  /**
   * Remove o token do localStorage
   */
  removeToken(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(environment.tokenKey);
      localStorage.removeItem(environment.refreshTokenKey);
    }
  }

  /**
   * Verifica se existe um token válido
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = this.decodeToken(token);
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }

  /**
   * Decodifica o payload do token JWT
   */
  decodeToken(token: string): TokenPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload) as TokenPayload;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  /**
   * Obtém informações do usuário a partir do token
   */
  getUserInfo(): { userId: number; email: string; roles: string[] } | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = this.decodeToken(token);
      return {
        userId: payload.userId || 0,
        email: payload.sub || '',
        roles: Array.isArray(payload.roles) ? payload.roles : []
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica se o usuário tem uma determinada role
   */
  hasRole(role: string): boolean {
    const userInfo = this.getUserInfo();
    return userInfo && userInfo.roles && Array.isArray(userInfo.roles) 
      ? userInfo.roles.includes(role) 
      : false;
  }

  /**
   * Verifica se o usuário é admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Obtém o tempo restante do token em segundos
   */
  getTokenExpirationTime(): number {
    const token = this.getToken();
    if (!token) {
      return 0;
    }

    try {
      const payload = this.decodeToken(token);
      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, payload.exp - now);
    } catch (error) {
      return 0;
    }
  }
}
