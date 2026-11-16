import type {Timestamp} from "firebase/firestore";


export const fmtTime = (ts: Timestamp | null | undefined): string =>
  ts && typeof ts.toDate === "function"
    ? ts.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
