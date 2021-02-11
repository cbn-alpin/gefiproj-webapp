import { ExportReceiptsService } from './../../services/export-receipts.service';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ExportFundingsService } from 'src/app/services/export-fundings.service';
import { PopupService } from 'src/app/shared/services/popup.service';

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

  /**
   * Crée et affiche des bilans.
   * @param fb : gère le formulaire.
   * @param popupService : affiche des informations à l'utilisateur.
   * @param exportFundingsSrv : crée les bilans de suivi des financements.
   * @param exportFundingsSrv : crée les bilans financiers.
   */
  constructor(
    private readonly fb: FormBuilder,
    private readonly popupService: PopupService,
    private readonly exportFundingsSrv: ExportFundingsService,
    private readonly exportReceiptsSrv: ExportReceiptsService
  ) {}

  ngOnInit(): void {
    this.suiviFinancementsFormGroupVersion2 = this.fb.group({
      annee1: [
        '',
        [Validators.required, Validators.pattern(new RegExp(this.patternYear))],
      ],
      annee2: [
        '',
        [Validators.required, Validators.pattern(new RegExp(this.patternYear))],
      ],
    });
    this.bilanFinancierFormGroup = this.fb.group({
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

  /**
   * Crée et affiche le bilan de suivi des financements v1.
   */
  public async executeSuiviFinancementsVersion1(): Promise<void> {
    try {
      console.log('Suivi financements v1..');
      const url = await this.exportFundingsSrv.createExportV1();
      if (!url) {
        throw new Error('La réponse ne contient pas l\'URL du document');
      }

      window.open(url, '_blank');
    } catch (error) {
      console.log(error);
      this.popupService.error(error, 'Impossible d\'afficher le bilan de suivi des financements (v1)');
    }
  }

  /**
   * Crée et affiche le bilan de suivi des financements v2 (sur une période).
   */
  public async executeSuiviFinancementsVersion2(formDirective: FormGroupDirective): Promise<void> {
    try {
      if (this.suiviFinancementsFormGroupVersion2.valid) {
        console.log('Suivi financements v2..');
        const minPeriod = parseInt(this.suiviFinancementsFormGroupVersion2.get('annee1')?.value, 10);
        const maxPeriod = parseInt(this.suiviFinancementsFormGroupVersion2.get('annee2')?.value, 10);

        const url = await this.exportFundingsSrv.createExportV2(minPeriod, maxPeriod);
        if (!url) {
          throw new Error('La réponse ne contient pas l\'URL du document');
        }

        window.open(url, '_blank');
        formDirective.resetForm();
        this.suiviFinancementsFormGroupVersion2.reset();
      }
    } catch (error) {
      console.log(error);
      this.popupService.error(error, 'Impossible d\'afficher le bilan de suivi des financements (v2)');
    }
  }

  /**
   * Crée et affiche un bilan financier.
   */
  public async executeBilanFinancier(formDirective: FormGroupDirective): Promise<void> {
    try {
      if (this.bilanFinancierFormGroup.valid) {
        console.log('Bilan fiancier..');
        const year = parseInt(this.bilanFinancierFormGroup.get('annee')?.value, 10);

        const url = await this.exportReceiptsSrv.createExport(year);
        if (!url) {
          throw new Error('La réponse ne contient pas l\'URL du document');
        }

        window.open(url, '_blank');
        formDirective.resetForm();
        this.bilanFinancierFormGroup.reset()
      }
    } catch (error) {
      console.log(error);
      this.popupService.error(error, 'Impossible d\'afficher le bilan financier (tentez de changer l\'année de référence)');
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
