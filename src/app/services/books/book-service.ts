import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, issueBook, returnBook } from '@/interfaces/book';
import { environment } from '../../../environments/environment.development';

// Define interface for the paginated response
export interface PaginatedResponse<T> {
    content: T[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: any[];
        offset: number;
        paged: boolean;
    };
    size: number;
    sort: any[];
    totalElements: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class BookService {
    private baseUrl = 'your-api-base-url'; // Replace with your actual API URL

    constructor(private http: HttpClient) { }

    // Update this method to return the paginated response
    getBooks(page: number = 0, size: number = 10): Observable<PaginatedResponse<Book>> {
        return this.http.get<PaginatedResponse<Book>>(environment.base_url+`/library/books?page=${page}&size=${size}`);
    }


    getBorrowedBooks(page: number = 0, size: number = 10): Observable<PaginatedResponse<Book>> {
        return this.http.get<PaginatedResponse<Book>>(environment.base_url+`/library/borrowed?page=${page}&size=${size}`);
    }

    issueBook(payload:issueBook){
        return this.http.post(environment.base_url+`/library/issue`, payload);
    }

    returnBook(payload: { admNo: any; bookIsbn: any }){
        return this.http.post(environment.base_url+`/library/return`, payload);
    }

}
