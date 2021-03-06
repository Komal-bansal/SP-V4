import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { StorageService } from "../../shared/storage.service";
import { UniversityService } from "../../shared/UTI.service";
import * as alertify from 'alertifyjs';
import { LoaderService } from '../../shared/loader.service';

declare let $: any;

@Component({
  selector: 'strategic-plan',
  templateUrl: './plan.html',
  styleUrls: ['./../planner.component.css']
})
export class PlanComponent {
  selectedCycle: any;
  isUpdating: boolean;
  title: string = "Strategic Plan";
  cycleForm: FormGroup;
  cycles: any[] = [];
  status: any[] = [];
  constructor(public ss: StorageService, public orgService: UniversityService, private loaderService: LoaderService) {
    this.loaderService.display(true);
    this.cycleForm = this.initForm();
    this.getCycles();
  }

  initForm() {
    return new FormGroup({
      "universityId": new FormControl(this.ss.getData('org_info').universityId),
      "description": new FormControl('', [Validators.required]),
      "planYear": new FormControl('', [Validators.required]),
      "startYear": new FormControl('', [Validators.required]),
      "endYear": new FormControl('', [Validators.required])
    });
  }

  addNewPlan() {
    this.cycleForm = this.initForm();
    $("#add-plan").show();
    $('#add-btn').hide();
    $("#collapse1").collapse('show');
  }
  getCycles() {
    this.orgService.getAllCycle().subscribe((response: any) => {
      if (response.status == 204) {
        this.cycles = [];
      } else {
        this.cycles = response;
      }
      this.loaderService.display(false);
    }, (error: any) => {
      this.loaderService.display(false);
    });
  }

  editCycle(c: any) {
    $("#add-plan").show();
    $('#add-btn').hide();
    $("#collapse1").collapse('show');
    this.isUpdating = true;
    this.selectedCycle = c;
    this.cycleForm.patchValue(c);
  }

  onSubmit() {
    if (!this.isUpdating)
      this.orgService.saveCycle(this.cycleForm.value).subscribe((response: any) => {
        alertify.success('You added New Strategic plan.');
        $("#add-plan").hide();
        $('#add-btn').show();
        this.isUpdating = false;
        this.getCycles();
        this.cycleForm = this.initForm();
      });
    else {
      var data = {};
      data['description'] = this.cycleForm.value["description"];
      data['endYear'] = this.cycleForm.value["endYear"];
      this.orgService.updateCycle(this.selectedCycle.cycleId, data).subscribe((response: any) => {
        alertify.success('You updated Strategic plan.');
        $("#add-plan").hide();
        $('#add-btn').show();
        this.isUpdating = false;
        this.getCycles();
        this.cycleForm = this.initForm();
      })
    }
  }

  changeStatus(event: any, c: any) {
    console.log(event);
    alertify.confirm("Are you sure you want to do this?", () => {
      if (event.target.checked)
        this.orgService.disableCycle(c.cycleId).subscribe((response: any) => {
          alertify.success('You disabled the cycle.');
          this.getCycles();
        }, (error: any) => {
          alertify.error("Something went wrong");
        });
      else
        this.orgService.enableCycle(c.cycleId).subscribe((response: any) => {
          alertify.success('You enabled the cycle.');
          this.getCycles();
        }, (error: any) => {
          alertify.error("Something went wrong");
        });
    }, () => {
      event.target.checked = !event.target.checked;
    }).setHeader('Confirmation');
  }

  deleteCycle(cycleId: any) {
    alertify.confirm("Do you Really want to Delete this Cycle??", () => {
      this.orgService.defaultCycle(cycleId).subscribe((response: any) => {
        this.getCycles();
      }, (error: any) => {
        alertify.alert("You Can not Delete this Cycle??");
      })
    }).setHeader('Confirmation');

  }

  defaultCycle(event: any, cycleId: any) {
    if (!event.target.checked) {
      alertify.alert("This cycle is alredy defualt").setHeader("Alert Message")
    } else {
      alertify.confirm("Do you Really want to make it Default Cycle??", () => {
        this.orgService.defaultCycle(cycleId).subscribe((response: any) => {
          this.getCycles();
          alertify.success("Cycle has been made default..")
        }, (error: any) => {
          event.target.checked = !event.target.checked;
          alertify.error("Something went wrong..")
        })
      }, () => {
        event.target.checked = !event.target.checked;
      }).setHeader("Confirmation");
    }

  }

  click(event: any) {
    console.log(event);
  }

  reset() {
    $("#add-plan").hide();
    this.isUpdating = false;
    this.cycleForm.reset();
    $('#add-btn').show();
  }
}