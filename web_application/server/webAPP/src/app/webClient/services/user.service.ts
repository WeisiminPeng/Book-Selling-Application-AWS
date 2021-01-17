import { Injectable } from '@angular/core';
import { userData } from '../webapp.model';
import { success } from '../webapp.model';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  private hostname = environment.publicIP;
  private ROUTE_URL = `https://${this.hostname}:3000/users`;
  private ROUTE_URL1 = `https://${this.hostname}:3000`;

  constructor(private http: HttpClient) { }

   //Update one appointment
   public update(userItem:string,useremail: string): Observable<userData> {
    let header = new HttpHeaders({'content-type': 'application/json'});
    const userUpdate$ = this.http.put<userData>(`${this.ROUTE_URL}/${useremail}`, userItem, {headers : header});
    // this.http.post<Todoitem>(this.ROUTE_URL, todoitem);
    return userUpdate$;
  }

  //create one user
  public save(userItem:string): Observable<userData> {
    let header = new HttpHeaders({'content-type': 'application/json'});
    const newUser$ = this.http.post<userData>(this.ROUTE_URL, userItem, {headers : header});
    return newUser$;
  }

   //create one user
   public login(userItem:string): Observable<userData> {
    let header = new HttpHeaders({'content-type': 'application/json'});
    const newUser$ = this.http.post<userData>(this.ROUTE_URL+"/login", userItem, {headers : header});
    return newUser$;
  }

   //reset password
   public reset(useremail:string): Observable<userData> {
    let header = new HttpHeaders({'content-type': 'application/json'});
    const newUser$ = this.http.post<userData>(this.ROUTE_URL1+"/reset", useremail, {headers : header});
    return newUser$;
  }

   //retrive one user
   public get(useremail: string): Observable<userData> {
    const user$ = this.http.get<userData>(`${this.ROUTE_URL}/${useremail}`);
    // console.log(`${this.ROUTE_URL}/${id}`);
    return user$;
  }

}
