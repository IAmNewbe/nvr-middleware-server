const { nanoid } = require('nanoid');
const tasks = require('../../service/inMemmory/tasks.js');

const addTaskHandler = (request, h) => {
  const { server, 
    port,
    name,
    username,
    password,
    prefix } = request.payload;
 
  const id = nanoid(16);
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
 
  const newNote = {
   title, tags, body, id, createdAt, updatedAt,
  };
 
  notes.push(newNote);
 
  const isSuccess = notes.filter((note) => note.id === id).length > 0;
 
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: {
        noteId: id,
      },
    });
    response.code(201);
    return response;
  }
 
  const response = h.response({
    status: 'fail',
    message: 'Catatan gagal ditambahkan',
  });
  response.code(500);
  return response;
};