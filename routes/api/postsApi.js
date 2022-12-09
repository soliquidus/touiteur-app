const express = require("express");
const app = express();
const User = require("../../schemas/userSchema");
const Post = require("../../schemas/postSchema");

/**
 * Get posts
 */
app.get("/", async (req, res) => {
    let searchObj = req.query;

    if (searchObj.isReply !== undefined) {
        let isReply = searchObj.isReply === "true";
        searchObj.replyTo = { $exists: isReply };
        delete searchObj.isReply;
    }

    if (searchObj.followingOnly !== undefined) {
        let followingOnly = searchObj.followingOnly === "true";
        if (followingOnly) {
            let objectIds = [...req.session.user.following];
            objectIds.push(req.session.user._id);
            searchObj.postedBy = { $in: objectIds };
        }
        delete searchObj.followingOnly;
    }
    let results = await getPosts(searchObj);
    res.status(200).send(results);
});

/**
 * Get one post
 */
app.get("/:id", async (req, res) => {
    let postId = req.params.id;
    let postData = await getPosts({ _id: postId });
    postData = postData[0];

    let results = {
        postData,
    };

    if (postData.replyTo !== undefined) {
        results.replyTo = postData.replyTo;
    }

    results.replies = await getPosts({ replyTo: postId });

    return res.status(200).send(results);
});

/**
 * Create new post
 */
app.post("/", async (req, res) => {
    if (!req.body.content) {
        return res.sendStatus(400);
    }

    let postData = {
        content: req.body.content,
        postedBy: req.session.user,
    };

    if (req.body.replyTo) {
        postData.replyTo = req.body.replyTo;
    }

    Post.create(postData)
        .then(async (newPost) => {
            newPost = await User.populate(newPost, { path: "postedBy" });
            res.status(201).send(newPost);
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(400);
        });
});

/**
 * Delete one post
 */
app.delete("/:id", (req, res) => {
    Post.findByIdAndDelete(req.params.id)
        .then(() => res.sendStatus(202))
        .catch(() => res.sendStatus(400));
});

async function getPosts(filter) {
    let results = await Post.find(filter)
        .populate("retweetData")
        .populate("postedBy")
        .populate("replyTo")
        .sort({ createdAt: -1 })
        .catch((error) => {
            console.log(error);
        });
    results = await User.populate(results, { path: "replyTo.postedBy" });
    return User.populate(results, { path: "retweetData.postedBy" });
}

module.exports = app;
