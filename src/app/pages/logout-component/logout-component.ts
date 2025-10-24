import { Component, OnInit, inject } from '@angular/core';
import Keycloak from 'keycloak-js';

@Component({
    selector: 'app-logout',
    standalone: true,
    template: `
        <div class="flex align-items-center justify-content-center" style="height: 100vh;">
            <div class="text-center">
                <i class="pi pi-spin pi-spinner" style="font-size: 3rem"></i>
                <p class="mt-3">Logging out...</p>
            </div>
        </div>
    `
})
export class LogoutComponent implements OnInit {
    private keycloak = inject(Keycloak);

    ngOnInit(): void {
        this.logout();
    }

    logout(): void {
        const redirectUri = window.location.origin;
        this.keycloak.logout({ redirectUri })
            .then(() => {
                console.log('Logout successful');
                // You can add any cleanup or additional logic here
            })
            .catch((error) => {
                console.error('Logout failed:', error);
                // Handle logout error if needed
            });
    }
}
