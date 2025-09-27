import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpContext } from '@angular/common/http';
import { Observable, throwError, timeout, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, HttpOptions, PageRequest, PaginatedResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private readonly baseUrl = environment.apiUrl;
  private readonly defaultTimeout = environment.apiTimeout;

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);

    return this.http.get<T>(url, httpOptions).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);

    return this.http.post<T>(url, body, httpOptions).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);

    return this.http.put<T>(url, body, httpOptions).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);

    return this.http.delete<T>(url, httpOptions).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = this.buildHttpOptions(options);

    return this.http.patch<T>(url, body, httpOptions).pipe(
      timeout(options?.timeout || this.defaultTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * GET com paginação
   */
  getPageable<T>(endpoint: string, pageRequest?: PageRequest, options?: HttpOptions): Observable<PaginatedResponse<T>> {
    const params = this.buildPageParams(pageRequest);
    const mergedOptions = { ...options, params: { ...options?.params, ...params } };
    
    return this.get<PaginatedResponse<T>>(endpoint, mergedOptions);
  }

  /**
   * Upload de arquivo
   */
  uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const url = this.buildUrl(endpoint);
    
    return this.http.post<T>(url, formData).pipe(
      timeout(this.defaultTimeout * 3), // Timeout maior para uploads
      catchError(this.handleError)
    );
  }

  /**
   * Download de arquivo
   */
  downloadFile(endpoint: string, filename?: string): Observable<Blob> {
    const url = this.buildUrl(endpoint);
    
    return this.http.get(url, { 
      responseType: 'blob',
      observe: 'body'
    }).pipe(
      timeout(this.defaultTimeout * 2),
      catchError(this.handleError)
    );
  }

  /**
   * Constrói a URL completa
   */
  private buildUrl(endpoint: string): string {
    // Remove barra inicial se existir
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  /**
   * Constrói as opções HTTP
   */
  private buildHttpOptions(options?: HttpOptions): { headers: HttpHeaders; params: HttpParams } {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Adiciona headers customizados
    if (options?.headers) {
      Object.keys(options.headers).forEach(key => {
        headers = headers.set(key, options.headers![key]);
      });
    }

    let params = new HttpParams();
    
    // Adiciona parâmetros
    if (options?.params) {
      Object.keys(options.params).forEach(key => {
        const value = options.params![key];
        if (value !== null && value !== undefined) {
          params = params.set(key, value.toString());
        }
      });
    }

    return {
      headers,
      params
    };
  }

  /**
   * Constrói parâmetros de paginação
   */
  private buildPageParams(pageRequest?: PageRequest): any {
    if (!pageRequest) {
      return {};
    }

    const params: any = {};
    
    if (pageRequest.page !== undefined) {
      params.page = pageRequest.page.toString();
    }
    
    if (pageRequest.size !== undefined) {
      params.size = pageRequest.size.toString();
    }
    
    if (pageRequest.sort) {
      const direction = pageRequest.direction || 'ASC';
      params.sort = `${pageRequest.sort},${direction}`;
    }

    return params;
  }

  /**
   * Trata erros HTTP
   */
  private handleError = (error: any): Observable<never> => {
    return throwError(() => error);
  };

  /**
   * Helpers para endpoints comuns
   */
  
  // Health check
  healthCheck(): Observable<any> {
    return this.get('/health');
  }

  // Versão da API
  getApiVersion(): Observable<any> {
    return this.get('/version');
  }
}
