import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Title } from '@angular/platform-browser';
import { LocalStorageService } from '../local-storage.service';
import { EventEmittersService } from '../event-emitters.service';

@Component({
    selector: 'app-page-feed',
    templateUrl: './page-feed.component.html',
    styleUrls: ['./page-feed.component.css'],
})
export class PageFeedComponent implements OnInit {
    constructor(private apiService: ApiService, private title: Title, private storage: LocalStorageService, private events: EventEmittersService) {}

    ngOnInit(): void {
        this.title.setTitle('You Post - Feed');

        let requestObject = {
            method: 'GET',
            location: 'users/generate-feed',
        };

        this.apiService.makeRequest(requestObject).then((val) => {
            if (val.statusCode == 200) {
                this.bestiePosts = val.bestiePosts;

                let fullCol1 = val.posts.filter((_post: any, i: number) => i % 4 === 0);
                let fullCol2 = val.posts.filter((_post: any, i: number) => i % 4 === 1);
                let fullCol3 = val.posts.filter((_post: any, i: number) => i % 4 === 2);
                let fullCol4 = val.posts.filter((_post: any, i: number) => i % 4 === 3);

                let cols = [fullCol1, fullCol2, fullCol3, fullCol4];

                this.addPostToFeed(cols, 0, 0);
            }
        });
    }

    public newPostTheme: string = this.storage.getPostTheme() || 'primary';
    public newPostContent: string = '';
    public posts: { col1: any[]; col2: any[]; col3: any[]; col4: any[] } | any = {
        col1: [],
        col2: [],
        col3: [],
        col4: [],
    };
    public bestiePosts: Array<object> = [];

    public changePostTheme(themeName: string) {
        this.newPostTheme = themeName;
        this.storage.setPostTheme(themeName);
    }

    public createPost() {
        if (this.newPostContent.length == 0) {
            this.events.onAlertEvent.emit('No post content was provided. Please provide some post content.');
        }

        let requestObject = {
            location: 'users/create-post',
            method: 'POST',
            authorize: true,
            body: {
                theme: this.newPostTheme,
                content: this.newPostContent,
            },
        };

        this.apiService.makeRequest(requestObject).then((val) => {
            if (val.statusCode === 201) {
                val.newPost.ago = 'Now';
                this.posts.col1.unshift(val.newPost);
            } else {
                this.events.onAlertEvent.emit('Something went wrong, your post could not be created');
            }
        });
    }

    private addPostToFeed(array: any[], colNumber: number, delay: number) {
        setTimeout(() => {
            if (array[colNumber].length) {
                this.posts['col' + (colNumber + 1)].push(array[colNumber].splice(0, 1)[0]);
                colNumber = ++colNumber % 4;
                this.addPostToFeed(array, colNumber, 100);
            }
        }, delay);
    }
}
