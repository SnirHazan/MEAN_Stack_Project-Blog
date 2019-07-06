import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})
export class  PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 10;
  postPerPage = 2;
  pageSizeOption = [1, 2, 5, 10];
  private postSub: Subscription;


  constructor(private postsService: PostsService) {

  }

  ngOnInit() {
    this.isLoading = true;
    console.log(this.isLoading);
    this.postsService.getPosts();
    this.postSub = this.postsService.getPostUpdateListener().subscribe((Posts: Post[]) => {
      this.posts = Posts;
      this.isLoading = false;
      console.log(this.isLoading);
    });
  }

  ngOnDestroy(): void {
    this.postSub.unsubscribe();
  }
  onDelete(postId: string) {
    this.postsService.deletePost(postId);
  }

  onChangePage(pageData: PageEvent) {
    console.log(pageData)
  }

}

