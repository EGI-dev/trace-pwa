import { useState } from 'react';
import { db, storage, ensureSession } from '../appwrite';
import { ID, Permission, Role } from 'appwrite';

const DB_ID = 'default';       // Appwrite Cloud default DB
const COLLECTION = 'traces';
const BUCKET = import.meta.env.VITE_APPWRITE_TRACES_BUCKET_ID as string;

export default function PostTrace() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const choose: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  async function post() {
    if (!file) return;
    setBusy(true);
    await ensureSession();

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      /* 1 Upload image */
      const fileId = ID.unique();
      await storage.createFile(BUCKET, fileId, file);
      const photoURL = storage.getFilePreview(BUCKET, fileId).href;

      /* 2 Store document */
      await db.createDocument(
        DB_ID,
        COLLECTION,
        ID.unique(),
        {
          photoURL,
          lat:  coords.latitude,
          lng:  coords.longitude,
          expiresAt: Date.now() + 3 * 60 * 60 * 1000, // +3 h
        },
        [
          Permission.read(Role.any()),
          Permission.update(Role.user('current')),
          Permission.delete(Role.user('current')),
        ],
      );

      setFile(null);
      setBusy(false);
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={choose}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!file || busy}
        onClick={post}
      >
        {busy ? 'Posting…' : 'Post Trace'}
      </button>
    </div>
  );
}
