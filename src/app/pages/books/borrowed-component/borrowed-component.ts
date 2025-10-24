import { Component, OnInit } from '@angular/core';
import { BookService } from '@/services/books/book-service';
import { Book, returnBook } from '@/interfaces/book';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { DatePipe } from '@angular/common';
import { Toast } from 'primeng/toast';
import { Ripple } from 'primeng/ripple';

@Component({
    selector: 'app-borrowed-component',
    imports: [Button, PrimeTemplate, TableModule, Tag, DatePipe, Toast, Ripple],
    providers: [MessageService],
    templateUrl: './borrowed-component.html',
    styleUrl: './borrowed-component.scss'
})
export class BorrowedComponent implements OnInit {
    constructor(
        private bookService: BookService,
        private messageService: MessageService) {

    }

    books: Book[] = [];
    totalElements = 0;
    isLoading = false;
    isReturning = false;
    lastLoadEvent?: TableLazyLoadEvent;

    ngOnInit(): void {
        // Initial load will be triggered by the table's lazy loading
        this.isLoading = true;
    }

    getBorrowedBooks(event: TableLazyLoadEvent): void {
        this.isLoading = true;
        this.lastLoadEvent = event;

        // Calculate page number (PrimeNG uses 0-based indexing)
        const page = event.first ? Math.floor(event.first / (event.rows || 10)) : 0;
        const size = event.rows || 10;

        this.bookService.getBorrowedBooks(page, size).subscribe({
            next: (response: any) => {
                console.log('Full response:', response);

                // Handle paginated response
                if (response && response.content) {
                    this.books = response.content;
                    this.totalElements = response.totalElements;
                } else if (Array.isArray(response)) {
                    this.books = response;
                    this.totalElements = response.length;
                } else {
                    console.error('Unexpected response structure:', response);
                    this.books = [];
                    this.totalElements = 0;
                }

                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error fetching books:', error);
                this.books = [];
                this.totalElements = 0;
                this.isLoading = false;
            }
        });
    }

    returnBook(book: any): void {
        this.isReturning = true;
        let payload:{ admNo: any; bookIsbn: any } = {
            admNo:book.admNno,
            bookIsbn:book.isbn,
        }
        this.bookService.returnBook(payload).subscribe({
            next: (response: any) => {
                this.isReturning = false;
                // this.getBorrowedBooks(this)
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Book successfully returned' });
            },
            error: (error) => {
                this.isReturning = false;
            }
        })
    }


}
