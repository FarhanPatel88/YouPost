import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { EventEmittersService } from './event-emitters.service';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(private http: HttpClient, private storage: LocalStorageService, private events: EventEmittersService) {}
    private baseUrl = environment.baseUrl;

    private successHandler(value: any) {
        return value;
    }
    private errorHandler(error: any) {
        return error;
    }

    public async makeRequest(requestObject: any): Promise<any> {
        let method = requestObject.method.toLowerCase();
        if (!method) {
            return console.log('No method specified in the request object.');
        }

        let body = requestObject.body || {};
        let location = requestObject.location;
        if (!location) {
            return console.log('No location specified in the request object.');
        }

        let url = `${this.baseUrl}/${location}`;

        let httpOptions = {};

        if (this.storage.getToken()) {
            httpOptions = {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.storage.getToken()}`,
                }),
            };
        }

        if (method === 'get') {
            return this.http.get(url, httpOptions).toPromise().then(this.successHandler).catch(this.errorHandler);
        }
        if (method === 'post') {
            return this.http.post(url, body, httpOptions).toPromise().then(this.successHandler).catch(this.errorHandler);
        }

        console.log('Could not make the request. Make sure a method of GET or POST is supplied.');
    }

    public makeFriendRequest(to: string) {
        let from = this.storage.getParsedToken()._id;

        let requestObject = {
            location: `users/make-friend-request/${from}/${to}`,
            method: 'POST',
            authorize: true,
        };

        return new Promise((resolve, reject) => {
            this.makeRequest(requestObject).then((val) => {
                if (val.statusCode === 201) {
                    this.events.onAlertEvent.emit('Successfully sent a friend request!');
                } else {
                    this.events.onAlertEvent.emit(
                        'Something went wrong, could not send friend request. Perhaps you already sent a friend request to this user.'
                    );
                }
                resolve(val);
            });
        });
    }

    public resolveFriendRequest(resolution: string, id: any) {
        let to = this.storage.getParsedToken()._id;

        this.events.updateNumOfFriendRequestsEvent.emit();

        return new Promise((resolve, reject) => {
            let requestObject = {
                location: `users/resolve-friend-request/${id}/${to}?resolution=${resolution}`,
                method: 'POST',
                authorize: true,
            };

            this.makeRequest(requestObject).then((val) => {
                if (val.statusCode === 201) {
                    let resolutioned = resolution === 'accept' ? 'accepted' : 'declined';
                    this.events.onAlertEvent.emit(`Successfully ${resolutioned} your friend request`);
                } else {
                    this.events.onAlertEvent.emit('Something went wrong and we could not handle your friend request');
                }
                resolve(val);
            });
        });
    }

    public sendMessageRequest(sendMessageObject: any, showAlerts: boolean = true) {
        if (!sendMessageObject.content && showAlerts) {
            this.events.onAlertEvent.emit('Message not sent.  You must provide some content for your message');
            return;
        }

        let requestObject = {
            location: `users/send-message/${sendMessageObject.id}`,
            method: 'POST',
            body: {
                content: sendMessageObject.content,
            },
        };

        return new Promise((resolve, reject) => {
            this.makeRequest(requestObject).then((val) => {
                console.log(val);
                if (val.statusCode === 201 && showAlerts) {
                    this.events.onAlertEvent.emit('Successfully sent your message');
                }
                resolve(val);
            });
        });
    }

    public resetMessageNotifications() {
        let requestObject = {
            location: 'users/reset-message-notifications',
            method: 'POST',
        };

        return new Promise<void>((resolve, reject) => {
            this.makeRequest(requestObject).then((val) => {
                if (val.statusCode == 201) {
                    this.events.resetMessageNotificationsEvent.emit();
                }
                resolve();
            });
        });
    }
}
