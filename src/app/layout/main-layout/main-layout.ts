import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificacaoService } from '../../core/services/notificacao.service'; // <-- 1. Importe aqui no topo

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  protected authService = inject(AuthService);
  protected notificacao = inject(NotificacaoService); // <-- 2. Coloque a linha aqui dentro da classe
  private router = inject(Router);

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
