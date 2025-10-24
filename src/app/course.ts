export interface Course {
    id: number;
    name: string;
    content: string;
}

export interface Department {
    id: number;
    name: string;
    courses: Course[];
}
