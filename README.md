# Binge-Buddies Orbital 26
Your trusted one stop web app for movie and series enthusiasts

## NUS Orbital 2026 — Final Submission

**Team Name:** Binge Buddies  
**Proposed Level of Achievement:** Project Apollo

---

## Motivation
As avid consumers of movies, dramas, and television series, our team found ourselves facing a recurring frustration: there is no single, neutral space to track what we have watched, record our thoughts on it, and meaningfully compare shows or films across different streaming platforms. Recommendation engines on platforms like Netflix, Disney+, and Apple TV+ are inherently self-serving, surfacing only content available within their own ecosystem. This makes it difficult to get a holistic view of what is worth watching next, regardless of where it is hosted. Beyond discovery, we also found that there was nowhere convenient to log our viewing history, assign personal ratings, and write reflective notes on what we had watched, something that would help us remember and revisit our experiences with a piece of content. Among friends and teammates who share similar tastes in shows, there was also no shared space to see what others were watching, exchange recommendations, and make collective decisions on what to watch next. These gaps motivated us to build a unified web application that addresses all of these needs in one place.

---

## Aim
We hope to build a web application that serves as a personal and social hub for movie, drama, and series enthusiasts, that allows users to log and reflect on content they have watched, receive cross-platform recommendations tailored to their taste, and engage with a community of like-minded viewers through a shared dashboard for posting recommendations and discussions.

---

## User Stories
1. As a viewer who wants to track and reflect on everything I have watched, I want to be able to log movies, dramas, and shows with ratings and personal reflections.
2. As a user who wants personalized recommendations, I want to be able to receive show and movie suggestions from across multiple  platforms based on my stated preferences.
3. As a community member who wants to share my thoughts, I want to be able to post my reflections and recommendations to a community dashboard where other users can like and comment on them.
4. As an indecisive viewer who wants help choosing what to watch next, I want to be able to compare two or more titles side by side, including its availability, ratings, genre, and synopsis, to decide which to watch.

---

## Scope of Project
A unified web application for movie and series enthusiasts to log, rate, and reflect on content they have watched, discover cross-platform recommendations, and connect with a community of like-minded viewers.

---

## Features

### Features to be completed by Milestone 2 (end of Week 7):

1. **User Authentication**

Users will be able to log in using their login credentials. If they are not previously signed up, users will be redirected to a sign up page where personal information will be collected. After logging in, new users will be asked general questions regarding their favourite genres of shows. After login, users will be brought to their personal dashboard.

2. **Personal Watch Log**

Users are able to add new logs to the personal watch log page. Within the logs, users are able to input the title of the show/ movie, personal reflections and the star rating (out of 10).

3. **Cross-Platform Recommendations**

By leveraging data from onboarding preferences and personal watch logs, the platform delivers recommendations across various streaming services, including titles available to rent, buy, or stream with ads.

### Features to be completed by Milestone 3 (end of Week 12):

4. **Community Hub**

Users can share their reflections and reviews to a community feed where friends and other users can view, like, and comment on each other's thoughts.

5. **Side-by-Side Comparison** 

Users can select two or more titles and view a structured comparison of key attributes like genre, platform availability, community rating, runtime, and synopsis.

6. **Want to Watch List** (extension)

We will extend features in our app by including a “Want to Watch” List. Users can easily save hidden gems directly from their recommendations page to track their next viewing target.

7. **Social Connection Hub** (extension)
An opt-in extension feature that matches users with others who want to watch the same titles, making it easy to connect and watch together.

8. **Direct Messaging** (extension)

The direct messaging feature enables private, peer-to-peer communication for users connected through the Social Connect Hub.

---

## How Binge Buddies differs from existing applications like Letterboxd, Serializd and JustWatch

1. **Side-by-Side Comparison**

Unlike existing platforms like Letterboxd which require users to constantly navigate between isolated media pages, Binge Buddies introduces a dedicated Side-by-Side Comparison engine designed specifically to eliminate "decision fatigue." This feature allows indecisive users to select two titles and evaluate them simultaneously on a single, unified dashboard.

 ### Core Comparison Metrics:

* **Platform Availability:** Instantly see where a title is streaming (e.g., Netflix, Disney+, Prime) to ensure accessibility.
* **Time Constraints (Runtime):** Compare lengths directly to match the viewer's current schedule.
* **Quality Indicators (Community Ratings):** Compare community scores from TMDB to gauge quality.
* **Contextual Alignment (Genre & Synopsis):** Review summaries side-by-side to ensure the selected title matches the desired mood or tone.
* **Genre:** Compare the genre types of two titles.

By consolidating separate metadata endpoints into a single, glanceable interface, Binge Buddies drastically reduces the time spent choosing what to watch, turning an inefficient search process into a fast and seamless decision.

2. **Cross-Platform Recommendations**

Letterboxd emphasizes social discovery through friends’ activity, while JustWatch focuses on streaming availability across platforms. Binge Buddies, however, delivers personalized recommendations based on users’ watch logs and their preferred genres, categories, and languages set during onboarding.

3. **Multi-Language and Multi-Format Focus**

Letterboxd skews heavily towards Western films while Serializd focuses on TV shows. Binge Buddies supports Korean, Japanese, Mandarin, Thai and other language preferences, catering to the growing audience of K-drama, anime, and Asian content viewers. Additionally, Binge Buddies covers movies, TV shows and other foreign series.

---

## System Architecture Design

<img width="1920" height="1080" alt="1" src="https://github.com/user-attachments/assets/3c45566e-ad01-4b48-8ef7-3be69b12f972" />


Our Binge Buddies web app uses a multi-tier architecture: a React + TypeScript (Vite) frontend, two backend services, Firebase and an Express API server hosted on Render, and the TMDB API as an external data source. The client uses the Firebase SDK directly for authentication (email/password and Google), Cloud Firestore data, and real-time Community Hub updates, and calls the Express server over a REST API (attaching the user's Firebase ID token) for the TMDB proxy, onboarding, watch-log and want-to-watch persistence, password changes, and the binge-buddy matching behind the Social Connection Hub. The Express server verifies each request with the Firebase Admin SDK and is the only component that calls TMDB. All user data, including profile pictures lives in Cloud Firestore, the frontend is deployed on Firebase Hosting and the backend on Render.

---

## Tech Stack

1. Frontend: React + Typescript (Vite) 
React enables Binge Buddies to be built using reusable components, making development more scalable and maintainable. TypeScript improves code reliability through static type checking, reducing bugs during development. Vite provides fast development and build speed, improving team productivity. This combination also allows us to work on separate pages and components independently before integrating them into the final web app.

2. Backend: Firebase
Firebase Authentication provides secure user signup, login, password management, and session handling out of the box. It significantly reduces development time while following industry-standard security practices, allowing users to create accounts and securely access personalized features such as watch logs and binge streak.

3. Database: Firebase Firestore
Firestore is a cloud-hosted NoSQL database that supports real-time data synchronization and flexible document-based storage. It is well-suited for storing user profiles, watch logs, personal reviews and ratings. It is scalable and seamlessly integrates with Firebase services, which makes it suitable for Binge Buddies.

4. External API: TMDB (The Movie Database)
TMDB provides a large and regularly updated catalogue of movies and TV shows, including metadata such as titles, genres, posters, ratings, descriptions, and streaming availability. Using TMDB allows access to comprehensive entertainment data without maintaining our own content database, reducing development effort and ensuring updated information.

---

## User-Authentication

**Login Page**

Users can sign up and log in securely, and set up a profile with their content preferences during onboarding to personalise their experience. 

<img width="503" height="711" alt="Screenshot 2026-06-26 at 15 42 43" src="https://github.com/user-attachments/assets/08674ea6-bea0-4923-9db8-419d465763bc" />

**Onboarding Page**

New users are able to create a username for their profile and select their watch preferences. Users are required to select at least one genre type of the category that they like to watch.

<img width="302" height="624" alt="Screenshot 2026-08-08 at 23 27 51" src="https://github.com/user-attachments/assets/e634a0fb-2a42-456e-ba61-be6636287a72" />

**Profile Page**

<img width="1456" height="742" alt="Screenshot 2026-06-26 at 15 43 41" src="https://github.com/user-attachments/assets/183507f0-664e-4860-a9a9-42e629201d01" />

### How it works

Users are able to view and change their username and password and update their watch preferences. Additionally, users can update their profile picture.

The following table shows the fields stored in the Firestore database.

| Field Name | Type | Details |
|---|---|---|
| username | String | The name chosen during onboarding |
| photoURL | String | A base64 image string or null for a default letter avatar based on the starting letter of their username |
| movieGenres | Array | List of selected movie genres |
| tvGenres | Array | List of selected television genres |
| categories | Array | Tracks whether they like "Movies", "TV Shows", or both |
| languages | Array | Mixed list of default and user-added custom languages using the add button |

### Changing of password

For maximum security, passwords are never stored in the main database with the user preferences. Instead, changing a password follows a highly secure 3-step process:

* Secure Verification: When a user requests a password change, the app requests a temporary, encrypted digital signature (ID Token) directly from Firebase.

* The Backend Gatekeeper: The app sends this token, along with the old and new passwords, to a dedicated, private authentication server (https://binge-buddies-orbital-26-1.onrender.com).

* Safe Update: The backend server checks if the old password is correct. If it is correct, it securely overwrites the password and sends a success message back to the profile page, showing a 'Password updated successfully! 🎬' alert.

<img width="1069" height="529" alt="Screenshot 2026-06-27 010231" src="https://github.com/user-attachments/assets/34e08356-6297-4f91-9ef8-74f225247ed7" />

<img width="1057" height="634" alt="Screenshot 2026-06-27 010326" src="https://github.com/user-attachments/assets/c9bd6b84-4854-481c-91f7-a842cbafe4f3" />

### Updating of preferences

Users can update their preferences by navigating to the 'My Preferences' tab of the profile page. This allows the users' current preferences to be reflected in Binge Buddies so that the recommendations given on both the Homepage and the Recommendations page are tailored to the user.

<img width="733" height="614" alt="Screenshot 2026-06-27 010424" src="https://github.com/user-attachments/assets/01c0b502-f85a-4037-8547-8cd58f26cdd3" />

#### Improvements made for preference update

Users are now required to select and save at least one genre from either the movie or tv genres component to ensure they receive constant recommendations based on their favourite genres.

<img width="668" height="408" alt="Screenshot 2026-08-08 at 23 29 07" src="https://github.com/user-attachments/assets/aa97430d-d73b-4494-8cd8-250e9359b75a" />

---

## Home Page

### How it works

The homepage consists of a 'Watch Again' section as well as a 'Top Recommendation' section. Additionally, there is a 'Binge Streak' feature, which counts the number of consecutive days a user logs in to Binge Buddies.

<img width="726" height="390" alt="Screenshot 2026-08-08 at 23 29 59" src="https://github.com/user-attachments/assets/c408caf1-2c7a-461b-a69d-3e26b6afc49c" />

### Watch Again Calculation

This card shows content the user has already seen and thoroughly enjoyed, acting as a "favorites re-run" display.

Step 1: Fetch and Filter by Rating 
The code pulls the user's watchList history using getUserWatchLog(idToken). It then filters out any items where the user’s personal rating (userRating) is 14 or higher.

Step 2: Random Selection 
If there are multiple highly rated items, it randomly selects exactly one using a random index generator:

<img width="745" height="23" alt="Screenshot 2026-06-23 225110" src="https://github.com/user-attachments/assets/e8fb3f71-4516-4c6c-8bd6-fbdca294a5ba" />

Step 3: Fetching Details and Platforms 
It checks if the item is a movie or TV show, and fires off concurrent API requests (Promise.all) to TMDB to gather its full metadata (synopsis, backdrop image, genres) and streaming availability platforms before rendering the movie card.

<img width="554" height="594" alt="Screenshot 2026-06-26 at 15 44 10" src="https://github.com/user-attachments/assets/27fea647-03d6-4b4c-b5f9-78a92dca56e4" />

<img width="518" height="533" alt="Screenshot 2026-06-27 012600" src="https://github.com/user-attachments/assets/ab0eeade-70fb-478a-bdc1-2107560fd5a4" />

### Top Recommendation Calculation

This card uses an algorithmic approach based on the user's explicit profile preferences combined with their historical watch patterns.

*Phase A: Determining User Taste*
1. Top Genre Extraction: It reads the user's top genre from the `topGenre` field on their Firestore user document (computed automatically from the watch log by the Log page). If it is missing or "None", it falls back to pulling a genres string array from `sessionStorage` (e.g., movieGenres/tvGenres).

2. Language Pairing: It checks the user's preferred language array from sessionStorage and uses the languageCodeMap object to convert the human-readable string (e.g., "Korean") into an ISO 639-1 language code (e.g., "ko").

3. Media Type Weighing: It looks at sessionStorage categories. If the user explicitly picks only "Movies" or only TV-based categories (like "K-Dramas" or "Anime"), it locks that media type. If they selected both, it calculates a tally from their watch history
   
<img width="823" height="126" alt="Screenshot 2026-06-23 230352" src="https://github.com/user-attachments/assets/aecf51aa-cc7f-4d39-b49d-40dd5dc9db51" />

*Phase B: Querying and Filtering TMDB*
1. Discover Call: Using the determined genre ID, preferred media type, and language code, it calls discoverByGenre().

2. Deduplication: The code passes the results through a custom filteringProcess() utility along with a Set of IDs the user has already watched (watchedIds). This ensures the app never recommends something the user has already logged.

3. The Shuffle: It shuffles the verified un-watched results randomly so the user doesn't get stuck looking at the same top-indexed item every time they hit the home page:
   
<img width="559" height="23" alt="Screenshot 2026-06-23 230933" src="https://github.com/user-attachments/assets/52810225-e7b2-4c4b-996b-72bc35601aff" />

4. Mapping: It selects the first item (shuffledDiscover[0]), maps the genre strings back from TMDB's numerical ID system using genreMap, attaches streaming platform flags, and displays it.
   
<img width="535" height="630" alt="Screenshot 2026-06-26 at 15 45 02" src="https://github.com/user-attachments/assets/40be7a4e-1288-48a9-985a-53b880454c27" />

<img width="464" height="466" alt="Screenshot 2026-08-08 at 23 31 50" src="https://github.com/user-attachments/assets/c08e8a62-80fc-4e9c-983d-1ca954dcdf85" />

(image of what users will see if they have a top niche genre and there are no available titles streaming in SG for their top niche genre)

#### Improvements for Top Recommendation Calculation (milestone 3)

**Top Genre Extraction:** In milestone 2, the user’s top genre was determined by the topGenre from personal watch log. If no logs are present, it results in taking a genre from the list of movie and tv genres selected. We have decided to separate the movie and tv genres selected to separate lists for more accurate discovery of recommended titles.

**Media Type Weighting:** For milestone 3, we included an extra barrier to determine media type. If the user explicitly picks only "Movies" or only TV-based categories, it locks that media type. However if none or both are selected, it calculates a tally from their watch history. If there is a tie breaker, the media type is determined by the number of genres picked for each category on the user’s preferences section of the profile page. If both categories have the same number of selected genres, it falls back to “tv” as media type.

<img width="502" height="409" alt="Screenshot 2026-08-08 at 23 33 43" src="https://github.com/user-attachments/assets/be3fdeb9-84cd-4335-a694-f927022292b7" />

(code snippet of determinePreferredMediaType in HomePage.tsx)

---

## Personal Watch Log

### How it works

Binge Buddies offer a personal platform for users to log shows/ movies that they have watched. To add a log, users will click on the "Add new log" button which brings them to an empty log page which they can fill in the title of the show/ movie watched, personal reflections and a personal rating (out of 10). Additionally, users are able to view the total of shows/ movies watched, average TMDB rating, average personal rating and their top genre. There is also a search bar for users to search past logs for easy access.

<img width="1441" height="752" alt="Screenshot 2026-06-17 at 17 26 55" src="https://github.com/user-attachments/assets/64ad36ca-b6e2-4dac-95ab-9d0cb6c5181c" />

### Personal Watch Log Architecture : Data Flow

<img width="1920" height="1080" alt="Data Flow Diagram Whiteboard in Dark Yellow Light Yellow Black Monochromatic Style (4)" src="https://github.com/user-attachments/assets/a89a7087-10b2-43a6-a67e-3d629f4f6227" />

The following are the relevant fields that will be stored on the `users` documentation in Firestore for this feature:

| Field | Type | Details |
|---|---|---|
| `topGenre` | String | The user’s most watched genre based on Genre Frequency Rating Calculation. |
| `watchList` | LogItem[] | The array of every title the user has logged. The entire array is rewritten on every add, edit or remove operation via saveUserWatchLog. |

The fields of the LogItem is as follows:

| Field | Type | Details |
|---|---|---|
| `id` | Number | The TMDB id of the movie/ show. |
| `type` | "movie" / "tv" | Distinguishes whether the logged title is movie/ show. |
| `notes` | String (optional) | The user’s personal diary notes for the selected title. Defaults as empty string when first added to watch log. |
| `userRating` | Number (optional) | The user’s personal rating, stored on a 20-point hitbox architecture. |

### How results are generated

### Custom Star Rating & Analytics Pipeline

The app features a custom 10-star rating component that supports half-star increments. To handle this cleanly without storing complex decimals in the database, the system uses a 20-point hitbox architecture (userRating).

**1. The Frontend UI State (20 Hitboxes)**

Each of the 10 stars is split into a left and right button hitbox. The left half saves an odd number, and the right half saves an even number. This maps every choice to an integer from 1 to 20.

<img width="528" height="476" alt="Screenshot 2026-06-17 at 22 12 56" src="https://github.com/user-attachments/assets/fb512d84-fb6e-4cb8-aa1d-e57354d39153" />

**2. Displaying individual log ratings (Dividing by 2)**

To show users a standard 10-point scale on the log entry screen, the raw database score is divided by 2 dynamically upon render.

<img width="885" height="76" alt="Screenshot 2026-06-17 at 22 18 22" src="https://github.com/user-attachments/assets/d7e0e8a6-fd9e-4820-b796-85e5394ab6b9" />

### Top Genre Result

We will rely on genre frequency weighting to determine the user's favorite genre.

### Genre Frequency Weighting

* **Watch Log (All Entries):** Genres from every logged title each contribute +1, reflecting general viewing habits.
* **Watch Log (Rated 7 and above):** If a title is highly rated (a display score of 7.0 or above, which corresponds to a raw database value of item.userRating >= 14), its genres receive an additional +2, reflecting strong preference.

The genre with the highest cumulative frequency score is surfaced as the user's top genre on the watch log page. If multiple genres share the highest frequency score, the genre with the highest number of appearances is taken as the Top Genre. If there is still a tie, the genre is chosen in alphabetical order (via `localeCompare`). This top genre will be used to personalize recommendations on the Home and Recommendations pages once the user begins logging titles in their watch log.

<img width="791" height="527" alt="Screenshot 2026-06-20 at 16 56 35" src="https://github.com/user-attachments/assets/b305cf6f-6ba6-4bfc-8dac-63a0e7f0c5c0" />

(Code snippet of genre frequency weighting calculation in getTopGenre.ts)

The resultant topGenre is saved to the `topGenre` field on the users document in Cloud Firestore. 

### Average Rating Result

The average rating is calculated by summing all ratings across every logged title and dividing by the total number of entries.

**Average Rating = Sum of all ratings / Total number of logged titles**

When calculating the total average personal rating across all logged entries, the data pipeline divides each raw score (userRating) by 2 inside the reduce accumulator. This converts the values back to a standard 10-point system before calculating the mathematical average.

<img width="618" height="331" alt="Screenshot 2026-06-17 at 21 02 40" src="https://github.com/user-attachments/assets/d6470e39-a782-480f-bf4e-78a2f796ce0e" />

(Code snippet of the average rating calculation based on personal rating and TMDB rating in RecommendationsPage.tsx)

### Adding a personal log

When logging a new title, users search for it using the “Add New Log Button” and use a debounced search box. 

<img width="565" height="311" alt="Screenshot 2026-08-08 at 23 40 44" src="https://github.com/user-attachments/assets/7dbf3d9a-fa62-4f98-8c35-4ddfe7a8f9cc" />

<img width="278" height="449" alt="Screenshot 2026-08-08 at 23 41 19" src="https://github.com/user-attachments/assets/8ca69acb-b672-4969-87e5-5292fd92a825" />

A 400ms debounce ensures that the search is only fired once the user pauses typing, rather than on every keystroke. This reduces unnecessary API calls and avoids a flood of requests to searchMovies.

<img width="676" height="319" alt="Screenshot 2026-08-08 at 23 45 08" src="https://github.com/user-attachments/assets/45583b3b-a768-437b-be38-090854a88871" />

<img width="497" height="119" alt="Screenshot 2026-08-08 at 23 42 31" src="https://github.com/user-attachments/assets/4598f491-751f-44c7-827a-12c09ec0d436" />

(code snippet of searchMovies service layer interface in tmdbservice.ts)

When users click "Add", the app takes the id and type ("movie" or "tv") from the search results and prepends to the watchList array alongside default empty values (userRating: 0 and notes: ""). This immediately updates the local React state and triggers a background sync to the watchList in Firebase Firestore using saveUserWatchLog service layer interface. As such saving only essential identifiers (id, type, notes, userRating) in Firebase Firestore keeps database fast and cost-effective.

<img width="839" height="694" alt="Screenshot 2026-08-08 at 23 46 33" src="https://github.com/user-attachments/assets/1bc481a7-57a5-42b9-b443-075c1535f321" />

(code snippet of handleAddMedia in LogPage.tsx)

The following fields from TMDB and are fetched loaded in local `movies` state:

| Field | Service Layer Interface | TMDB Source |
|---|---|---|
| Image | `getPosterUrl` | `poster_path` combined with base asset CDN URL: `https://image.tmdb.org/t/p/{size}/` |
| Title | `getMovieDetails`, `getTVShowDetails` |`title` or `name` (Fetched via `/movie/{id}` or `/tv/{id}`) |
| Genres | `getMovieDetails`, `getTVShowDetails` | `genres` (Fetched via `/movie/{id}` or `/tv/{id}`) |
| TMDB Rating | `getMovieDetails`, `getTVShowDetails` | `vote_average` (Fetched via `/movie/{id}` or `/tv/{id}`) |
| Platform | `fetchPlatforms` | `/tv/{id}/watch/providers` or `/movie/{id}/watch/providers` (Filtered to `results.SG.flatrate` via backend proxy)|

<img width="476" height="85" alt="Screenshot 2026-06-17 at 21 37 06" src="https://github.com/user-attachments/assets/2ccab2f0-d29b-4521-b04b-0ad88199fe31" />

<img width="499" height="82" alt="Screenshot 2026-06-17 at 21 37 22" src="https://github.com/user-attachments/assets/ac6afd5b-b12d-4efc-aee4-bbc2d840aa04" />

(Code snippets of services in tmdbService.ts for managing inbound handshakes to our backend proxy server to fetch individual media metadata payloads)

<img width="549" height="171" alt="Screenshot 2026-06-17 at 21 34 34" src="https://github.com/user-attachments/assets/211de823-d3af-4149-a3fe-d907473cd8c1" />

(Code snippet of helper functions in the tmdbService.ts to construct the absolute URL strings pointing directly to TMDB's global Content Delivery Network for shows/ movie images)

<img width="719" height="294" alt="Screenshot 2026-06-17 at 21 38 52" src="https://github.com/user-attachments/assets/2637762a-7808-4598-8429-de6950dff12c" />

(Code snippet of fetchPlatforms in tmdbService.ts to obtain platform availability of shows/ movies in SG. Since TMDB returns global streaming data, our backend intercepts the payload, extracts only the Singapore region data (results.SG.flatrate), and returns a clean string array (e.g., ["Netflix", "Disney+"]) directly to the UI)

#### Improvements made to fetching of platform availability

Previously, fetchPlatforms only retrieved subscription-based streaming options (flatrate) available in SG. It now extracts and merges platform availability across all access models including rental (rent), purchase (buy) and ad-supported (ads), returning a deduplicated array of providers. This expands support beyond subscription streaming to accommodate any availability model or provider type.

<img width="811" height="437" alt="Screenshot 2026-08-08 at 23 48 14" src="https://github.com/user-attachments/assets/559f6db6-a9fe-4577-a872-9b35b6789a06" />

(code snippet of new fetchPlatforms in tmdbService.ts) 

Adding a new log will display a summary card on the main log page, showing the show or movie title and image.

<img width="533" height="398" alt="Screenshot 2026-08-08 at 23 48 44" src="https://github.com/user-attachments/assets/2ead3364-c723-4887-aa68-91f034d8496e" />

### Watch log Display

Clicking into a card expands the full log entry, revealing the complete notes and all other logged details:

| Displayed Field | Source |
|---|---|
| Image | TMDB |
| Title | TMDB |
| Genres | TMDB |
| TMDB Rating | TMDB | 
| Platform | TMDB |
| Personal Rating | User Input |
| Notes preview | User Input |

<img width="519" height="601" alt="Screenshot 2026-06-17 at 17 31 11" src="https://github.com/user-attachments/assets/2df30d69-e665-440f-8923-86f219bd0cc1" />

(Empty log for user input)

The user then completes the log entry by providing:

* **Rating (1–10 stars) (optional)** 
* **Notes (optional)** 

<img width="519" height="608" alt="Screenshot 2026-06-17 at 17 40 55" src="https://github.com/user-attachments/assets/ce45eedb-ab3f-457f-9725-06d614c6a89d" />

(Full detailed log after user input)

The app will map over the local `watchList` array, updating the correct entry's notes and `userRating` fields. The modified updatedWatchList is committed to Firebase Firestore. 

<img width="901" height="450" alt="Screenshot 2026-08-08 at 23 49 53" src="https://github.com/user-attachments/assets/dd57ac90-8a0e-450b-bb7e-264122684eb3" />

(code snippet of handleSaveNote in LogPage.tsx which maps users notes and rating to updatedWatchList and saved to backend watchList.)

If the user confirms they want to remove a title from the their watch log, the log is filtered out from watchList and persisted to Firebase, ensuring real-time consistency across devices. 

<img width="807" height="442" alt="Screenshot 2026-08-08 at 23 50 33" src="https://github.com/user-attachments/assets/e4148924-cf7b-4066-a15b-d73d7b4b23f5" />

(code snippet of handleRemoveMedia in LogPage.tsx which filters the targeted log)

<img width="411" height="539" alt="Screenshot 2026-08-08 at 23 51 01" src="https://github.com/user-attachments/assets/1da0ab86-6a45-425a-bcc7-b39efd89d695" />

---

## Cross-Platform Recommendations

### How it works

Binge Buddies uses a content-based filtering approach to generate personalized recommendations. The recommendations are driven by users own data along with the TMDB API.

<img width="789" height="470" alt="Screenshot 2026-08-08 at 23 51 56" src="https://github.com/user-attachments/assets/ecb9716e-7741-47c6-ad43-3e41d3f901c6" />

### Recommendations Sections

The recommendation page is divided into two sections, each generated differently:

| Section | Triggered by | Logic | Service Layer Interface | TMDB Endpoint |
|---|---|---|---|---|
| Based on your love for X | Titles rated 7 or above in personal watch log | Finds titles similar to a highly rated show | `getRecommendations` | `/tv/{id}/recommendations` or `/movie/{id}/recommendations` |
| Discovering a new obsession | Relying on Top Genre result from personal watch log or genre preferences in users' profile page | Discovers new titles matching the user's favourite genre | `discoverByGenre` | `/discover/tv` or `/discover/movie` |

<img width="709" height="196" alt="Screenshot 2026-06-17 at 23 08 16" src="https://github.com/user-attachments/assets/73550708-395e-4433-85b4-199f022ce582" />

(Code snippet of getRecommendation in tmdbService.ts takes a specific movie/ TV show ID and calls TMDB's recommendation engine to find structurally similar titles)

<img width="748" height="100" alt="Screenshot 2026-06-17 at 23 15 15" src="https://github.com/user-attachments/assets/d67af7f1-e83d-411c-b313-947f7f5bbed4" />

(Code snippet of discoverByGenre in tmdbService.ts that takes a specific genre ID and queries TMDB's discovery engine to find movies or TV shows belonging to that category)

### Conversion of Genre Names to IDs and vice versa

Because our backend analytics track and store a user's favorite genre as a string , but the external TMDB API strictly requires numeric identifiers, the app initializes a two-way translation map upon mounting by creating a bi-directional lookup dictionary of genres (genreMap and genreNameToId) from useGenreMap.ts.

<img width="753" height="667" alt="Screenshot 2026-07-09 at 15 32 44" src="https://github.com/user-attachments/assets/f5d74a6a-0a79-4251-827d-8fc5852f7047" />

We will rely on the getGenres service layer interface in tmdbService.ts below to fetch the list of genre data.

<img width="649" height="224" alt="Screenshot 2026-06-17 at 23 49 08" src="https://github.com/user-attachments/assets/5be263f1-426a-4722-b472-ad51b50b0f39" />

### Recommendation System Architecture : Data Flow

<img width="1920" height="1080" alt="Copy of Data Flow Diagram Whiteboard in Dark Yellow Light Yellow Black Monochromatic Style (1)" src="https://github.com/user-attachments/assets/924b1db7-0fe1-404e-9bd3-c4717a21a544" />

### How Recommendations Are Generated Initially in Milestone 2 and How We Improved it Milestone 3

### Section 1: Based On Your Love For X

**1. Gathering of log IDs from personal watch log**

The system pulls users complete watch history from their personal watch log and creates a hashing set of log IDs.

<img width="533" height="65" alt="Screenshot 2026-06-19 at 13 10 14" src="https://github.com/user-attachments/assets/b2f21697-4ebb-4b34-aefd-8a06f2ae7146" />

**2. Fetching of metadata**

Rich metadata like genre, synopsis and titles of movies/ shows are fetched along with users' personal rating.

<img width="816" height="166" alt="Screenshot 2026-06-19 at 13 15 12" src="https://github.com/user-attachments/assets/168b2b44-e2a8-428f-8f72-3960fdf6c084" />

**3. Filtering to retain logs rated 7 stars and above**

The engine filters the user's log to find items they rated 7.0 or higher. Because the underlying UI tracks increments via a 20-point hitbox system, this maps directly to checking if userRating is 14 or above.

**4. Evaluating the seed item using a priority chain**

The selected show/ movie to base recommendations on is identified using a priority system:

1. Find a highly rated item that also matches the users' computed top genre from personal watch log.
2. If none match the top genre, grab any highly rated item in their log.
3. If the user has no highly rated items, use their most recent watch entry.
4. Else return null.

<img width="687" height="203" alt="Screenshot 2026-06-20 at 17 24 00" src="https://github.com/user-attachments/assets/4b9de9cf-778f-4b9e-b070-6e0552b98864" />

(Code snippet of filtering and evaluating seed item in getSeedItem.ts)

**5. Sourcing and filtering recommendations based on seed item**

Using the selected seed item, a set of recommended movies/ shows is returned. All results are filtered to exclude titles already in the user's watch log, and entries with no streaming availability in Singapore are stripped out using platform data from TMDB's Watch Providers endpoint.

<img width="758" height="219" alt="Screenshot 2026-06-20 at 17 14 19" src="https://github.com/user-attachments/assets/ccaf61b2-25ec-4663-9c64-e68431c2962f" />

(Code snippet of the sourcing process in the RecommendationsPage.tsx)

<img width="611" height="321" alt="Screenshot 2026-06-20 at 17 07 55" src="https://github.com/user-attachments/assets/e1f5f9e2-7b57-4047-b643-7fac0abccf8f" />

(Code snippet of the filtering process in filteringProcess.ts)

**6. Shuffling of recommendations in each reload**

To ensure different recommendations every time a user refreshes the page, we will shuffle the recommendations.

<img width="489" height="27" alt="Screenshot 2026-06-19 at 13 33 02" src="https://github.com/user-attachments/assets/aebdac2b-f9aa-4aa3-a778-9892f583e46f" />

**If no watch logs present:**

The user will not be recommended any shows/movies and will be asked to log a previously watched show/ movie.

<img width="559" height="623" alt="Screenshot 2026-06-26 at 15 40 30" src="https://github.com/user-attachments/assets/4836fe0c-0e50-47a1-b374-7e71541f9d3e" />

### Section 2: Discovering a New Obsession

**1. Obtaining active genre**

The engine checks if the user has a calculated top genre (`topGenre`) saved on their Firestore user document from their personal watch log. If they are a new user with an empty watch history, it falls back to pulling their preferred choices from sessionStorage captured during the onboarding questionnaire.

<img width="758" height="309" alt="Screenshot 2026-06-20 at 17 17 49" src="https://github.com/user-attachments/assets/c0fa7840-6690-431e-bebf-b7936f54ee02" />

(Code snippet of getting active genre in getActiveGenre.ts)

**2. Fetching genre ID**

Users' top genre ID is fetched for reference.

**3. Discovering recommended shows/ movies and filtering results**

Movies and TV shows belonging to that specific top genre are selected, merged into a single array and filtered to exclude titles already in the user's watch log and titles not available for streaming in SG.

<img width="743" height="244" alt="Screenshot 2026-06-20 at 17 19 11" src="https://github.com/user-attachments/assets/947db77f-2c08-4072-a0b5-264b36f0458c" />

(Code snippet of discovering recommended titles in RecommendationsPage.tsx)

<img width="611" height="321" alt="Screenshot 2026-06-20 at 17 07 55" src="https://github.com/user-attachments/assets/e1f5f9e2-7b57-4047-b643-7fac0abccf8f" />

(Code snippet of the filtering process in filteringProcess.ts)

**4. Shuffling of recommendations in each reload**

To ensure different recommendations every time a user refreshes the page, we will shuffle the recommendations.

<img width="597" height="36" alt="Screenshot 2026-06-19 at 14 10 05" src="https://github.com/user-attachments/assets/3c3609ea-2c66-4882-bacc-9a5962cbbce9" />

**If no active genres found:**

If the user does not have a top genre from their personal watch log or a saved genre preference in their profile page, the user will not be recommended any movies/ shows.

<img width="565" height="623" alt="Screenshot 2026-06-26 at 15 40 57" src="https://github.com/user-attachments/assets/2f786073-29df-431c-ab47-e03dd5f5a744" />

### Improvements for Milestone 3

#### How We Have Improved the Filtering and Shuffling Process for Both Sections in Milestone 3:

* **Performance optimization on filteringProcess function**

To ensure performance is optimal, we made significant changes to the filtering process in filteringProcess.ts. Checking each item's SG streaming availability was originally done sequentially, one API call at a time inside a for loop. Thus the total wait time is scaled linearly with the number of recommended items. As such, our new filteringProcess checks platform availability concurrently using Promise.all so that the total wait time is only bounded by roughly a single round-trip regardless of how many items are being checked.

<img width="626" height="395" alt="Screenshot 2026-08-08 at 23 56 22" src="https://github.com/user-attachments/assets/3fb9a99b-d122-40c4-ba45-8556b513d5d2" />
 
(code snippet of the new filteringProcess.ts)

**Further improvement of filtering process after Milestone 3**

Since fetchPlatforms now accounts for rent, buy, and ad-supported availability (not just subscription streaming), titles that are only available to rent or buy are no longer incorrectly stripped out during filtering. We've also ensured recommendations exclude titles already in the user's Want to Watch list, by matching each candidate against a “type-id" key built from the Want to Watch list.

<img width="594" height="444" alt="Screenshot 2026-08-08 at 23 57 39" src="https://github.com/user-attachments/assets/a6aa6ff2-94fb-406d-b6b5-4e78c403e598" />

(code snippet of updated filteringProcess.ts)

* **Shuffle and cap before filtering**

Since only one recommendation card is displayed, checking platform availability for the entire raw result set was wasteful. The list of recommended items is now shuffled and capped to a fixed pool size of 12 (CANDIDATE_POOL == 12) before the filteringProcess runs. This reduces the number of network calls made per page load while still preserving randomized recommendations each reload.

<img width="718" height="149" alt="Screenshot 2026-08-08 at 23 58 23" src="https://github.com/user-attachments/assets/90e11cf9-030e-4451-90f5-fbc24b05c19e" />

#### How We Improved Overall Performance of Recommendations Generation

* **Ensuring Both Sections Run Concurrently**

Section 1 ('Based On Your Love For X') and Section 2 ('Discovering a New Obsession') are independent of each other. Originally, 2 sections were built to evaluate sequentially. Therefore the total load time was the sum of both sections' wait time. Now, each sections' logic has a self-contained async function ( buildShowCards(), buildGenreCards() for Section 1 and 2 respectively), allowing them to run concurrently using Promise.all.

<img width="557" height="91" alt="Screenshot 2026-08-08 at 23 58 49" src="https://github.com/user-attachments/assets/8ddc8af8-92cb-4541-8631-9fcd52e6e7f0" />

---
## Community Hub

### How it works
The Community Hub serves as the social platform within Binge Buddies, allowing users to share movie/ show recommendations, post reflections, and interact with other users through likes and comments. It creates a community driven recommendation experience where users can discover content based on real opinions from fellow viewers rather than algorithmic suggestions alone.

<img width="1439" height="733" alt="Screenshot 2026-06-26 at 15 57 58" src="https://github.com/user-attachments/assets/33260cfe-daec-4c76-b906-13c81c1b1e08" />

### Features
#### Creation of Reflection or Recommendation Post

Users are able to decide on 2 type of posts they would like to make:

| Post Type | What are Displayed on Feed | Contents to be Filled | Reasoning |
|---|---|---|---|
| Reflection | Custom Title, Personal Reflection, Timestamp, User Profile Information (username, photo) | Custom Title (mandatory), Personal Reflection (mandatory) | Allows users to share thoughts, opinions, or discussions about movies, TV shows, or general viewing experiences. |
| Recommendation | Searched Movie/ Show Title, Personal Recommendation, Timestamp, User Profile Information (username, photoURL) | Searched Movie/ Show Title (mandatory), Personal Recommendation (optional) | Allows users to recommend movies/ shows with other Binge Buddies users. |

<img width="891" height="337" alt="Screenshot 2026-08-09 at 00 01 18" src="https://github.com/user-attachments/assets/98bc42a6-d58c-427a-9129-af225e166727" />

When the user creates a recommendation post, users will search for a movie/ show to recommend. We will rely on a 400ms debounce buffer search. We will also rely on searchMovies service layer interface in tmdbService.ts. The raw JSON payloads returned from our internal backend `/search` proxy endpoint are funneled and mapped using the mapSearchDataToMovie utility function.

**mapSearchDataToMovie workflow**

genreMap is first used to convert genre IDs to strings. If ID is not found, it safely defaults to "Other". For safe deduction of media_type, the function checks if TMDB explicitly provided a media_type. If it is missing, it checks if first_air_date exists on the object as only TV shows use first_air_date. Else, it defaults to "movie" type. We will keep the platform as [] first to prevent mass-hitting APIs.

<img width="889" height="410" alt="Screenshot 2026-08-09 at 00 02 50" src="https://github.com/user-attachments/assets/c1ecf1f8-d372-40a8-ae90-f6716271729f" />

We have limited the search dropdown layout to show at most 6 titles to prevent the interface from being too cluttered and overwhelming.

<img width="642" height="298" alt="Screenshot 2026-08-09 at 00 03 29" src="https://github.com/user-attachments/assets/74d2412d-5040-4d15-95db-b5eb000b0bf8" />

The searched movie/ show is stored as selectedMedia.

Before a post can be submitted, canSubmitPost checks whether the post is complete. For recommendation posts, a selectedMedia must be present, an optional recommendation note can be added. For reflection posts, title and reflection content must be both filled.

<img width="497" height="211" alt="Screenshot 2026-08-09 at 00 04 15" src="https://github.com/user-attachments/assets/6092f59b-9a9b-4be7-a2e6-b8a5b36bde3d" />

(code snippet of canSubmitPost in communityUtils.ts)

handleCreatePost writes the new post to Firestore's posts collection. 

<img width="579" height="481" alt="Screenshot 2026-08-09 at 00 05 10" src="https://github.com/user-attachments/assets/7cf89fc7-4712-487d-965c-d66d76cfdf4d" />

(code snippet of handleCreatePost in CommunityPage.tsx)

The following table shows the fields stored in the `posts` collection on Firestore database.

| Field Name | Type | Details |
|---|---|---|
| `authorId` | String | The Firebase Auth uid of the post's author. |
| `authorName` | String | A frozen snapshot of the author's display name at the moment the post was created. Does not update automatically if they later change their username. The live-corrected name is resolved separately at render time via resolveAuthor logic function. |
| `authorPhotoURL` | String | A frozen snapshot of the author's display photo at the moment the post was created. Does not update automatically if they later change their profile picture. The live-corrected photo URL is resolved separately at render time via resolveAuthor logic function. |
| `type` | "reflection" or "recommendation" | Used to determine how the post is composed and displayed. Reflections are free-form text while recommendations are tied to specific titles via the media field. |
| `content` | String | Main body text input by user. This would be the optional note for the recommendation posts or the mandatory reflection content on reflection posts. |
| `createdAt` | Timestamp | We are using Firestore's Timestamp type. We will rely on formatTime logic function to improve time display in Binge Buddies. |
| `likedBy` | String[] | Array of Firebase uids for users who have liked the post. |
| `commentCount` | Number | The running total of comments on the post, incremented using Firestore's increment(1)/ increment(-1) operator whenever a comment is added or deleted. |
| `media` | Media | Media is a nested object, it is the selectedMedia on recommendation posts. Will be null for reflection posts. |
| `title` | String | For recommendation posts, the title is always taken from the selectedMedia. |

The table below shows the fields stored for `media` object on Firestore Firebase:

| Field Name | Type | Details |
|---|---|---|
| `id` | Number | The TMDB id of the movie/ show. |
| `mediaType` | “movie” or “tv” | Distinguishes whether it is a movie/ show. |
| `title` | String | The displayed title of the movie/ show returned by TMDB. |
| `year` | String | The release year of the movie/ show. |
| `posterURL`| String | URL of the poster image from TMDB. Returns null if TMDB has no poster for that title. |

**Live Post Subscription on Feed Instead of One Time Fetch**

To ensure the feed always reflects the latest state of every post, the feed uses onSnapshot rather than a single getDocs call. Unlike a one-time fetch, onSnapshot keeps an open connection to Firestore. Any changes on the posts collection (additions, deletions of posts, updates on like counts, updated comment counts) automatically pushes a fresh result back into the callback, and the feed re-renders to match. This ensures that users do not need to manually refresh the page to see the changes.

<img width="574" height="442" alt="Screenshot 2026-08-09 at 00 07 41" src="https://github.com/user-attachments/assets/da3b7ea4-8269-49b2-86c7-41025be42e16" />

(code snippet of live subscription of posts in CommunityPage.tsx)

The listener is cleaned up (unsub()) when the component unmounts, so it does not continue running and update state after the user navigates away from the page.

#### Deletion of Post

When a post is deleted, it is removed on Firestore and its comments are deleted too. The change is reflected in the feed automatically through the live subscription.

#### Resolving Author Information

Since `authorName` and `authorPhotoURL` are frozen onto a post at the moment it's created, a problem arises if a user later changes username or profile picture. To fix this, the Community Hub keeps a separate profiles state ({ uid: { username, photoURL } }) which is checked first whenever an author's name or photo needs to be displayed, falling back to the frozen values stored on the post only if no live profile is available.

**2 Sources for Profile Data**

1. User's own profile (live-synced)

The current user's own profile document is subscribed to live via onSnapshot, following the same real-time pattern used for the post feed. Any changes to the user's username or photo are reflected immediately, both in myPhotoURL (used when creating new posts) and in the profiles map.

<img width="588" height="406" alt="Screenshot 2026-08-09 at 00 09 51" src="https://github.com/user-attachments/assets/fb27f4d3-7bbe-4887-a574-802d52e99f68" />

(code snippet of the live subscription or user's own profile in CommunityPage.tsx)

2. Other users' profiles (fetched once)

Unlike the current user's own profile, other users' profiles are not subscribed to live. Instead, when a post or comment from a user not in profiles becomes visible (a new user adds a post when the page is still open), the new user's profile is fetched via getDoc. This avoids opening one live listener per visible author, which would scale poorly as more users post and comment.

<img width="734" height="544" alt="Screenshot 2026-08-09 at 00 11 26" src="https://github.com/user-attachments/assets/2cebd50b-6934-43d9-8e02-f6db3ea7765b" />

(code snippet of fetching profiles not loaded yet in CommunityPage.tsx)

Once fetched, a given user's profile is cached in profiles throughout the session. The tradeoff is that if another existing user that has already made a post on the Community Hub changes their profile (username or photo), that change would only be seen when the page is reloaded.

As such, resolveAuthor is the logic function that ties both sources together. It works identically regardless of whether the author is the current user or other users. The function prioritises `authorName` and `authorPhotoURL` from profiles[`authorId`] only fall back to frozen values on the post or comment if no live profile is available for that author.

<img width="596" height="225" alt="Screenshot 2026-08-09 at 00 12 32" src="https://github.com/user-attachments/assets/c0eedb7b-6594-42bd-9a07-8952d8e2a535" />

(code snippet of resolveAuthor in communityUtils.ts)

Within CommunityPage.tsx, we will use a wrapper.

<img width="548" height="99" alt="Screenshot 2026-08-09 at 00 13 19" src="https://github.com/user-attachments/assets/8bc52086-a5cb-46d2-ac50-948e7ecec1b6" /> 

#### Commenting

Every post has its own comment thread, stored as a Firestore subcollection (posts/{postId}/comments) instead of a field on the post itself. This ensures that comments can be queried and subscribed to independently. Posting a comment follows the same pattern as creating a post. A new document is written directly to Firestore's `comments` subcollection with `commentCount` incrementing by 1.

<img width="611" height="391" alt="Screenshot 2026-08-09 at 00 14 39" src="https://github.com/user-attachments/assets/51e0a553-840d-400a-b55f-2dba62c63235" />

(code snippet of handlePostComment in CommunityPage.tsx)

<img width="782" height="586" alt="Screenshot 2026-08-09 at 00 15 14" src="https://github.com/user-attachments/assets/73c7d8da-6488-42f6-9e0c-891181b776ac" />

**Live Comment Subscription**

Following the same real-time pattern used for the post feed, comments on the currently opened post are subscribed to live via onSnapshot and ordered in ascending order by creation time.

<img width="604" height="488" alt="Screenshot 2026-08-09 at 00 16 16" src="https://github.com/user-attachments/assets/b6f48972-bc47-4b03-87de-dff0fdefa0b2" />

(code snippet of subscription of comments on the currently opened post)

#### Deletion of Comment

When a comment is deleted, the post is not removed on Firestore but the comment gets removed from the `comments` subcollection. The change is reflected in the opened post automatically through the live subscription.
The number of comments shown on the comment icon is `commentCount` of a post and will be automatically updated when a comment is added or deleted.

<img width="661" height="352" alt="Screenshot 2026-08-09 at 00 17 08" src="https://github.com/user-attachments/assets/df10e4e0-b8b7-425b-8eef-964f7c683b2b" />

#### Liking a Post

Each post stores an array of Firebase uids (`likedBy`), representing every user who has liked it. When the user clicks on the like toggle button of a post, handleLike adds or removes the user's uid from that array, depending on whether they have already liked the post.

<img width="604" height="233" alt="Screenshot 2026-08-09 at 00 18 24" src="https://github.com/user-attachments/assets/ac2ff531-6733-4ffb-8561-2e193bc327d1" />

(code snippet of handleLike in CommunityPage.tsx)

The function checks whether the current user's uid is already present in `likedBy`, and uses Firestore's arrayRemove/ arrayUnion operators to update the array automatically. 

<img width="706" height="466" alt="Screenshot 2026-08-09 at 00 19 17" src="https://github.com/user-attachments/assets/f46db54a-e69a-4d5b-9992-140cde4db3e0" />

The number of likes shown next to the like button is the length of the `likedBy` array.

**Live Update of Likes**

Since the post feed is already subscribed live, the updated `likedBy` array appears automatically when Firestore confirms the write. This allows instant updates of the like count and button state.

<img width="680" height="279" alt="Screenshot 2026-08-09 at 00 19 55" src="https://github.com/user-attachments/assets/f5c3e477-af15-421a-92ef-5eea0f180f8c" />

#### Browsing the Feed

Users are able to browse other user's recommendations or reflection posts on the feed. There is also a search and filter feature for users to filter out posts they would like to view.

**Filtering by Type and Searching**

The feed can be narrowed down to 2 ways at once using filterPosts logic function:

*  Post type: all/ reflections/ recommendations. 
*  Free-text search: reflection post titles/ post content/ username/ recommendation post media titles.

<img width="746" height="371" alt="Screenshot 2026-08-09 at 00 20 26" src="https://github.com/user-attachments/assets/2d0946eb-cf91-483c-bdf6-1e0772325896" /> 

(code snippet of filterPosts in communityUtils.ts)

If both the filter and search are used at the same time, the post has to match the selected type and query.

**Trending This Week**

<img width="709" height="364" alt="Screenshot 2026-08-09 at 00 22 01" src="https://github.com/user-attachments/assets/7a4bec0c-4732-48ed-979c-839c2c87182f" />

The sidebar's "Trending This Week" card shows the top 3 most recommended titles, derived from the current set of recommendation posts. We use the computeTrending logic function.

<img width="597" height="249" alt="Screenshot 2026-08-09 at 00 22 20" src="https://github.com/user-attachments/assets/6c91eb09-0e47-4b00-b3f0-7fc955b0ffc9" />

(code snippet of computeTrending in communityUtils.ts)

Each recommendation post with a media (valid movie/ show) will be tallied in a lookup object with mediaType-id as the key since movie and TV shows may share the same numeric TMDB id. Once every valid recommendation post has been counted, the tallies are sorted by descending order and the ranked list is limited to return 3 movie/ show titles. This leaderboard updates automatically whenever new recommendation posts are added.

---

## Side-by-Side Comparison

### How it works
The Comparison Page allows users to pick any two movies or TV shows and compare their metrics side-by-side. This feature allows indecisive users to select two separate titles and evaluate them simultaneously on a single, unified dashboard without navigating back and forth between isolated media detail pages. It is designed to help users quickly weigh their options and decide what to binge next based on ratings, year, genres, synopsis and streaming availability.

Users can toggle focus between two selection slots. Searching for a title queries live data from the TMDB multi-search engine. Once both slots are filled, clicking the "Compare" button generates a detailed grid evaluating metrics like ratings, year, genres, synopsis and streaming availability side-by-side.

<img width="880" height="349" alt="Screenshot 2026-08-09 at 19 29 03" src="https://github.com/user-attachments/assets/182c75ce-8898-4382-96e7-1b40356f1fda" />

<img width="989" height="755" alt="Screenshot 2026-08-09 at 19 35 02" src="https://github.com/user-attachments/assets/53afd6b7-6a5b-431c-a57e-9187899d452c" />

### Step-by-Step Data Flow and Component Execution

**1. Input Buffering (Debounced Search)**

When the user types into the search bar to search for a show/movie to compare, we will rely on a 400ms debounce buffer search to avoid hammering the TMDB API endpoints with a network request on every single keypress. Only when the user pauses typing does the application execute the active query handler.

We will also rely on searchMovies service layer interface in tmdbService.ts by routing queries through a secure internal backend proxy. The input parameter, query (string) is the text string entered by the user.

The raw JSON payloads returned from our internal backend `/search` proxy endpoint are funneled and mapped using the mapSearchDataToMovie utility function.

**2. Slot Ingestion and its Logic**

When the user selects a show/movie to be compared, the system invokes the handleSlotSelection workflow.

<img width="583" height="277" alt="Screenshot 2026-07-09 at 14 57 23" src="https://github.com/user-attachments/assets/4f579fbd-f02d-4c2f-9a47-1c0afdc5969a" />


#### `handleSlotSelection` workflow

It first requests a valid Firebase user authentication token via `getIdToken()`. It then calls `fetchPlatforms` service layer function to pull localized SG subscription platforms. If a movie is a brand-new release or not available
 on standard platforms in SG (returning an empty array), the function intercepts this and injects a fallback array:["Not currently available in SG"]. This ensures the UI never renders a broken or completely blank layout. 

The function calculates the next step to ensure seamless shifting of slots when choosing the next title to compare.
* If Slot 0 is filled and Slot 1 is empty, the active slot will become Slot 1 so that users can immediately type the next title without having to manually click to the next comparison box.
* If Slot 1 is already filled, it keeps focus right where it is to prevent users from jumping around erratically when replacing a title.

<img width="877" height="559" alt="Screenshot 2026-08-09 at 19 38 20" src="https://github.com/user-attachments/assets/5dda4fc6-1b98-4f96-8bc2-3f5dc16952a0" />

Once a show/movie is selected, the active search input string is flushed, the 6 matching dropdown items is wiped out from local memory and the overlay menu viewport is closed. 

<img width="1442" height="754" alt="Screenshot 2026-07-09 at 15 30 14" src="https://github.com/user-attachments/assets/3da3d792-55db-438a-86fb-0f5990ada432" />

(Example of one title searched and how the second slot is highlighted for the next search)

**3. Reversible Slot State**

If users changes their mind, clicking the "X" button triggers `removeMovie`. This function duplicates the slot state, resets the chosen slot back to null and focuses the cursor onto the slot that was cleared, eliminating extra click for the user if they want to replace the title. 

<img width="537" height="140" alt="Screenshot 2026-07-09 at 15 36 29" src="https://github.com/user-attachments/assets/19e1ba80-cad3-4f38-9e42-80269cb3e016" />

When both slots are filled, the compare button becomes more visible for users to click on. 

<img width="1462" height="747" alt="Screenshot 2026-07-09 at 15 37 00" src="https://github.com/user-attachments/assets/b024fe22-845f-45c7-940b-a997ff2a3856" />

---

## Want To Watch List (extension feature)

### How it works

Another new feature that sets Binge Buddies apart from existing applications is the Want To Watch List feature. This feature allows users to save movies/ shows recommended to them from the Recommendations Page to their Want To Watch List on their Home Page. When users have watched any title from their Want To Watch List and logged their reflections in their Personal Watch Log. The title will be automatically removed from their Want To Watch List. Users are also able to manually add or remove titles from their Want To Watch List for greater flexibility.

<img width="851" height="456" alt="Screenshot 2026-08-09 at 19 40 54" src="https://github.com/user-attachments/assets/2e1dadbf-adea-431d-8816-2765bdc0b357" />

<img width="880" height="435" alt="Screenshot 2026-08-09 at 19 41 59" src="https://github.com/user-attachments/assets/0b109b6b-75a5-46fd-a55b-d88cc674e356" />

### Step-by-Step Work Flow

**1. Authentication Guard**

 Binge Buddies first secures a valid session by invoking getIdToken() to verify user authentication. 

**2.Database Synchronisation** 

It then fetches the user's saved want to watch items from Firebase Firestore using the getUserWantToWatchList service layer function.

(code snippet of getUserWantToWatchList in tmdbService.ts)

**3. Local State Initialization** 

The returned data is committed to the local React state via setWantToWatchList. If a list exists, it populates the state. Otherwise, it returns an empty array ([]).

**4. Dynamic Toggle Controller**

When a user clicks on the "Add to Want to Watch List" button for a recommendation item, handleAddToWantToWatch logic function is called. This function takes in the item, consisting {`id`, `type`} and compares it with the local state array.

* Removal Path: If the item with a matching ID and type already exists in `wantToWatchList`, alreadyInList === true, the function filters it out of the array to handle a removal request
* Addition Path: If the item is not in `wantToWatchList`, it appends the new {`id`, `type`} object to create an `updatedList`.

The updatedList is then used to update the local React state and the Firebase Firestore database using setWantToWatchList and saveUserWantToWatchList respectively.

<img width="883" height="422" alt="Screenshot 2026-08-09 at 19 44 08" src="https://github.com/user-attachments/assets/19fdd527-3e8e-40d5-8801-087c400f8b1f" />

(code snippet of handleAddToWantToWatch in handleAddToWantToWatch.ts)

<img width="833" height="214" alt="Screenshot 2026-08-09 at 19 45 03" src="https://github.com/user-attachments/assets/de511525-01a6-4dd0-8ac0-b744cf10bd95" />

(code snippet of saveUserWantToWatchList in tmdbService.ts)

**5. Want To Watch List Sync Logic in Home Page**

We will rely on the mapping of items in the `watchList` fetched from cloud Firebase Firestore to a unique "type-id" string to filter unique items in the `wantToWatchList` that are already in the `watchList`. Storing it as a set allows to perform lookups in O(1) constant time instead of scanning arrays repeatedly. 

After fetching and filtering the `wantToWatchList` using watchedkeys, duplicate items (in both `watchList` and `wantToWatchList`) is removed from `wantToWatchList` in backend database using removeFromUserWantToWatchList service layer function. 

<img width="923" height="363" alt="Screenshot 2026-08-09 at 19 46 38" src="https://github.com/user-attachments/assets/0f818137-71a7-4dc8-b16c-dbd8df8009cb" />

(code snippet of the Want To Watch List syncing logic in HomePage.tsx to ensure logged titles are not shown in the Want To Watch List.)

<img width="886" height="199" alt="Screenshot 2026-08-09 at 19 47 13" src="https://github.com/user-attachments/assets/0d4ea35d-47eb-4d61-949b-911fa329e1db" />

(code snippet of removeFromUserWantToWatchList in tmdbService.ts)

For the remaining items in the users' Want To Watch List, they are displayed as mini-cards displaying the poster image and title. If there are no items in the Want To Watch List, the empty state is displayed.

<img width="950" height="353" alt="Screenshot 2026-08-09 at 19 47 37" src="https://github.com/user-attachments/assets/fc4e6ede-2ec4-4fe6-94b7-34f2d223ad98" />

**Manual Adding and Removal of Titles in Want To Watch List**

Users have the option to add movies/ shows from the Want To Watch List on the Home Page using a search bar. Click “Add” to add the title to the Want To Watch List and “x” to remove.

<img width="611" height="278" alt="Screenshot 2026-08-09 at 19 48 11" src="https://github.com/user-attachments/assets/48992243-1643-47c7-9b3a-0020473241c5" />

<img width="888" height="348" alt="Screenshot 2026-08-09 at 19 48 26" src="https://github.com/user-attachments/assets/aedb3409-e58d-4dad-bb1c-ce1ecc74b1a7" />

<img width="891" height="270" alt="Screenshot 2026-08-09 at 19 48 49" src="https://github.com/user-attachments/assets/d43cf2ef-44aa-4178-9710-eaa04b717420" />

Manual addition and deletion will be synced to the `wantToWatchList` on cloud Firestore database.

---

## Social Connection Hub (extension feature)

### How it works
The Social Connection Hub is a social feature within Binge Buddies, designed to bring movie and TV enthusiasts together. Instead of watching alone, users can discover other users who want to watch the same titles they do, view their taste at a glance, and reach out directly to plan a watch session.

The hub is built as an **opt-in** feature. A user only appears to others once they have explicitly chosen to be discoverable from their profile page, and matches are only formed between users who share at least one title on their **Want To Watch** list. This keeps the experience relevant (you only see people with overlapping taste) while giving each user full control over their own visibility.

<img width="989" height="750" alt="Screenshot 2026-08-09 at 19 49 43" src="https://github.com/user-attachments/assets/097a305d-d067-43f5-acd4-6c72c178c5cc" />

### Opting In
Discoverability is controlled by a single toggle in the **Account Info** tab of the profile page. When a user turns it on, a disclaimer makes clear that turning it on makes their binge buddy contact visible to everyone they match with. The choice is written immediately to Firebase Firestore as a `bingeBuddyOptIn` boolean on the user document.

* **Opted in:** the user's username, binge buddy contact, top genre and shared want-to-watch titles become visible to anyone they match with.
* **Opted out (default):** the user does not appear on anyone's hub, and no information is shared.

<img width="891" height="531" alt="Screenshot 2026-08-09 at 19 50 55" src="https://github.com/user-attachments/assets/10be4485-bb3b-43cd-bf0f-c66a2c34bbec" />

A user's own opt-in status is read directly from Firestore when the hub loads, so the page can prompt users who have not yet opted in to do so from their profile.

### The Binge Buddy Contact
Alongside the opt-in toggle, users can save an optional **Binge Buddy Contact** so matched users have a way to reach them. It is stored as two fields — `contactType` and `contactValue` — and supports Instagram, Telegram, Discord, and Email. On a buddy card, the handle is rendered as a clickable link where possible:

| Contact Type | Rendered As |
|---|---|
| Instagram | `@handle` linking to `https://instagram.com/{handle}` |
| Telegram | `@handle` linking to `https://t.me/{handle}` |
| Email | the address linking via `mailto:` |
| Discord | the handle shown as plain text (Discord has no public profile URL) |


<img width="682" height="363" alt="Screenshot 2026-08-09 at 19 51 57" src="https://github.com/user-attachments/assets/da870119-a817-4419-9257-f63c1a1bd7c1" />

(code snippet of buildContactLink in buildContactLink.ts)

Leaving the contact blank is allowed — the card simply shows "No contact shared."

<img width="924" height="546" alt="Screenshot 2026-08-09 at 19 52 36" src="https://github.com/user-attachments/assets/c874b0dc-adbd-4715-a50e-d82df76743a4" />

### What a Buddy Card Displays
Each match is rendered as a card showing:

| Field | Source |
|---|---|
| Username | Firestore user document |
| Profile picture | Firestore `photoURL` (falls back to a letter avatar) |
| Top genre | Reused from the user's Personal Watch Log calculation |
| Binge Buddy Contact | Firestore `contactType` / `contactValue` |
| Titles in common | The shared entries on both users' Want To Watch lists, shown as posters |

<img width="1073" height="575" alt="Screenshot 2026-08-09 at 19 53 10" src="https://github.com/user-attachments/assets/21654a38-011f-4d3e-ad9d-e74338d3d88c" />

### How Matches Are Generated
The hub is powered by the `getBingeBuddies` service layer interface, which calls the backend `GET /api/users/binge-buddies` endpoint. 

<img width="613" height="263" alt="Screenshot 2026-08-09 at 20 50 04" src="https://github.com/user-attachments/assets/7948ca2a-79ce-49d5-84ff-5ec5e2a5ee9f" />

(code snippet of getBingeBuddies in tmdbService.ts)

The matching logic runs as follows:

1. **Load the current user's Want To Watch list.** If it is empty, the user is prompted to add titles first, as matches are based on shared Want To Watch titles.

<img width="704" height="380" alt="Screenshot 2026-08-09 at 20 51 04" src="https://github.com/user-attachments/assets/37cd94ef-fb23-452a-bd2f-1d1ddcf45909" />

2. **Make a quick-reference list** of the titles on the current user's Want To Watch list, so each one can be checked against other users instantly.
3. **Scan all users**, skipping the current user and anyone who has not set `bingeBuddyOptIn` to true.
4. **Compute the overlap** between each opted-in user's Want To Watch list and the current user's set, collecting the shared titles.
5. **Keep only users with at least one shared title**, attaching their username, profile picture, contact, top genre and the list of shared titles.
6. **Rank the matches** by the number of titles in common, so the most compatible binge buddies appear first.

<img width="791" height="707" alt="Screenshot 2026-08-09 at 20 52 47" src="https://github.com/user-attachments/assets/a8c8bdf6-d6e8-451d-91fa-15d7a6d45c42" />

(code snippet of computeBingeBuddiesMatches function in computeBingeBuddiesMatches.js)

The poster and title for each shared item are then resolved from TMDB (getMovieDetails / getTVShowDetails) and cached so repeated titles across cards are only fetched once.

### Top Genre
The top genre shown on a buddy card is the same value surfaced on the user's Personal Watch Log, computed using the genre frequency weighting described in the Watch Log section. Because the watch log stores only lightweight identifiers, the computed top genre is persisted to the user's Firestore document (`topGenre`) whenever they view their watch log, so it can be displayed to other users on the hub without recomputation. Users who have not yet built up a watch log simply show as not having a top genre set.

### Firestore Fields
The Social Connection Hub introduces the following fields on the user document:

| Field Name | Type | Details |
|---|---|---|
| `bingeBuddyOptIn` | Boolean | Whether the user has opted in to being discoverable on the Social Connection Hub |
| `contactType` | String | The platform for the binge buddy contact (instagram, telegram, discord, or email) |
| `contactValue` | String | The handle or address other users use to reach them; blank if not shared |
| `topGenre` | String | The user's top genre, persisted from the Personal Watch Log calculation |

---
## Direct Messaging (extension feature) 

### How it works

Users can communicate directly with one another within Binge Buddies, making it easier to connect with fellow movie and TV enthusiasts without leaving the platform. 

<img width="543" height="328" alt="Screenshot 2026-08-09 at 20 56 50" src="https://github.com/user-attachments/assets/5d7a319f-ff08-4600-a1d5-d4e8fbad2606" />

<img width="875" height="455" alt="Screenshot 2026-08-13 at 00 55 13" src="https://github.com/user-attachments/assets/50fe0513-ba37-4aa5-bda9-1ef8d1346d6e" />

Messages Inbox page with all past conversations with user’s Binge Buddies.

### Key Features

* Real-time one-to-one messaging between users
* In-app conversations without needing external contact details
* Seamless communication after discovering users through the social community hub
* Messages are accessible only to the participants in the conversation

<img width="681" height="412" alt="Screenshot 2026-08-09 at 20 58 43" src="https://github.com/user-attachments/assets/58501025-c679-46c1-9892-16c620b8254b" />

Image of private chat when user clicks on a chat conversation

### Why we added it

Previously, Binge Buddies allowed users to share external contact information such as Instagram, Telegram, Discord, or email. This required users to leave the platform and raised privacy concerns.
The new Direct Messaging system keeps conversations entirely within Binge Buddies, creating a smoother, safer, and more integrated social experience. 
While our in-app private messaging makes chatting seamless, we believe that true connection should not be constrained. Users are still given the autonomy to contact their Binge Buddy outside of our app by sharing their external contact information on the Social Connect Hub.

### Data Model

Conversations are stored one document per pair of users at `conversations/{convId}`. The convId itself is generated deterministically and is order-independent. This ensures that both users will land on the same conversation no matter who messages first. 

<img width="471" height="57" alt="Screenshot 2026-08-09 at 21 03 35" src="https://github.com/user-attachments/assets/3817317d-e008-41d4-be6e-22eb19e394f2" />

(code snippet of conversationId in messagesService.ts)

Each conversation documents enough information to render the inbox without extra reads. 

| Field | Type | Details |
|---|---|---|
| `id` | string | Document ID which is equivalent to conversationId(uidA, uidB). |
| `participants` | string[] | The two user IDs in the conversation. |
| `users` | Record<string, UserInfo> | Denormalized username/ photo snapshot for both users. |
| `lastMessage` | string | Preview text shown in the inbox (max 500 characters). |
| `lastMessageAt` | Timestamp or null | When the last message was sent, null briefly while the server timestamp resolves. |
| `unread` | Record<string, number> | Per-user unread message counter. |

The UserInfo shape referenced above is a small denormalized snapshot used by both users.

| Field | Type | Details |
|---|---|---|
| `username` | string | Display name shown in the inbox and chat header. |
| `photoURL` | string or null | Profile photo URL or null to fall back to the initial avatar. |

The full message history for a conversation lives in a nested Firestore subcollection, `conversations/{convId}/messages/{messageId}`, ordered oldest-first:

| Field Name | Type | Details |
|---|---|---|
| `id` | string | Message document ID. |
| `text` | string | Message body (max 2000 characters). |
| `senderId` | string | UID of sender. |
| `createdAt` | Timestamp | When the message was sent, null briefly while the server timestamp resolves. |

### Sending a Message

Sending a message performs two writes directly to Firestore. Firstly, the `conversation` document is upserted via setDoc so its preview fields stay current and the recipient’s unread count is incremented. Secondly, the message is appended to the `messages` subcollection via addDoc.

<img width="755" height="612" alt="Screenshot 2026-08-09 at 21 12 46" src="https://github.com/user-attachments/assets/4e6d0679-5126-4f7c-adc5-c54ed8ba22bf" />

(code snippet of sendMessage in messagesService.ts)

{merge: true} ensures that setDoc updates the conversation document rather than replacing it. The conversation preview text is capped at 500 characters while the full message body stored in `messages` subcollection is capped up to 2000 characters. 

### Realtime-sync (Firestore listeners)

Both the inbox and an open chat rely on onSnapshot real-time listeners. This ensures that Binge Buddies does not poll or manually re-request data. Firestore pushes updates to the client when a document changes. This allows new messages to appear on both user’s screens instantly without refreshing.

<img width="752" height="264" alt="Screenshot 2026-08-09 at 21 14 07" src="https://github.com/user-attachments/assets/1a9bf466-2d71-4d4c-b64b-69f8d37ecc93" />

Conversations are sorted from most to least recent on the client side. When a message is sent, serverTimestamp() has not yet been resolved, so the client briefly sees lastMessage as null. Rather than treating it as the oldest conversation, it is treated as the most recent. This ensures that the conversation does not visually jump to the bottom of the inbox before snapping back to the real timestamp.

<img width="630" height="56" alt="Screenshot 2026-08-09 at 21 15 35" src="https://github.com/user-attachments/assets/2d6a7e63-5963-45ec-a2f1-c346cc2409e1" />

(code snippet of millis in messagesService.ts)

### Unread tracking and read receipts

Sending a message increments the recipient's unread count directly in Firestore using increment(1) field operator. Opening a chat calls markConversationRead, which writes the current user's unread count back to 0 in Firestore for that conversation.

<img width="673" height="150" alt="Screenshot 2026-08-09 at 21 16 19" src="https://github.com/user-attachments/assets/a7f59dd5-b5e3-4b9f-a992-c51b54077a68" />

(code snippet of markConversationRead in messagesService.ts)

### Optimistic Reading 

When a user presses Send, the message input clears immediately without having to wait for Firestore write to complete. If the write fails, the previously typed text is restored into the input.

<img width="617" height="376" alt="Screenshot 2026-08-09 at 21 17 16" src="https://github.com/user-attachments/assets/11b61019-ca60-4243-b13f-fd0998261ae9" />

(code snippet of handleSend in MessagesPage.tsx)

### Inbox search and filtering

Searching the inbox is not limited to people you have already messaged. Any matching user who is not already in an existing conversation is surfaced under a "Start a new conversation" section, and clicking on them opens a brand new private chat with that user. Users you already have a conversation with are instead matched against your existing inbox.

Among your existing conversations, the list is filtered client-side in a case-insensitive way by matching the other user’s username only — the last message preview is deliberately excluded from the search so the search always stays focused on finding a user. There is also a toggle for viewing all conversations versus only unread ones.

<img width="731" height="169" alt="Screenshot 2026-08-13 at 00 52 58" src="https://github.com/user-attachments/assets/677e92d8-1f3c-46a5-97a9-9143623956a3" />

### Shared Utils

The initial function, derives a fallback avatar letter from a user’s name whenever the user does not have a profile photo. 

<img width="637" height="30" alt="Screenshot 2026-08-09 at 21 20 30" src="https://github.com/user-attachments/assets/997dfa52-1a5c-4392-850e-4ad759dfa651" />

(code snippet of initial in getInitial.ts)

The fmtTime function formats the Firestore timestamp into a readable display time and safely returns an empty string if the timestamp has not been resolved from the server. 

<img width="670" height="131" alt="Screenshot 2026-08-09 at 21 21 10" src="https://github.com/user-attachments/assets/6f620122-ca4d-4eb4-aef0-57678e38edb6" />

(code snippet of fmtTime in messagesUtils.ts)

---
## SWE Practices 

* **Security & Environment Isolation (Backend Proxy Architecture):** All microservice credentials and external API tokens (eg. TMDB API tokens) are securely isolated in environment variables (.env/ Render environment config). Rather than making direct client-side requests to third -party services, all calls are routed through our backend Express proxy layer (/api/tmdb/*) on port 5005. This abstracts external API interactions, normalizes response payloads, and guarantees that sensitive credentials never reach or leak into the public client browser. 

* **Component Based Development:** Reusable components such as MovieCard and Sidebar were created to reduce code duplication, improve maintainability, and allow consistent UI design across multiple pages.

* **Type Safety with TypeScript:** TypeScript was used to catch errors during development and improve code reliability. We defined interfaces and types for the TMDB API responses and application data using typescript.

* **Version Control and Branching Workflow:** During Milestone 3, team development followed a feature-branching strategy. Isolated Git branches were used for individual features and bug fixes before being integrated via Pull Requests, maintaining main branch stability.

---
## Development Plan

| Period | Tasks |
|---|---|
| Week 1–2 | Github repository set up, Finalised Lift-off.|
| Week 3 | Creation of Mockup.|
| Week 4–5 | A minimal working system with both frontend and backend integrated for the User Authentication.|
| Week 6–7 | Implementation of the Personal Watch Log and Cross-Platform Recommendation Feature. |
| Week 8–9 | Implementation of the Side-by-Side Comparison Feature.|
| Week 10–11 | Implementation of the Community Hub.|
| Week 12 | Testing and Debugging. Addition of extension features.|

---

## How to run the app locally

Users can try out the live, fully functional Binge Buddies App using the link below:

https://binge-buddies-17abf.web.app 

We advise accessing the app on your laptops for better user experience.

### Running Binge Buddies Locally

#### Prerequisites

Do contact us if you would like to run the Binge Buddies app locally.

Before running the project, ensure you have the following installed:

* Node.js (v18 or later recommended)
* npm (comes with Node.js)
* A Firebase project with Authentication and Firestore enabled
* A TMDB API key

#### 1. Clone the Repository

git clone https://github.com/SakshiVashist/Binge-Buddies-Orbital-26.git

cd Binge-Buddies-Orbital-26

#### 2. Configure Environment Variables

Copy the example environment files (use `copy` instead of `cp` on Windows PowerShell):

cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

Open `frontend/.env` and replace the placeholder values with your own Firebase web configuration (the 7 `VITE_FIREBASE_*` keys).

Open `backend/.env` and replace the placeholder values with:

* `TMDB_API_KEY`: Your TMDB API key.
* `FIREBASE_SERVICE_ACCOUNT`: The full JSON of your Firebase service-account private key, used by the backend to verify requests. Locally, the backend also falls back to the `*.json` file beside `config/firebase.js` if this variable is not set.
* `FIREBASE_API_KEY`: Your Firebase web API key, used to verify passwords during the change-password flow.
* `PORT`: Backend port (defaults to 5005).

#### 3. Install Dependencies

Install the required packages for both the frontend and backend.

Frontend:
cd frontend
npm install

Backend:
cd ../backend
npm install

#### 4. Start the Backend

From the `backend` directory:

npm run dev

#### 5. Start the Frontend

Open a new terminal and run:

cd frontend
npm run dev

The application will be available at:

http://localhost:5173

Open the application in your browser, create an account (or log in), and start exploring Binge Buddies.

---

## Testing 

### Unit Testing 

We will be using Vitest to test individual functions. 

#### Service Layer Functions (tmdbService.ts) 

| Function | File Name | What to Test |
|---|---|---|
| getPosterUrl | tmdbService.ts | Verify if it constructs the full TMDB image URL when given a valid poster path, and returns an empty string when the path is empty or undefined. |
| getRecommendations | tmdbService.ts | Verify if it returns the results array when the API call succeeds. If API is unavailable or returns an error, it fails by returning { results: [] }. |
| fetchPlatforms | tmdbService.ts | Verify if it correctly extracts and returns provider names from the `flatrate` array in the TMDB Watch Providers response for the SG region. Returns an empty array when flatrate is missing or when the API response is not ok. |
| discoverByGenre | tmdbService.ts | Verify if it returns a results array when given a valid genre ID and media type, and returns an empty array when the API call fails. |
| searchMovies | tmdbService.ts | Verify if a valid query returns a populated results array and automatically URL-encodes special characters. Empty array is returned for invalid searches and an exception will be thrown during network failures. |
| getBingeBuddies | tmdbService.ts | Verify if the function sends the correct request to fetch a user’s binge buddy matches, returns the parsed response on success and returns a safe fallback when request fails. |
| conversationId | messagesService.ts | Verify if the function returns the same joined id regardless of argument order, and that it always joins with "__". |
| sendMessage | messagesService.ts | Verify if it skips writing when text is empty/ whitespace, correctly upserts the conversation doc (participants, users, last message, timestamp), bumps the recipient’s unread count while leaving the sender’s untouched. Truncates lastMessage to 500 characters and the stored message test to 2000, and appends the messages to messages subcollection. |
| markConversationRead | messagesService.ts | Verify if the function sets the given user’s unread count to 0 on the correct conversation doc. |
| subscribeConversations | messagesService.ts | Verify if the function queries conversations where the user is a participant, correctly maps and sorts snapshot results by most recent activity and returns a working unsubscribe function. |
| subscribeMessages | messagesService.ts | Verify if it queries the correct messages subcollection ordered oldest-first and correctly maps snapshot into Message objects in that order. |

#### Logic Functions (src/services)

| Function | File Name | What to Test |
|---|---|---|
| filteringProcess | filteringProcess.ts | Verify if the function correctly excludes titles already in user’s Want To Watch List, Watch Log and titles not available in SG. The function should also attach platform data to titles that pass and check availability for each candidate independently. |
| getTopGenre | getTopGenre.ts | Verify if the correct top genre is returned based on the genre frequency weighting calculation. |
| mapToCard | mapToCard.ts | Verify if the functions correctly transform TMDB show/ movie data into a standardised card format. |
| getActiveGenre | getActiveGenre.ts | Verify if users' Top Genre from personal watch log is chosen, if not one of the genre preferences in the profile page. Returns "None" if no logs or preferences are saved.|
| getSeedItem | getSeedItem.ts | Verify if the function returns the top log entry of users' personal watch log based on its genre and personal rating. If no logs present, null is returned. |
| mapSearchDataToMovie | mapSearchDataToMovie.ts | Verify if it correctly transforms raw TMDB show/movie data by mapping fallback naming structures, extracting parsed years and mapping at most 3 genre IDs to strings. Furthermore, it should correctly  infer mediaType accurately using conditional checks and returns default fallback ("N/A"/ "No description available") for missing texts. |
| handleSlotSelection | handleSlotSelection.ts | Verify if the function fetches Singapore streaming platforms of the selected title, handles missing platform availability and correctly evaluates the next active slot for user focus.|
| handleAddToWantToWatch | handleAddToWantToWatch.ts | Verify if the function updates the user's Want To Watch List by adding new titles, excluding existing ones, and enforcing security by halting execution if the user is unauthenticated. |
| formatTime | communityUtils.ts | Verify every unit boundary (60s > min, 60 min > hr, 24hr > day, 7days > date) is drawn in the right place, and singular/ plural grammar is corrected at each unit. |
| computeTrending | communityUtils.ts | Verify that the function excludes reflection posts from trending, applies correct grouping, uses the proper deduplication key, ranks items correctly, and limits the display to three trending items. |
| resolveAuthor | communityUtils.ts | Verify if the function deduces the correct photoURL and name of a user's profile when username or photo is changed. |
| canSubmitPost | communityUtils.ts | Verify if the function correctly evaluates the validity of reflection and recommendation posts while treating whitespace-only input as "empty". |
| filterPosts | communityUtils.ts | Verify if every field (reflection post title, recommendation post movie/ tv titles, post content, username) gets checked and filtered correctly during searching while handling case sensitivity. Type-filtering and text-search should compose correctly together rather than override each other. |
| computeBingeBuddiesMatches | computeBingeBuddiesMatches.js | Verify if the function correctly matches the current user with opted-in users who share Want To Watch titles, correctly computes and deduplicates shared titles, only exposes contact information when a value is present and rank matches based on the number of shared titles. |
| buildContactLink | buildContactLink.ts | Verify if the function correctly builds a display label and clickable link for each supported contact type (Instagram, Telegram, Email), strips leading “@” from handles, and trims whitespace. |
| fmtTime | messagesUtils.ts | Verify if the function correctly formats a valid Firestore timestamp into a readable time string. |
| initial | getInitial.ts | Verify if the function correctly returns the uppercased first letter of a name. |

### System Testing

We will carry out manual system testing.

| Flow | What to Test |
|---|---|
| Authentication Flow |  Verify if an unauthenticated user is redirected to `/login`. Authenticated users are redirected to `/home`. New users after signup are directed to `/onboarding` and then to `/home`. |
| Watch Log Flow | Verify if results appear when users search for titles. Titles added will be shown in the log page and a duplicate title shows will result in an alert. Saved logs are updated in the live cloud firestore database. |
| Recommendations Flow | Verify if both "Based on your love for X" and "Discovering a new obsession" cards are shown. | 
| Side-by-Side Comparison Flow | Verify if users are able to search for titles, fill up comparison slots and hit compare. |
| Personal Details Update Flow | Verify if users' password and preferences are updated on the live cloud firestore database when users change them. |
| Want To Watch List Update Flow | Verify that when users add a title from the Want To Watch List to the Watch Log, that title is automatically removed from the Want To Watch List in cloud firestore, and that titles are added to the Want To Watch List when the user selects them from the Recommendations page. |
| Social Connection Hub Flow | Verify that opted-in users with matching titles on their Want To Watch List have their profiles displayed to one another. Confirm that clicking the “Message” button successfully redirects the user to the Messages page and opens a private chat thread with that user. |
| Direct Messages Flow | Verify that the Messages page displays all past private chats across different users. Confirm that clicking a conversation opens its message thread, and that newly sent messages are successfully received by the target user. |

### User testing (by Milestone 3)

We conducted usability testing with a cohort of 20 individual users to evaluate the application's user interface, discoverability, and end-to-end user experience. The full plan and results are detailed in the Evaluation section below.

### CI/ CD Testing

Binge Buddies uses GitHub Actions to automate code validation and deployment, ensuring that every code change is tested before being released.

#### Continuous Integration (CI)
The CI pipeline is triggered on every push and every pull request. It automatically performs the following checks:
* Installs project dependencies (npm ci)
* Builds the frontend using Vite and TypeScript
* Runs the complete test suite using Vitest
* Performs backend JavaScript syntax validation
* Executes ESLint to identify code quality and style issues (currently configured as non-blocking while existing lint issues are being resolved)
  
This automation helps detect build failures, syntax errors, and failing tests early, reducing the likelihood of introducing regressions into the codebase.

#### Continuous Deployment (CD)

The CD pipeline is triggered whenever changes are pushed to the main branch.
Once the CI checks complete successfully, GitHub Actions automatically:
1. Installs dependencies
2. Builds the production version of the application
3. Deploys the latest version to Firebase Hosting
   
This eliminates the need for manual deployment and ensures that the live application is always updated with the latest stable version from the main branch.

#### Benefits

* Automated verification of every code change
* Early detection of build and test failures
* Consistent deployment process
* Reduced risk of introducing broken code into production
* Faster and more reliable software delivery

----

## Evaluation 

### Unit Testing 

#### Service Layer Functions (src/services) 

**tmdbService.ts**

**`getPosterUrl`**

<img width="574" height="218" alt="Screenshot 2026-06-23 at 16 27 11" src="https://github.com/user-attachments/assets/e61fbed5-ed5b-456c-b1c3-0a2cf51d25f4" />

(code snippet of test in tmdbService.test.ts)

We have used "/abc123.jpg" to test if the function returns a full TMDB image URL. Empty string is returned if there is no valid path ("").

**`getRecommendations`**

<img width="679" height="517" alt="Screenshot 2026-06-23 at 16 27 37" src="https://github.com/user-attachments/assets/de4d3c7c-0665-4235-960a-f0ab49e1cb16" />

(code snippet of test in tmdbService.test.ts)

Since the function makes a real HTTP request to the backend, we used mocked fetch to simulate API response without needing the backend or TMDB API to be running. A successful response returns a fake array, { results: [{ id: 1, title: "Dark" }] }. A failed response or a network error returns { results: [] }.

**`fetchPlatforms`**

<img width="665" height="641" alt="Screenshot 2026-06-23 at 16 27 59" src="https://github.com/user-attachments/assets/be8e3980-8f3f-4f91-84d6-902f94848a15" />

(code snippet of test in tmdbService.test.ts)

Since the function makes a real HTTP request to the backend, we used mocked fetch to simulate API responses without needing the backend or TMDB API to be running. It also allows us to test specific scenarios like a missing flatrate field. A successful response with a fake flatrate array containing Netflix and Disney+ returns the provider names as a string array, ["Netflix", "Disney+"]. A successful array with no flatrate field or a failed response returns empty array []. 

**Additional Test Cases for Updated fetchPlatforms function**

Since our new fetchPlatforms now extracts and merges platform availability across all access models including rental (rent), purchase (buy) and ad-supported (ads), we have extended coverage beyond existing test cases to verify correct behavior when merging providers across all 4 categories (flatrate, rent, buy, ads). This includes de-duplicating providers that appear in multiple categories, filtering out entries with missing non-string provider_name values, returning an empty array when fetch throws and ensuring that request is sent to the correct URL with the proper Authorization header.

<img width="846" height="652" alt="Screenshot 2026-08-09 at 22 06 30" src="https://github.com/user-attachments/assets/71a35a3d-68be-43ee-b890-2a25267cf714" />

<img width="912" height="570" alt="Screenshot 2026-08-09 at 22 06 43" src="https://github.com/user-attachments/assets/e3c50ac0-67b2-47f7-bacd-fce2f674a3ed" />

<img width="929" height="586" alt="Screenshot 2026-08-09 at 22 06 56" src="https://github.com/user-attachments/assets/6e59a43b-e132-4921-bdb5-b63a85fbee0a" />

(code snippet of additional test cases for updated fetchPlatforms)

**`discoverByGenre`**

<img width="715" height="400" alt="Screenshot 2026-06-23 at 16 28 19" src="https://github.com/user-attachments/assets/cf2d86ea-e5d1-438f-96a0-78b074f7762e" />

Since the function makes a real HTTP request to the backend, we used mocked fetch to simulate API responses without needing the backend or TMDB API to be running. A successful response returns a fake results array { results: [{ id: 1, title: "Inception" }] }. A failed response results in an empty array { results: [] }.


**`searchMovies`**

Since the function makes a real HTTP request to the backend, we used mocked fetch to simulate API responses without needing the backend or TMDB API to be running. We validated the service across 4 test cases:

1. We mock a successful 200 OK network response containing a standard movie payload. The test verifies if the function correctly fulfills promise and returns the exact, unmutated JSON payload back to the calling component without altering its structure. 
2. URLs cannot process raw spaces or specific symbols. We will pass a title containing special symbols ("Spider-Man: No Way Home") and verify if the internal network request transforms it into a percent-encoded, web safe string.
3. When an invalid title is searched, the remote API should not throw an error and return an empty array ({results: []}). This prevents the UI from breaking.
4. We simulate the scenario where the user's internet drops or the server goes offline by forcing `fetch` to reject with a native network error. The funcion should raise the exception so that UI can trigger an error boundary or an alert banner.

<img width="788" height="393" alt="Screenshot 2026-08-09 at 22 08 04" src="https://github.com/user-attachments/assets/746a1155-96eb-411b-8717-995f694aa6f1" />

<img width="936" height="525" alt="Screenshot 2026-08-09 at 22 08 36" src="https://github.com/user-attachments/assets/d7e63cda-fb1d-4938-8e17-d9f0e96725b9" />

<img width="773" height="181" alt="Screenshot 2026-08-09 at 22 08 49" src="https://github.com/user-attachments/assets/36ebb5a2-17c6-445c-a327-531d9a28bad9" />

(code snippet of searchMovies test in tmdbService.test.ts)

**`getBingeBuddies`**

<img width="1086" height="516" alt="Screenshot 2026-08-09 at 22 10 42" src="https://github.com/user-attachments/assets/aad38483-dfca-45bd-bcad-77e21d6d9081" />

<img width="810" height="423" alt="Screenshot 2026-08-09 at 22 10 58" src="https://github.com/user-attachments/assets/23a92bc1-c1ed-41b1-9084-8a66337dd946" />

1. We will confirm that the request hits the /binge-buddies route with the correct HTTP method and Bearer token in the headers. This ensures that a future refactor of the URL or auth format does not silently break the request.
2. A successful response’s JSON body should be returned as it is without modifications.
3. When there is a failed request, the function should not throw or return undefined but returns to default values ({ matches: [], hasList: true, myOptIn: false })for render.
4. When the response is not ok, res.json() should not have been called, ensuring the early return short circuits before attempting to parse a response body that might not even be valid.

**messagesService.ts**

**`conversationId`**

The function should generate the same id for the same pair of users regardless of order. As such, the tests below verifies that conversationId is commutative. This is essential as either user in a pair could initiate a conversation first and both must resolve the same Firestore document ID so they land in the same conversation thread rather than accidentally creating separate ones. 

<img width="762" height="139" alt="Screenshot 2026-08-09 at 22 13 10" src="https://github.com/user-attachments/assets/c7cab9c6-de53-496a-9449-cfa9b5fed9ae" />

Additionally, the function should join user ids with double underscores into a string which will be used as Firestore document ID. 

<img width="685" height="149" alt="Screenshot 2026-08-09 at 22 13 28" src="https://github.com/user-attachments/assets/d78def36-6ba8-4006-93dd-8e3788c13169" />

**`sendMessage`**

The function should not call setDoc or addDoc for empty/ whitespace-only messages, preventing any message document to be written on Firestore. This guards against blank or accidental messages from polluting the conversation history. 

<img width="639" height="299" alt="Screenshot 2026-08-09 at 22 14 27" src="https://github.com/user-attachments/assets/127f3bd0-a938-433e-8a00-e100090d81d5" />

We will also verify that sending a valid message writes the conversation document’s core fields (participants, users, lastMessage, lastSenderId, lastMessageAt and unread) to the correct document path, using {merge: true} so the write updates the document instead of overwriting it entirely. 

<img width="714" height="382" alt="Screenshot 2026-08-09 at 22 14 48" src="https://github.com/user-attachments/assets/17ebe7f2-37d5-4c96-904e-f73c14741230" />

The function should bump the unread count for the recipient and not the sender, ensuring unread badges only appear for the person who did not send the message and that a sender never sees the unread count on their outgoing message.

<img width="698" height="147" alt="Screenshot 2026-08-09 at 22 15 07" src="https://github.com/user-attachments/assets/10941ea3-224f-4de9-a8cf-b291b8bdefbf" />

Our test should also verify if our function trims whitespace and ensure conversation preview (lastMessage) is capped at 500 characters so the inbox list is readable.

<img width="785" height="109" alt="Screenshot 2026-08-09 at 22 15 27" src="https://github.com/user-attachments/assets/53b2da2f-f60f-401c-8dc3-169e66d00f13" />

We will also check that messages are written to the correct path (`conversations/{convoId}/messages`) with senderId and server-generated createdAt, so the chat view’s listener picks it up correctly.

<img width="780" height="200" alt="Screenshot 2026-08-09 at 22 16 08" src="https://github.com/user-attachments/assets/ec406c90-c06b-4a1a-aa53-965e93ae2b4a" />

Lastly, the message body text should be capped to 2000 characters. 

<img width="665" height="178" alt="Screenshot 2026-08-09 at 22 16 59" src="https://github.com/user-attachments/assets/f1fb7edf-6fee-4bee-bbb5-2fc6e27d9160" />

**`markConversationRead`**

Our test verifies that calling this function writes {unread: { [uid]: 0 } } to the correct conversation document with { merge: true }, so that only that user’s unread count is reset without affecting the other participant’s unread count.

<img width="668" height="238" alt="Screenshot 2026-08-09 at 22 17 33" src="https://github.com/user-attachments/assets/d8b131de-03ac-4553-8f81-0c8aacdf4b8c" />


**`subscribeConversations`**

The test below checks if the Firestore query is correctly scoped using where(“participants”, “array-contains”, uid), so the user only sees their own conversations. 

<img width="682" height="105" alt="Screenshot 2026-08-09 at 22 18 17" src="https://github.com/user-attachments/assets/36d82cbb-8201-41fe-a090-21bdec48a3e2" />

We will also verify if snapshot documents are correctly transformed into Conversation objects and ordered newest-first. Conversations with an unresolved (null) lastMessageAt are treated as the most recent rather than pushed to the bottom as such instances only happen immediately after an optimistic write.

<img width="748" height="315" alt="Screenshot 2026-08-09 at 22 18 50" src="https://github.com/user-attachments/assets/a02d154b-23d5-4fe6-9a75-ef7cd7a1a308" />

Lastly, we will verify if the function returns the cleanup callback from onSnapshot, which React components rely on to detach the listener on unmount.

<img width="529" height="145" alt="Screenshot 2026-08-09 at 22 19 08" src="https://github.com/user-attachments/assets/157223d0-54e6-4cb8-a00e-5839f8fe37cc" />

**`subscribeMessages`**

The test below checks whether the subcollection query sorts oldest-first, so messages render top-to-bottom in chronological order in chat view.

<img width="669" height="98" alt="Screenshot 2026-08-09 at 22 20 03" src="https://github.com/user-attachments/assets/a967724f-6091-4dcd-b1ee-bed48324f621" />

Snapshot documents should be correctly transformed into Message objects, preserving id, text, senderId and createdAt in the order Firestore returns them.

<img width="754" height="356" alt="Screenshot 2026-08-09 at 22 20 28" src="https://github.com/user-attachments/assets/a851be57-9155-4f9f-8d66-96b0866aa508" />

#### Logic Functions (src/utils)

**`filteringProcess`**

We will test the function based on 5 test cases:
1. The function should exclude items already in the Want To Watch List. This confirms that the same exclusion applies for wantToWatchKeys, using “type-id” key format. This ensures that titles that users already saved to watch in the future never get recommended again.

<img width="805" height="219" alt="Screenshot 2026-08-09 at 22 33 06" src="https://github.com/user-attachments/assets/a881b0d2-9af4-4383-8f82-601a4d46786b" />


2. The functions should exclude items with no available platforms. This ensures that titles not available in SG (fetchPlatforms return an empty array) are not recommended.


<img width="514" height="99" alt="Screenshot 2026-08-09 at 22 33 17" src="https://github.com/user-attachments/assets/c30bf28c-e5d4-49a3-ae32-3fd398ce178b" />

3. The function should exclude items already in the user's Watch Log, ensuring that already watched titles do not get recommended again.

<img width="618" height="128" alt="Screenshot 2026-08-09 at 22 33 37" src="https://github.com/user-attachments/assets/eb7b2a0e-5eb3-4337-ae73-472d633075fd" />

4. The functions should check for platform availability (calling fetchPlatforms) for each candidate independently.

<img width="658" height="112" alt="Screenshot 2026-08-09 at 22 33 55" src="https://github.com/user-attachments/assets/119bf4f2-e8f2-4504-89cb-7ff2424e50ac" />

5. The function should return an empty array when all candidates are filtered out.
   
<img width="620" height="153" alt="Screenshot 2026-08-09 at 22 34 04" src="https://github.com/user-attachments/assets/ae2f6845-488a-4fd6-ae15-457d51e645e8" />


**`getTopGenre`**

<img width="927" height="699" alt="Screenshot 2026-06-23 at 22 44 43" src="https://github.com/user-attachments/assets/df6cc137-d0cd-43a0-ae63-6ad19a7e01c2" />

We will test the function based on 5 test cases:

1. If there are no logs present, [], "None" is returned.
2. Using 2 sample logs [ { genres: [{ name: "Action" }], userRating: 16 }, { genres: [{ name: "Drama" }], userRating: 5 } ], the genre of the log rated >= 14 hitboxes will have +2 frequency and therefore chosen over the other. 
3. Using 3 sample logs where there are no logs rated >=14 hitboxes, [ { genres: [{ name: "Action" }], userRating: 5 }, { genres: [{ name: "Action" }], userRating: 5 }, { genres: [{ name: "Drama" }], userRating: 5 }, ], the top genre is chosen based on its frequency. 
4. Using 2 sample logs where personal ratings are both the same, [ { genres: [{ name: "Drama" }], userRating: 5 }, { genres: [{ name: "Action" }], userRating: 5 } ], the top genre is chosen based on alphabetical order.
5. Using a sample log which does not have a stated genre, [{ genres: [], userRating: 5 }], "None" is returned.

**`mapToCard`**

<img width="886" height="631" alt="Screenshot 2026-06-24 at 15 08 56" src="https://github.com/user-attachments/assets/37de1c70-4342-4e41-916f-daad978dce33" />

<img width="916" height="181" alt="Screenshot 2026-06-24 at 15 20 24" src="https://github.com/user-attachments/assets/88655c64-ab17-4aee-be6e-0f698058b61a" />

We will test if movies/ shows are mapped to the correct fields: title, genres, rating, platform, synopsis.

**`getActiveGenre`**

<img width="718" height="599" alt="Screenshot 2026-06-24 at 15 13 16" src="https://github.com/user-attachments/assets/185375c8-07d3-4963-a655-ba3d6f9824f3" />

We will test the function based on 7 test cases:

1. Users' top genre from personal watch log is chosen if it is valid and they do not have genre preferences in session storage.
2. Users' valid top genre from personal watch log is chosen in precedence over genre preferences in session storage.
3. Users' first genre preference is chosen if their top genre from personal watch log is "None" or is an empty string.
4. Returns "None" if users' top genre from personal watch log is "None" and genre preferences are unavailable, an empty array or JSON is invalid.

**`getSeedItem`**

<img width="702" height="623" alt="Screenshot 2026-06-24 at 15 16 04" src="https://github.com/user-attachments/assets/2d0c38fb-7d09-4a18-a17e-393717759622" />

<img width="695" height="452" alt="Screenshot 2026-06-24 at 15 16 27" src="https://github.com/user-attachments/assets/fd295cf4-b359-4777-981a-074d5f07a829" />

We will test the function based on 6 test cases:

1. Returns the highly rated log that matches the top genre when one exists.
2. Returns the first highly rated log when no logs match the top genre.
3. Returns the first highly rated log when a genre match exists but is not highly rated.
4. Returns the first log if there are no highly rated logs.
5. Returns null if logs are empty arrays, [].
6. Prioritises a highly rated log matching top genre over other highly rated logs.

**`mapSearchDataToMovie`**

We will test the function based on 5 test cases:

1. When an item with 4 genre IDs (with one ID missing from the mapping dictionary) is passed, the valid numerical genre ID arrays are translated into strings (like "Action") and truncated to the final list with a maximum of 3 genre strings.

<img width="776" height="299" alt="Screenshot 2026-08-09 at 22 37 03" src="https://github.com/user-attachments/assets/20d52837-21fa-4cea-bf74-66e51997e026" />

2. When an item lacking genre IDs is passed, the utility does not crash and assigns an empty array, [].

<img width="726" height="138" alt="Screenshot 2026-08-09 at 22 37 41" src="https://github.com/user-attachments/assets/f56d5074-957b-46eb-acd6-c9707dc647ba" />

3. When a perfect model item is passed, the utility handles correct propery transformations, extracts only 4 digit year from full date string, maps overview to synopsis, and dynamically builds a complete image URL asset using a mocked helper function.

<img width="870" height="422" alt="Screenshot 2026-08-09 at 22 38 19" src="https://github.com/user-attachments/assets/4644d27f-5e8e-4a47-9c8f-58a77e8cb8d0" />


4. When an item containing release_date and no media_type, the function is able to infer the item is "movie" for media_type.

<img width="837" height="230" alt="Screenshot 2026-08-09 at 22 38 47" src="https://github.com/user-attachments/assets/ef20e8cf-7158-41c5-abd4-e0e538358447" />


5. When an item containing first_air_date and no media_type, the function is able to infer the item is "tv" for `media_type`.

<img width="784" height="257" alt="Screenshot 2026-08-09 at 22 39 07" src="https://github.com/user-attachments/assets/74b58fb2-8ab0-4b50-8b62-d5ceb2796059" />


**`handleSlotSelection`**

We will test the function based on 4 test cases:

1. We will first call the utility with an empty selection array to place a mock movie into the left box (index 0). The utility should securely retrieve authorization token, trigger API with the correct metadata parameters (id, token, mediaType)
and successfully populate the targeted slot with the mock movie's streaming providers.

<img width="800" height="473" alt="Screenshot 2026-08-09 at 22 40 56" src="https://github.com/user-attachments/assets/5cde709d-ccbb-4533-89e4-e456cd774d0e" />


2. If the TMDB API yields empty platform array ([]), the utility applies a fallback string array (["Not currently available in SG"]) to safeguard UI layout.

<img width="817" height="258" alt="Screenshot 2026-08-09 at 22 41 07" src="https://github.com/user-attachments/assets/8653aae9-2e20-44eb-b831-8e001489787e" />


3. When the first slot is populated (index 0) and the second slot is empty, the utility automatically sets `nextActiveSlot` to be the vacant index (index 1).

<img width="902" height="259" alt="Screenshot 2026-08-09 at 22 41 19" src="https://github.com/user-attachments/assets/e9df54be-6001-4394-8b09-19709691389b" />

   
4. When second slot (index 1) is already populated and the user updates the first slot (index 0), the `nextActiveSlot` should remain at the current index (index 0) rather than jumping to the filled slot.

<img width="869" height="338" alt="Screenshot 2026-08-09 at 22 41 32" src="https://github.com/user-attachments/assets/84418277-bcac-4730-aefa-804a1fdc2f32" />

**`handleAddToWantToWatch`**

(code snippet of test)

We will test the function based on 3 test cases:

1. When an item that is not currently inside `wantToWatchList`. The function should create a new array and appends the new item {id, type} to the end, and updates the backend database. 

<img width="771" height="338" alt="Screenshot 2026-08-09 at 22 42 20" src="https://github.com/user-attachments/assets/3ad18125-b5af-4002-858c-030e98ca763b" />

2. When an item is already present inside the wantToWatchList (by verifying the item id and type), the function filters duplicate items and pushes the clean array to the backend database.

<img width="831" height="399" alt="Screenshot 2026-08-09 at 22 42 33" src="https://github.com/user-attachments/assets/2e90f78a-4bf2-48ea-b5b0-d5351d1ad624" />

3. To simulate an unauthenticated user, we will force `getIdToken` to return `null`. The function should halt and print an error message.

<img width="836" height="316" alt="Screenshot 2026-08-09 at 22 42 47" src="https://github.com/user-attachments/assets/1d8dd260-3bf4-4bbd-967c-f9caa8eac8fb" />

**`formatTime`**

<img width="686" height="588" alt="Screenshot 2026-08-09 at 22 43 25" src="https://github.com/user-attachments/assets/b6684cb2-126d-462a-9a9b-a3dd4df801dd" />

<img width="598" height="246" alt="Screenshot 2026-08-09 at 22 43 41" src="https://github.com/user-attachments/assets/ab3bd9cd-417b-4494-8a5d-de8a4ff570d4" />

(code snippet of tests for formatTime in communityUtils.test.ts)

We will test the function based on 11 test cases, mainly:

1. When there is no timestamp yet (serverTimestamp() is null) or if the post is very recent (under 60s), returns 'Just now' instead of crashing.
2. For posts made X minutes, hours, or days ago, return “X minutes ago,” “X hours ago,” or “X days ago,” respectively.
3. If a post was made 60 seconds or 60 minutes ago, roll over to return “1 minute ago” or “1 hour ago.”
4. If a post was made 24 hours ago, return "1 day ago".
5. If a post was made more than 7 days ago, return its locale date string.

**`computeTrending`**

We will test the function based on 8 test cases:

1. If there are no posts present, the function does not crash.

<img width="559" height="68" alt="Screenshot 2026-08-09 at 22 44 36" src="https://github.com/user-attachments/assets/cb9f31dd-a288-44e6-b5dd-3c75d0be744f" />

2. Reflection posts are correctly excluded from trending.

<img width="505" height="85" alt="Screenshot 2026-08-09 at 22 44 57" src="https://github.com/user-attachments/assets/9cfa97cb-1d97-47cc-b942-b873e21fbd02" />

3. An incomplete recommendation post does not get counted or crash the function.

<img width="529" height="88" alt="Screenshot 2026-08-09 at 22 45 25" src="https://github.com/user-attachments/assets/1a02f228-8b2e-4749-ae9b-9b726fb226b5" />

4. Recommended posts recommending the same movie/tv are accumulated correctly.

<img width="505" height="210" alt="Screenshot 2026-08-09 at 22 45 09" src="https://github.com/user-attachments/assets/fc1b9442-7f7a-428d-b741-1c6a032ec4d0" />

5. Recommended posts recommending titles with same id but different mediaType are not accumulated and treated as separate entities.

<img width="596" height="186" alt="Screenshot 2026-08-09 at 22 45 38" src="https://github.com/user-attachments/assets/7871e62c-c008-4d49-953e-80ebc50f9572" />

6. The top 3 trending titles are sorted in descending order.

<img width="477" height="229" alt="Screenshot 2026-08-09 at 22 45 51" src="https://github.com/user-attachments/assets/a181eb90-0916-4cf5-b05b-38d22b92827b" />

7. Only the top 3 titles are returned.

<img width="550" height="120" alt="Screenshot 2026-08-09 at 22 46 00" src="https://github.com/user-attachments/assets/220214f5-392f-4e95-9d0d-c569019a8bec" />

8. If there is a tiebreaker, the first encountered order from the input array is preserved.

<img width="860" height="224" alt="Screenshot 2026-08-09 at 22 46 21" src="https://github.com/user-attachments/assets/45cb09f0-f041-4208-b668-0aff40cc626e" />

**`resolveAuthor`**

<img width="907" height="526" alt="Screenshot 2026-08-09 at 22 46 47" src="https://github.com/user-attachments/assets/3ac9bad6-3c0f-458a-98b8-c8f79243a8b9" />

(code snippet of resolveAuthor test in communityUtils.test.ts)

We will test the function based on 5 test cases, mainly:

1. The user's live updated profile is prioritized over the post's stored `authorName/ authorPhotoURL`.
2. If the live profile is absent, fallback to the post's stored `authorName/ authorPhotoURL`.
3. If none exists, fallback to 'Binger' as post authorName and null as `authorPhotoURL`.

**`canSubmitPost`**

<img width="791" height="561" alt="Screenshot 2026-08-09 at 22 47 51" src="https://github.com/user-attachments/assets/aaac8df4-0e4a-4730-869b-c97ad68314c4" />

(code snippet of canSubmitPost test in communityUtils.test.ts)

We will test the function based on 7 test cases, mainly:

1. When making a recommendation post, if a movie/ show is selected, the post is considered valid.
2. If no movie/ show is selected, the post is considered invalid regardless if the post contains notes or not.
3. A reflection post is considered valid if both the title and content are non-empty and not composed solely of whitespace.

**`filterPosts`**

<img width="912" height="609" alt="Screenshot 2026-08-09 at 22 48 31" src="https://github.com/user-attachments/assets/f9c14245-f886-4bbb-91a9-3e62d19dd3b0" />

<img width="910" height="403" alt="Screenshot 2026-08-09 at 22 49 05" src="https://github.com/user-attachments/assets/b960482c-61d4-4e20-8a57-9e42103fea75" />

<img width="732" height="279" alt="Screenshot 2026-08-09 at 22 49 22" src="https://github.com/user-attachments/assets/a3d098e3-7910-4b6b-b812-1ffd3d605b7a" />

(code snippet of filterPosts test in communityUtils.test.ts)

We will test the function based on 10 test cases, mainly:

1. If the filter type is “reflection,” “recommendation,” or “all” and the query is empty, return reflection posts, recommendation posts, or all posts, respectively.
2. If the search query matches a post’s title, regardless of type, return posts with matching titles.
3. If the search query matches a post’s content, regardless of type, return posts with matching content.
4. If the search query matches a user’s current (updated) username, return all posts by that user, regardless of type, including posts created before the username change.
5. Search is case insensitive
6. If nothing matches the search query, return an empty array.
7. If both type filter and search query are used, both are applied.

**`computeBingeBuddiesMatches`**

<img width="853" height="534" alt="Screenshot 2026-08-09 at 22 51 23" src="https://github.com/user-attachments/assets/d9030815-4cdc-4c53-b447-dc5093ab3e60" />

<img width="939" height="461" alt="Screenshot 2026-08-09 at 22 51 50" src="https://github.com/user-attachments/assets/4e5aafe0-135e-429f-a53b-30d21f193dd4" />

<img width="919" height="497" alt="Screenshot 2026-08-09 at 22 52 09" src="https://github.com/user-attachments/assets/86227d17-a55c-41e0-a2cf-fc27d08c5c6f" />

(code snippet of computeBingeBuddiesMatches in computeBingeBuddiesMatches.test.js)

We will test the function based on 9 test cases, mainly:
1. Users should be excluded from their own matches.
2. Users who have not opted-in even with matching Want To Watch titles with/ have an empty Want To Watch List are excluded.
3. Users who opted-in but do not have matching Want To Watch titles are excluded.
4. Only users who opted-in and have matching Want To Watch titles are included, matchCount of titles should be correct as well.
5. Movies and shows with the same TMDB ID are treated as different titles.
6. Matches are sorted by matchCount descending.
7. If the username is missing, use the default “Binger” username for display.
8. If a user has leftover contactType (“Instagram”) but no actual contactValue, contactType becomes null and will not be displayed.

**`buildContactLink`**

<img width="635" height="536" alt="Screenshot 2026-08-09 at 22 54 22" src="https://github.com/user-attachments/assets/52e47c40-7a15-40ad-b5f5-7f2b21e832a1" />

<img width="590" height="498" alt="Screenshot 2026-08-09 at 22 54 44" src="https://github.com/user-attachments/assets/aa0d5785-12a5-4f59-a23e-2b2d53bc0485" />

(code snippet of buildContactLink in buildContactLink.test.ts)

We will test the function 9 test cases, mainly:
1. When the value is null/ empty, it should return null.
2. The function returns a correct Instagram link and strips leading “@” if present.
3. The function returns a correct Telegram link and strips leading “@” if present.
4. The function builds a correct mailto link for email.
5. The function builds a Discord entry with no href.
6. It falls back to a plain label with no href for unknown/ null type.
7. Trims whitespace from the value.

**`fmtTime`**

We will test the function based on 4 test cases:

1. Confirms that an object with a valid Timestamp produces a correctly formatted time.

<img width="473" height="152" alt="Screenshot 2026-08-09 at 22 56 21" src="https://github.com/user-attachments/assets/a0291ecc-24db-41ac-97a2-4dd692bb6123" />

2. If the timestamp is null, an empty string is returned, ensuring the function does not crash.

<img width="547" height="79" alt="Screenshot 2026-08-09 at 22 56 31" src="https://github.com/user-attachments/assets/9595784a-ff41-4727-bd1a-57357b99c069" />

3. If toDate is not a function, return an empty string. 

<img width="569" height="87" alt="Screenshot 2026-08-09 at 22 56 48" src="https://github.com/user-attachments/assets/14df4cd5-94b9-4986-94ce-d290770a5663" />

4. If the timestamp is undefined, an empty string is returned.

<img width="558" height="82" alt="Screenshot 2026-08-09 at 22 56 40" src="https://github.com/user-attachments/assets/2e1b8ce3-3688-4bf6-ac99-6b5419fa07e6" />

**`Initial`**

We will test the function based on 5 test cases, mainly:

<img width="649" height="399" alt="Screenshot 2026-08-09 at 22 58 18" src="https://github.com/user-attachments/assets/fda60e37-4b03-4689-9be2-d77fa0ecd32b" />

(code snippet of messagesutils.test.ts)

1. The uppercased first letter of the name should be returned.
2. If the name is an empty string/ whitespace-only string, “?” is returned.
3. The first letter is used even if the name has a leading whitespace.
4. There should not be an off-by-one issue when the name is one character long.

### System Testing 

#### Authentication Flow

| Step | Expected | Passed/ Failed |
|---|---|---|
| Visit `/home` without logging in. | Redirected to `/login`. | Passed |
| Sign up as a new user. | Redirected to `/onboarding`. | Passed |
| Completed onboarding as a new user. | Redirected to `/home`. | Passed |
| Sign out and log back in. | Redirected to `/home`. | Passed |
| Visit `/log` without logging in. | Redirected to `/login`. | Passed |
| Visit `/recommendations` without logging in. | Redirected to `/login`. | Passed |

#### Watch Log Flow

| Step | Expected | Passed/ Failed |
|---|---|---|
| Click "Add New Log". | Search modal appears. | Passed |
| Search for a title. | Results appear in dropdown | Passed |
| Add a title | The card appears in the log grid and movie/ show id is saved to watchList in firestore cloud. Watched count increases by 1. | Passed |
| Add the same show/ movie again. | Alert shown- "This title is already logged in your list dashboard profile!" | Passed |
| Search for a title of saved logs on the watch log search bar and click "Apply Filter". | Logs with the searched title remain on the log grid while other logs are filtered out. | Passed |
| Search for a genre of saved logs on the watch log search bar and click "Apply Filter". | Logs of the searched genre remain on the log grid while other logs are filtered out. | Passed |
| Search for a format (tv/ movie) of saved logs on the watch log search bar and click "Apply Filter". | Logs with the searched format are retained on the log grid while other logs are filtered out. | Passed |
| Search for a platform (eg. "Netflix") of saved logs on the watch log search bar and click "Apply Filter". | Logs where its movies/ shows with the searched platform availability remains. | Passed |
| Search for an invalid title/ genre/ format of saved logs on the watch log search bar and click "Apply Filter". | All logs are filtered out and the log grid shows "No logged items match this filter category". | Passed |
| Open log card | Log card details shown. | Passed |
| After filling out ratings and reflections on the log card, click "Save Log". | Users' inputs are saved in the firestore cloud. Users' Top Genre, Avg TMDB Rating, Avg Custom Rating changes. | Passed |
| Remove a log | Card removed from grid and from watchList in firestore cloud. | Passed |
| Sign out and sign back in | Log data still present. | Passed |

#### Recommendations Flow

| Step | Expected | Passed/ Failed |
|---|---|---|
| Visit recommendations with empty log and empty genre preferences. | Empty state cards shown. | Passed |
| Add titles to log then visit recommendations. | Both recommendation cards with recommended shows/ movies appear. | Passed |
| Refresh page | Different recommendations shown. | Passed |

#### Side-by-Side Comparison Flow

| Step | Expected | Passed/ Failed |
|---|---|---|
| Visit Side-by-Side Comparison page. | 2 Empty comparison slots shown with the first slot being highlighted/ focused on. | Passed |
| Click on the search bar and search for a valid title. | The first 6 most relevant titles will appear below the search bar. | Passed |
| Select the first title for comparison. | The selected show/ movie will be shown on the first comparison slot showing its image, title, year of release, genre and TMDB rating. The second comparison slot is highlighted/ focused on. | Passed |
| Click on the X button to remove the movie/ show. | The show/ movie is removed from the comparison slot with that slot being highlighted/ focused on for user to easily replace with another title. | Passed |
| After selecting 2 titles to compare, click on the orange "Compare" button. | The result will show a comparison table for the 2 show/ movie in terms of its TMDB rating, release year, genre, platform availability and synopsis. | Passed |
| Click the X button for one of the 2 selected shows/ movies after hitting "Compare". | The comparison table is cleared and the selected show/ movie is removed with its comparison slot being highlighted/ focused on for user to easily replace with another title. | Passed |
| After making a comparison, click out of the page and click into the page again. | The comparison page will return back to original empty state. | Passed |

#### Community Hub Flow

| Step | Expected | Passed/ Failed |
|---|---|---|
| Click on the "Write a Reflection" button and fill up the title and contents section, click "Post Comment". | Posts, including the username, timestamp, title, and content, are displayed on the feed. Post details are stored in the `posts` collection on the cloud Firestore database. | Passed |
| Click on the delete button on the post. | Post is deleted and no longer displayed on the feed. Post details no longer present in the cloud Firestore database. | Passed |
| Click on the "Write a Reflection" button and click the "Back to feed" button. | Returned back to feed. | Passed |
| Click on the "Share a Recommendation" button, search and select for a movie/ show title. Fill up the contents section and click "Post Comment". | Posts, including the username, timestamp, title, and content, are displayed on the feed. Post details are stored in the cloud Firestore database. | Passed |
| Click on the "Share a Recommendation" button, search for a title and click the "change" button below the movie/ show. | The selected movie/ show is removed and returned back to the original empty Recommendation card. | Passed |
| Click on another user's post and click the like button. | The like number increments by 1 on the post. UserId is appended to the `likedBy` array on the cloud Firestore database. | Passed |
| Click the like button again to unlike the post. | The like number decreases by 1 on the post. UserId is removed from the `likedBy` array on the cloud Firestore database. | Passed |
| Click on another user's post, leave a comment and click "Post Comment". | Comment with username, timestamp can be seen on the post when expanded. `commentCount` of the post increments by 1 on cloud Firebase Firestore. | Passed |
| Click on the delete button the comment made. | Comment is now absent. `commentCount` of the post decreases by 1 on cloud Firebase Firestore. The specific comment in `comments` subcollection is absent. | Passed |
| Click on the "Reflections" filter. | Only Reflection posts will be present on the feed. | Passed |
| Click on the "Recommendations" filter. | Only Recommendation posts will be present on the feed. | Passed |
| Click the “Recommendations” filter and search for an existing movie or show title on the feed. | Only Recommendation posts with the matching movie/ show title will be present on the feed. | Passed |
| Click on the "Reflections" filter and search an existing title on the feed. | Only Reflection posts with matching titles will be present on the feed. | Passed |
| Search for post content. | Only posts with the matching content will be present on the feed. | Passed |

#### Personal Details Update Flow

| Step | Expected | Passed/ Failed |
|---|---|---|
| Click "Edit" on username, change username and save. | New username appears on Profile and Home Page. Username updated on firestore cloud. | Passed |
| Click "Add Picture" on profile picture, change picture and save. | New profile picture appears on Profile Page. | Passed |
| Click "Change Password", update password and sign out. | New password updated and successfully logged in using new password. | Passed |
| Change "Favourite Movie Genres", "Favourite TV genres" , "What I Like to Watch" or "What Languages I Watch In" and save preferences | Updated preferences saved in cloud firestore. Preferences persist after signing out and logging in again. | Passed |
| Toggle with the opt-in button. | The `bingeBuddyOptIn` on Firestore cloud database updates accordingly (true/false). When returned to Social Connection Hub, a notification is shown to opt-in so that Bingers can have access to person contact. | Passed |

### Want To Watch List Update Flow

| Step | Expected | Passed/ Failed |
|---|---|---|
| Click on the "Add to Want to Watch List" button below the recommended show/ movie. | The movie/ show id is saved to `wantToWatchList` in the firestore cloud. Button changes to "Remove from Want to Watch". Want To Watch List in the Home Page displays the saved title. | Passed |
| Click on the "Remove from Want to Watch" button. | The movie/ show id is removed from `wantToWatchList` in the firestore cloud. Button changes to "Add to Want to Watch". | Passed |
| Add the same saved title in the Want To Watch List to the Watch Log and return to the Home Page. | The movie/ show id is removed from `wantToWatchList` in the firestore cloud. The title is removed fron the Want To Watch List. | Passed |
| Manually add a title to the Want To Watch List from the Home Page. | The movie/ show id is saved to `wantToWatchList` in the cloud Firestore database. The title with its image is shown on the Want To Watch list. | Passed |
| Manually delete a title from the Want To Watch List. | The movie/ show id is removed from `wantToWatchList` in the cloud Firestore database. The title is removed from the Want To Watch List. | Passed |

#### Social Connection Hub Flow

| Step | Expected | Passed/ Failed |
|---|---|---|
| Log in to Account A, search for a specific title, and add it to Account A's Want To Watch List. Sign out of Account A, log in to Account B, and add the exact same title to Account B's Want To Watch List. Finally, while remaining logged in as Account B, navigate to the Social Connection Hub page. | The title is saved to `wantToWatchList` in the cloud Firestore database for both User A and B.  Additionally, on the Social Connection Hub page while logged in as User B, User A's profile name, User A's top genre, personal contacts and the poster image of the shared title should be correctly displayed. | Passed |
| Click on the link beside the contact to contact User A via email/instagram/discord/ telegram. | User B should be redirected to User A’s instagram/ telegram/ email. Discord is not supported. | Passed |
| Click “Message” to direct message User A. | Brought to Messages Page and private chat with User A. | Passed |

#### Direct Messages Flow

| Step | Expected | Passed/ Failed |
|---|---|---|
| Log in to the application as User A. Navigate to the Messages Page. | All past private chats across different users (User B, User C, etc.) appear correctly in the conversation list. | Passed |
| Click on the existing conversation item with User B. | The message thread loads the historical chat log between User A and User B. Header details (User B's name, profile picture) render accurately. | Passed |
| On User B's browser session, log in and navigate to the chat thread with User A. As User A, type a unique test message into the input field and click Send. | Message are added to `messages` subcollection in the cloud Firestore database.The message immediately displays in the chat window with a time stamp on User A’s side. On User B’s side, the new message appears in real time without needing a page refresh. | Passed |
| Refresh the page for both User A and User B. Navigate back to the inbox. | The sent message persists in the chat history. The conversation list preview in inbox displays the latest sent message and timestamp for both users. | Passed |

### User testing (by Milestone 3)

We conducted usability testing with a cohort of 20 individual users once all core features of our app were fully implemented. Here is how the testing was carried out:

**1. Recruit Testers**

We recruited approximately 20 individuals, mainly students around the age of 20, to test the app. These individuals were chosen based on their strong interest in movies/ shows.

**2. Give Testers Tasks to Complete**

Testers were given a list of tasks to complete without help.

| Task | 
|---|
| Create an account and complete onboarding. |
| Search and add 3 titles on your watch log. |
| Click on 1 title on your watch log, edit personal rating and reflections, and save it. |
| View recommendations page. |
| Add a recommended title to the Want To Watch List from the Recommendations Page and check if the title is present on the Want To Watch List on Home Page. |
| Add a title to the Want To Watch List on the Home Page. |
| Write a reflection and post it on the Community Hub. | 
| Share a recommendation on the Community Hub. |
| Like another user's post on the Community Hub. |
| Comment on another user's post on the Community Hub. |
| Change password in profile page. |
| Change preferences in profile page. |
| Toggle on the Social Connection Hub and edit your Binge Buddy Contact Type. |
| Visit the Social Connection Hub. |
| Search 2 titles on the Comparison Page to compare them. |

**3. Collect Feedback**

After completing the tasks, participants were asked to fill out a survey evaluating the app’s overall usability. Questions included:

* From a scale of 1 to 10, with 1 being very difficult and 10 being very easy, how easy was it to navigate the app?
* From a scale of 1 to 10, with 1 being very irrelevant and 10 being very relevant, how relevant were the recommendations?
* Was anything confusing or missing?
* From a scale of 1 to 10, with 1 being very unlikely and 10 being very likely, how likely would you recommend this app to your others?
* Any other suggestions for improvement?


**4. Document and Evaluate**

We reviewed all results to identify any shortcomings in our app.

---

## Testing Results

**Unit Testing**

Overall, the implemented components of the web app have passed all unit and system tests. 

(image of the passed test from github)

**System Testing**

Out of the 60 system tests done for the different features, all 60 tests passed.

**User Testing**

Below are the results obtained from a set of 20 students.

Q1: From a scale of 1 to 10, with 1 being very easy and 10 being very difficult, how easy was it to navigate the app?

<img width="633" height="222" alt="Screenshot 2026-08-09 at 23 26 07" src="https://github.com/user-attachments/assets/2884676a-06bb-4b78-9f51-bd010cc44cb3" />

Overall Perception: Across 20 total responses, the feedback skews strongly toward easy navigation (where 1 is very easy and 10 is very difficult).
High Ease of Use (Scores 1–4): A combined 65% of respondents (13 users) rated ease of navigation between 1 and 4, with 4 being the single most common rating (20%, 4 responses).
Moderate Experience (Scores 5–7): 35% of respondents (7 users) gave a mid-range score (10% each for 5 and 6; 15% for 7).
High Difficulty (Scores 8–10): 0% of respondents rated the app an 8, 9, or 10, indicating no users found the app significantly difficult to navigate.

Q2: From a scale of 1 to 10, with 1 being very irrelevant and 10 being very relevant, how relevant were the recommendations?

<img width="654" height="249" alt="Screenshot 2026-08-09 at 23 26 27" src="https://github.com/user-attachments/assets/d08a222a-b016-4e65-bdb9-641662704ce4" />

Overall Perception: Out of 20 responses, feedback is overwhelmingly positive, indicating that users found the recommendations highly relevant (where 1 is very irrelevant and 10 is very relevant).
High Relevance (Scores 8–10): A vast majority of 70% (14 respondents) rated the recommendations between 8 and 10. Rating 8 was the most frequent answer at 35% (7 users), followed by 9 at 25% (5 users), and 10 at 10% (2 users).
Moderate Relevance (Scores 5–7): 20% of respondents (4 users) felt neutral to moderately satisfied, splitting evenly between scores of 5 and 7 (10% / 2 users each).
Low Relevance (Scores 1–4): Only 10% (2 users) found the recommendations largely irrelevant, with 1 user giving a rating of 1 (5%) and 1 giving a 2 (5%).

Q3: From a scale of 1 to 10, with 1 being highly unlikely and 10 being highly likely, how likely would you recommend this app to others?

<img width="658" height="233" alt="Screenshot 2026-08-09 at 23 26 47" src="https://github.com/user-attachments/assets/290abde6-51d5-41e2-bba7-42e7abf9d9d4" />

Overall Sentiment: Across 20 total responses, user willingness to recommend the app is exceptionally high (where 1 is highly unlikely and 10 is highly likely).
Strong Recommendations (Scores 8–10): An overwhelming 90% of respondents (18 users) are highly likely to recommend the app. Scores of 8 and 9 tied for the top spot at 35% each (7 users each), with another 20% (4 users) giving a perfect score of 10.
Moderate Likelihood (Score 7): Only 10% of respondents (2 users) gave a score of 7, leaning positive.
Low Likelihood (Scores 1–6): 0% of respondents rated the app between 1 and 6, showing a total absence of negative feedback regarding recommendation likelihood.

**Overall Feedback Derived by Respondents**

Overall, feedback is positive. Most respondents find title recommendations relevant and useful and many would recommend Binge Buddies to friends. However, key areas for improvement include:

1. Mobile Optimization: Many users accessed the app via mobile, where the current display is cluttered and hard to navigate. This explains the mid-range ease-of-navigation ratings in Q1 (where 1 is very easy and 10 is very difficult), which a third of respondents scored between 5 and 7.
2. Password Requirements: Users requested clearer guidelines (eg. alphanumeric symbols) directly on the Sign-up Page.
3. Direct Messaging: Users suggested adding a private messaging feature to chat with other buddies in-app.

---

## Problems Encountered and How we solved them

### User Authentication Learning Curve

As we started our project, full-stack authentication was entirely new to us. Integrating Firebase made us learn how secure apps handle identity.

* **The Challenge:** We did not know how our Node.js backend would recognize a user who logged in on the frontend.

* **The Solution:** We learned how to pass JWT tokens from the frontend headers to the backend, using firebase-admin to securely decode them on the server.

* **State & Security:** We built an AuthContext.tsx to handle global login states and safely split our architecture between public frontend variables and protected backend environment variables.

### Data Orchestration & Performance Hurdles

Our Watch Log page combines lightweight database records with live, heavy data from the TMDB API, creating a few performance bottlenecks.

* **The Challenge:** To keep our database small, we only stored basic media IDs. However, fetching images, genres, and streaming info for every single item sequentially was crashing page performance.

* **The Solution:** We used Promise.all to run API requests concurrently instead of waiting for them one by one. This helped to eliminate our loading bottlenecks.

* **The Challenge:** Adding an item to the database caused a noticeable lag while waiting for the server to respond.

* **The Solution:** We implemented Optimistic UI. The app instantly updates the screen so it feels fast for the user, while background processes handle the backend database write.

* **The Challenge:** We needed a fast, intuitive way to filter a user's library by titles, media types, and genres all at once.

* **The Solution:** We built a local query parser that splits user input into tokens and searches across multiple data layers simultaneously.

### The Personalization Engine & Caching

Our Recommendations page calculates tailored media suggestions based on what a user watches, which required managing a lot of moving parts.

* **The Challenge:** Shuffling recommendations on page load kept triggering accidental re-renders in React, creating endless network requests.

* **The Solution:** We used React’s useRef hook to create a "gatekeeper" that guarantees heavy data fetching fires strictly once per session.

* **The Challenge:** The TMDB API separates genre lists for Movies and TV shows and sends them as raw numbers, causing slow rendering when displaying names.

* **The Solution:** We fetch both genre dictionaries simultaneously on mount and combine them into a single, unified map for instant ID-to-string lookups.

* **The Challenge:** The recommendation algorithm relies on a chain of dependencies (User Auth → History → Seed Selection → API Lookup). If any step failed or data was missing, the page crashed.

* **The Solution:** We wrapped the pipeline in strict defensive checks. If a user has no watch history, the app falls back to displaying context-aware placeholder cards instead of breaking.

---

## Conclusion 

### Future Plans

1. Continued testing and improvement of features

We will continue to work on improving the various features of Binge Buddies for better user experience. We will also continue on unit and system testing on extension features like the Social Connection Hub.

2. Improvement of user experience on mobile phones

Currently Binge Buddies works well on desktops. We will work on ensuring that the display looks better on mobile phones.

3. Improvement of Binge Buddies based on results collected from User Testing

We will take the feedback collected into account, continue to refine Binge Buddies, and possibly include new features if needed.

Google Forms link: https://docs.google.com/forms/d/18ryXQRXmV9LvS_7gZ7jBmv02RJg6ro9PsQ_RfT54-uU/edit#response=ACYDBNja5K1lBN-yHEsPt4Oxafh9Il8_l2tWrkYMO8YgaImsZfassS0yzOcXF_cC_-7dUh0

----

## Team 7578

| Name | Student ID |
|---|---|
| Sakshi Vashist | A0321888R |
| Claudine Wang | A0321840N |

---
