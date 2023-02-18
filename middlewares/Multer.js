import multer from 'multer';

const Storage=multer.memoryStorage();

const singleUpload=multer({Storage}).single("file");

export default singleUpload;