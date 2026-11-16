const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();

// TMDB Router Import
const tmdbRouter = require("./routes/tmdbRoutes");

// Firebase
const { admin, db } = require("./config/firebase");

//import the computeBingeBuddiesMatches function
const { computeBingeBuddiesMatches } = require("./utils/computeBingeBuddiesMatches");

// =============================
// CORS MIDDLEWARE
// =============================
const allowedOrigins = [
  "http://localhost:5173",
  "https://binge-buddies-17abf.web.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error("The CORS policy for this site does not allow access from the specified Origin."), false);
    }
  },
  credentials: true
}));

app.use(express.json());

// =============================
// BASE ROUTES
// =============================

app.get("/", (req, res) => {
  res.send("BingeBuddies backend running.");
});

// =============================
// FIREBASE AUTH MIDDLEWARE
// =============================
// Limits the number of requests to the server to prevent abuse.
// Keyed by Firebase UID so its per account, not per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each user to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => req.user?.uid || req.ip,
  message: { message: "Too many password change attempts, please try again later." }
});

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// =============================
// MOUNT TMDB ROUTES
// =============================

app.use("/api/tmdb", tmdbRouter);

// =============================
// FIREBASE ROUTES
// =============================

// onboarding
app.post("/api/users/onboarding", verifyFirebaseToken, async (req, res) => {
  try {
    const { movieGenres, tvGenres, categories, languages, username } = req.body;
    const userUid = req.user.uid;

    if (!movieGenres || !tvGenres || !categories || !languages || !username) {
      return res.status(400).json({ message: "Missing fields" });
    }

    await db.collection("users").doc(userUid).set({
      username: username.trim(),
      movieGenres,
      tvGenres,
      categories,
      languages,
      hasCompletedOnboarding: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.json({ success: true });

  } catch (err) {
    console.error("Onboarding backend failure:", err);
    res.status(500).json({ message: "Onboarding error" });
  }
});

// =============================
// WATCH LOG ROUTINES
// =============================

// 1. Save/Update Watch Log
app.post("/api/users/watchlog", verifyFirebaseToken, async (req, res) => {
  try {
    const { watchList } = req.body;
    const userUid = req.user.uid;

    if (!Array.isArray(watchList)) {
      return res.status(400).json({ message: "Invalid watch list format" });
    }

    await db.collection("users").doc(userUid).set({
      watchList,
      lastUpdatedLog: new Date().toISOString()
    }, { merge: true });

    res.json({ success: true, message: "Watch log updated successfully" });
  } catch (err) {
    console.error("Failed to save watch log:", err);
    res.status(500).json({ message: "Failed to save watch log" });
  }
});

// 2. Retrieve Saved Watch Log
app.get("/api/users/watchlog", verifyFirebaseToken, async (req, res) => {
  try {
    const userUid = req.user.uid;
    const userDoc = await db.collection("users").doc(userUid).get();

    if (userDoc.exists && userDoc.data().watchList) {
      return res.json({ watchList: userDoc.data().watchList });
    }
    
    res.json({ watchList: [] });
  } catch (err) {
    console.error("Failed to retrieve watch log:", err);
    res.status(500).json({ message: "Failed to retrieve watch log" });
  }
});

// change password
app.post("/api/users/change-password", verifyFirebaseToken, limiter, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userUid = req.user.uid;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (newPassword.length < 12) {
      return res.status(400).json({ message: "New password must be at least 12 characters" });
    }
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumberOrSymbol = /[0-9]/.test(newPassword);
    

    if(!hasUppercase || !hasNumberOrSymbol) {
      return res.status(400).json({ message: "New password must contain an uppercase letter and a number or symbol" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password cannot be the same as the current password" });
    }

    const userRecord = await admin.auth().getUser(userUid);
    const email = userRecord.email;

    const apiKey = process.env.FIREBASE_API_KEY;

    const verifyUrl =
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: currentPassword,
        returnSecureToken: false
      })
    });

    if (!response.ok) {
      return res.status(401).json({ message: "Wrong password" });
    }

    await admin.auth().updateUser(userUid, {
      password: newPassword
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: "Password update failed" });
  }
});

// =============================
// START SERVER
// =============================

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// =============================
// WANT TO WATCH LIST ROUTES
// =============================

// save want to watch list 
app.post("/api/users/wanttowatch", verifyFirebaseToken, async (req, res) => {
  try {
    const { wantToWatchList } = req.body;
    const userUid = req.user.uid;

    if (!Array.isArray(wantToWatchList)) {
      return res.status(400).json({ message: "Invalid want to watch list format" });
    }

    await db.collection("users").doc(userUid).set({
      wantToWatchList,
      lastUpdatedWantToWatch: new Date().toISOString()
    }, { merge: true });

    res.json({ success: true, message: "Want to watch list updated successfully" });
  } catch (err) {
    console.error("Failed to save want to watch list:", err);
    res.status(500).json({ message: "Failed to save want to watch list" });
  }
});

// retrieve saved want to watch list
app.get("/api/users/wanttowatch", verifyFirebaseToken, async (req, res) => {
  try {
    const userUid = req.user.uid;
    const userDoc = await db.collection("users").doc(userUid).get();

    if (userDoc.exists && userDoc.data().wantToWatchList) {
      return res.json({ wantToWatchList: userDoc.data().wantToWatchList });
    }
    
    res.json({ wantToWatchList: [] });
  } catch (err) {
    console.error("Failed to retrieve want to watch list:", err);
    res.status(500).json({ message: "Failed to retrieve want to watch list" });
  }
});

// delete item from want to watch list
app.delete("/api/users/wanttowatch/:itemId", verifyFirebaseToken, async (req, res) => {
  try {
    const userUid = req.user.uid;
    const itemId = req.params.itemId;
    const type = req.query.type; // tyoe is either 'movie' or 'tv'
    if (!type) {
      return res.status(400).json({ message: "Missing type query parameter" });
    }

    const userDocRef = db.collection("users").doc(userUid);
    await userDocRef.update({
      wantToWatchList: admin.firestore.FieldValue.arrayRemove({
        id: Number(itemId),
        type: type
      })
    });

    res.json({ success: true, message: "Item removed from want to watch list" });
  } catch (err) {
    console.error("Failed to remove item from want to watch list:", err);
    res.status(500).json({ message: "Failed to remove item from want to watch list" });
  }
});

// =============================
// FIND A BINGE BUDDY
// =============================

// Match the current user with other users based on shared want-to-watch titles.
// Only users who have opted in to Find a Binge Buddy are returned. Each match
// includes their opt-in contact and top genre so they can be reached directly.
app.get("/api/users/binge-buddies", verifyFirebaseToken, async (req, res) => {
  try {
    const userUid = req.user.uid;

    // Current user's want-to-watch list + own opt-in status
    const meDoc = await db.collection("users").doc(userUid).get();
    const meData = meDoc.exists ? meDoc.data() : {};
    const myList = meData.wantToWatchList || [];
    const myOptIn = meData.bingeBuddyOptIn === true;

    if (myList.length === 0) {
      return res.json({ matches: [], hasList: false, myOptIn });
    }

    // Scan all users and compute overlap
    const usersSnap = await db.collection("users").get();
    const allUsers = [];


    usersSnap.forEach((doc) => 
      allUsers.push({ id: doc.id, data: doc.data() }));

    const matches = computeBingeBuddiesMatches(userUid, myList, allUsers);

    res.json({ matches, hasList: true, myOptIn });
  } catch (err) {
    console.error("Failed to find binge buddies:", err);
    res.status(500).json({ message: "Failed to find binge buddies" });
  }
});
