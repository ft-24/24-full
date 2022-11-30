
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

export default (filename: string) => {
  const randomPath: string = `${uuid()}${extname(filename)}`
  return randomPath;
}