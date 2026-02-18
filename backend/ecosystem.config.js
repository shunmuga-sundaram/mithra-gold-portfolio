/**
 * PM2 Ecosystem Configuration
 *
 * This file tells PM2 how to run your application
 * and which environment variables to load
 */

module.exports = {
  apps: [
    {
      name: 'api',
      script: './build/index.js',

      // Environment variables (loaded from .env file)
      env_file: '.env',

      // Watch for file changes (disable in production)
      watch: false,

      // Instances (1 for development, 'max' for production)
      instances: 1,

      // Auto restart on crash
      autorestart: true,

      // Max memory before restart
      max_memory_restart: '500M',

      // Logging
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,

      // Merge logs from all instances
      merge_logs: true,

      // Node.js options
      node_args: '',
    },
  ],
};
