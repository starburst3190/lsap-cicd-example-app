// app.js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res
    .status(200)
    .send("<h1>Welcome to phase 1 demo ver 3!</h1>");
});

app.get('/health', (req, res) => {
  res.status(200).send("OK");
});

module.exports = app;
