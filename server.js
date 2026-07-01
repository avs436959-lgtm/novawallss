const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer'); 
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const ADMIN_PASSWORD = "nova123"; 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'images')); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const dbPath = path.join(__dirname, 'wallpapers.json');
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([{ id: 1, title: "M3 Coupe", filename: "m3.jpg", category: "araba" }], null, 2));
}

app.get('/api/wallpapers', (req, res) => {
    const data = fs.readFileSync(dbPath);
    res.json(JSON.parse(data));
});

app.post('/api/add-wallpaper', upload.single('wallpaperFile'), (req, res) => {
    const { title, category, password } = req.body;

    if (password !== ADMIN_PASSWORD) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(401).json({ error: "Yetkisiz Giriş! Şifre Yanlış." });
    }

    if (!req.file) {
        return res.status(400).json({ error: "Lütfen bir görsel seçin!" });
    }

    const data = JSON.parse(fs.readFileSync(dbPath));
    const newWallpaper = {
        id: Date.now(),
        title,
        filename: req.file.filename, 
        category
    };

    data.push(newWallpaper);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

    res.status(201).json({ message: "Başarıyla yüklendi ve kaydedildi!" });
});

// --- YÖNLENDİRMELER BAŞLANGICI ---

// Ana Sayfa (İnternetteki hatayı düzelten kısım)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Yönetici Paneli
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// --- YÖNLENDİRMELER BİTİŞİ ---

app.get('/download', (req, res) => {
    const filename = req.query.file;
    const filePath = path.join(__dirname, 'public', 'images', filename);
    res.download(filePath, filename, (err) => {
        if (err) res.status(404).send("Dosya bulunamadı!");
    });
});

app.post('/api/delete-wallpaper', (req, res) => {
    const { id, password } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Yetkisiz işlem! Şifre yanlış." });
    }

    const data = JSON.parse(fs.readFileSync(dbPath));
    const wallpaperToDelete = data.find(w => w.id === Number(id));

    if (!wallpaperToDelete) {
        return res.status(404).json({ error: "Görsel bulunamadı!" });
    }

    const filePath = path.join(__dirname, 'public', 'images', wallpaperToDelete.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); 
    }

    const filteredData = data.filter(w => w.id !== Number(id));
    fs.writeFileSync(dbPath, JSON.stringify(filteredData, null, 2));

    res.json({ message: "Görsel başarıyla silindi!" });
});

app.listen(PORT, () => {
    console.log(`Gelişmiş Sunucu açıldı: http://localhost:${PORT}`);
});
