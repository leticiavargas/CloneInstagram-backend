const Post = require('../models/Post');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

module.exports = {
    async index(req, res){
        const posts = await Post.find().sort('-createdAt');

        return res.json(posts);

    },
    
    async store(req, res){
        const {author, place, description, hastags} = req.body;
        const {filename: image} = req.file;

        const [name] = image.split('.');
        const filename = `${name}.jpg`;

        //redimensiona imagens
        await sharp(req.file.path)
            .resize(500)
            .jpeg({quality:70})
            .toFile(
                path.resolve(req.file.destination, 'resized', filename)
            );

        fs.unlinkSync(req.file.path); //deleta imagem original     

        const post = await Post.create({
            author,
            place,
            hastags,
            image: filename,
        });

        req.io.emit('post', post);

        return res.json(post);
    }
};