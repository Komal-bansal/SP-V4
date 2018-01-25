import { Component, AfterViewInit } from '@angular/core';
import { CoordinatorService } from "../coordinator.service";
import { StorageService } from "../../shared/storage.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Filters } from "../../shared/filters";
import { LoaderService } from '../../shared/loader.service';
import * as alertify from 'alertifyjs';
declare let $: any;

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css', './../coordinator.component.css'],
  providers: [CoordinatorService]
})
export class HomeComponent extends Filters implements AfterViewInit {
  // goalsCopy: any[]=[];
  // goals: any[]=[];
  evidencForm: FormGroup;
  evidences: any[] = [];
  selectedOpi:any;
  selectedMeasure:any;
  roles: any[] = ["coordinator", "hod", "dvc", "vc", "chanceller"]
  constructor(private utServ: CoordinatorService,
    private storage: StorageService, private loaderService: LoaderService) {
    super();
    this.getOpi();
    this.evidencForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', Validators.required),
      files: new FormControl('', [Validators.required])
    });
  }

  ngAfterViewInit() {

  }
  public getOpi() {
    this.loaderService.display(true);
    this.utServ.getOpiByDeptId(this.storage.getData('user_roleInfo')[0].departmentId).subscribe((response: any) => {
      if (response.status == 204) {
        this.goals = [];
        this.goalsCopy = []
      } else {
        this.goals = response;
        this.goalsCopy = response;

        this.initFilters(this.goalsCopy);
      }
      this.loaderService.display(false);
    }, (error: any) => {
      this.loaderService.display(false);
    })
  }

  public showOpi(goal: any, measure: any) {
    $("#first-section").show();
    $("#second-section").hide();
    $('#edit-section').collapse('show');
    console.log(goal);
  }
  isUpdating: boolean = false;
  public saveQuarterResult(quarter: any) {
    if (!quarter.isUpdating) {
      var object = {
        'levelId': quarter.id,
        'currentCost': quarter.currentCost,
        'currentTargetLevel': quarter.currentTargetLevel,
      }
      this.loaderService.setLoadingStatus("Saving");
      this.loaderService.setTransactionLoader(true);
      this.utServ.saveQuarterResult(object).subscribe((response: any) => {
      this.loaderService.setTransactionLoader(false);
      quarter.status = 'inprogress';
      })
    } else {
      let object = {
        'currentCost': quarter.currentCost,
        'currentTargetLevel': quarter.currentTargetLevel,
      }
      this.loaderService.setLoadingStatus("Updating");
      this.loaderService.setTransactionLoader(true);
      this.utServ.updateQuarterResult(quarter.id, object).subscribe((response: any) => {
      this.loaderService.setTransactionLoader(false);
      alertify.success("Updated");
      console.log(response);
      });
    }
  }

  saveQuarterResultWithMou(lev: any) {
    var object = {
      "currentCost": lev.currentCost,
      "mouType": lev.mouType,
      "organization": lev.organization
    }
    this.loaderService.setLoadingStatus("Saving");
    this.loaderService.setTransactionLoader(true);
    this.utServ.saveQuarterResultWithMou(lev.id, object).subscribe((response: any) => {
      console.log(response);
      lev.currentCost = response.currentCost;
      lev['mouDetails'] = response.mouDetails;
    this.loaderService.setTransactionLoader(false);
    alertify.success("Saved");      
    });
  }

  updateCurrentCost(lev: any) {
    var object = {
      "currentCost": lev.currentCost
    }
    this.loaderService.setLoadingStatus("Updating");
    this.loaderService.setTransactionLoader(true);    
    this.utServ.updateQuarterResultCurrentCost(lev.id, object).subscribe((response: any) => {
      lev.edit = false;
      setTimeout(() => {
        this.loaderService.setTransactionLoader(false);
        alertify.success("Updated");
      }, 1000);
      console.log(response);
    });
  }

  updateMou(mou: any) {
    var object = {
      "mouType": mou.mouType,
      "organization": mou.organization
    }
    this.loaderService.setLoadingStatus("Updating");
    this.loaderService.setTransactionLoader(true);
    this.utServ.updateMou(mou.id, object).subscribe((response: any) => {
      this.loaderService.setTransactionLoader(false);
      alertify.success("Updated");
      mou.edit = false;
    })
  }

  deleteMou(mous: any[], mou: any, index: any) {
    alertify.confirm("Are you sure you want to delete this mou",()=>{
      this.loaderService.setLoadingStatus("Updating");
      this.loaderService.setTransactionLoader(true);
      this.utServ.deleteMou(mou.id).subscribe((response: any) => {
        mous.splice(index, 1);
        this.loaderService.setTransactionLoader(false); 
        alertify.success("Sucessfully removed");       
      },(error:any)=>{
        alertify.error("Something went wrong");
      });      
    }).setHeader("Confirmation");
  }

  lockQuarterResult(quarter: any) {
    alertify.confirm("Are you sure you want to Lock you results",()=>{
      this.loaderService.setLoadingStatus("Locking");
      this.loaderService.setTransactionLoader(true);
      this.utServ.updateQuarterResult(quarter.id, { 'status': 'locked' }).subscribe((response: any) => {
        this.loaderService.setTransactionLoader(false);      
        console.log(response);
        quarter.disable = true;
        quarter.status = "locked";
      },(error:any)=>{
        alertify.error("Something went wrong");
      });
    }).setHeader("Confirmation");
    
  }

  deleteEvidence(evidences: any[], evidence: any, index: any) {
    alertify.confirm("Are you sure you want to delete this evidence",()=>{
      this.utServ.deleteEvidence(evidence.id).subscribe((response: any) => {
        evidences.splice(index, 1);
        alertify.success("Success");
      },(error:any)=>{
        alertify.error("Something went wrong");
      })
    }).setHeader("Atert Message");      
  }

  deleteInternshipEvidence(evidences: any[], evidence: any, index: any) {
    if (confirm("Are you sure you want to delete this evidence"))
      this.utServ.deleteInternshipEvidence(evidence.id).subscribe((response: any) => {
        evidences.splice(index, 1);
        alertify.success("Success");
      },(error:any)=>{
        alertify.error("Error");
      });
  }

  getInternshipFile(lev:any,event){
    console.log(event);
    lev.internshipFile = event.target.files["0"];
  }

  file: any;
  getFile(event: any) {
    this.file = event.srcElement.files[0];
  }
  selectedQuarter: any;
  selectedInternshipFile: any;
  selectedMou: any;
  onEvidenceSubmit(evForm: any) {
    let formData = new FormData();
    formData.append('title', this.evidencForm.value['title']);
    formData.append('description', this.evidencForm.value['description']);
    formData.append('file', this.file);

    switch (evForm) {
      case 0:
        this.utServ.saveEvidence(formData, this.selectedQuarter.id).subscribe((res: any) => {
          if (!this.selectedQuarter.evidance)
            this.selectedQuarter.evidance = [];
          this.selectedQuarter.evidance.push(res);
          $('#evidenceForm').modal('hide');
        });
        break;
      case 1:
        this.utServ.saveEvidenceForInternshipFile(formData, this.selectedInternshipFile.id).subscribe((response: any) => {
          this.selectedInternshipFile['evidance'].push(response);
          $('#evidenceForm').modal('hide');
        })
        break;
      case 2:
        this.utServ.saveEvidenceForMou(formData, this.selectedMou.id).subscribe((response: any) => {
          this.selectedMou.evidance.push(response);
          $('#evidenceForm').modal('hide');
        })
        break;
    }
  }

  saveInternshipForm(lev: any) {
    var formData = new FormData();
    // formData.append('internshipEvidance',lev.internshipEvidance);
    formData.append('internshipFile', lev.internshipFile);
    formData.append('currentCost', lev.currentCost);

    console.log(formData);
    this.utServ.saveQuarterWithInternship(lev.id, formData).subscribe((response: any) => {
      lev.internshipDetails = response.internshipDetails;
    })
  }

  deleteInternshipFile(files: any[], file: any, index: any) {
    if (confirm("Are you sure you want to delete this file"))
      this.utServ.deleteInternshipFile(file.id).subscribe((response: any) => {
        files.splice(index, 1);
      })
  }

  closeForm(){
    $("#first-section").hide();
    $("#second-section").show();
  }

  get(e) {
    var promise = new Promise((resolve: any, reject: any) => { $(e)["0"].height = $(e)["0"].clientHeight; resolve(); });
    return promise;
  }

  collapseOff(element:any){
    if($(element).hasClass('in')){
      return;
    }
    $(element).addClass('in');
    $(".collapse-off").removeClass('in');
  }

  allAnnualTargets:any[];

  getAnnualTargetsByOpiDepartment(opiDepartmentId:any,department:any){
    this.utServ.getAnnualTargets(opiDepartmentId).subscribe((response:any)=>{
      console.log(response);
      // this.allAnnualTargets = department.opiAnnualTargets;
      // department.opiAnnualTargets = response;
    })
  }

}