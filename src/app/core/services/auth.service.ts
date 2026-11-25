import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../../models/auth.model';

export interface JwtPayload {
  sub?: string;
  exp?: number;
  nome?: string;
  perfil?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private chave = 'financeiro.sessao';
  private sessao = signal<LoginResponse | null>(this.restaurar());

  readonly token = computed(() => this.sessao()?.token ?? null);
  readonly autenticado = computed(() => {
    const t = this.token();
    return !!t && !this.isTokenExpirado(t);
  });

  // Signals prontos para o MainLayout exibir nome e validar perfil
  readonly payload = computed(() => {
    const t = this.token();
    return t ? this.decodificarToken(t) : null;
  });

  readonly nomeUsuario = computed(() => {
    return this.payload()?.nome || 'Usuário autenticado';
  });

  readonly perfilUsuario = computed(() => {
    return this.payload()?.perfil ?? null;
  });

  login(dados: LoginRequest) {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`, dados
    ).pipe(tap(res => {
      sessionStorage.setItem(this.chave, JSON.stringify(res));
      this.sessao.set(res);
    }));
  }

  logout() {
    sessionStorage.removeItem(this.chave);
    this.sessao.set(null);
  }

  decodificarToken(token: string): JwtPayload | null {
    try {
      const partes = token.split('.');
      if (partes.length !== 3) return null;

      // Converte Base64URL para Base64 padrão e completa padding '='
      let base64 = partes.at(1)!.replace(/-/g, '+').replace(/_/g, '/');

      while (base64.length % 4 !== 0) {
        base64 += '=';
      }

      // Decodifica em UTF-8 para suportar acentos no nome
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const jsonPayload = new TextDecoder().decode(bytes);

      return JSON.parse(jsonPayload) as JwtPayload;
    } catch {
      return null; // Trata tokens malformados sem quebrar a aplicação
    }
  }

  isTokenExpirado(token: string | null): boolean {
    if (!token) return true;

    const payload = this.decodificarToken(token);
    if (!payload || !payload.exp) return true;

    return Date.now() >= payload.exp * 1000;
  }

  private restaurar(): LoginResponse | null {
    try {
      const salvo = JSON.parse(sessionStorage.getItem(this.chave) ?? 'null') as LoginResponse | null;
      
      // Se houver sessão salva, mas o token estiver expirado ou inválido, limpa imediatamente
      if (!salvo?.token || this.isTokenExpirado(salvo.token)) {
        sessionStorage.removeItem(this.chave);
        return null;
      }

      return salvo;
    } catch {
      sessionStorage.removeItem(this.chave);
      return null;
    }
  }
}
