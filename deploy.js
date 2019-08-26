const path = require('path');
const NodeSsh = require('node-ssh');
const ssh = new NodeSsh();

(async () => {
  let status;
  const failed = [];
  const successful = [];

  // connect to ssh
  await ssh.connect({
    host: process.env.SSH_HOST,
    username: process.env.SSH_USERNAME,
    password: process.env.SSH_PASSWORD,
    port: 22,
  });

  if (process.env.SSH_FOLDER !== '') {
    // delete what exists in current folder
    await ssh.execCommand(`rm -rf ${process.env.SSH_FOLDER}/*`)

    // copy directory
    status = await ssh.putDirectory(`${__dirname}/build`, process.env.SSH_FOLDER, {
      recursive: true,
      concurrency: 10,
      validate: (itemPath) => {
        const baseName = path.basename(itemPath);
        return baseName.substr(0, 1) !== '.' && // do not allow dot files
          baseName !== 'node_modules'; // do not allow node_modules
      },
      tick: (localPath, remotePath, error) => {
        if (error) {
          failed.push(localPath);
        } else {
          successful.push(localPath);
        }
      }
    });
  }

  console.log('the directory transfer was', status ? 'successful' : 'unsuccessful');
  if (failed.length > 0) {
    console.log('failed transfers:', failed.join('\n'));
  }
  ssh.dispose();
})();
