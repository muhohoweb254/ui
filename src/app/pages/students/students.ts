import { Component, OnInit, WritableSignal } from '@angular/core';
import { StudentsService } from '@/services/students/students-service';
import { Student } from '@/interfaces/student';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputMask } from 'primeng/inputmask';
import { Course, Department } from '@/course';
import { CourseService } from '@/services/courses/course-service';
import { Select, SelectChangeEvent } from 'primeng/select';


@Component({
    selector: 'app-students',
    // standalone: true,
    imports: [
        TableModule,
        Button,
        Dialog,
        InputText,
        ReactiveFormsModule,
        Select,
        FormsModule
    ],
    templateUrl: './students.html',
    styleUrl: './students.scss'
})
export class Students implements OnInit {
    students: Student[] = [];
    isLoading: boolean = false;
    totalElements = 0;
    visible = false;
    studentForm: FormGroup;
    courses: Course[] = [];
    departments: Department[] = [];
    selectedCourse: any;
    hasSelectedDepartment: boolean = false;
    selectedDepartment: any;


    constructor(
        private studentService: StudentsService,
        private fb: FormBuilder,
        private courseService: CourseService,
        ) {
        this.studentForm = this.fb.group({
            name: ['', [Validators.required]],
            course: ['', [Validators.required]],
            department: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
        this.isLoading = true;
        this.getDepartments();
    }

    loadStudents($event: TableLazyLoadEvent) {
        this.studentService.getStudents().subscribe({
            next: (response: any) => {


                if (response) {
                    this.students = response;
                    this.totalElements = response.totalElements;
                }

                this.isLoading = false;
            },
            error: (error: any) => {
                this.isLoading = false;
            }
        });
    }

    registerStudent() {
        let payload = {
            name: this.studentForm.value.name,
            courseId: this.studentForm.value.course.id,
        }
        this.studentService.saveStudent(payload).subscribe({
            next: (response: any) => {
                if (response) {
                    console.log(response);
                }
            },
            error: (error: any) => {}
        })
    }

    openModal() {
        this.visible = true;
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.studentForm.get(fieldName);
        return !!(field?.invalid && field?.touched);
    }

    private getCourses() {
        this.courseService.getCourses().subscribe({
            next: (response: any) => {


                if (response && response.content) {
                    this.totalElements = response.totalElements;
                    this.courses = response.content;
                }
            },
            error: (error: any) => {}
        })
    }

    private getDepartments() {
        this.courseService.getDepartments().subscribe({
            next: (response: any) => {


                if (response) {
                    this.departments = response;
                }
            },
            error: (error: any) => {}
        })
    }

    selectDepartment(event: SelectChangeEvent) {
        this.hasSelectedDepartment = true;
        this.selectedDepartment = event.value;
        this.courses = event.value.courses;
    }
}
