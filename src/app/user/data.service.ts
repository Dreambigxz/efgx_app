import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  userData =  new Object()

  update(new_obj:any){
    Object.assign(this.userData,new_obj)
    // console.log({userData:this.userData});
    return this.userData
  }

}
