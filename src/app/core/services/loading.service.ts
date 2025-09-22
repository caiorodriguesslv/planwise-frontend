import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  
  // Usando signals para estado reativo moderno
  private _isLoading = signal(false);
  private _loadingMessage = signal('');

  // Para compatibilidade com RxJS
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private messageSubject = new BehaviorSubject<string>('');

  // Contador para múltiplas requisições simultâneas
  private loadingCounter = 0;

  // Getters para signals
  get isLoading() {
    return this._isLoading.asReadonly();
  }

  get loadingMessage() {
    return this._loadingMessage.asReadonly();
  }

  // Observables para compatibilidade
  get isLoading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  get loadingMessage$(): Observable<string> {
    return this.messageSubject.asObservable();
  }

  /**
   * Inicia o loading
   */
  show(message: string = 'Carregando...'): void {
    this.loadingCounter++;
    this._isLoading.set(true);
    this._loadingMessage.set(message);
    this.loadingSubject.next(true);
    this.messageSubject.next(message);
  }

  /**
   * Para o loading
   */
  hide(): void {
    this.loadingCounter = Math.max(0, this.loadingCounter - 1);
    
    if (this.loadingCounter === 0) {
      this._isLoading.set(false);
      this._loadingMessage.set('');
      this.loadingSubject.next(false);
      this.messageSubject.next('');
    }
  }

  /**
   * Força a parada do loading (zera contador)
   */
  forceHide(): void {
    this.loadingCounter = 0;
    this._isLoading.set(false);
    this._loadingMessage.set('');
    this.loadingSubject.next(false);
    this.messageSubject.next('');
  }

  /**
   * Executa uma função mostrando loading
   */
  async withLoading<T>(
    operation: () => Promise<T>, 
    message: string = 'Carregando...'
  ): Promise<T> {
    this.show(message);
    try {
      const result = await operation();
      return result;
    } finally {
      this.hide();
    }
  }

  /**
   * Executa um Observable mostrando loading
   */
  withLoadingObservable<T>(
    operation$: Observable<T>,
    message: string = 'Carregando...'
  ): Observable<T> {
    this.show(message);
    
    return new Observable<T>(subscriber => {
      const subscription = operation$.subscribe({
        next: (value) => subscriber.next(value),
        error: (error) => {
          this.hide();
          subscriber.error(error);
        },
        complete: () => {
          this.hide();
          subscriber.complete();
        }
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Atualiza apenas a mensagem sem alterar o estado
   */
  updateMessage(message: string): void {
    if (this._isLoading()) {
      this._loadingMessage.set(message);
      this.messageSubject.next(message);
    }
  }

  /**
   * Verifica se está carregando
   */
  get isCurrentlyLoading(): boolean {
    return this._isLoading();
  }

  /**
   * Obtém a mensagem atual
   */
  get currentMessage(): string {
    return this._loadingMessage();
  }
}
