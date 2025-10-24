import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Student } from '@/interfaces/student';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Course, Department } from '@/course';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

    constructor(private http: HttpClient) {

    }

    getCourses(): Observable<Course[]> {
        return this.http.get<Course[]>(environment.base_url + '/course/all-courses');
    }

    getDepartments(): Observable<Department[]> {
        return this.http.get<Department[]>(environment.base_url + '/course/departments');
    }
}
