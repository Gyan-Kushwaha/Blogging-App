require("dotenv").config();
const express=require("express");
const path=require("path");
const userRoute=require('./routes/user');
const blogRoute=require('./routes/blog');
const mongoose=require("mongoose");
const cookieParser=require('cookie-parser');
const { checkForAuthCookie } = require("./middleware/authentication");
const Blog=require('./models/blog');


const app=express();
const port = process.env.PORT || 5005; 

mongoose.connect(process.env.MONGO_URL || process.env.MONGO_URI )
.then(e=>console.log("Mongodb connected"));

app.set("view engine", "ejs");
app.set("views",path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(checkForAuthCookie("token"));
app.use(express.static(path.resolve('./public')));


app.get('/',async (req,res)=>{
    const allBlogs=await Blog.find({});
    return res.render("home",{
        user:req.user,
        blogs:allBlogs,
    });
});
app.get('/blogs', async (req, res) => {
    try {
        const allBlogs = await Blog.find({}); 
       return res.render('allBlogs', {
        user:req.user, blogs:allBlogs });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

app.use('/user',userRoute);
app.use('/blog',blogRoute);

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
