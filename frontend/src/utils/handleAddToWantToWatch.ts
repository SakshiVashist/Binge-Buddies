import { saveUserWantToWatchList } from "../services/tmdbService";

export async function handleAddToWantToWatch(item: { id: number, type: "movie" | "tv" },
    wantToWatchList: { id: number; type: "movie" | "tv" }[],
    setWantToWatchList: (list: { id: number; type: "movie" | "tv" }[]) => void,
    getIdToken: () => Promise<string | null>
) {
    const idToken = await getIdToken();
    if (!idToken) {
        console.error("User is not authenticated.");
        return;
    }
    const alreadyInList = wantToWatchList.some(entry => entry.id === item.id && entry.type === item.type);
    let updatedList;
    if (alreadyInList) {
        updatedList = wantToWatchList.filter(entry => !(entry.id === item.id && entry.type === item.type));
    } else {
        updatedList = [...wantToWatchList, { id: item.id, type: item.type }];

    }
    setWantToWatchList(updatedList);
    await saveUserWantToWatchList(updatedList, idToken);
}