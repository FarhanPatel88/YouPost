import { Component, OnInit, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { EventEmittersService } from '../event-emitters.service';
import { AutoUnsubscribe } from '../unsubscribe';

@Component({
    selector: 'app-page-profile',
    templateUrl: './page-profile.component.html',
    styleUrls: ['./page-profile.component.css'],
})
@AutoUnsubscribe
export class PageProfileComponent implements OnInit {
    constructor(
        private title: Title,
        @Inject(DOCUMENT) private document: Document,
        private route: ActivatedRoute,
        private api: ApiService,
        private events: EventEmittersService
    ) {}

    ngOnInit(): void {
        this.title.setTitle('Profile');
        this.document.getElementById('sidebarToggleTop')?.classList.add('d-none');

        let userDataEvent = this.events.getUserData.subscribe((user) => {
            this.besties = user.besties;
            this.enemies = user.enemies;
            this.route.params.subscribe((params) => {
                this.showPosts = 6;
                this.isBestie = user.besties.some((v: any) => v._id == params.userid);
                this.isEnemy = user.enemies.some((v: any) => v._id == params.userid);

                this.maxAmountOfBesties = user.besties.length >= 2;

                if (params.userid === user._id) {
                    this.addToComponents(user);
                    this.resetBooleans();
                } else {
                    let requestObject = {
                        location: `users/get-user-data/${params.userid}`,
                        method: 'GET',
                    };

                    this.api.makeRequest(requestObject).then((val) => {
                        if (val.statusCode === 200) {
                            this.canAddUser = user.friends.includes(val.user._id) ? false : true;
                            this.canSendMessage = user.friends.includes(val.user._id) ? true : false;
                            this.haveReceivedFriendRequest = user.friend_requests.includes(val.user._id);
                            this.haveSentFriendRequest = val.user.friend_requests.includes(user._id) ? true : false;
                            this.addToComponents(val.user);
                            if (this.canAddUser) {
                                this.showPosts = 0;
                            }
                        }
                    });
                }
            });
        });

        this.subscriptions.push(userDataEvent);
    }

    private subscriptions: any = [];
    public randomFriends: any[] = [];
    public friendsLength: number = 0;
    public userName: string = '';
    public userEmail: string = '';
    public posts: object[] = [];
    public canAddUser: boolean = false;
    public canSendMessage: boolean = false;
    public showPosts: number = 6;
    public profileImage: string = 'default-avatar';
    public haveSentFriendRequest: boolean = false;
    public haveReceivedFriendRequest: boolean = false;
    public userId: string = '';
    public isBestie: boolean = false;
    public isEnemy: boolean = false;
    public maxAmountOfBesties: boolean = false;
    private besties: Array<any> = [];
    private enemies: Array<any> = [];

    public showMorePosts() {
        this.showPosts += 6;
    }

    public backToTop() {
        this.document.body.scrollTop = this.document.documentElement.scrollTop = 0;
    }

    public addToComponents(user: any) {
        this.randomFriends = user.random_friends;
        this.friendsLength = user.friends.length;
        this.userName = user.name;
        this.posts = user.posts;
        this.profileImage = user.profile_image;
        this.userEmail = user.email;
        this.userId = user._id;
    }

    public accept() {
        this.api.resolveFriendRequest('accept', this.userId).then((val: any) => {
            if (val.statusCode === 201) {
                this.haveReceivedFriendRequest = false;
                this.canAddUser = false;
                this.friendsLength++;
                this.showPosts = 6;
            }
        });
    }

    public decline() {
        this.api.resolveFriendRequest('decline', this.userId).then((val: any) => {
            if (val.statusCode == 201) {
                this.haveReceivedFriendRequest = false;
            }
        });
    }

    public sendMessage(id: string, name: string) {
        this.events.updateSendMessageObjectEvent.emit({ id, name });
    }

    public makeFriendRequest() {
        this.api.makeFriendRequest(this.userId).then((val: any) => {
            // this.canAddUser = false;
            this.haveSentFriendRequest = true;
        });
    }

    public resetBooleans() {
        this.canAddUser = false;
        this.canSendMessage = false;
        this.haveReceivedFriendRequest = false;
        this.haveSentFriendRequest = false;
        this.isBestie = false;
        this.isEnemy = false;
    }

    public toggleRequest(toggle: string) {
        const toggleValue = (array: any) => {
            for (let i = 0; i < array.length; i++) {
                if (array[i]._id == this.userId) {
                    return array.splice(i, 1);
                }
            }
            array.push({ _id: this.userId });
        };

        let requestObject = {
            location: `users/bestie-enemy-toggle/${this.userId}?toggle=${toggle}`,
            method: 'POST',
        };

        this.api.makeRequest(requestObject).then((val: any) => {
            if (val.statusCode == 201) {
                if (toggle == 'besties') {
                    toggleValue.call(this, this.besties);
                    this.maxAmountOfBesties = this.besties.length >= 2;
                    this.isBestie = !this.isBestie;
                } else {
                    toggleValue.call(this, this.enemies);
                    this.isEnemy = !this.isEnemy;
                }
            }
        });
    }
}
