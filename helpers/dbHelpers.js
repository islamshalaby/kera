const { spawn } = require('child_process')
const path = require('path')
const mongoose = require('mongoose')

// mongoexport --uri mongodb+srv://kera:0185865167Isso@kera.lai3r.mongodb.net/kera-test --collection users --type json --out /home/islam/Documents/node-projects/kera/db/users.json --forceTableScan
function backupMongoDb(collection, path, uri, extension) {
    const child = spawn('mongoexport', [
      `--uri=${uri}`,
      `--collection=${collection}`,
      `--type=${extension}`,
      `--out=${path}/${collection}.${extension}`,
      '--forceTableScan'
    ])
  
    child.stdout.on('data', (data) => {
      console.log('stdout:\n', data)
    })
  
    child.stderr.on('data', (data) => {
      console.log('stderr:\n', Buffer.from(data).toString())
    })
  
    child.on('error', (err) => {
      console.log('error:\n', err)
    })
  
    child.on('exit', (code, signal) => {
      if (code) {
        console.log('process exit with cod:', code)
      }else if(signal) {
        console.log('process killed with signal:', signal)
      }else {
        console.log('backup created successfully')
      }
    })
  }

  module.exports.backup = (path, uri, type) => {
      mongoose.connection.db.listCollections().toArray(function(err, names) {
          if (err) {
              console.log(err);
          }
          else {
              names.forEach(function(e,i,a) {
              backupMongoDb(e.name, path, uri, type)
              console.log("--->>", e.name);
              });
          }
      })
  }

  