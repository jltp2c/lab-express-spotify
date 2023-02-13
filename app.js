require("dotenv").config({ path: "./config/.env" });
const path = require("path");
const express = require("express");
const hbs = require("hbs");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");
const async = require("hbs/lib/async");
const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
hbs.registerPartials(path.join(__dirname, "views/partials"));
// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Our routes go here:
app.get("/", async (req, res, next) => {
  try {
    res.render("home", {
      title: "Spotify Home",
    });
  } catch (error) {
    next(error);
  }
});

app.get("/artist-search", (req, res) => {
  spotifyApi
    .searchArtists(req.query.artist)
    .then((data) => {
      console.log("The received data from the API: ", data.body);
      res.render("artist-search-results", {
        title: "Artist",
        artists: data.body.artists,
      });
      // res.send(data);
      console.log(data.body);
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

app.get("/albums/:artistId", (req, res, next) => {
  const id = req.params.artistId;
  spotifyApi
    .getArtistAlbums(id)
    .then((data) => {
      res.render("albums", {
        title: "Artist",
        albums: data.body.items,
      });
      // res.send(data);
    })
    .catch((err) => next(err));
});

app.get("/tracks/:albumId", (req, res, next) => {
  const id = req.params.albumId;
  spotifyApi
    .getAlbumTracks(id)
    .then((data) => {
      res.render("tracks", {
        title: "Tracks",
        tracks: data.body.items,
      });
      // res.send(data);
    })
    .catch((err) => next(err));
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
