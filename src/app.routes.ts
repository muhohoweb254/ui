import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/component/app.layout';
import { Dashboard } from '@/pages/dashboard/dashboard';
import { Documentation } from '@/pages/documentation/documentation';
import { Landing } from '@/pages/landing/landing';
import { Notfound } from '@/pages/notfound/notfound';
import { Students } from '@/pages/students/students';
import { BooksComponent } from '@/pages/books/books-component/books-component';
import { Empty } from '@/pages/empty/empty';
import { LogoutComponent } from '@/pages/logout-component/logout-component';
import { BorrowedComponent } from '@/pages/books/borrowed-component/borrowed-component';
import { CourseComponent } from '@/pages/course-component/course-component';
import { ExamsComponent } from '@/pages/exams-component/exams-component';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'students', component: Students },
            { path: 'books', component: BooksComponent },
            { path: 'books/borrowed', component: BorrowedComponent },
            { path: 'exam', component: ExamsComponent },
            { path: 'courses', component: CourseComponent },
            { path: 'logout', component: LogoutComponent },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
