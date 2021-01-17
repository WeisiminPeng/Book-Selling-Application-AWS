export interface userData {
    email: string,
    firstname: string,
    lastname: string,
    password: string,
    message: string,
    token :string;
    type: string;
}

export interface success {
    message: string;
}

export interface bookData {
    BookId: number,
    ISBN: string,
    Title: string,
    Authors: string,
    PublicationDate: Date,
    Quantity: number,
    Price :number,
    message: string,
    email: string,
    images: string;
    imageStringList: string[]
}

export interface cartData {
    BookId: number,
    selleremail: string,
    message: string,
    buyeremail: string;
}