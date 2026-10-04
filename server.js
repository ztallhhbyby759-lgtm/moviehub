/* =========================================================
   MovieHub Backend — Express + JSON DB + Uploads (with video)
   ========================================================= */
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const DATA_DIR = path.join(__dirname, "data");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const VIDEOS_DIR = path.join(UPLOADS_DIR, "videos");
const DB_FILE = path.join(DATA_DIR, "db.json");

[DATA_DIR, UPLOADS_DIR, VIDEOS_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

/* ---------- DB ---------- */
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return { movies: [], comments: [], ratings: [], nextId: 1 }; }
}
function writeDB(db) { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }

/* ---------- Seed ---------- */
const SEED = [
  {title:"Inception",originalTitle:"Inception",year:2010,rating:8.8,duration:148,genres:["Action","Sci-Fi","Thriller"],overview:"A skilled thief who steals corporate secrets through dream-sharing technology.",director:"Christopher Nolan",cast:["Leonardo DiCaprio","Joseph Gordon-Levitt","Elliot Page"],poster:"https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",backdrop:"https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",trailer:"YoHD9XEInc0",language:"English",country:"USA",isNew:false,popularity:95},
  {title:"Interstellar",originalTitle:"Interstellar",year:2014,rating:8.7,duration:169,genres:["Sci-Fi","Drama","Adventure"],overview:"Explorers travel through a wormhole in space.",director:"Christopher Nolan",cast:["Matthew McConaughey","Anne Hathaway","Jessica Chastain"],poster:"https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",backdrop:"https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",trailer:"zSWdZVtXT7E",language:"English",country:"USA",isNew:false,popularity:97},
  {title:"The Dark Knight",originalTitle:"The Dark Knight",year:2008,rating:9.0,duration:152,genres:["Action","Crime","Drama"],overview:"Batman faces the Joker.",director:"Christopher Nolan",cast:["Christian Bale","Heath Ledger"],poster:"https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",backdrop:"https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",trailer:"EXeTwQWrcwY",language:"English",country:"USA",isNew:false,popularity:99},
  {title:"Dune",originalTitle:"Dune",year:2021,rating:8.0,duration:155,genres:["Sci-Fi","Adventure","Drama"],overview:"A noble family becomes embroiled in a war.",director:"Denis Villeneuve",cast:["Timothée Chalamet","Rebecca Ferguson"],poster:"https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",backdrop:"https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg",trailer:"n9xhJrPXop4",language:"English",country:"USA",isNew:true,popularity:93},
  {title:"Oppenheimer",originalTitle:"Oppenheimer",year:2023,rating:8.3,duration:181,genres:["Drama","History","Thriller"],overview:"The story of J. Robert Oppenheimer.",director:"Christopher Nolan",cast:["Cillian Murphy","Emily Blunt"],poster:"https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",backdrop:"https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",trailer:"uYPbbksJxIg",language:"English",country:"USA",isNew:true,popularity:98},
  {title:"The Matrix",originalTitle:"The Matrix",year:1999,rating:8.7,duration:136,genres:["Sci-Fi","Action"],overview:"A hacker learns the true nature of his reality.",director:"The Wachowskis",cast:["Keanu Reeves","Laurence Fishburne"],poster:"https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",backdrop:"https://image.tmdb.org/t/p/original/icmmSD4vTTF4uhRqIO35NF3Y3bB.jpg",trailer:"vKQi3bBA1y8",language:"English",country:"USA",isNew:false,popularity:92},
  {title:"Joker",originalTitle:"Joker",year:2019,rating:8.4,duration:122,genres:["Crime","Drama","Thriller"],overview:"A mentally troubled comedian embarks on a downward spiral.",director:"Todd Phillips",cast:["Joaquin Phoenix","Robert De Niro"],poster:"https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",backdrop:"https://image.tmdb.org/t/p/original/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg",trailer:"zAGVQLHvwOY",language:"English",country:"USA",isNew:false,popularity:91},
  {title:"The Godfather",originalTitle:"The Godfather",year:1972,rating:9.2,duration:175,genres:["Crime","Drama"],overview:"The aging patriarch of an organized crime dynasty.",director:"Francis Ford Coppola",cast:["Marlon Brando","Al Pacino"],poster:"https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",backdrop:"https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",trailer:"sY1S34973zA",language:"English",country:"USA",isNew:false,popularity:94},
  {title:"Parasite",originalTitle:"기생충",year:2019,rating:8.5,duration:132,genres:["Thriller","Drama","Comedy"],overview:"Greed and class discrimination threaten a symbiotic relationship.",director:"Bong Joon-ho",cast:["Song Kang-ho","Lee Sun-kyun"],poster:"https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",backdrop:"https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",trailer:"5xH0HfJHsaY",language:"Korean",country:"South Korea",isNew:false,popularity:88},
  {title:"Pulp Fiction",originalTitle:"Pulp Fiction",year:1994,rating:8.9,duration:154,genres:["Crime","Drama"],overview:"The lives of two mob hitmen intertwine.",director:"Quentin Tarantino",cast:["John Travolta","Uma Thurman"],poster:"https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",backdrop:"https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",trailer:"s7EdQ4FqbhY",language:"English",country:"USA",isNew:false,popularity:90},
  {title:"Forrest Gump",originalTitle:"Forrest Gump",year:1994,rating:8.8,duration:142,genres:["Drama","Romance"],overview:"The presidencies unfold through Forrest's perspective.",director:"Robert Zemeckis",cast:["Tom Hanks","Robin Wright"],poster:"https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",backdrop:"https://image.tmdb.org/t/p/original/7c9UVPPiTPltouxRVY6N9uugaVA.jpg",trailer:"bLvqoHBptjg",language:"English",country:"USA",isNew:false,popularity:87},
  {title:"The Shawshank Redemption",originalTitle:"The Shawshank Redemption",year:1994,rating:9.3,duration:142,genres:["Drama"],overview:"Two imprisoned men bond over years.",director:"Frank Darabont",cast:["Tim Robbins","Morgan Freeman"],poster:"https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",backdrop:"https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",trailer:"6hB3S9bIaco",language:"English",country:"USA",isNew:false,popularity:96}
];

if (!fs.existsSync(DB_FILE)) {
  const db = { movies: [], comments: [], ratings: [], nextId: 1 };
  SEED.forEach((m) => db.movies.push({ ...m, id: db.nextId++, views: 0, createdAt: Date.now() }));
  writeDB(db);
  console.log(`✅ Seeded ${SEED.length} movies.`);
}

/* ---------- Multer: images + video ---------- */
const imgStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || ".jpg").toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const vidStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, VIDEOS_DIR),
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || ".mp4").toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

// یک multer ترکیبی: بر اساس نام فیلد تصمیم می‌گیره کجا بره
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, file, cb) => {
      if (file.fieldname === "video") cb(null, VIDEOS_DIR);
      else cb(null, UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = (path.extname(file.originalname) || ".bin").toLowerCase();
      const prefix = file.fieldname === "video" ? "vid-" : "img-";
      cb(null, `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === "video") {
      if (/^video\//.test(file.mimetype)) return cb(null, true);
      return cb(new Error("Only video files allowed"));
    }
    if (/^image\//.test(file.mimetype)) return cb(null, true);
    return cb(new Error("Only images allowed"));
  },
});
const uploadFields = upload.fields([
  { name: "poster", maxCount: 1 },
  { name: "backdrop", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

/* ---------- Middlewares ---------- */
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(UPLOADS_DIR)); // پشتیبانی از range requests برای ویدیو
app.use(express.static(__dirname));

function requireAdmin(req, res, next) {
  if (req.headers["x-admin-token"] === ADMIN_PASSWORD) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

function avgRating(db, movieId) {
  const rs = db.ratings.filter((r) => r.movieId === movieId);
  if (!rs.length) return 0;
  return +(rs.reduce((s, r) => s + r.value, 0) / rs.length).toFixed(1);
}

/* =========================================================
   ROUTES
   ========================================================= */

app.post("/api/login", (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) return res.json({ ok: true, token: ADMIN_PASSWORD });
  res.status(401).json({ error: "Wrong password" });
});

app.get("/api/movies", (_req, res) => {
  const db = readDB();
  const list = db.movies.map((m) => ({
    ...m,
    avgRating: avgRating(db, m.id),
    ratingCount: db.ratings.filter((r) => r.movieId === m.id).length,
    commentCount: db.comments.filter((c) => c.movieId === m.id).length,
  }));
  res.json(list);
});

app.post("/api/movies", requireAdmin, uploadFields, (req, res) => {
  const db = readDB();
  const b = req.body;
  const movie = {
    id: db.nextId++,
    title: b.title || "Untitled",
    originalTitle: b.originalTitle || b.title || "Untitled",
    year: Number(b.year) || new Date().getFullYear(),
    rating: Number(b.rating) || 0,
    duration: Number(b.duration) || 0,
    genres: (b.genres || "").split(",").map((s) => s.trim()).filter(Boolean),
    overview: b.overview || "",
    director: b.director || "",
    cast: (b.cast || "").split(",").map((s) => s.trim()).filter(Boolean),
    poster: req.files?.poster ? "/uploads/" + req.files.poster[0].filename : b.posterUrl || "",
    backdrop: req.files?.backdrop ? "/uploads/" + req.files.backdrop[0].filename : b.backdropUrl || "",
    video: req.files?.video ? "/uploads/videos/" + req.files.video[0].filename : b.videoUrl || "",
    trailer: b.trailer || "",
    language: b.language || "English",
    country: b.country || "",
    isNew: b.isNew === "true" || b.isNew === true,
    popularity: Number(b.popularity) || 50,
    views: 0,
    createdAt: Date.now(),
  };
  db.movies.push(movie);
  writeDB(db);
  res.json(movie);
});

app.put("/api/movies/:id", requireAdmin, uploadFields, (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  const m = db.movies.find((x) => x.id === id);
  if (!m) return res.status(404).json({ error: "Not found" });
  const b = req.body;
  if (b.title) m.title = b.title;
  if (b.originalTitle) m.originalTitle = b.originalTitle;
  if (b.year) m.year = Number(b.year);
  if (b.rating) m.rating = Number(b.rating);
  if (b.duration) m.duration = Number(b.duration);
  if (b.genres) m.genres = b.genres.split(",").map((s) => s.trim()).filter(Boolean);
  if (b.overview) m.overview = b.overview;
  if (b.director) m.director = b.director;
  if (b.cast) m.cast = b.cast.split(",").map((s) => s.trim()).filter(Boolean);
  if (b.trailer !== undefined) m.trailer = b.trailer;
  if (b.language) m.language = b.language;
  if (b.country) m.country = b.country;
  if (b.isNew !== undefined) m.isNew = b.isNew === "true" || b.isNew === true;
  if (b.popularity) m.popularity = Number(b.popularity);
  if (req.files?.poster) m.poster = "/uploads/" + req.files.poster[0].filename;
  if (req.files?.backdrop) m.backdrop = "/uploads/" + req.files.backdrop[0].filename;
  if (req.files?.video) m.video = "/uploads/videos/" + req.files.video[0].filename;
  if (b.posterUrl) m.poster = b.posterUrl;
  if (b.backdropUrl) m.backdrop = b.backdropUrl;
  if (b.videoUrl) m.video = b.videoUrl;
  writeDB(db);
  res.json(m);
});

app.delete("/api/movies/:id", requireAdmin, (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  db.movies = db.movies.filter((m) => m.id !== id);
  db.comments = db.comments.filter((c) => c.movieId !== id);
  db.ratings = db.ratings.filter((r) => r.movieId !== id);
  writeDB(db);
  res.json({ ok: true });
});

app.post("/api/movies/:id/view", (req, res) => {
  const db = readDB();
  const m = db.movies.find((x) => x.id === Number(req.params.id));
  if (m) { m.views = (m.views || 0) + 1; writeDB(db); }
  res.json({ ok: true, views: m?.views || 0 });
});

app.post("/api/movies/:id/rate", (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  const { deviceId, value } = req.body || {};
  const v = Number(value);
  if (!deviceId || !v || v < 1 || v > 10) return res.status(400).json({ error: "Invalid" });
  db.ratings = db.ratings.filter((r) => !(r.movieId === id && r.deviceId === deviceId));
  db.ratings.push({ movieId: id, deviceId, value: v, at: Date.now() });
  writeDB(db);
  res.json({ ok: true, avg: avgRating(db, id), count: db.ratings.filter((r) => r.movieId === id).length });
});

app.get("/api/movies/:id/comments", (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  res.json(db.comments.filter((c) => c.movieId === id).sort((a, b) => b.at - a.at));
});

app.post("/api/movies/:id/comments", (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  const { name, text, deviceId } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: "Empty" });
  const c = { id: Date.now(), movieId: id, name: (name || "Guest").slice(0, 40), text: text.trim().slice(0, 600), deviceId: deviceId || "", at: Date.now() };
  db.comments.push(c);
  writeDB(db);
  res.json(c);
});

app.delete("/api/comments/:id", requireAdmin, (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  db.comments = db.comments.filter((c) => c.id !== id);
  writeDB(db);
  res.json({ ok: true });
});

app.get("/api/stats", (_req, res) => {
  const db = readDB();
  res.json({
    movies: db.movies.length,
    comments: db.comments.length,
    ratings: db.ratings.length,
    views: db.movies.reduce((s, m) => s + (m.views || 0), 0),
  });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`🎬 MovieHub running → http://localhost:${PORT}`);
  console.log(`🔐 Admin password: ${ADMIN_PASSWORD}`);
});