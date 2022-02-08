module.exports = {
    apps: [{
        name: 'viewer',
        script: 'build/app.js',
        exec_mode: 'cluster',
        instances: '2',
        node_args: '--max_old_space_size=1024',
        error_file: '/home/ubuntu/log/error.log',
        out_file: '/home/ubuntu/log/access.log'
    }]
}
