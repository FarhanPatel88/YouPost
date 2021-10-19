import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../api.service';
import { EventEmittersService } from '../event-emitters.service';

@Component({
    selector: 'app-result-request',
    templateUrl: './result-request.component.html',
    styleUrls: ['./result-request.component.css'],
})
export class ResultRequestComponent implements OnInit {
    @Input() resultRequest: any;
    @Output() resultRequestChange = new EventEmitter<any>();
    @Input() use: any;

    constructor(public api: ApiService, private events: EventEmittersService) {}

    ngOnInit(): void {
        if (this.resultRequest.haveSentFriendRequest) {
            this.haveSentFriendRequest = true;
        }
        if (this.resultRequest.haveRecievedFriendRequest) {
            this.haveRecievedFriendRequest = true;
        }
        if (this.resultRequest.isFriend) {
            this.isFriend = true;
        }
    }

    public accept(id: any) {
        this.updateRequest(id);
        this.api.resolveFriendRequest('accept', id).then((val) => {});
    }
    public decline(id: any) {
        this.updateRequest(id);
        this.api.resolveFriendRequest('decline', id).then((val) => {
            console.log(val);
            console.log(`Declining friend request of ${id}`);
        });
    }
    public updateRequest(id: any) {
        console.log(id);
        this.resultRequestChange.emit(id);
    }

    public sendMessage(id: string, name: string) {
        this.events.updateSendMessageObjectEvent.emit({ id, name });
    }

    public haveSentFriendRequest: boolean = false;
    public haveRecievedFriendRequest: boolean = false;
    public isFriend: boolean = false;
}
