import DataUrlParser from 'datauri/parser.js';
import  path  from 'path';

const getDatauri=(file)=>{

    const parser= new DataUrlParser();
    const extName=path.toNamespacedPath(file.originalname).toString()

   return parser.format(extName,file.buffer)
};

export default getDatauri;