import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Response, Http, Headers, RequestOptions } from '@angular/http';
import { CustomHttpService } from "../shared/default.header.service";
import { StorageService } from "../shared/storage.service";


import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class HodService{
 baseUrl: string;

 private parent = new RequestOptions({
  headers: new Headers({
    'parent': true
  })
});

 constructor(public http: CustomHttpService,private htttp:Http,
  public con: StorageService){
   this.baseUrl = con.baseUrl + con.getData('user_roleInfo')[0].role;
 }

 getOpiByDeptId(deptId){
  return this.http.get(this.baseUrl + "/result")
    .map(this.extractData)
    .catch(this.handleError);
 }

 approve(levelId,data){
  return this.http.put(this.baseUrl + "/quarter/"+levelId+"/approve",data)
  .map(this.extractData)
  .catch(this.handleError);
 }

 reject(levelId,data){
  return this.http.put(this.baseUrl + "/quarter/"+levelId+"/reject",data)
  .map(this.extractData)
  .catch(this.handleError);
 }

 getAnnualTargets(opiDepartmentId:any){
  return this.http.get(this.baseUrl + "/opiDepartment/"+opiDepartmentId+"/annualTargets?currentYear=false&currentQuarter=false").map(this.extractData)
  .catch(this.handleError);
}

getDepartmentByOpiId(opiId:any){
  return this.http.get(this.baseUrl + "/opi/"+opiId+"/departments",this.parent)
  .map(this.extractData)
  .catch(this.handleError);
}

public getDepartments() {
  return this.http.get(this.baseUrl + "/department")
    .map(this.extractData)
    .catch(this.handleError);
}

 private extractData(res: Response) {
  if (res.status === 204) { return res; }
  let body = res.json();
  return body || {};
}


private handleError(error: Response | any) {
  let errMsg: string;
  if (error instanceof Response) {
    const body = error.json() || '';
    const err = body.error || JSON.stringify(body);
    errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    if (error.status === 0) {
      errMsg = `${error.status} - "Something is wrong.."`;
    }
  } else {
    errMsg = error.message ? error.message : error.toString();
  }
  return Observable.throw(errMsg);
}
}