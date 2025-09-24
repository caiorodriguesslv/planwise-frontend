import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError, map, of, take } from 'rxjs';
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
import { environment } from '../../../environments/environment';

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
    // Inicialização com delay para permitir que outros serviços inicializem
    setTimeout(() => {
      this.initializeAuthState();
    }, 100);
  }

  /**
   * Inicializa o estado de autenticação verificando token existente
   */
  initializeAuthState(): void {
    const hasToken = this.tokenService.hasValidToken();
    const currentToken = this.tokenService.getToken();
    
    console.log('🚀 Inicializando estado de autenticação:', {
      hasToken,
      tokenExists: !!currentToken,
      tokenLength: currentToken?.length || 0,
      tokenStart: currentToken ? currentToken.substring(0, 20) + '...' : 'N/A'
    });
    
    if (hasToken) {
      // Se tem token válido, busca dados do usuário
      console.log('🔍 Token válido encontrado, buscando dados do usuário...');
      this.getCurrentUser().subscribe({
        next: (user) => {
          this.setAuthenticatedState(user);
          console.log('✅ Estado de autenticação inicializado com sucesso', user);
        },
        error: (error) => {
          console.warn('⚠️ Token inválido encontrado, fazendo logout', {
            error,
            status: error.status,
            message: error.message,
            url: error.url
          });
          // Token inválido, remove e redireciona
          this.logout(false);
        }
      });
    } else {
      console.log('ℹ️ Nenhum token válido encontrado na inicialização');
    }
  }

  /**
   * Realiza login do usuário
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 Iniciando processo de login para:', credentials.email);
    console.log('📤 Dados sendo enviados:', {
      email: credentials.email,
      password: credentials.password ? '***' : 'undefined',
      url: `${environment.apiUrl}/auth/login`,
      credentialsType: typeof credentials,
      credentialsKeys: Object.keys(credentials),
      isEmailValid: !!credentials.email,
      isPasswordValid: !!credentials.password,
      emailLength: credentials.email?.length || 0,
      passwordLength: credentials.password?.length || 0
    });
    
    // Validação adicional dos dados antes de enviar
    if (!credentials.email || !credentials.password) {
      const error = new Error('Email e senha são obrigatórios');
      console.error('❌ Validação falhou:', error);
      return throwError(() => error);
    }
    
    if (credentials.email.length < 3 || credentials.password.length < 1) {
      const error = new Error('Email ou senha muito curtos');
      console.error('❌ Validação falhou:', error);
      return throwError(() => error);
    }
    
    // Teste de conectividade antes do login
    console.log('🌐 Testando conectividade com o servidor...');
    
    return this.loadingService.withLoadingObservable(
      this.httpService.post<AuthResponse>('/auth/login', credentials),
      'Realizando login...'
    ).pipe(
      tap((response) => {
        console.log('✅ Resposta de login recebida:', response);
        console.log('📊 Análise da resposta:', {
          hasResponse: !!response,
          hasToken: !!(response?.token),
          hasUser: !!(response?.user),
          userStructure: response?.user ? Object.keys(response.user) : 'N/A'
        });
        
        // Verificações de segurança
        if (!response) {
          throw new Error('Resposta vazia do servidor');
        }
        
        if (!response.token) {
          throw new Error('Token não encontrado na resposta');
        }
        
        // Armazena o token primeiro
        this.tokenService.setToken(response.token);
        console.log('💾 Token armazenado no localStorage');
        
        // Verifica se temos dados do usuário na resposta
        if (response.user) {
          // Atualiza estado do usuário com dados da resposta
          this.setAuthenticatedState(response.user);
          console.log('🔄 Estado de autenticação atualizado com dados da resposta');
          
          // Redireciona após configurar o estado (com pequeno delay para garantir sincronização)
          setTimeout(() => {
            console.log('🔄 Redirecionando para dashboard após autenticação...');
            this.router.navigate(['/dashboard']);
            this.showWelcomeMessage(response.user);
          }, 150);
          
        } else {
          // Se não tem dados do usuário, tenta buscar do servidor
          console.log('⚠️ Dados do usuário não encontrados na resposta, buscando do servidor...');
          this.getCurrentUser().subscribe({
            next: (user) => {
              this.setAuthenticatedState(user);
              console.log('🔄 Estado de autenticação atualizado com dados do servidor');
              
              // Redireciona após obter e configurar dados do usuário
              setTimeout(() => {
                console.log('🔄 Redirecionando para dashboard após buscar dados do usuário...');
                this.router.navigate(['/dashboard']);
                this.showWelcomeMessage(user);
              }, 150);
            },
            error: (userError) => {
              console.error('❌ Erro ao buscar dados do usuário:', userError);
              // Mesmo assim marca como autenticado e redireciona, pois o token é válido
              this._isAuthenticated.set(true);
              this.isAuthenticatedSubject.next(true);
              
              setTimeout(() => {
                console.log('🔄 Redirecionando para dashboard mesmo com erro nos dados do usuário...');
                this.router.navigate(['/dashboard']);
                this.notificationService.success('Login realizado com sucesso!');
              }, 150);
            }
          });
        }
      }),
      catchError((error) => {
        console.error('❌ Erro no login:', error);
        console.error('📊 Detalhes do erro:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          errorBody: error.error,
          headers: error.headers
        });
        
        let errorMessage = 'Email ou senha incorretos.';
        
        if (error.status === 400) {
          errorMessage = 'Dados inválidos. Verifique email e senha.';
        } else if (error.status === 401) {
          errorMessage = 'Email ou senha incorretos.';
        } else if (error.status === 403) {
          errorMessage = 'Acesso negado. Verifique suas credenciais.';
        } else if (error.status === 0) {
          errorMessage = 'Erro de conexão. Verifique se o servidor está rodando.';
        }
        
        this.notificationService.error(error.friendlyMessage || errorMessage);
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
        this.showWelcomeMessage(response.user);
        
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
   * Força a sincronização do estado de autenticação
   * Útil para resolver problemas de cache/estado inconsistente
   */
  forceSyncAuthState(): void {
    console.log('🔄 Forçando sincronização do estado de autenticação...');
    
    const hasToken = this.tokenService.hasValidToken();
    const currentAuthState = this._isAuthenticated();
    
    console.log('📊 Estado atual:', { hasToken, currentAuthState });
    
    if (hasToken && !currentAuthState) {
      console.log('⚠️ Inconsistência detectada: tem token mas não está autenticado');
      // Força inicialização
      this.initializeAuthState();
    } else if (!hasToken && currentAuthState) {
      console.log('⚠️ Inconsistência detectada: não tem token mas está autenticado');
      // Força logout
      this.clearAuthenticatedState();
    } else {
      console.log('✅ Estado consistente');
    }
  }

  /**
   * Mostra mensagem de boas-vindas com verificações de segurança
   */
  private showWelcomeMessage(user?: User): void {
    try {
      let userName = 'Usuário';
      
      if (user?.name) {
        userName = user.name;
      } else if (user?.email) {
        userName = user.email;
      } else {
        // Tenta pegar do usuário atual
        const currentUser = this._currentUser();
        if (currentUser?.name) {
          userName = currentUser.name;
        } else if (currentUser?.email) {
          userName = currentUser.email;
        }
      }
      
      this.notificationService.success(`Bem-vindo, ${userName}!`);
    } catch (error) {
      console.error('❌ Erro ao mostrar mensagem de boas-vindas:', error);
      this.notificationService.success('Login realizado com sucesso!');
    }
  }

  /**
   * Define estado autenticado
   */
  private setAuthenticatedState(user: User): void {
    if (!user) {
      console.error('❌ Tentativa de definir estado autenticado com usuário inválido');
      return;
    }
    
    console.log('🔄 Definindo estado autenticado para usuário:', user);
    
    // Atualiza todos os estados de forma síncrona
    this._isAuthenticated.set(true);
    this._currentUser.set(user);
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(user);
    
    // Log de confirmação
    console.log('✅ Estado de autenticação configurado:', {
      isAuthenticated: this._isAuthenticated(),
      hasUser: !!this._currentUser(),
      userName: this._currentUser()?.name
    });
    
    // Força sincronização do AuthSyncService se disponível
    setTimeout(() => {
      console.log('🔄 Forçando verificação de consistência pós-login...');
      this.forceSyncAuthState();
    }, 50);
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

  /**
   * Aguarda a inicialização completa do serviço de autenticação
   * Útil para guards que precisam aguardar o estado estar sincronizado
   */
  waitForInitialization(): Observable<boolean> {
    // Se já tem token, verifica se o estado está consistente
    if (this.tokenService.hasValidToken()) {
      const currentState = this._isAuthenticated();
      
      if (!currentState) {
        console.log('⏳ Aguardando inicialização do estado de autenticação...');
        // Se tem token mas não está autenticado, aguarda a inicialização
        return this.isAuthenticated$.pipe(
          tap(state => console.log('🔍 Estado atual durante inicialização:', state)),
          take(1)
        );
      }
    }
    
    // Se não tem token ou estado já está consistente, retorna imediatamente
    return this.isAuthenticated$.pipe(take(1));
  }
}
