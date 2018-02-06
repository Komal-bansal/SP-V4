import {Component} from '@angular/core';
import { Filters } from '../../shared/filters';
import { HodService } from '../hod.service';
import { StorageService } from '../../shared/storage.service';
import * as alertify from 'alertifyjs';

declare let $:any;

@Component({
 selector:'assigned-kpi',
 templateUrl:'./kpi.component.html',
 styleUrls: ['./../hod.component.css','./../../coordinator/home/home.component.css']
})
export class KPIComponent extends Filters {
 selectedLevel:any;
 selectedOpi:any;
 roles: any[] = ["coordinator", "hod", "dvc", "vc", "chanceller"];

 constructor(private utServ: HodService,
   private storage: StorageService) {
   super();
   this.getOpi();
 }

 getOpi(): any {
   this.utServ.getOpiByDeptId(this.storage.getData('user_roleInfo')[0].departmentId).subscribe((response: any) => {
     if (response.status == 204) {
       this.goals = [];
       this.goalsCopy = []
     } else {
       this.goals = response;
       this.goalsCopy = response;

       this.initFilters(response);
     }
   })
 }

 setQuarterFeedback(data:any){
   console.log(data.feedback);
   if(data.feedback == 'true')
     alertify.confirm("Do you realy want to Approve this??",()=>{
       this.utServ.approve(data.id,{comment:data.comment}).subscribe((reponse)=>{
         console.log(reponse);
         alertify.notify("Audit has been Approved");
         $("#feedbackModal").modal('hide');
       },(error:any)=>{
         console.log(error); 
         alertify.notify("Something went wrong");          
         $("#feedbackModal").modal('hide');                 
       });
     });
   else
     alertify.confirm("Do you realy want to Reject this??", ()=>{
       this.utServ.reject(data.id,{comment:data.comment}).subscribe((reponse)=>{
         console.log(reponse);
         alertify.notify("Audit has been Rejected");
       },(error:any)=>{
         console.log(error);        
         alertify.notify("Something went wrong");
       });
     })
     
 }

 public showOpi(goal: any, measure: any) {
   $('#edit-block').show();
   $('#edit-section').collapse('show');
   console.log(measure);
 }

 hideEditBlock(){
   $('#edit-block').hide();
 }

 get(e) {
   var promise = new Promise((resolve: any, reject: any) => { $(e)["0"].height = $(e)["0"].clientHeight; resolve(); });
   return promise;
 }
}