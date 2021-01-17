import { Injectable } from '@angular/core';

import { bookData } from '../webapp.model';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private hostname = environment.publicIP;

  private ROUTE_URL_BOOKS = `https://${this.hostname}:3000/books`;
  private ROUTE_URL_BOOK = `https://${this.hostname}:3000/book`;
  private ROUTE_URL_BOOKS_SELL = `https://${this.hostname}:3000/books/sell`;

  constructor(private http: HttpClient) { }

  //Update one book
  public update(bookItem: string, id: number): Observable<bookData> {
    let header = new HttpHeaders({ 'content-type': 'application/json' });
    const bookUpdate$ = this.http.put<bookData>(`${this.ROUTE_URL_BOOK}/${id}`, bookItem, { headers: header });
    // this.http.post<Todoitem>(this.ROUTE_URL, todoitem);
    return bookUpdate$;
  }

  //create one book
  public save(bookItem: string, useremail: string, imageFiles: File[]): Observable<bookData> {
    var book = JSON.parse(bookItem);
    let payload = new FormData();
    payload.append("Title", book.Title);
    payload.append("Authors", book.Authors);
    payload.append("ISBN", book.ISBN);
    // payload.append("owner", book.owner);
    payload.append("PublicationDate", book.PublicationDate);
    payload.append("Quantity", book.Quantity);
    payload.append("Price", book.Price);
    for(let image of imageFiles){
      payload.append("imageFile", image);
    }

    // let header = new HttpHeaders({ 'content-type': 'application/json' });
    // const newBook$ = this.http.post<bookData>(`${this.ROUTE_URL_BOOKS}/${useremail}`, book, { headers: header });
    const newBook$ = this.http.post<bookData>(`${this.ROUTE_URL_BOOKS}/${useremail}`, payload);
    return newBook$;
  }

  //retrive one book
  public get(id: number): Observable<bookData> {
    const book$ = this.http.get<bookData>(`${this.ROUTE_URL_BOOK}/${id}`);
    // console.log(`${this.ROUTE_URL}/${id}`);
    return book$;
  }

  //get all the books not this user not sell
  public list(useremail: string): Observable<Array<bookData>> {
    const books$ = this.http.get<bookData[]>(`${this.ROUTE_URL_BOOKS}/${useremail}`);
    return books$;
  }

  //get all the books not this user sell
  public listSell(useremail: string): Observable<Array<bookData>> {
    const books$ = this.http.get<bookData[]>(`${this.ROUTE_URL_BOOKS_SELL}/${useremail}`);
    return books$;
  }

  //Delete one abook
  public delete(id: number): Observable<bookData> {
    const deletebook$ = this.http.delete<bookData>(`${this.ROUTE_URL_BOOK}/${id}`);
    return deletebook$;
  }
}
