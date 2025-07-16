const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'team');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

module.exports = (pool) => {
    // Get all team members
    router.get('/', async (req, res) => {
        try {
            const [members] = await pool.query('SELECT * FROM team_members ORDER BY id');
            res.json(members);
        } catch (error) {
            console.error('Error fetching team members:', error);
            res.status(500).json({ message: 'Error fetching team members' });
        }
    });

    // Add new team member (admin only)
    router.post('/', auth, upload.single('image'), async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const { name, position, description } = req.body;
            const image_url = req.file ? `/uploads/team/${req.file.filename}` : null;

            const query = 'INSERT INTO team_members (name, position, description, image_url) VALUES (?, ?, ?, ?)';
            const [result] = await pool.query(query, [name, position, description, image_url]);

            res.status(201).json({
                id: result.insertId,
                name,
                position,
                description,
                image_url
            });
        } catch (error) {
            console.error('Error adding team member:', error);
            res.status(500).json({ message: 'Error adding team member' });
        }
    });

    // Update team member (admin only)
    router.put('/:id', auth, upload.single('image'), async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const { id } = req.params;
            const { name, position, description } = req.body;
            
            let updateQuery = 'UPDATE team_members SET name = ?, position = ?, description = ?';
            let queryParams = [name, position, description];

            if (req.file) {
                const image_url = `/uploads/team/${req.file.filename}`;
                updateQuery += ', image_url = ?';
                queryParams.push(image_url);

                // Delete old image
                const [oldMember] = await pool.query('SELECT image_url FROM team_members WHERE id = ?', [id]);
                if (oldMember[0] && oldMember[0].image_url) {
                    const oldPath = path.join(__dirname, '..', 'public', oldMember[0].image_url);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
            }

            updateQuery += ' WHERE id = ?';
            queryParams.push(id);

            await pool.query(updateQuery, queryParams);
            
            const [updatedMember] = await pool.query('SELECT * FROM team_members WHERE id = ?', [id]);
            res.json(updatedMember[0]);
        } catch (error) {
            console.error('Error updating team member:', error);
            res.status(500).json({ message: 'Error updating team member' });
        }
    });

    // Delete team member (admin only)
    router.delete('/:id', auth, async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const { id } = req.params;

            // Delete image file
            const [member] = await pool.query('SELECT image_url FROM team_members WHERE id = ?', [id]);
            if (member[0] && member[0].image_url) {
                const imagePath = path.join(__dirname, '..', 'public', member[0].image_url);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            await pool.query('DELETE FROM team_members WHERE id = ?', [id]);
            res.json({ message: 'Team member deleted successfully' });
        } catch (error) {
            console.error('Error deleting team member:', error);
            res.status(500).json({ message: 'Error deleting team member' });
        }
    });

    return router;
}; 