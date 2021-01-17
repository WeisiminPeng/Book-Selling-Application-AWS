import { Injectable } from '@angular/core';
import { cartData, bookData } from '../webapp.model';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private hostname = environment.publicIP;

  private ROUTE_URL = `https://${this.hostname}:3000/carts`;

  constructor(private http: HttpClient) { }

  //create one cart
  public save(cartItem: string): Observable<cartData> {
    let header = new HttpHeaders({ 'content-type': 'application/json' });
    const newCart$ = this.http.post<cartData>(this.ROUTE_URL, cartItem, { headers: header });
    return newCart$;
  }

  //get all the books in cart
  public get(useremail: string): Observable<Array<bookData>> {
    const books$ = this.http.get<bookData[]>(`${this.ROUTE_URL}/${useremail}`);
    return books$;
  }
}
