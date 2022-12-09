const express = require("express");
const app = express();

app.get("/:id", (req, res) => {
  let payload = {
    pageTitle: "Touiteur - Voir le touite",
    userLoggedIn: req.session.user,
    userLoggInedJs: JSON.stringify(req.session.user),
    postId: req.params.id,
  };
  res.status(200).render("postPage", payload);
});

module.exports = app;
