// =============================
// FIND A BINGE BUDDY
// =============================

// Match the current user with other users based on shared want-to-watch titles.
// Only users who have opted in to Find a Binge Buddy are returned. Each match
// includes their opt-in contact and top genre so they can be reached directly.
function computeBingeBuddiesMatches(userUid, myList, allUsers) {

    // Build a lookup of my titles keyed by "type-id"
    const myKeys = new Set(myList.map((item) => `${item.type}-${item.id}`));

    const matches = [];

    allUsers.forEach(({id, data}) => {
      if (id === userUid) return; // skip self
      if (data.bingeBuddyOptIn !== true) return; // skip users who haven't opted in
      const theirList = data.wantToWatchList || [];
      if (theirList.length === 0) return; // skip users with no titles

      // Shared titles (deduplicated) that appear in both lists
      const seen = new Set();
      const commonItems = [];
      theirList.forEach((item) => {
        const key = `${item.type}-${item.id}`;
        if (myKeys.has(key) && !seen.has(key)) {
          seen.add(key);
          commonItems.push({ id: item.id, type: item.type });
        }
      });

      if (commonItems.length > 0) {
        matches.push({
          uid: id,
          username: data.username || "Binger",
          photoURL: data.photoURL || null,
          matchCount: commonItems.length,
          commonItems,
          // Contact shared with everyone they match with (opted in above)
          contactType: data.contactValue ? (data.contactType || null) : null,
          contactValue: data.contactValue || null,
          // Top genre from their watch log (populated when they view their log)
          topGenre: data.topGenre || null,
        });
      }
    });

    // Rank by most shared titles first
    matches.sort((a, b) => b.matchCount - a.matchCount);
    return matches;
}

module.exports = {computeBingeBuddiesMatches};
