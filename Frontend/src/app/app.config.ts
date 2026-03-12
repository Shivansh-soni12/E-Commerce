import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection} from '@angular/core';
import { provideHttpClient, withInterceptors, withFetch} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing:true}),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        (req, next) => {
          return next(req.clone({ withCredentials: true }));
        }
      ]) 
    ),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),

  ]
};
