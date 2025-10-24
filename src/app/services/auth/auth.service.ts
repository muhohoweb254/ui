// your-component.ts
import { Component, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

@Component({
    selector: 'app-navbar',
    template: `<button (click)="logout()">Logout</button>`
})
export class AuthService {
    private keycloak = inject(Keycloak);


    logout(): void {
        this.keycloak.logout({ redirectUri: window.location.origin });
    }
}
