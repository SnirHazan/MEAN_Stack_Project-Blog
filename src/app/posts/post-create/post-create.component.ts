import { Component, OnInit,} from '@angular/core';
import { Post } from '../post.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap} from '@angular/router';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit{
  enteredTitle = '';
  enteredContent = '';
  editPost: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string | ArrayBuffer;
  private mode = 'create';
  private postId: string;


  constructor(private postsService: PostsService, public route: ActivatedRoute) {}

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
      })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        console.log(this.mode);
        this.postId = paramMap.get('postId');
        // Start Fetcing
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          // Get the result
          this.isLoading = false;
          console.log('%%%%',postData.imagePath);
          this.editPost = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath
          };
          this.form.setValue({title : this.editPost.title,
                              content: this.editPost.content,
                              image : this.editPost.imagePath});
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if(!this.validateFile(file.name)){
      console.log('Selected File Format Isn\'t Supported');
      return false;
    }
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      console.log(reader.result)
      this.imagePreview = reader.result;
    };
    console.log(this.form)
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    const createdPost: Post = {title: this.form.value.title,
      content: this.form.value.content, id: null, imagePath: null};
    if (this.mode === 'create') {
      this.postsService.addPost(createdPost, this.form.value.image);
    } else {
      createdPost.id = this.editPost.id;
      console.log('$$$$$',createdPost);
      console.log(this.form.value.image);
      this.postsService.updatePost(createdPost, this.form.value.image);
    }
    this.form.reset();
  }

  validateFile(name: string) {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'png' || ext.toLowerCase() === 'jpg'
      || ext.toLowerCase() === 'jpeg' || ext.toLowerCase() === 'gif'
      || ext.toLowerCase() === 'bmp' ) {
        return true;
    } else {
        return false;
    }
}
}
