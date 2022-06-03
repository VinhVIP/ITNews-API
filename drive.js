const fs = require('fs');
const { google } = require('googleapis');
const { Duplex } = require('stream');

const MyDrive = {}

const KEYFILEPATH = "itnews-drivekey.json";
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const FOLDER = '1XYtDHJWOG6lkuodWz_F7mmjB8pvVpkTi';

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES
})

function bufferToStream(buffer) {
  const duplexStream = new Duplex();
  duplexStream.push(buffer);
  duplexStream.push(null);
  return duplexStream;
}


MyDrive.uploadImage = async (file, filename) => {
  const driveService = google.drive({ version: 'v3', auth });

  let fileMetaData = {
    'name': filename + '.png',
    'parents': [FOLDER]
  }

  let media = {
    mimeType: 'image/jpeg',
    body: bufferToStream(file.data)
  }

  let response = await driveService.files.create({
    resource: fileMetaData,
    media: media,
    fields: 'id'
  })

  switch (response.status) {
    case 200:
      let file = response.result;
      console.log("ok", response.data.id);
      return response.data.id;
    default: console.error("err", response.error); break;
  }

  return false;
}

function listFiles(auth) {
  const drive = google.drive({ version: 'v3', auth });
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
        deleteFiles(auth, file.id);

      });
    } else {
      console.log('No files found.');
    }
  });
}

MyDrive.deleteFiles = (idFile) => {
  const drive = google.drive({ version: 'v3', auth });
  console.log("delete id: "+idFile);
  drive.files.delete({
    'fileId': idFile
  }, (err, res) => {
    if (err) {
      console.log(err);
      return false;
    }
    else {
      // File k tồn tại thì vẫn ok
      console.log("delete ok");
      return true;
    }
  })
}

MyDrive.getImageId = (path) => {
  let pos = path.lastIndexOf('=');
  return path.substr(pos + 1);
}

module.exports = MyDrive;