import { Component, OnInit } from '@angular/core';
import { CourseService } from '@/services/courses/course-service';
import { Observable } from 'rxjs';
import { Course } from '@/course';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { PrimeTemplate } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

@Component({
    selector: 'app-course-component',
    imports: [
        Button,
        PrimeTemplate,
        ReactiveFormsModule,
        TableModule
    ],
    templateUrl: './course-component.html',
    styleUrl: './course-component.scss'
})
export class CourseComponent implements OnInit {
    constructor(private courseService: CourseService) {}

    courses: Course[] = [];
    isLoading: boolean = false;
    totalElements = 0;

    ngOnInit(): void {
        this.isLoading = true;
    }


    loadCourses(event: TableLazyLoadEvent):void {
        this.courseService.getCourses().subscribe({
            next: (response: any) => {
                if (response && response.content) {
                    this.courses = response.content;
                    this.totalElements = response.totalElements;
                }

                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error fetching courses:', error);
                this.courses = [];
                this.totalElements = 0;
                this.isLoading = false;
            }
        });
    }

    addCourse() {

    }
}
