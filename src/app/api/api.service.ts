import { Component, Injectable } from '@angular/core';
import { Observable, of} from 'rxjs';
import { tap, delay } from 'rxjs/operators';

import { HttpClient,HttpHeaders } from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})

export class ApiService {

  /** POST: add a new hero to the database */
  constructor (
    private http: HttpClient
    // private client: HttpClientModule
  ){}

  defaultUrl = 'http://127.0.0.1:8000/api/'
  // defaultUrl='https://efgxapp-09bac9e2934a.herokuapp.com/api/'


  tokenData(url:any,token:any,req_type='get',data:any|null): Observable<any>{

    const isFormData = data instanceof FormData;

    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`,
      // 'Content-Type': 'application/json'
    });

      if (!isFormData) {
        headers.set('Content-Type', 'application/json');
      }

    if (req_type=='post') {
      return this.http.post(this.defaultUrl+url, data, { headers })
    }else{
      url = this.defaultUrl+url
      return this.http.get(url,{ headers })
    }

  }

  NotokenData(url:any,data:any|null,req_type='post'): Observable<any>{

      if (req_type=='post') {
        return this.http.post(this.defaultUrl+url, data)
      }else{
        return this.http.get(this.defaultUrl+url)
      }
    }

}
