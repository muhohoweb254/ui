import { Component, OnInit } from '@angular/core';
import { Exam } from '@/interfaces/exam';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { HttpClient } from '@angular/common/http';
import { ExamsService } from '@/services/exams/exams-service';
import { Button } from 'primeng/button';
import { PrimeTemplate } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';

@Component({
    selector: 'app-exams-component',
    imports: [Button, PrimeTemplate, TableModule, Dialog, InputText, FormsModule, Select],
    templateUrl: './exams-component.html',
    styleUrl: './exams-component.scss'
})
export class ExamsComponent implements OnInit {
    constructor(private examService: ExamsService) {}

    exams: Exam[] = [];

    totalElements = 0;
    isLoading = false;
    visible = false;
    selectedSemester: any;
    semesters: [{ name: string }, { name: string }, { name: string }] | undefined

    loadExams(event: TableLazyLoadEvent): void {
        this.isLoading = true;

        // Calculate page number (PrimeNG uses 0-based indexing)
        const page = event.first ? Math.floor(event.first / (event.rows || 10)) : 0;
        const size = event.rows || 10;

        this.examService.getExams(page, size).subscribe({
            next: (response: any) => {
                console.log('Full response:', response);

                // Handle paginated response
                if (response && response.content) {
                    this.exams = response.content;
                    this.totalElements = response.totalElements;
                } else if (Array.isArray(response)) {
                    this.exams = response;
                    this.totalElements = response.length;
                } else {
                    console.error('Unexpected response structure:', response);
                    this.exams = [];
                    this.totalElements = 0;
                }

                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error fetching books:', error);
                this.exams = [];
                this.totalElements = 0;
                this.isLoading = false;
            }
        });
    }

    addExamRecord() {
        this.visible = true;
    }

    ngOnInit(): void {
        this.semesters = [
            { name: 'One'},
            { name: 'Two'},
            { name: 'Three'},
        ];
    }
}
