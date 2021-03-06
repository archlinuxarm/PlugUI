from fabric.api import *
from fabric.contrib.project import rsync_project
from fabric.contrib.files import exists

env.project_name = 'PlugUI'
env.path = '/opt/PlugUI'
env.local_dir = '/SourceCache/Projects/PlugUI/'
env.user = 'root'
env.warn_only = True 

# environments

@task
def local():
	"Use a local plug"
	env.hosts = ['192.168.1.11']


# tasks

@task
def setup():
	require('hosts', provided_by=[local])
	require('path')
	run('pacman -S --noprogressbar --noconfirm nodejs')
	run('pacman -S --noprogressbar --noconfirm rsync')
	run('mkdir -p %(path)s' % env, pty=True)
	if not exists('/etc/rc.d/plugui'):
		run('ln -s %(path)s/plugui.sh /etc/rc.d/plugui' % env, pty=True)
	with cd(env.path):
		run('npm install express')
		run('npm install unixlib')
		run('npm install each')
		run('npm install connect-form')
	deploy()
	

@task
def deploy():
	require('hosts', provided_by=[local])
	require('path')

	upload()
	restart_appserver()
	
# Helpers. These are called by other functions rather than directly

def upload():
	rsync_project(remote_dir='%(path)s/' % env, local_dir=env.local_dir) 
	run('chown -R root %(path)s' % env)
	
def restart_appserver():
	run('chmod +x /opt/PlugUI/plugui.sh')
	run('/etc/rc.d/plugui restart')
	
	
	
	
	