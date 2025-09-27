import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthSyncService } from './core/services/auth-sync.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: (authSyncService: AuthSyncService) => () => {
        return Promise.resolve();
      },
      deps: [AuthSyncService],
      multi: true
    }
  ]
};
