import { Component, OnInit } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-rapports',
  templateUrl: './rapports.component.html',
  styleUrls: ['./rapports.component.scss'],
})
export class RapportsComponent implements OnInit {
  public suiviFinancementsFormGroupVersion2: FormGroup;
  public bilanFinancierFormGroup: FormGroup;
  public annee1Matcher: ErrorStateMatcher;
  public annee2Matcher: ErrorStateMatcher;
  public annee3Matcher: ErrorStateMatcher;

  private readonly patternYear = '^\\d{4}$';

  constructor(private readonly _fb: FormBuilder) {}

  ngOnInit(): void {
    this.suiviFinancementsFormGroupVersion2 = this._fb.group({
      annee1: [
        '',
        [Validators.required, Validators.pattern(new RegExp(this.patternYear))],
      ],
      annee2: [
        '',
        [Validators.required, Validators.pattern(new RegExp(this.patternYear))],
      ],
    });
    this.bilanFinancierFormGroup = this._fb.group({
      annee: [
        '',
        [Validators.required, Validators.pattern(new RegExp(this.patternYear))],
      ],
    });
    this.annee1Matcher = new MyErrorStateMatcher();
    this.annee2Matcher = new MyErrorStateMatcher();
    this.annee3Matcher = new MyErrorStateMatcher();
  }

  public checkPeriod(): void {
    const fbValidOrPeriodError =
      (this.suiviFinancementsFormGroupVersion2.get('annee1').valid &&
        this.suiviFinancementsFormGroupVersion2.get('annee2').valid) ||
      this.suiviFinancementsFormGroupVersion2
        .get('annee1')
        .hasError('period') ||
      this.suiviFinancementsFormGroupVersion2.get('annee2').hasError('period');
    if (
      fbValidOrPeriodError &&
      this.suiviFinancementsFormGroupVersion2.get('annee1').value >=
        this.suiviFinancementsFormGroupVersion2.get('annee2').value
    ) {
      this.suiviFinancementsFormGroupVersion2
        .get('annee1')
        .setErrors({ period: true });
      this.suiviFinancementsFormGroupVersion2
        .get('annee2')
        .setErrors({ period: true });
    }

    if (
      fbValidOrPeriodError &&
      this.suiviFinancementsFormGroupVersion2.get('annee1').value <
        this.suiviFinancementsFormGroupVersion2.get('annee2').value
    ) {
      this.suiviFinancementsFormGroupVersion2.get('annee1').setErrors(null);
      this.suiviFinancementsFormGroupVersion2.get('annee2').setErrors(null);
    }
  }

  public executeSuiviFinancementsVersion1(): void {
    console.log('Suivi financements v1');
  }

  public executeSuiviFinancementsVersion2(): void {
    if (this.suiviFinancementsFormGroupVersion2.valid) {
      console.log('Suivi financements v2');
    }
  }

  public executeBilanFinancier(): void {
    if (this.bilanFinancierFormGroup.valid) {
      console.log('Bilan financiers');
    }
  }
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}
