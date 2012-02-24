import sys, os
import uuid as _uuid
import datetime
from array import *
from storm.locals import *
import hashlib

	
class User(object):
	__storm_table__ = 'user'
	id = Int(primary=True)
	username = Unicode()
	hashedpassword = Unicode()
	uuid = Unicode()
	date = DateTime()
	admin = Bool()


class Share(object):
	__storm_table__ = 'share'
	id = Int(primary=True)
	path = Unicode()
	uuid = Unicode()
	public = Bool()

	  
class Settings(object):
	__storm_table__ = 'settings'
	id = Int(primary=True)
	
	
	
class Database(object):
	def __init__(self):
		self.salt = '70197a4d3a5cd29b62d4239007b1c5c3c0009d42d190308fd855fc459b107f40a03bd427cb6d87de18911f21ae9fdfc24dadb0163741559719669c7668d7d587'
		self.database = create_database('sqlite:/var/lib/PlugUI/server.sqlite')
		self.store = Store(self.database)
		self.create_tables()
		self.setupmode = self.check_superuser()
		
	def password_hash(self,password_cleartext):
		hash = hashlib.sha256(self.salt + password_cleartext).hexdigest()
		return unicode(hash)


# settings																									 #
# ---------------------------------------------------------------------------------------------------------- #
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! #

	def create_tables(self):
		# store.execute("CREATE TABLE settings (id INTEGER PRIMARY KEY)", noresult=True)
		self.store.execute("CREATE TABLE IF NOT EXISTS share (id INTEGER PRIMARY KEY, path VARCHAR, uuid VARCHAR, public INTEGER)")
		self.store.execute("CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY, username VARCHAR, hashedpassword VARCHAR, uuid VARCHAR, email VARCHAR, date VARCHAR, admin INTEGER)")
		self.store.flush()
		self.store.commit()
		
	def get_settings(self):
		return self.store.get(Settings, 1)
		
		
	def save_settings(self,dict):
		try:
			twitter_username	= dict['twitter_username']
			github_username		= dict['github_username']
			prowl_key			= dict['prowl_key']
		
			query				= { "type": "settings" }
			settings			= { "updated": datetime.datetime.now(), "twitter_username": twitter_username, "github_username": github_username, "prowl_key": prowl_key }
	
			command				= { "$push": { "global": settings } }
	
			self.system.update(query, command, upsert=True)
			return True
		except Exception as e:
			print "Exception during save settings: %s" % e.__str__()
			return False
		
		
		
		
		
# authentication                                                                                             #
# ---------------------------------------------------------------------------------------------------------- #
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! #

	def create_user(self,username,password,admin=False):
		try:
			print username, password
			user = User()
			
			user.username = username  
			user.hashedpassword = self.password_hash(password)
			user.uuid = unicode(_uuid.uuid4().hex)
			user.date = datetime.datetime.utcnow()
			user.admin = admin
			self.store.add(user)
			self.store.flush()
			self.store.commit()
			self.setupmode = False
			return True
		except Exception as e:
			print "Exception during create user: %s" % e.__str__()
			return False

	# takes a UUID string for the user and nothing else
	def delete_user(self,uuid=False):
	
		# if neither of these have been set, just return 
		if not uuid:
			return False
		try:
			user = self.store.find(User, User.uuid == uuid).one()
			self.store.remove(user)
			self.store.flush()
			self.store.commit()
			return True
		except Exception as e:
			print "Exception during delete user: %s" % e.__str__()
			return False






	def list_users(self):
		result = self.store.find(User)
		return [ { "username": user.username, "uuid": user.uuid } for user in result.order_by(User.username) ]

	

	def check_user(self,username,password):
		user = self.store.find(User, User.username == username, User.hashedpassword == self.password_hash(password) ).one()
		if user:
			print "found user"
			return user
		else:
			print "User not found in db: %s" % username
			return False



	def check_superuser(self):
		superuser = self.store.find(User, User.admin == True ).one()
		if superuser:
			return False
		else:
			return True
		