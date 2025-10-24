import { Injectable } from '@angular/core';
import { Exam } from '@/interfaces/exam';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '@/course';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ExamsService {

  constructor(private http: HttpClient) {

  }

    getExams(page: number = 0, size: number = 10): Observable<Exam[]> {
        return this.http.get<Exam[]>(environment.base_url + `/exam?page=${page}&size=${size}`);
    }


}
