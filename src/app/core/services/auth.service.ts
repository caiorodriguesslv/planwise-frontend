import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError, map, of } from 'rxjs';
import { HttpService } from './http.service';
import { TokenService } from './token.service';
import { NotificationService } from './notification.service';
import { LoadingService } from './loading.service';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse 
} from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Signals para estado reativo moderno
  private _isAuthenticated = signal(false);
  private _currentUser = signal<User | null>(null);

  // BehaviorSubjects para compatibilidade RxJS
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  // Getters para signals (readonly)
  get isAuthenticated() {
    return this._isAuthenticated.asReadonly();
  }

  get currentUser() {
    return this._currentUser.asReadonly();
  }

  // Observables para compatibilidade
  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  constructor(
    private httpService: HttpService,
    private tokenService: TokenService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  /**
   * Inicializa o estado de autenticação verificando token existente
   */
  private initializeAuthState(): void {
    if (this.tokenService.hasValidToken()) {
      // Se tem token válido, busca dados do usuário
      this.getCurrentUser().subscribe({
        next: (user) => {
          this.setAuthenticatedState(user);
        },
        error: () => {
          // Token inválido, remove e redireciona
          this.logout(false);
        }
      });
    }
  }

  /**
   * Realiza login do usuário
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.loadingService.withLoadingObservable(
      this.httpService.post<AuthResponse>('/auth/login', credentials),
      'Realizando login...'
    ).pipe(
      tap((response) => {
        // Armazena o token
        this.tokenService.setToken(response.token);
        
        // Atualiza estado do usuário
        this.setAuthenticatedState(response.user);
        
        // Notifica sucesso
        this.notificationService.success(`Bem-vindo, ${response.user.name}!`);
        
        // Redireciona para dashboard
        this.router.navigate(['/dashboard']);
      }),
      catchError((error) => {
        this.notificationService.error(
          error.friendlyMessage || 'Email ou senha incorretos.'
        );
        return throwError(() => error);
      })
    );
  }

  /**
   * Registra novo usuário
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.loadingService.withLoadingObservable(
      this.httpService.post<AuthResponse>('/auth/register', userData),
      'Criando conta...'
    ).pipe(
      tap((response) => {
        // Armazena o token
        this.tokenService.setToken(response.token);
        
        // Atualiza estado do usuário
        this.setAuthenticatedState(response.user);
        
        // Notifica sucesso
        this.notificationService.success(
          `Conta criada com sucesso! Bem-vindo, ${response.user.name}!`
        );
        
        // Redireciona para dashboard
        this.router.navigate(['/dashboard']);
      }),
      catchError((error) => {
        this.notificationService.error(
          error.friendlyMessage || 'Erro ao criar conta. Tente novamente.'
        );
        return throwError(() => error);
      })
    );
  }

  /**
   * Realiza logout do usuário
   */
  logout(showNotification: boolean = true): void {
    // Remove token
    this.tokenService.removeToken();
    
    // Limpa estado
    this.clearAuthenticatedState();
    
    // Notifica (opcional)
    if (showNotification) {
      this.notificationService.info('Logout realizado com sucesso.');
    }
    
    // Redireciona para home
    this.router.navigate(['/home']);
  }

  /**
   * Obtém dados do usuário atual
   */
  getCurrentUser(): Observable<User> {
    return this.httpService.get<User>('/users/me');
  }

  /**
   * Atualiza dados do usuário atual
   */
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.loadingService.withLoadingObservable(
      this.httpService.put<User>('/users/me', userData),
      'Atualizando perfil...'
    ).pipe(
      tap((updatedUser) => {
        // Atualiza estado local
        this._currentUser.set(updatedUser);
        this.currentUserSubject.next(updatedUser);
        
        this.notificationService.updatedSuccessfully('Perfil');
      }),
      catchError((error) => {
        this.notificationService.error(
          error.friendlyMessage || 'Erro ao atualizar perfil.'
        );
        return throwError(() => error);
      })
    );
  }

  /**
   * Altera senha do usuário
   */
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    const passwordData = {
      currentPassword,
      newPassword,
      confirmPassword: newPassword
    };

    return this.loadingService.withLoadingObservable(
      this.httpService.put<void>('/users/me/password', passwordData),
      'Alterando senha...'
    ).pipe(
      tap(() => {
        this.notificationService.success('Senha alterada com sucesso!');
      }),
      catchError((error) => {
        this.notificationService.error(
          error.friendlyMessage || 'Erro ao alterar senha.'
        );
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica se o usuário tem uma determinada role
   */
  hasRole(role: string): boolean {
    return this.tokenService.hasRole(role);
  }

  /**
   * Verifica se o usuário é admin
   */
  isAdmin(): boolean {
    return this.tokenService.isAdmin();
  }

  /**
   * Verifica se o token está próximo do vencimento
   */
  isTokenExpiringSoon(minutesThreshold: number = 5): boolean {
    const timeLeft = this.tokenService.getTokenExpirationTime();
    return timeLeft > 0 && timeLeft <= (minutesThreshold * 60);
  }

  /**
   * Força atualização dos dados do usuário
   */
  refreshUserData(): Observable<User> {
    return this.getCurrentUser().pipe(
      tap((user) => {
        this.setAuthenticatedState(user);
      })
    );
  }

  /**
   * Verifica se o email já está em uso (para validação)
   */
  checkEmailAvailability(email: string): Observable<boolean> {
    return this.httpService.get<{ available: boolean }>(`/auth/check-email?email=${email}`)
      .pipe(
        map(response => response.available),
        catchError(() => of(true)) // Em caso de erro, assume que está disponível
      );
  }

  /**
   * Define estado autenticado
   */
  private setAuthenticatedState(user: User): void {
    this._isAuthenticated.set(true);
    this._currentUser.set(user);
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(user);
  }

  /**
   * Limpa estado autenticado
   */
  private clearAuthenticatedState(): void {
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  /**
   * Helpers para verificações rápidas
   */
  
  // Verifica se está logado
  get isLoggedIn(): boolean {
    return this._isAuthenticated() && this.tokenService.hasValidToken();
  }

  // Obtém nome do usuário
  get userName(): string {
    return this._currentUser()?.name || '';
  }

  // Obtém email do usuário
  get userEmail(): string {
    return this._currentUser()?.email || '';
  }

  // Obtém ID do usuário
  get userId(): number | null {
    return this._currentUser()?.id || null;
  }
}
