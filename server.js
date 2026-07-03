const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const dbPath = path.join(__dirname, 'wallpapers.json');

// Yüklenen resimlerin klasör ayarı
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Yardımcı Fonksiyonlar (Dosyaya yazma ve okuma)
function getWallpapers() {
    if (!fs.existsSync(dbPath)) return [];
    return JSON.parse(fs.readFileSync(dbPath, 'utf8') || '[]');
}
function saveWallpapers(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// API Rotaları
app.get('/api/wallpapers', (req, res) => {
    res.json(getWallpapers());
});

app.post('/api/upload', upload.single('wallpaper'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    
    const wallpapers = getWallpapers();
    const newWallpaper = {
        id: Date.now().toString(),
        name: req.body.name,
        category: req.body.category || 'Cars',
        url: `/uploads/${req.file.filename}`
    };
    
    wallpapers.push(newWallpaper);
    saveWallpapers(wallpapers);
    res.status(200).send('Success');
});

app.post('/api/delete', (req, res) => {
    const { id, password } = req.body;
    if (password !== '1234') return res.status(401).send('Wrong password');
    
    let wallpapers = getWallpapers();
    wallpapers = wallpapers.filter(wp => wp.id !== id);
    saveWallpapers(wallpapers);
    res.status(200).send('Deleted');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});