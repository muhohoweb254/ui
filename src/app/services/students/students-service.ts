import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import {environment} from '../../../environments/environment.development';
import { Student, StudentPayload } from '@/interfaces/student';

@Injectable({
  providedIn: 'root'
})
export class StudentsService {

    constructor(private http: HttpClient) {

    }

    getStudents(): Observable<Student[]> {  // Note: Changed to Student[] if returning multiple students
        return this.http.get<Student[]>(environment.base_url + '/students/all');
    }

    saveStudent(payload: { name: any; courseId: any }){
        return this.http.post(environment.base_url+`/students/save`, payload);
    }
}
