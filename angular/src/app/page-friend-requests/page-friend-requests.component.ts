import { Component, Inject, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Title } from '@angular/platform-browser';
import { AutoUnsubscribe } from '../unsubscribe';
import { DOCUMENT } from '@angular/common';
import { EventEmittersService } from '../event-emitters.service';

@Component({
    selector: 'app-page-friend-requests',
    templateUrl: './page-friend-requests.component.html',
    styleUrls: ['./page-friend-requests.component.css'],
})
@AutoUnsubscribe
export class PageFriendRequestsComponent implements OnInit {
    constructor(
        public apiService: ApiService,
        private title: Title,
        @Inject(DOCUMENT) private document: Document,
        private events: EventEmittersService
    ) {}

    ngOnInit(): void {
        this.document.getElementById('sidebarToggleTop')?.classList.add('d-none');

        this.title.setTitle('Friend Requests');
        let userDataEvent = this.events.getUserData.subscribe((data) => {
            this.userData = data;

            let friendRequests = JSON.stringify(data.friend_requests);

            let requestObject = {
                location: `users/get-friend-requests?friend_requests=${friendRequests}`,
                method: 'GET',
                authorize: true,
            };

            this.apiService.makeRequest(requestObject).then((val) => {
                if (val.statusCode === 200) {
                    this.friendRequests = val.users;
                }
            });
        });
        this.subscriptions.push(userDataEvent);
    }

    private subscriptions: any = [];
    public userData: any = {};
    public friendRequests: Array<any> = [];

    public updateRequest(id: any) {
        for (let i = 0; i < this.friendRequests.length; i++) {
            if (id === this.friendRequests[i]._id) {
                this.friendRequests.splice(i, 1);
                break;
            }
        }
    }
}
