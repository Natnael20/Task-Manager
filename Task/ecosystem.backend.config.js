module.exports = {
  apps: [
    {
      name: 'Task-Backend',
      script: 'javaw',
      args: ['-jar', 'target/Task-0.0.1-SNAPSHOT.jar'],
      interpreter: 'none',
      windowsHide: true
    },
  ]
};