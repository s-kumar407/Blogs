const express = require("express");
require("./db/dbconfig");
const multer = require("multer");
const path = require("path");
const User = require("./db/User");
const Blog = require("./db/Blog");
const cors = require("cors");
const bcrypt = require('bcrypt');

const app = express();
const Jwt = require("jsonwebtoken");

require("dotenv").config();

app.use(express.json());
app.use(cors({
  origin:[`${process.env.FRONTEND_URI}`],
  methods:["POST","GET","PUT","DELETE"],
  credentials:true
}));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "usersProfilePics/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const secondStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "blogPics/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
const secondUpload = multer({ storage: secondStorage });

const saltRounds = 10;

async function hashPassword(plainPassword) {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (err) {
    console.error("Error hashing password:", err);
    throw err;
  }
}


app.get("/",(req,res)=>{
  res.json("Hello");
})

app.get("/favicon.ico",(req,res)=>{
  res.json("no icon");
})

app.post("/signup", upload.single("profileImage"), async (req, res) => {
  try {
    const {password} = req.body;
    const hashPass = await hashPassword(password);
    const user = new User({ ...req.body,password:hashPass, imageName: req.file.filename });
    let result = await user.save();
    result = result.toObject();
    delete result.password;

    Jwt.sign(
      { user },
      process.env.JWT_KEY,
      { expiresIn: "2h" },
      (error, token) => {
        if (error) {
          return res.status(500).send({ message: "Something went wrong!" });
        } else {
          return res.status(201).send({
            result: result,
            auth: token,
            message: "User created successfully",
            filePath: `/usersProfilePics/${req.file.path}`,
          });
        }
      }
    );
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).send({ message: "Error during signup" });
  }
});

app.use("/usersProfilePics", express.static("usersProfilePics"));


async function comparePasswords(plainPassword, hashedPassword) {
  try {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match; 
  } catch (err) {
    console.error("Error comparing passwords:", err);
    throw err;
  }
}



app.post("/login", async (req, res) => {
  try {
    if (req.body.email && req.body.password) {
      let user = await User.findOne({ email: req.body.email });
      console.log(user);
      const isMatch = comparePasswords(req.body.password,user.password)
      user = user.toObject();
      delete user.password;
      if (isMatch && user) {
        
        Jwt.sign(
          { user },
          process.env.JWT_KEY,
          { expiresIn: "2h" },
          (error, token) => {
            if (error) {
              return res.status(500).send({ message: "Something went wrong!" });
            } else {
              return res
                .status(200)
                .send({ user: user, result: true, auth: token });
            }
          }
        );
      } else {
        return res
          .status(404)
          .send({ result: false, message: "User not found" });
      }
    } else {
      return res
        .status(400)
        .send({ result: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).send({ message: "Error during login" });
  }
});

app.post(
  "/bloglist",
  verifyToken,
  secondUpload.single("file"),
  async (req, res) => {
    try {
      console.log(req);
      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

      const blog = new Blog({
        ...req.body,
        blogImageName: req.file.filename,
        userID: req.body.userID,
        publishDate: formattedDate,
      });

      let result = await blog.save();
       res.status(201).send({
        filePath: `/blogPics/${req.file.filename}`,
        message: "Blog created successfully",
        blog: result,
      });
    } catch (err) {
      console.error("Error during blog creation:", err);
       res.status(500).send({ message: "Error during blog creation" });
    }
  }
);

app.use("/blogPics", express.static("blogPics"));

app.get("/bloglist", async (req, res) => {
  try {
    let blogs = await Blog.find({});
    if (blogs.length > 0) {
      return res.status(200).send(blogs);
    } else {
      return res.status(404).send({ message: "Blogs not found" });
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).send({ message: "Error fetching blogs" });
  }
});

app.get("/user/:id", async (req, res) => {
  try {
    console.log(req);
    let user = await User.findById(req.params.id);
    if (user) {
      return res.status(200).send(user);
    } else {
      return res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).send({ message: "Error fetching user" });
  }
});

app.get("/blog/:userId", verifyToken, async (req, res) => {
  try {
    let blogs = await Blog.find({ userID: req.params.userId });
    if (blogs.length > 0) {
      return res.status(200).send(blogs);
    } else {
      return res.status(404).send({ message: "No blogs found for this user" });
    }
  } catch (error) {
    console.error("Error fetching user's blogs:", error);
    return res.status(500).send({ message: "Error fetching user's blogs" });
  }
});

app.get("/updateBlog/:blogId", verifyToken, async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.blogId);
    if (blog) {
      return res.status(200).send(blog);
    } else {
      return res.status(404).send({ message: "Blog not found" });
    }
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).send({ message: "Error fetching blog" });
  }
});

app.delete("/deleteBlog/:blogId", verifyToken, async (req, res) => {
  try {
    let id = req.params.blogId;
    console.log(id);
    let result = await Blog.findByIdAndDelete(id);
    if (result) {
       res
        .status(200)
        .send({ message: "Blog deleted successfully", blog: result });
    } else {
       res.status(404).send({ message: "Blog not found" });
    }
  } catch (error) {
    console.error("Error deleting blog:", error);
     res.status(500).send({ message: "Error deleting blog" });
  }
});

app.put(
  "/updateBlog/:blogID",
  verifyToken,
  secondUpload.single("file"),
  async (req, res) => {
    try {
      const blogId = req.params.blogID;
      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

      const updateData = {
        ...req.body,
        publishDate: formattedDate,
      };

      if (req.file) {
        updateData.blogImageName = req.file.filename;
      }

      const updatedBlog = await Blog.findByIdAndUpdate(blogId, updateData, {
        new: true,
      });

      if (!updatedBlog) {
        return res.status(404).send({ message: "Blog not found" });
      }

      return res
        .status(200)
        .send({ message: "Blog updated successfully", blog: updatedBlog });
    } catch (error) {
      console.error("Error updating blog:", error);
      return res
        .status(500)
        .send({ message: "Server error, could not update blog" });
    }
  }
);

app.get("/search/:key", async (req, res) => {
  try {
    let result = await Blog.find({
      $or: [
        {
          title: { $regex: req.params.key, $options: "i" }, // Case-insensitive search
        },
      ],
    });

    if (result.length > 0) {
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: "No blogs found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

function verifyToken(req, res, next) {
  let token = req.headers["authorization"];

  if (token) {
    console.log(token);
    token = token.split(" ")[1];

    Jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          result: "Invalid or expired token",
        });
      } else {
        req.user = decoded;
        next();
        console.log("verified");
      }
    });
  } else {
    return res.status(403).send({
      result: "Token is required",
    });
  }
}

function optionalVerifyToken(req, res, next) {
  let token = req.headers["authorization"];

  if (token) {
    token = token.split(" ")[1];

    Jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        // If token is invalid or expired, proceed without user info
        next();
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    // No token provided, proceed without user info
    next();
  }
}
