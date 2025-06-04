const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const sanitize = require('sanitize-filename');
const mime = require('mime-types');

const app = express();
const port = process.env.PORT || 3000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from public directory
app.use('/uploads', express.static('uploads'));
app.use('/login', express.static('public/login.html'));

const requireAuth = (req, res, next) => {
    if (req.session.authenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Protect all routes except login
app.use((req, res, next) => {
    // Allow access to login page and its assets
    if (req.path === '/login' || req.path.startsWith('/uploads/')) {
        next();
    } else {
        requireAuth(req, res, next);
    }
});

// Serve static files from public directory after auth check
app.use(express.static('public'));

app.post('/login', express.json(), async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash('MyCDN', 10);
    
    if (username === 'Osama' && await bcrypt.compare(password, hashedPassword)) {
        req.session.authenticated = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const sanitizedFilename = sanitize(file.originalname);
        cb(null, Date.now() + '-' + sanitizedFilename);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.json({
        success: true,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype
    });
});

app.get('/files', requireAuth, (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error reading files' });
        }
        const fileList = files.map(filename => {
            const filePath = path.join(uploadsDir, filename);
            const stats = fs.statSync(filePath);
            const mimetype = mime.lookup(filename) || 'application/octet-stream';
            return {
                filename,
                originalname: filename.split('-').slice(1).join('-'),
                mimetype,
                size: stats.size,
                date: stats.mtime
            };
        });
        res.json({ success: true, files: fileList });
    });
});

app.get('/files/:filename', (req, res) => {
    const filename = sanitize(req.params.filename);
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    const mimetype = mime.lookup(filename) || 'application/octet-stream';
    res.setHeader('Content-Type', mimetype);
    res.sendFile(filePath);
});

app.delete('/files/:filename', requireAuth, (req, res) => {
    const filename = sanitize(req.params.filename);
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found' });
    }

    try {
        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, message: 'Error deleting file' });
    }
});

app.get('/settings', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.post('/settings', requireAuth, express.json(), async (req, res) => {
    const { newPassword, confirmPassword, maxFileSize, allowedTypes, twoFactor, requirePassword } = req.body;

    try {
        if (newPassword && confirmPassword) {
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ success: false, message: 'Passwords do not match' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
        }

        const settings = {
            maxFileSize: parseInt(maxFileSize) || 100,
            allowedTypes: allowedTypes || [],
            twoFactor: twoFactor === 'on',
            requirePassword: requirePassword === 'on'
        };

        res.json({ success: true, settings });
    } catch (error) {
        console.error('Settings error:', error);
        res.status(500).json({ success: false, message: 'Error saving settings' });
    }
});

app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 