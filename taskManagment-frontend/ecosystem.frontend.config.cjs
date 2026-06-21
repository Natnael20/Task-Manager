module.exports = {
  apps: [{
    name: 'frontend',
    script: 'cmd',
    args: ['/c', 'serve -s dist -l 3000'],
    windowsHide: true,
    cwd: 'C:/Users/natuw/Documents/VS/Frontend/Clone/Mobile/taskManagment-frontend'
  }]
};