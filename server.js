import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploads statically
app.use('/api/uploads', express.static(UPLOADS_DIR));

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

const DEFAULT_PROFILES = [
  {
    id: "1",
    name: "Alex Johnson",
    details: "Lead Developer & Tech Support",
    photoUrl: "/profile_1.png",
    whatsapp: "15551230001",
    telegram: "alex_j",
  },
  {
    id: "2",
    name: "Sarah Miller",
    details: "Customer Success Manager",
    photoUrl: "/profile_2.png",
    whatsapp: "15551230002",
    telegram: "sarah_m",
  },
  {
    id: "3",
    name: "David Chen",
    details: "Senior Sales Representative",
    photoUrl: "/profile_3.png",
    whatsapp: "15551230003",
    telegram: "david_c",
  },
  {
    id: "4",
    name: "Emily Davis",
    details: "Marketing & PR Coordinator",
    photoUrl: "/profile_4.png",
    whatsapp: "15551230004",
    telegram: "emily_d",
  },
  {
    id: "5",
    name: "Marcus Wright",
    details: "Community Manager",
    photoUrl: "/profile_5.png",
    whatsapp: "15551230005",
    telegram: "marcus_w",
  }
];

const DEFAULT_ANALYTICS = {
  whatsapp: 0,
  telegram: 0,
  impressions: 0,
  startDate: new Date().toISOString()
};

const DEFAULT_SETTINGS = {
  adminPin: "admin123"
};

async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    const defaultDB = { profiles: DEFAULT_PROFILES, analytics: DEFAULT_ANALYTICS, settings: DEFAULT_SETTINGS };
    await writeDB(defaultDB);
    return defaultDB;
  }
}

async function writeDB(data) {
  // Ensure settings exists
  if (!data.settings) {
    data.settings = DEFAULT_SETTINGS;
  }
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET all data (hide the PIN from public data!)
app.get('/api/data', async (req, res) => {
  const db = await readDB();
  res.json({ profiles: db.profiles, analytics: db.analytics });
});

// POST to increment impression
app.post('/api/impression', async (req, res) => {
  const db = await readDB();
  db.analytics.impressions += 1;
  await writeDB(db);
  res.json(db.analytics);
});

// POST to increment click
app.post('/api/click', async (req, res) => {
  const { platform } = req.body;
  const db = await readDB();
  
  if (platform === 'whatsapp' || platform === 'telegram') {
    db.analytics[platform] += 1;
    await writeDB(db);
  }
  
  res.json(db.analytics);
});

// POST to verify PIN
app.post('/api/verify-pin', async (req, res) => {
  const { pin } = req.body;
  const db = await readDB();
  if (db.settings.adminPin === pin) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// POST to update PIN
app.post('/api/update-pin', async (req, res) => {
  const { oldPin, newPin } = req.body;
  const db = await readDB();
  if (db.settings.adminPin === oldPin) {
    db.settings.adminPin = newPin;
    await writeDB(db);
    res.json({ success: true });
  } else {
    res.json({ success: false, error: "Incorrect old PIN" });
  }
});

// POST to update profiles
app.post('/api/profiles', async (req, res) => {
  const { profiles } = req.body;
  if (!Array.isArray(profiles)) return res.status(400).json({ error: "Invalid profiles data" });
  
  const db = await readDB();
  db.profiles = profiles;
  await writeDB(db);
  
  res.json(db.profiles);
});

// POST to upload a photo for a specific profile
app.post('/api/upload', upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const profileId = req.body.profileId;
  if (!profileId) {
    return res.status(400).json({ error: "No profileId provided" });
  }

  const db = await readDB();
  const profileIndex = db.profiles.findIndex(p => p.id === profileId);
  
  if (profileIndex === -1) {
    return res.status(404).json({ error: "Profile not found" });
  }

  const oldPhotoUrl = db.profiles[profileIndex].photoUrl;

  // If the old photo was a local upload, delete it from the filesystem
  if (oldPhotoUrl && oldPhotoUrl.startsWith('/api/uploads/')) {
    const filename = oldPhotoUrl.replace('/api/uploads/', '');
    const oldFilePath = path.join(UPLOADS_DIR, filename);
    try {
      await fs.unlink(oldFilePath);
    } catch (e) {
      console.log("Could not delete old photo or it didn't exist:", oldFilePath);
    }
  }

  // Set the new photo URL
  const newPhotoUrl = `/api/uploads/${req.file.filename}`;
  db.profiles[profileIndex].photoUrl = newPhotoUrl;
  
  await writeDB(db);

  res.json({ success: true, photoUrl: newPhotoUrl, profiles: db.profiles });
});

// POST to reset analytics
app.post('/api/reset', async (req, res) => {
  const db = await readDB();
  db.analytics = {
    whatsapp: 0,
    telegram: 0,
    impressions: 0,
    startDate: new Date().toISOString()
  };
  await writeDB(db);
  res.json(db.analytics);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
