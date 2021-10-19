import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { AutoUnsubscribe } from '../unsubscribe';
import { EventEmittersService } from '../event-emitters.service';

@Component({
    selector: 'app-page-searches',
    templateUrl: './page-searches.component.html',
    styleUrls: ['./page-searches.component.css'],
})
@AutoUnsubscribe
export class PageSearchesComponent implements OnInit {
    constructor(
        private api: ApiService,
        private route: ActivatedRoute,
        private title: Title,
        @Inject(DOCUMENT) private document: Document,
        private events: EventEmittersService
    ) {}

    ngOnInit(): void {
        this.title.setTitle('Search Results');
        this.document.getElementById('sidebarToggleTop')?.classList.add('d-none');

        let userDataEvent = this.events.getUserData.subscribe((val) => {
            this.userData = val;
            this.route.params.subscribe((params) => {
                this.query = params.query;
                this.getResults();
            });
        });
        this.subscriptions.push(userDataEvent);
    }

    public results: any;
    public query = this.route.snapshot.params.query;
    private subscriptions: any = [];
    private userData: any;

    private getResults() {
        let requestObject = {
            location: `users/get-search-results?query=${this.query}`,
            method: 'GET',
        };

        this.api.makeRequest(requestObject).then((val) => {
            this.results = val.results;

            for (const result of this.results) {
                if (result.friends.includes(this.userData._id)) {
                    result.isFriend = true;
                }
                if (result.friend_requests.includes(this.userData._id)) {
                    result.haveSentFriendRequest = true;
                }
                if (this.userData.friend_requests.includes(result._id)) {
                    result.haveRecievedFriendRequest = true;
                }
            }
        });
    }
}
