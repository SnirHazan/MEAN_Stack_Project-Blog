const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const postsRoutes = require('./routes/posts')
const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://SnirHazan:eMUPAJJl5StLYV92@cluster0-ocbbo.mongodb.net/node-angular?retryWrites=true",{ useNewUrlParser: true})
        .then(()=>{
          console.log('Connected TO DataBase');
        })
        .catch(()=>{
          console.log('Connection Failed');
        })

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use('/images',express.static(path.join('backend/images')));

app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, content-Type, Accept");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS, PUT");
  next()
})

app.use("/api/posts",postsRoutes);

module.exports = app;
