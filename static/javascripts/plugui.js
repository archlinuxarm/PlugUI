// global stuff
var directory = '';
var currentpath = '';
var authenticated = false;


function login() {
	console.log("Login");
    var username    = $('#usernamefield').attr('value');
	var password	= $('#passwordfield').attr('value');

    if (username == "") {  
        console.log("No username");        
        $("#usernamefield").focus();  
        return false;  
    } 	
    if (password == "") {  
        console.log("No password");        
        $("#passwordfield").focus();  
        return false;  
    } 
	
	
	$.ajax({
           type: "POST",
           url: "/api/login",
           dataType : 'json',
		   data: { apicmd: "login", "username": username, "password": password },
           success: function(json){
				console.log("Login request succeeded");
                if (json.authenticated == true) {
					authenticated = true;
					console.log("Login request succeeded");
					get_page('dashboard');
				}
				else {
					console.log("Login failed");
					$('#login_error').text("Login failed");
				}
				
           }
    });
}



function plugui_init() {
	//get_page('dashboard');
	//update_stats();
	//update = setInterval(update_stats, 1000);
	
	//update_packages();
	//update_packages = setInterval(update_stats, 600000);
	
	//soundManager.url = '/static/flash/';
	//soundManager.flashVersion = 9;
	//soundManager.useFlashBlock = false;

	//soundManager.onready(function() {
		// Ready to use; soundManager.createSound() etc. can now be called.
	//});

}




function showloader() {
	$('#loader').show();
}
	
function hideloader() {
	setTimeout( function(){ $('#loader').hide() }, 500);
}

//system stuff


function reboot() {
	$('#button').hide();
	$('#text').html('Please wait, your device is rebooting. You will be redirected to the home page in 60 seconds.');
	$.ajax({
        type: "POST",
		data: { command: runcommand, cmd: "reboot" },
        url: '/api/system',
        cache: false,
	});
	setTimeout("get_page('dashboard')",60000);
}

//file page stuff

function getTree(directory) {
	showloader();
	$.ajax({
		   type: 'POST',
		   cache: false,
		   url : '/api/files',
		   data: { apicmd: "directory_list", path: directory },
		   dataType : 'json',
		   success: function (json) { 
				hideloader();
				var returnlist = json;
				if (returnlist) {
									}
				else {
					$('#filelist').html("Did not receive a response"); 
				}
				
		   }
	});
	hideloader();
}

function downloadFile(item) {
	var form = document.createElement("form");
	form.setAttribute("method", "post");
	form.setAttribute("action", "/api/files");
	document.body.appendChild(form);

	var hidden;

	// append cmd to form
	hidden = document.createElement('input');
	hidden.type = 'hidden';
	hidden.name = 'apicmd';
	hidden.value = 'download';
	form.appendChild(hidden);
	
	// append path to form
	hidden = document.createElement('input');
	hidden.type = 'hidden';
	hidden.name = 'path';
	hidden.value = directory + "/" + item.text;
	form.appendChild(hidden);
	
	form.submit();
}

function viewFile(item) {
	var form = document.createElement("form");
	form.setAttribute("method", "post");
	form.setAttribute("action", "/api/files");
	document.body.appendChild(form);

	var hidden;

	// append cmd to form
	hidden = document.createElement('input');
	hidden.type = 'hidden';
	hidden.name = 'apicmd';
	hidden.value = 'view';
	form.appendChild(hidden);
	
	// append path to form
	hidden = document.createElement('input');
	hidden.type = 'hidden';
	hidden.name = 'path';
	hidden.value = directory + "/" + item.text;
	form.appendChild(hidden);
	
	form.submit();
}

function deleteShare(uuid) {
    $.ajax({
           type: "POST",
           url: "/deleteshare",
           data: { uuid: uuid },
           dataType : 'json',
           success: function(json){
				var response = json;
				if (json.success) {
					$('#share-'+uuid).remove();
				}
				else {
					
				}
           }
    });
}
    

function shareFile(item) {
		var form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", "/addshare");

        // setting form target to a window named 'formresult'
        form.setAttribute("target", "formresult");

        var hiddenField = document.createElement("input");              

		// append cmd to form
		hiddenField = document.createElement('input');
		hiddenField.type = 'hidden';
		hiddenField.name = 'apicmd';
		hiddenField.value = 'share';
		form.appendChild(hiddenField);

		// append path to form
		hiddenField = document.createElement('input');
		hiddenField.type = 'hidden';
		hiddenField.name = 'path';
		hiddenField.value = "/media/" + directory + "/" + item.text;
		form.appendChild(hiddenField);
        document.body.appendChild(form);
        window.open('/addshare', 'formresult', 'scrollbars=no,menubar=no,height=400,width=650,resizable=no,toolbar=no,status=no');
        form.submit();
}
	
function playMedia(item) {
	path = item.text;
	showloader();
	$("#player").jPlayer("destroy");
	var filetype = '';
	if (item.iconCls == 'file-mp3') {
		filetype = 'mp3';
	}
	else if (item.iconCls == 'file-m4a') {
		filetype = 'm4a';
	}
	else if (item.iconCls == 'file-oga') {
		filetype = 'oga';
	}
	$('#player').jPlayer({
						 ready: hideloader(),
						 swfPath: '/static',
						 solution: 'html, flash',
						 supplied: filetype,
						 preload: 'metadata',
						 volume: 1.0,
						 muted: false,
						 backgroundColor: 'transparent',
						 cssSelectorAncestor: '#jp_interface_1',
						 cssSelector: {
						 
						 play: '.jp-play',

						 pause: '.jp-pause',
						 
						 stop: '.jp-stop',

						 seekBar: '.jp-seek-bar',

						 playBar: '.jp-play-bar',

						 volumeBar: '.jp-volume-bar',
						 volumeBarValue: '.jp-volume-bar-value',
						 
						 currentTime: '.jp-current-time',
						 duration: '.jp-duration'
						 },
						 errorAlerts: false,
						 warningAlerts: false
	});
	if (filetype == 'mp3') {
		$('#player').jPlayer("setMedia", { mp3: "/api/files?apicmd=stream&path=" + directory + "/" + encodeURIComponent(path) }).jPlayer("play");
	}
	else if (filetype == 'm4a') {
		$('#player').jPlayer("setMedia", { m4a: "/api/files?apicmd=stream&path=" + directory + "/" + encodeURIComponent(path) }).jPlayer("play");
	}
	else if (filetype == 'oga') {
		$('#player').jPlayer("setMedia", { oga: "/api/files?apicmd=stream&path=" + directory + "/" + encodeURIComponent(path) }).jPlayer("play");
	}
	$('#current-track').text(item.text);
}
	

function selectLine(item) {
	$('#filename').text(item.text);
	$('#filetype').text(item.iconCls);
	$('#filesize').text(item.size);
	$('#filedate').text(item.date);

	if (item.folder == true) {
	
	}
	else {

	}
	
}

function selectParent() {
	var directory_array = directory.split("/");
	directory_array.pop();
	var newdir = directory_array.join("/");
	directory = newdir;
	getTree(newdir);
}

function selectLink(item) {
	if (item.folder == true) {
		var directory_array = directory.split("/");
		directory_array.push(item.text);
		var newdir = directory_array.join("/");
		directory = newdir;
		getTree(newdir);
	}
	else {
		
	}	
}

//software stuff

function checkUpdates() {
	$('#os').html("Checking for updates...");
	$('#upgradebuttons').hide();
	$('#checkbuttons').hide();
	$('#loading').show();
	$.ajax({
        type: 'POST',
        cache: false,
        url : '/api/pacman',
		data: { apicmd: "check_for_updates" },
        dataType : 'json',
        success: function (json) { 
			$('#loading').hide();
			var returnlist = json;
			if (returnlist.hasupgrades) {
				showUpgrade();
				$('#os').html(returnlist.numberofpackages + " update(s) available."); 
				$('#updatecount').html(returnlist.numberofpackages);
				$.each(returnlist.packages, function(i,package){
					var packageline = document.createElement("div");
					packageline.setAttribute('class', 'package');
					var packagename = document.createTextNode(package.name + " " + package.newversion);
					packageline.appendChild(packagename);
					$(packageline).appendTo("#os");
				});
            }
            else {
                $('#os').html("All software is up to date!"); 
				showCheck();
            }
			
		}
	});
}

function doUpgrade() {
	$('#loading').show();
	$('#os').empty();
	$('#os').html('Upgrading....');
	$('#upgradebuttons').hide();
	$('#checkbuttons').hide();
	$.ajax({
		type: 'POST',
		cache: false,
		url : '/api/pacman',
		data: { apicmd: "do_upgrade" },
		dataType : 'json',
		success: function (json) { 
			var returndata = json;
			$('#loading').hide();
			$('#os').html(returndata.output);
			$('<p><b>All done!</b></p>').appendTo('#os');
			showCheck();
			$('#updatecount').html("None");
		}
	});
}

function update_packages() {
	$.ajax({
           type: "POST",
           url: "/api/pacman",
           dataType : 'json',
		   data: { apicmd: "list_updates" },
           success: function(json){
                var result = json;
                if (result.success == true) {
					console.log(result);
                    $('#package-notification').text("Success");
					
                }
           }
    });
}



//storage page stuff

function generate_list() {

	var storagelist = document.getElementById('storagelist');
	$.each(devicelist, function(i,device){
		

		//new storage line	
		var storageline = document.createElement("div");
		storageline.setAttribute('class', 'device-row');
		storageline.onclick = function(){ select_line(device); $('.device-row').removeClass('highlightRow'); $(this).addClass('highlightRow'); };
		
		//create an element to hold the mountpoint
		var mountpoint = document.createElement("div");
		mountpoint.setAttribute('class', 'mountpoint');
		var text = document.createTextNode(device.mountpoint);
		mountpoint.appendChild(text);
		storageline.appendChild(mountpoint);

		//create an element to hold the device name
		var devicename = document.createElement("div");
		devicename.setAttribute('class', 'devicename');
		var text = document.createTextNode(device.devicename);
		devicename.appendChild(text);
		storageline.appendChild(devicename);
	
		
		//create an element to hold the filesystem
		var filesystem = document.createElement("div");
		filesystem.setAttribute('class', 'filesystem');
		var text = document.createTextNode(device.filesystem);
		filesystem.appendChild(text);
		storageline.appendChild(filesystem);
		
		//create an element to hold the space free
		var spaceused = document.createElement("div");
		spaceused.setAttribute('class', 'spaceused');
		var text = document.createTextNode(device.prettyspaceused);
		spaceused.appendChild(text);
		storageline.appendChild(spaceused);
		
		//create an element to hold the space used
		var spacefree = document.createElement("div");
		spacefree.setAttribute('class', 'spacefree');
		var text = document.createTextNode(device.prettyspacefree);
		spacefree.appendChild(text);
		storageline.appendChild(spacefree);
		

		//append our new line to the file list
		storagelist.appendChild(storageline);
		
		//create a clearing element and add it to the file list to keep things from floating next to each other
		var clear = document.createElement("div");
		clear.setAttribute('id', 'clear');
		storagelist.appendChild(clear);
	});
}

function select_line(device) {
	$('#devicename').text(device.devicename);
}

function saveSettings() {
	
	
    var twitter_username       = $('#twitterfield').attr('value');
    var github_username        = $('#githubfield').attr('value');
    var prowl_key              = $('#prowlfield').attr('value');

    $.ajax({
           type: "POST",
           url: "/admin/settings/save",
           dataType : 'json',
           data: JSON.stringify({ github_username: github_username, twitter_username: twitter_username, prowl_key: prowl_key }),
           success: function(json){
                var result = json;
                if (result.success == 'true') {
                    $('#error').html("<strong>Saved</strong>");
                    $('#error').fadeIn('slow');
                }
                else {
                    $('#error').html("Save failed");
                    $('#error').fadeIn('slow');
                }  
                setTimeout('$("#error").fadeOut("slow");$("#error").html("");', 3000)
           }
    });
}

function setFileDropbox() {
	var dropbox = $('#dropbox');
	var message = $('.message', dropbox);
	
	dropbox.filedrop({

		paramname:'file',
		maxfiles: 1,
		maxfilesize: 500, // in mb
		url: '/api/files/upload',
					 
		uploadFinished:function(i,file,response){
			//$.data(file).addClass('done');
			message.html("File uploaded");
			//setTimeout(window.location="/admin/files/list",3000);
			// response is the JSON object that post_file.php returns
		},
					 
		error: function(err, file) {
			switch(err) {
				case 'BrowserNotSupported':
					message.html('Browser unsupported');
					break;
				case 'TooManyFiles':
					message.html('Limit 1 file');
					break;
				case 'FileTooLarge':
					message.html(file.name+' is too large');
					break;
				default:
					break;
			}
		},
					 
		// Called before each upload is started
		beforeEach: function(file){
			//
		},
						
		uploadStarted:function(i, file, len){
			message.html("Uploading " + file.name);
		},
					 
		progressUpdated: function(i, file, progress) {
			$('.progress').width(progress + "%");
		}
	});
}






function update_stats() {
	$.ajax({
           type: "POST",
           url: "/api/status",
           dataType : 'json',
           success: function(json){
                var result = json;
                if (result.success == true) {
                    $('#loadfield').text(result.cpu + "%");
					$('#memused').text(result.memused + "%");
                }
           }
    });
}

function show_controls() {
	if ($("ul.inset").is(":hidden")) {
		$('#controlbutton').addClass('selected');
		$("ul.inset").slideDown({
			duration:500,
			easing:"swing",
			complete:function(){
			//alert("complete!");
			}
		});
	} else {
		$('#controlbutton').removeClass('selected');

		$("ul.inset").slideUp({
			duration:500,
			easing:"swing",
			complete:function(){
			//alert("complete!");
			}
		});
	}
	
	

}












// User stuff


function get_users() {
	$.ajax({
           type: "POST",
           url: "/api/user",
           dataType : 'json',
		   data: { apicmd: "list" },
           success: function(json){
                var result = json;
                if (result.success == true) {
					$('#userlist').empty();
                    $.each(result.users, function(i,user){
						var userline = document.createElement("li");
						
						var span = document.createElement("span");
						var text = document.createTextNode(user.username);
						span.appendChild(text);
						userline.appendChild(span);
						
						var del = document.createElement("a");
						var t = document.createTextNode("D");
						del.appendChild(t);
						del.onclick = function(){ delete_user(user.uuid); return false };
						
						
						userline.appendChild(del);
						
						$('#userlist').append(userline);
						
						
					});
					
					
							
					
                }
				
           }
    });
	
}

function add_user() {
	$("#overlay").fadeIn(); 
}

function createUser() {
	var admin, username, password, password2, email;

    /*if ($('#adminfield').attr('value') !== undefined) {
        admin = $('#adminfield').attr('value');
    }
    else {
        $("#adminfield").focus(); 
        $('#usererror').html("No admin selection");
        return false;
    }*/

    
    if ($('#usernamefield').attr('value') !== undefined) {  
        var username	= $('#usernamefield').attr('value');

    } 
	else {
		$("#usernamefield").focus(); 
        $('#usererror').html("Username blank");
        return false;  
	}
	
	
	
	
    if ($('#passwordfield').attr('value') !== undefined) {  
        var password	= $('#passwordfield').attr('value');    
    } 	
	else {
		$("#passwordfield").focus();  
        $('#usererror').html("No password");
        return false;  
	}
    if ($('#password2field').attr('value') !== undefined) {  
        var password2	= $('#password2field').attr('value');    
    } 	
	else {
		$("#password2field").focus();  
        $('#usererror').html("Repeat password");
        return false;  
	}
	
	
    if ($('#emailfield').attr('value') !== undefined) {  
		var email		= $('#emailfield').attr('value');
    } 
	else {
		$("#emailfield").focus(); 
        $('#usererror').html("No email address");
        return false;  
	}
	
	
	if (password != password2) {
		$("#password2field").focus(); 
        $('#usererror').html("Passwords don't match");
        return false; 	
	}

    $.ajax({
        type: "POST",
        url: "/api/user",
        dataType : 'json',
           data: { "apicmd": "create", "email": email, "username": username, "password": password, /* "admin": admin */ },
			success: function(json){
            var result = json;
            if (result.success == true) {
				
                $('#usererror').html("<strong>User created</strong>");
                $('#usererror').fadeIn('slow');
				//setTimeout(window.location.replace("/admin/settings"), 3000);
            }
            else {
                $('#usererror').html("Create user failed");
                $('#usererror').fadeIn('slow');
            }  
            setTimeout('$("#error").fadeOut("slow");$("#error").html("");', 3000);
			$("#overlay").fadeOut(); 
			get_users();
        }
    });
}

function delete_user(uuid) {

    $.ajax({
        type: "POST",
        url: "/api/user",
        dataType : 'json',
           data: { "apicmd": "delete", "uuid": uuid },
			success: function(json){
            var result = json;
            if (result.success == true) {

            }
            else {
  
            }  

			get_users();
        }
    });
}


