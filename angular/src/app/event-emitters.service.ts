import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class EventEmittersService {
    public onAlertEvent: EventEmitter<string> = new EventEmitter();
    public updateNumOfFriendRequestsEvent: EventEmitter<string> = new EventEmitter();
    public updateSendMessageObjectEvent: EventEmitter<object> = new EventEmitter();
    public resetMessageNotificationsEvent: EventEmitter<string> = new EventEmitter();
    public getUserData: EventEmitter<any> = new EventEmitter();

    constructor() {}
}
