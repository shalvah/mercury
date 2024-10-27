module.exports = {
    apps: [
        {
            name: "mercury",
            script: "./app.js",
            env: {
                NODE_ENV: "staging",
            },
            env_production: {
                NODE_ENV: "production",
                DEBUG: "tentacle:*",
            },
            log_file: 'mercury.log',
            time: true,
            node_args: "--experimental-sqlite",
            instances : "1",
            exec_mode : "cluster"
        }
    ]
};
