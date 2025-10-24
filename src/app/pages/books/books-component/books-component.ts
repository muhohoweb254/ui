import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookService, PaginatedResponse } from '@/services/books/book-service';
import { Book } from '@/interfaces/book';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { Tag } from 'primeng/tag';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { InputMask } from 'primeng/inputmask';
import { Tooltip } from 'primeng/tooltip';
import { Popover } from 'primeng/popover';
import { IconField } from 'primeng/iconfield';
import { Select } from 'primeng/select';

@Component({
    selector: 'app-books-component',
    imports: [TableModule, Button, Tag, Dialog, ReactiveFormsModule, DatePickerModule, InputMask, FormsModule, Popover, Select], // Add your PrimeNG imports here if using standalone components
    templateUrl: './books-component.html',
    styleUrl: './books-component.scss'
})
export class BooksComponent implements OnInit {
    // Modal state
    visible: boolean = false;
    bookForm: FormGroup;
    minDate: Date = new Date();

    books: Book[] = [];
    totalElements = 0;
    isLoading = false;
    savingBook = false;
    expectedDate = ''
    admNo = ''
    bookIsbn = ''
    lastLoadEvent?: TableLazyLoadEvent;
    selectedBooks!: Book[];
    searchValue: string | undefined;

    statuses = [
        { label: 'Available', value: false },
        { label: 'Borrowed', value: true }
    ];

    constructor(
        private bookService: BookService,
        private fb: FormBuilder
    ) {
        this.bookForm = this.fb.group({
            admNo: ['', [Validators.required]],
            bookIsbn: ['', [Validators.required]],
            expectedDate: ['', [Validators.required]]
        });
    }



    selectedStatus: boolean | null = null;

    onStatusChange(value: boolean, filterCallback: Function) {
        this.selectedStatus = value;
        filterCallback(value);
    }



    showDialog() {
        this.visible = true;
        this.bookForm.reset();
    }

    // Hide modal
    hideDialog() {
        this.visible = false;
        this.bookForm.reset();
    }

    formatDate(date: Date): string {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    clear(table: Table) {
        table.clear();
        this.searchValue = ''
    }

    // Submit form
    onSubmit() {
        if (this.bookForm.valid) {
            const formValue = this.bookForm.value;
            const payload = {
                admNo: formValue.admNo,
                bookIsbn: formValue.bookIsbn,
                expectedDate: this.formatDate(formValue.expectedDate)
            };

            console.log('Payload:', payload);

            // Call your API here
            // this.bookService.addBookLoan(payload).subscribe(...);

            this.hideDialog();
        } else {
            Object.keys(this.bookForm.controls).forEach((key) => {
                this.bookForm.get(key)?.markAsTouched();
            });
        }
    }

    ngOnInit(): void {
        // Initial load will be triggered by the table's lazy loading
        this.isLoading = true;
    }

    loadBooks(event: TableLazyLoadEvent): void {
        this.isLoading = true;
        this.lastLoadEvent = event;

        // Calculate page number (PrimeNG uses 0-based indexing)
        const page = event.first ? Math.floor(event.first / (event.rows || 10)) : 0;
        const size = event.rows || 10;

        this.bookService.getBooks(page, size).subscribe({
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

    // Action methods for the buttons
    copied = "Copied the book";
    borrowBook(book: Book): void {
        // Implement borrow logic
        console.log('Borrowing book:', book);
        // You can call a service method here to update the book status
        // this.bookService.borrowBook(book.id).subscribe(...);
    }

    returnBook(book: Book): void {
        // Implement return logic
        console.log('Returning book:', book);
        // You can call a service method here to update the book status
        // this.bookService.returnBook(book.id).subscribe(...);
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.bookForm.get(fieldName);
        return !!(field?.invalid && field?.touched);
    }

    issueBook() {
        this.savingBook = true;
        if (this.bookForm.valid) {
            const formValue = this.bookForm.value;
            const payload = {
                admNo: formValue.admNo,
                bookIsbn: formValue.bookIsbn,
                expectedDate: this.formatDate(formValue.expectedDate)
            };

            console.log('Payload:', payload);

            this.bookService.issueBook(payload).subscribe({
                next: (response: any) => {
                    console.log('Success:', response);
                    // this.hideDialog();
                    this.savingBook = false;
                    if (this.lastLoadEvent) {
                        this.loadBooks(this.lastLoadEvent);
                        this.hideDialog();
                    }
                    // Optionally reload the books table
                    // this.loadBooks({ first: 0, rows: 10 });
                },
                error: (error: any) => {
                    console.log('Error:', error);
                    this.savingBook = false;
                }
            });
        } else {
            this.savingBook = false;
            // Mark all fields as touched to show validation errors
            Object.keys(this.bookForm.controls).forEach((key) => {
                this.bookForm.get(key)?.markAsTouched();
            });
        }
    }

    copy(bookIsbn: string) {
        navigator.clipboard.writeText(bookIsbn).then(
            () => {
                console.log('Copied to clipboard:', bookIsbn);
                // Optionally show a success message
            },
            (err) => {
                console.error('Failed to copy:', err);
            }
        );
    }
}
