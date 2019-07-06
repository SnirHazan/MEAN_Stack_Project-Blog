const express = require('express');
const router = express.Router();
const Post = require('../models/post')
const multer = require('multer');
const MIMR_TYPE_MAP = {
  'image/png' : 'png',
  'image/jpeg' : 'jpg',
  'image/jpg' : 'jpg',
  'image/bmp' : 'bmp',
};

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    const isValid = MIMR_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if(isValid) {
      error = null
    }
    callBack(null,'backend/images');
  },
  filename: (req,file,callBack) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIMR_TYPE_MAP[file.mimetype];
    callBack(null, name + '-' + new Date().getDate() + '-' +
     (new Date().getMonth()+1) + '-' + new Date().getFullYear() + '.' + ext);
  }
});


router.post("",multer({storage : storage}).single('image'),(req,res,next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    _id:req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'Post Added Successfully',
      post:{
        id: createdPost._id,
        title: createdPost.title,
        content: createdPost.content,
        imagePath: createdPost.imagePath
      }
    });
  });
});

router.get("",(req,res,next) => {
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  if(pageSize && currentPage){
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery.find().then(documents => {
    console.log(documents)
    res.status(200).json({
      message:'Post fetched successfully',
      posts:documents
    });
  });
});

router.delete("/:id",(req,res,next)=>{
  Post.deleteOne({ _id:req.params.id }).then(result => {
    res.status(200).json({message:'Post Deleted!'});
  });
});

router.put("/:id",multer({storage : storage}).single('image') ,(req,res,next)=>{
  let imagePath = req.body.imagePath;
  if(req.file){
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  })
  console.log(post);
  Post.updateOne({_id:req.params.id},post).then(result => {
    res.status(200).json({message: 'Update Successful!'});
  })
});

router.get('/:id',(req,res,next) => {
  Post.findById(req.params.id).then(post=>{
    if(post){
      res.status(200).json(post);
    } else {
      res.status(404).json({message:'Post not found!'})
    }
  });
});

module.exports = router;
