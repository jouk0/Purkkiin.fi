import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BackendService } from '../../backend.service'

export interface CommentData {
    nick: string
    comment: string
    date: Date
}
export interface DialogData {
    torrent: {
        name: string,
        comments: Array<CommentData>
    }
}

@Component({
    selector: './comment-dialog',
    templateUrl: './commentDialog.html',
    styleUrls: ['./commentDialog.scss']
})
export class CommentDialog {
    public videoComments: Array<any> = []
    constructor(
      public dialogRef: MatDialogRef<CommentDialog>,
      @Inject(MAT_DIALOG_DATA) public data: DialogData,
      private backend: BackendService
    ) {
        this.backend.haeKommentit()
        this.backend.kommentitOsbserver.subscribe((response:any) => {
            if(response) {
                response.kommentit.forEach((kommentti:any, ind:Number) => {
                    if(kommentti.torrentName === this.data.torrent.name) {
                        this.videoComments.push(kommentti)
                    }
                })
            }
        })
    }
  
    onNoClick(e: MouseEvent): void {
        e.preventDefault()
        e.stopPropagation()
        this.dialogRef.close();
    }
    lahetaKommentti(e: MouseEvent, nick:any, kommentti:any) {
        e.preventDefault()
        e.stopPropagation()
        console.log(nick.value, kommentti.value)
        this.backend.lahetaKommentti(this.data.torrent, nick.value, kommentti.value)
        this.dialogRef.close();
    }
}