import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Empty } from './empty/empty';
import { Students } from '@/pages/students/students';
import { BooksComponent } from '@/pages/books/books-component/books-component';
import { LogoutComponent } from '@/pages/logout-component/logout-component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'students', component: Students },
    { path: 'books', component: BooksComponent },
    { path: 'empty', component: Empty },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
