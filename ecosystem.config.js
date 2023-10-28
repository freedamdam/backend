module.exports = {
	apps: [
		{
			name: 'backend',
			script: 'build/src/app.js',
			autorestart: true,
			watch: ['src'],

			max_restarts: 1,

			max_memory_restart: '300M',
			ignore_watch: ['node_modules'],
			env: {
				PORT: 3000,
				NODE_ENV: 'production',
			},
		},
	],
}
