import { Client, Storage, Models } from "appwrite";
import { Account } from "appwrite";

const client = new Client()
    .setEndpoint("https://nyc.cloud.appwrite.io/v1")
    .setProject("68a1eeac0035a566282d");

const storage = new Storage(client);

export async function uploadImage(file: File): Promise<Models.File> {
    try {
        const res = await storage.createFile(
            "68a1f095002ea9e01b8f",
            "unique()",
            file
        );
        console.log("Uploaded:", res);
        return res;
    } catch (err: any) {
        console.error("Upload error:", err.message);
        throw err;
    }
}

export function getFileUrl(fileId: string): string {
    try {
        const url = storage.getFileView("68a1f095002ea9e01b8f", fileId);
        return url.toString();
    } catch (err: any) {
        console.error("Get file URL error:", err.message);
        throw err;
    }
}

export { client, storage };
