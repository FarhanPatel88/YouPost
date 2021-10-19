import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../api.service';
import { LocalStorageService } from '../local-storage.service';

@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit {
    @Input() post: any;

    constructor(private api: ApiService, private storage: LocalStorageService) {}

    ngOnInit(): void {
        function removeLeadingNumbers(string: string) {
            function isNumber(n: any) {
                n = Number(n);
                if (!isNaN(n)) {
                    return true;
                }
                return false;
            }

            if (string && isNumber(string[0])) {
                string = removeLeadingNumbers(string.substring(1));
            }
            return string;
        }

        this.userId = this.storage.getParsedToken()._id;

        this.fakeId = removeLeadingNumbers(this.post._id);

        if (this.post.content.length < 40) {
            this.fontSize = 22;
        }
        if (this.post.content.length < 24) {
            this.alignment = 'center';
            this.fontSize = 28;
        }
        if (this.post.content.length < 14) {
            this.fontSize = 32;
        }
        if (this.post.content.length < 8) {
            this.fontSize = 44;
        }
        if (this.post.content.length < 5) {
            this.fontSize = 62;
        }

        if (this.post.likes.includes(this.userId)) {
            this.liked = true;
        } else {
            this.liked = false;
        }
    }

    public fakeId: string = '';
    public fontSize: number = 18;
    public alignment: string = 'center';
    public liked: boolean = false;
    public userId: string = '';
    public comment: string = '';

    public likePost(postId: string, ownerId: string) {
        let requestObject = {
            location: `users/like-unlike-post/${ownerId}/${postId}`,
            method: 'POST',
            authorize: true,
        };

        this.api.makeRequest(requestObject).then((val) => {
            if (this.post.likes.includes(this.userId)) {
                this.post.likes.splice(this.post.likes.indexOf(this.userId), 1);
                this.liked = false;
            } else {
                this.post.likes.push(this.userId);
                this.liked = true;
            }
        });
    }

    public postComment(postId: string, ownerId: string) {
        if (!this.comment.length) {
            return;
        }
        let requestObject = {
            location: `users/post-comment/${ownerId}/${postId}`,
            method: 'POST',
            authorize: true,
            body: {
                content: this.comment,
            },
        };

        this.api.makeRequest(requestObject).then((val) => {
            if (val.statusCode == 201) {
                let newComment = {
                    ...val.comment,
                    commenter_name: val.commenter.name,
                    commenter_profile_image: val.commenter.profile_image,
                };
                this.post.comments.push(newComment);
                this.comment = '';
            }
        });
    }
}
