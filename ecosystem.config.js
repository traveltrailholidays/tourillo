module.exports = {
  apps: [
    {
      name: 'tourillo',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/app',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/www/app/logs/error.log',
      out_file: '/var/www/app/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
