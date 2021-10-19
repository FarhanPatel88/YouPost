import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { LocalStorageService } from '../local-storage.service';
import { EventEmittersService } from '../event-emitters.service';
import { ApiService } from '../api.service';
import { AutoUnsubscribe } from '../unsubscribe';

@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.css'],
})
@AutoUnsubscribe
export class TopbarComponent implements OnInit {
    constructor(
        public authService: AuthService,
        private router: Router,
        private storage: LocalStorageService,
        private events: EventEmittersService,
        public apiService: ApiService
    ) {}

    ngOnInit(): void {
        this.userName = this.storage.getParsedToken().name;
        this.userId = this.storage.getParsedToken()._id;

        let alertEvent = this.events.onAlertEvent.subscribe((msg) => {
            this.alertMessage = msg;
        });

        let friendRequestEvent = this.events.updateNumOfFriendRequestsEvent.subscribe(() => {
            this.notifications.friendRequests--;
        });

        let userDataEvent = this.events.getUserData.subscribe((user) => {
            this.notifications.friendRequests = user.friend_requests.length;
            this.notifications.messages = user.new_message_notifications.length;
            this.notifications.alerts = user.new_notifications;
            this.profileImage = user.profile_image;

            this.setAlerts(user.notifications);
            this.setMessagePreviews(user.messages, user.new_message_notifications);
        });

        let resetMessagesEvent = this.events.resetMessageNotificationsEvent.subscribe(() => {
            this.notifications.messages = 0;
        });

        let sendMessageObjectEvent = this.events.updateSendMessageObjectEvent.subscribe((data: any) => {
            this.sendMessageObject.id = data.id;
            this.sendMessageObject.name = data.name;
        });

        let requestObject = {
            location: `users/get-user-data/${this.userId}`,
            method: 'GET',
            authorize: true,
        };

        this.apiService.makeRequest(requestObject).then((val) => {
            if (val.status == 404) {
                return this.authService.logOut();
            } else {
                this.events.getUserData.emit(val.user);
            }
        });

        this.subscriptions.push(alertEvent, friendRequestEvent, userDataEvent, sendMessageObjectEvent, resetMessagesEvent);
    }

    private subscriptions: any = [];
    public query: string = '';
    public userName: string = '';
    public userId: string = '';
    public alertMessage: string = '';
    public userData: any = {};
    public friendRequests: number = 0;
    public profileImage: string = 'default-avatar';
    public sendMessageObject: any = {
        id: '',
        name: '',
        content: '',
    };
    public messagePreviews: Array<any> = [];
    public alerts: Array<any> = [];
    public notifications = {
        alerts: 0,
        friendRequests: 0,
        messages: 0,
    };

    public searchForFriends() {
        this.router.navigate(['/search-results', { query: this.query }]);
    }

    public sendMessage() {
        this.apiService.sendMessageRequest(this.sendMessageObject);
    }
    public resetMessageNotifications() {
        if (this.notifications.messages == 0) {
            return;
        }
        this.apiService.resetMessageNotifications();
    }

    public resetAlertNotifications() {
        if (this.notifications.alerts == 0) {
            return;
        }
        let requestObject = {
            location: 'users/reset-alert-notifications',
            method: 'POST',
        };

        this.apiService.makeRequest(requestObject).then((val) => {
            if (val.statusCode == 201) {
                this.notifications.alerts = 0;
            }
        });
    }

    private setMessagePreviews(messages: any, messageNotifications: any) {
        for (let i = messages.length - 1; i >= 0; i--) {
            let lastMessage = messages[i].content[messages[i].content.length - 1];

            let preview = {
                messengerName: messages[i].messengerName,
                messageContent: lastMessage.message,
                messengerImage: '',
                messengerId: messages[i].from_id,
                isNew: false,
            };

            if (lastMessage.messenger == this.userId) {
                preview.messengerImage = this.profileImage;
            } else {
                preview.messengerImage = messages[i].messengerProfileImage;
                if (messageNotifications.includes(messages[i].from_id)) {
                    preview.isNew = true;
                }
            }

            if (preview.isNew) {
                this.messagePreviews.unshift(preview);
            } else {
                this.messagePreviews.push(preview);
            }
        }
    }

    public messageLink(id: string) {
        this.router.navigate(['/messages'], { state: { data: { msgId: id } } });
    }
    private setAlerts(notificationData: any) {
        for (let alert of notificationData) {
            let alertObj = JSON.parse(alert);
            let newAlert = {
                text: alertObj.alert_text,
                icon: '',
                bgColor: '',
                href: '',
            };

            switch (alertObj.alert_type) {
                case 'new_friend':
                    newAlert.icon = 'fa-user-check';
                    newAlert.bgColor = 'bg-success';
                    newAlert.href = `/profile/${alertObj.from_id}`;
                    break;
                case 'liked_post':
                    newAlert.icon = 'fa-thumbs-up';
                    newAlert.bgColor = 'bg-purple';
                    newAlert.href = `/profile/${this.userId}`;
                    break;
                case 'commented_post':
                    newAlert.icon = 'fa-comment';
                    newAlert.bgColor = 'bg-primary';
                    newAlert.href = `/profile/${this.userId}`;
                    break;
            }

            this.alerts.push(newAlert);
        }
    }
}
