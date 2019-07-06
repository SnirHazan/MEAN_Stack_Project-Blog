import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router'


@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private httpClient: HttpClient, public router: Router){}

  getPosts() {
    this.httpClient.get<{ message: string, posts: any }>('http://localhost:3000/api/posts')
        .pipe(map((postData) => {
          return postData.posts.map(post => {
            return{
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath
            };
          });
        }))
        .subscribe((transformedPost) => {
          this.posts = transformedPost;
          this.postsUpdated.next([...this.posts]);
        });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(newPost: Post, imageFile: File) {
    const postData = new FormData();
    postData.append('title', newPost.title);
    postData.append('content', newPost.content);
    postData.append('image', imageFile, imageFile.name.split('.').slice(0, -1).join('.'));
    this.httpClient.post<{message: string, post: Post}>('http://localhost:3000/api/posts', postData)
    .subscribe((responseData) => {
      const postId = responseData.post.id;
      newPost.id = postId;
      newPost.imagePath = responseData.post.imagePath;
      this.posts.push(newPost);
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(['/']);
    });
  }

  deletePost(postId: string) {
    console.log(postId);
    this.httpClient.delete('http://localhost:3000/api/posts/' + postId)
                   .subscribe(() => {
                     const updatedPosts = this.posts.filter(post => post.id !== postId);
                     this.posts = updatedPosts;
                     this.postsUpdated.next([...this.posts]);
                   });
  }

  getPost(id: string) {
    return this.httpClient.get<{_id: string, title: string, content: string, imagePath: string}>(
      'http://localhost:3000/api/posts/' + id);
  }

  updatePost(post: Post, image: File | string) {
    let postData: Post | FormData;
    console.log('@@@@@', image);
    if (typeof(image) === 'object') {
      postData = new FormData();
      console.log(image,image.name);
      postData.append('id', post.id);
      postData.append('title', post.title);
      postData.append('content', post.content);
      postData.append('image', image, image.name);
      console.log('Service - line 79', postData.get('image'));
    } else {
      postData = {
        id: post.id,
        content: post.content,
        title: post.title,
        imagePath: image
      }
    }
    this.httpClient.put<{post: Post}>('http://localhost:3000/api/posts/' + post.id, postData)
        .subscribe(response => {
          const UpdatedPosts = [...this.posts];
          const oldPostIndex = UpdatedPosts.findIndex(p => p.id === post.id);
          const Updatepost: Post = {
              title: post.title,
              content: post.content,
              id: post.id,
              imagePath: post.imagePath
          }
          UpdatedPosts[oldPostIndex] = post;
          this.posts = UpdatedPosts;
          this.postsUpdated.next([...this.posts]);
          this.router.navigate(['/']);
        });
  }
}
