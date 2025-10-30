import {withFetch } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';

import {
    provideKeycloak,
    createInterceptorCondition,
    IncludeBearerTokenCondition,
    includeBearerTokenInterceptor,
    INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG

} from 'keycloak-angular';
import {environment} from './environments/environment';


const baseUrl = environment.base_url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters

const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
    urlPattern: new RegExp(`^(${baseUrl})(\/.*)?$`, 'i'),
    bearerPrefix: 'Bearer'
});

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch()),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        provideKeycloak({
            config: {
                url: environment['keycloak-server-url'],
                realm: environment['realm-id'],
                clientId: environment['client-id'],
            },
            initOptions: {
                onLoad: 'login-required',
                silentCheckSsoRedirectUri: window.location.origin + 'silent-check-sso.html'
            }
        }),
        {
            provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
            useValue: [urlCondition] // <-- Note that multiple conditions might be added.
        },
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(appRoutes),
        provideHttpClient(withInterceptors([includeBearerTokenInterceptor]))
    ]
};
