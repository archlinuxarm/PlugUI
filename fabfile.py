from fabric.api import *
from fabric.contrib.project import rsync_project
from fabric.contrib.files import exists

# globals

env.project_name = 'plugbuild-web'
env.git_url = 'git://github.com/archlinuxarm/plugbuild-web.git'
env.path = '/var/www/plugbuild-web'

# environments

@task
def local():
	"Use the local virtual server"
	env.hosts = ['192.168.1.2']
	env.user = 'root'

@task
def production():
	"Use a VPS"
	env.hosts = ['archlinuxarm.org']
	env.user = 'root'

@task
def development():
	"Use a dev VPS"
	env.hosts = ['dev.archlinuxarm.org']
	env.user = 'root'

@task
def setup():
	"""
	Setup a fresh virtualenv as well as a few useful directories, then run
	a full deployment
	"""
	require('hosts', provided_by=[local, production, development])
	require('path')
	run('aptitude install -y supervisor')
	
	run('aptitude install -y libev-dev python-dev libevent-dev libxml2-dev libzmq-dev')
	
	run('aptitude install -y python-setuptools python-software-properties')
	run('easy_install pip')
	run('pip install virtualenv')

	# make project directory 
	run('mkdir -p %(path)s' % env)

	# create python virtualenv 
	with cd(env.path):
		run('virtualenv .')

	run('mkdir -p %(path)s/release' % env, pty=True)
	with cd(env.path):
		run('git clone %(git_url)s release' % env)

	run('mkdir -p %(path)s/logs' % env, pty=True)
	
	# make sure nginx is installed and running
	run('add-apt-repository -y ppa:nginx/stable')
	run('aptitude install -y nginx')

	deploy()

@task
def deploy():
	"""
	Deploy the latest version of the site to the servers, install any
	required third party modules, install the virtual host and 
	then restart the webserver
	"""
	require('hosts', provided_by=[local, production, development])
	require('path')

	sync()
	install_requirements()
	restart_webserver()
	restart_appserver()

@task
def rollback(commit):
	"""
	Rollback to specific git commit
	"""
	require('hosts', provided_by=[local, production, development])
	require('path')
	with cd("%(path)s/release" % env):
		run('git checkout %(commit)')
	restart_webserver()
	restart_appserver()
	
# Helpers. These are called by other functions rather than directly

def install_requirements():
	with cd(env.path):
		run('pip install -E . -r ./release/requirements.pip')

def sync():
	with cd("%(path)s/release" % env):
		run('git pull')
		run('chown -R www-data %(path)s' % env)

def restart_webserver():
	"Restart the web server"
	if not exists('/etc/nginx/sites-enabled/plugbuild-web.conf'):
		run('ln -s %(path)s/release/plugbuild-web-nginx.conf /etc/nginx/sites-enabled/plugbuild-web.conf' % env, pty=True)
	run('service nginx configtest')
	run('service nginx reload')
	
	
def restart_appserver():
	if not exists('/etc/supervisor/conf.d/plugbuild-web.conf'):
		run('ln -s %(path)s/release/plugbuild-web-supervisor.conf /etc/supervisor/conf.d/plugbuild-web.conf' % env, pty=True)
	run('supervisorctl update')
	run('supervisorctl restart plugbuild-web:server1')
	run('sleep 10')
	run('supervisorctl restart plugbuild-web:server2')
	
	
	
