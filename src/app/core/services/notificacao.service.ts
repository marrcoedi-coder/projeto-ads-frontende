import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  readonly mensagemErro = signal<string | null>(null);

  mostrarErro(mensagem: string): void {
    this.mensagemErro.set(mensagem);
    setTimeout(() => this.limpar(), 6000);
  }

  limpar(): void {
    this.mensagemErro.set(null);
  }
}
