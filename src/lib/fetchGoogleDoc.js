import axios from "axios";

export async function fetchPublicGoogleDoc(docId) {
    const url = `https://docs.google.com/document/d/${docId}/export?format=html`;

    const res = await axios.get(url);
    return res.data; // returns HTML string
}