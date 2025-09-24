import { Injectable, OnDestroy } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthSyncService implements OnDestroy {
  
  private storageSubscription?: Subscription;
  private lastTokenState: boolean = false;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService
  ) {
    this.initializeStorageListener();
    this.lastTokenState = this.tokenService.hasValidToken();
  }

  ngOnDestroy(): void {
    this.storageSubscription?.unsubscribe();
  }

  /**
   * Inicializa o listener para mudanças no localStorage
   * Detecta quando o token é alterado em outra aba/janela
   */
  private initializeStorageListener(): void {
    if (typeof window !== 'undefined') {
      this.storageSubscription = fromEvent<StorageEvent>(window, 'storage')
        .pipe(
          filter(event => event.key === environment.tokenKey || event.key === null)
        )
        .subscribe((event) => {
          console.log('🔄 Mudança detectada no localStorage:', event);
          this.handleStorageChange(event);
        });

      // Também verifica periodicamente por mudanças
      setInterval(() => {
        this.checkTokenConsistency();
      }, 5000); // Verifica a cada 5 segundos
    }
  }

  /**
   * Manipula mudanças no localStorage
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === environment.tokenKey) {
      const currentTokenState = this.tokenService.hasValidToken();
      
      if (currentTokenState !== this.lastTokenState) {
        console.log('🔄 Estado do token mudou, sincronizando...', {
          anterior: this.lastTokenState,
          atual: currentTokenState
        });
        
        this.authService.forceSyncAuthState();
        this.lastTokenState = currentTokenState;
      }
    }
  }

  /**
   * Verifica consistência do token periodicamente
   */
  private checkTokenConsistency(): void {
    const currentTokenState = this.tokenService.hasValidToken();
    const currentAuthState = this.authService.isLoggedIn;
    
    if (currentTokenState !== this.lastTokenState) {
      console.log('🔍 Inconsistência de token detectada na verificação periódica');
      this.authService.forceSyncAuthState();
      this.lastTokenState = currentTokenState;
    }
    
    // Detecta inconsistências entre token e estado de auth
    if (currentTokenState !== currentAuthState) {
      console.warn('⚠️ Inconsistência entre token e estado de autenticação detectada');
      this.authService.forceSyncAuthState();
    }
  }

  /**
   * Força uma verificação manual da consistência
   */
  forceCheck(): void {
    console.log('🔍 Verificação manual de consistência solicitada');
    this.checkTokenConsistency();
  }
}

