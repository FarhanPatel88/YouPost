import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { EventEmittersService } from '../event-emitters.service';
import { AutoUnsubscribe } from '../unsubscribe';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
})
@AutoUnsubscribe
export class SidebarComponent implements OnInit {
    constructor(public authService: AuthService, private events: EventEmittersService) {}

    ngOnInit(): void {
        let userDataEvent = this.events.getUserData.subscribe((user) => {
            this.userId = user._id;
            this.besties = user.besties;
            this.enemies = user.enemies;
        });
        this.subscriptions.push(userDataEvent);
    }
    private subscriptions: any = [];
    public enemies: any = [];
    public besties: any = [];
    public userId: any = '';
}
