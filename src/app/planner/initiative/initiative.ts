import { Component } from '@angular/core';
import { UniversityService } from "../../shared/UTI.service";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { StorageService } from "../../shared/storage.service";
import { Filters } from "../../shared/filters";
import * as alertify from 'alertifyjs';
import { LoaderService } from '../../shared/loader.service';


declare let $: any;

@Component({
  selector: 'initiatives',
  templateUrl: './initiative.html',
  styleUrls: ['./initiative.css', './../planner.component.css']
})
export class InitiativeComponent extends Filters {
  public cycles: any[] = [];
  // public goals:any[]=[];
  // public goalsCopy:any[]=[];
  public objectives: any[] = [];
  public initiativeForm: FormGroup;
  public isUpdating: boolean = false;
  public quarter: any[] = ["Q1", "Q2", "Q3", "Q4"];
  constructor(public orgService: UniversityService,
    public formBuilder: FormBuilder,
    public commonService: StorageService,
    private loaderService: LoaderService) {
    super();

    this.loaderService.display(true);
    this.getCycleWithChildren(false);
    this.initiativeForm = this.initForm();
  }

  getCycleWithChildren(flag: any) {
    this.orgService.getCycleWithChildren(flag).subscribe((response: any) => {
      if (response.status == 204) {
        this.cycles = [];
      } else {
        this.cycles = response;
        this.cycles.forEach(element => {
          if (element.defaultCycle)
            this.defaultCycle = element.cycleId;
        });
        if (!flag)
          this.getInitiative();
      }
    })
  }

  getObjective(cycleId: any) {
    this.cycles.forEach(element => {
      if (element.cycleId == cycleId) {
        this.objectives = element.goals;
        return;
      }
    });
  }

  defaultCycle: any;
  getInitiative() {
    this.orgService.getInitiativesByCycleId(this.defaultCycle).subscribe((response: any) => {
      if (response.status == 204) {
        this.goals = [];
        this.goalsCopy = [];
      } else {
        this.goals = response;
        this.goalsCopy = response;
        this.initFilters(response);
      }
      this.loaderService.display(false);
    }, (error: any) => {
      this.loaderService.display(false);
    });
  }

  initForm() {
    return this.formBuilder.group({
      "cycleId": [this.defaultCycle, [Validators.required]],
      "goalId": ['', [Validators.required]],
      "initiative": ['', [Validators.required]]
    });
  }

  submitInitiative() {
    delete this.initiativeForm.value["cycleId"];
    if (!this.isUpdating)
      this.orgService.addInitiative(this.initiativeForm.value).subscribe((res: any) => {
        this.getInitiative();
        $("#add-initiative").hide();
        alertify.notify("You have successfully added a new Initiative.");
        $('#add-btn').show();
        this.initiativeForm.controls["initiative"].reset();
      }, err => {
        console.log(err);
      });
    else
      alertify.confirm("Are you sure you want to update this Initiative?", () => {
        this.orgService.updateInitiative(this.selectedInitiative.initiativeId, this.initiativeForm.value).subscribe((res: any) => {
          $("#add-initiative").hide();
          $('#add-btn').show();
          this.getInitiative();
          alertify.notify("You have successfully updated Initiative.");
          // $('#initiativeModal').modal('show');
          this.isUpdating = false;
        })
      }).setHeader("Confirmation");

  }

  deleteInitiative(initiativeId: any, initiatives: any[], index: any) {
    alertify.confirm("Are you sure you want to delete this Initiative?", () => {
      this.orgService.deleteInitiative(initiativeId).subscribe((res: any) => {
        console.log(res);
        initiatives.splice(index, 1);
        this.getInitiative();
      }, (error: any) => {
        alertify.alert("Something went wrong..");
      });
    }).setHeader("Confirmation");
  }

  selectedInitiative: any;
  updateInitiative(goalId: any, initiative: any, highlight: any) {
    $('#add-btn').hide();
    $(".to-be-highlighted").removeClass("highlight");
    $(highlight).addClass("highlight");
    this.isUpdating = true;
    // this.initiativeForm.controls["cycleId"].disable();
    this.initiativeForm.controls["goalId"].disable();
    this.selectedInitiative = initiative;
    this.initiativeForm.patchValue({
      cycleId: this.defaultCycle,
      goalId: goalId,
      initiative: initiative.initiative
    });
    $("#add-initiative").show();
    $("#collapse1").collapse('show');
  }

  enableFields() {
    $(".to-be-highlighted").removeClass("highlight");
    // this.initiativeForm.controls["cycleId"].enable();
    this.initiativeForm.controls["goalId"].enable();
    this.initiativeForm = this.initForm();
  }

  closeForm() {
    $("#add-initiative").hide();
    $('#add-btn').show();
    this.enableFields();
    this.isUpdating = false;
    this.getCycleWithChildren(false);
  }

  addNewInitiative() {
    $("#add-initiative").show();
    $('#add-btn').hide();
    this.isUpdating = false;
    $("#collapse1").collapse('show');
    this.getCycleWithChildren(true);
    this.initiativeForm = this.initForm();

  }

  disable(event: any, initiativeId: any) {
    if (event.target.checked)
      alertify.confirm("Do you Really want to disable this Initiative??", () => {
        this.orgService.disableInitiative(initiativeId).subscribe((response: any) => {
          alertify.success("You disabled the Initiative..");
          this.getInitiative();
        }, () => {
          event.target.checked = !event.target.checked;
          alertify.error("Something went wrong..")
        })
      }, () => {
        event.target.checked = !event.target.checked;
        alertify.error("Action was not performed")
      }).setHeader("Confirmation");
    else
      alertify.confirm("Do you Really want to enable this Initiative??", () => {
        this.orgService.enableInitiative(initiativeId).subscribe((response: any) => {
          alertify.success("You enabled the Initiative..");
          this.getInitiative();
        }, () => {
          event.target.checked = !event.target.checked;
          alertify.error("Something went wrong..")
        })
      }, () => {
        event.target.checked = !event.target.checked;
        alertify.error("Action was not performed")
      }).setHeader("Confirmation");
  }

  get(e) {
    var promise = new Promise((resolve: any, reject: any) => { $(e)["0"].height = $(e)["0"].clientHeight; resolve(); });
    return promise;
  }
}