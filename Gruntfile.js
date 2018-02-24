module.exports = function(grunt) {
    /**
     * @typedef {{initConfig:function, loadNpmTasks:function, registerTask:function}} grunt
     */
    grunt.initConfig({
        sshexec: {
            deploy: {
                command: [
                    'cd /data/www/svr',
                    'git checkout master && git fetch',
                    'git reset --hard origin/master',
                    'git pull origin master',
                    'npm i -no-optional && pm2 restart all'
                ].join(' && '),
                options: {
                    host        : '47.52.136.193',
                    port        : '22',
                    privateKey  : '~/.ssh/id_rsa',
                    passphrase  : '',
                    username    : 'root',
                    showProgress: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-ssh');
    grunt.registerTask('api', ['sshexec:deploy']);
};