import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface IMessage {
  header: string;
  content: string;
  param?: { [key: string]: string | number };
  type?: string;
  action: {
    name: string;
    color?: string;
  };
  showCancel?: boolean;
}

@Component({
  selector: 'app-generic-dialog',
  templateUrl: './generic-dialog.component.html',
  styleUrls: ['./generic-dialog.component.scss'],
})
export class GenericDialogComponent implements OnInit {
  /**
   * message data
   */
  message: IMessage = {
    header: null,
    content: null,
    action: {
      name: null,
    },
    showCancel: true,
  }

  constructor(
    public dialogRef: MatDialogRef<GenericDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IMessage
  ) {

    this.message = {...this.message,...data};
    console.log("This.message : " , this.message);
  }

  ngOnInit(): void {}

  /**
   * Confirm and close popup
   */
  onConfirmClick() {
    this.dialogRef.close(true);
  }

  /**
   * Cancel and close popup
   */
  onCancelClick() {
    this.dialogRef.close();
  }

  /**
   * Cancel and close popup
   */
  showCancel() : boolean{
    console.log(this.message.showCancel);
     return this.message.showCancel;
  }

  /**
   * Get color button confirm
   */
  getConfirmColor() {
    return this.message.type === 'warning' ? 'warn' : 'primary';
  }
}
