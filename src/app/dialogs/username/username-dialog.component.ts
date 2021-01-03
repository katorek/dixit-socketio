import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UsernameDialogData} from './username-dialog-data';

@Component({
  selector: 'app-username-dialog',
  templateUrl: './username-dialog.component.html',
  styleUrls: ['./username-dialog.component.scss']
})
export class UsernameDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<UsernameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsernameDialogData) {
  }

  ngOnInit(): void {
  }

}
