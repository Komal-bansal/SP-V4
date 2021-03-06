import { Component, Input } from '@angular/core';
import { HodService } from '../../hod.service';
import { Router } from '@angular/router';
import { StorageService } from '../../../shared/storage.service';
import { Location } from '@angular/common';

@Component({
  selector: 'by-kpi',
  templateUrl: './by.kpi.component.html',
  styleUrls: ['./../../hod.component.css']
})
export class ByKPIComponent {
  departments: any[];
  goalsCopy: any[]=[];
  goals;
  role;
  selectedGoal:any;
  selectedInitiative:any;
  selectedActivity:any;
  selectedKpi:any;

  constructor(private utServ: HodService, public router: Router, private storage: StorageService, public _location: Location) {
    this.role = this.storage.getData('userDetails').roleInfo[0].role;
    if (!(this.role == 'coordinator' || this.role == 'hod')) {
      this.departments = this.storage.getData('user_roleInfo');
    } else {
      this.utServ.getDepartments().subscribe((res: any) => {
        this.departments = res;
        console.log(res);
      });
    }
    this.utServ.goals.asObservable().subscribe((val: any[]) => {
      this.goals = val;
      this.goalsCopy = val;
    });
  }

  navigateToKpi(opiId) {
    if (this.role != 'coordinator')
      this.router.navigateByUrl(this.role + "/" + opiId)
    else
      this.router.navigateByUrl(this.role + "/kpis/" + opiId);
  }

  selectGoal(goal:any){
    
  }

  goBack() {
    this.goals = this.goalsCopy.filter((element:any)=>{
      if(this.selectedInitiative)
      element.initiatives = element.initiatives.filter((initiative:any)=>{
        if(this.selectedActivity)
        initiative.activities =  initiative.activities.filter((activity:any)=>{
          if(this.selectedKpi)
          activity.opis = activity.opis.filter((opi:any)=>{
            return (opi.opiId == this.selectedKpi.opiId)
          })
          return (activity.activityId == this.selectedActivity.activityId);
        })
        return (initiative.initiativeId == this.selectedInitiative.initiativeId);
      })
      return (element.goalId == this.selectedGoal.goalId);
    });
    this.utServ.goals.next(this.goals);
    this.router.navigateByUrl(this.role + "/home");
  }

}