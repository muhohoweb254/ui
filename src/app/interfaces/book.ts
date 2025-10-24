export interface Book {
    "id": number,
    "title": string,
    "author": string,
    "borrowed": false,
    "isbn": string
}


export interface issueBook {
    admNo: string,
    bookIsbn: string,
    expectedDate: string
}

export interface returnBook {
    admNo: string,
    bookIsbn: string
}
