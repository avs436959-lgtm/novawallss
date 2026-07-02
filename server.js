const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// JSON ve istek gövdelerini okumak için gerekli midleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ÇOK KRİTİK: Public klasörünü dışarıya açar (HTML, JS, CSS ve Görseller için)
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa rotası (Ziyaretçiler için temiz İngilizce sayfa)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin paneli rotası (Sadece senin bildiğin gizli silme alanı)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Mock veritabanı veya API rotaların (Mevcut kodunda ne varsa buraya ekleyebilirsin)
// Örnek: app.get('/api/wallpapers', ...) 
// Örnek: app.post('/api/delete-wallpaper', ...)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
