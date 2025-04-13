const {Router}=require("express");
const express=require("express");
const router=express.Router();
const multer=require("multer");
const path=require("path");
const Blog=require("../models/blog");
const Comment=require("../models/comment");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads/`));
    },
    filename: function (req, file, cb) {
        //date to make unique, cb-callBack
      const fileName=`${Date.now()}-${file.originalname}`;
      cb(null,fileName);
    }
});

const upload = multer({ storage: storage })

router.get("/add-new",(req,res)=>{
  return res.render('addBlog',{
    //q ki nav bar blog page p bhi toh hoga ye jayega toh waha jo locals.user check ho rha h usi k liye hai
    user:req.user,
  });
});


router.get("/:id",async (req,res)=>{
    const blog=await Blog.findById(req.params.id).populate('createdBy');
    //comments,blogs dono ko db se la rhe h frontend p bhejne k liye
    const comments=await Comment.find({blogId:req.params.id}).populate("createdBy");
    // // console.log("blog",blog);
    console.log("Comment",comments);
    return res.render('blog',{
      user:req.user,
      blog,
      comments,
    })
});

//comment krne k liye route
router.post("/comment/:blogId",async (req,res)=>{
    await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
});

//add-blog ko handle kr rhe h wha se ek image bhi aa rha 
router.post("/",upload.single('coverImage'),async (req,res)=>{
//   console.log(req.body);
//   console.log(req.file);
const {title,body}=req.body;//add blog se kya bhej rhe the
  const blog=await Blog.create({
      body,
      title,
      createdBy:req.user._id,
      coverImageURL:`/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
 
});

module.exports=router;