// global stuff


window.fileMap = {
	"3gp":	"3gp media", 
	"afp":	"Unknown",
	"afpa": "Unknown",
	"asp":	"Unknown",
	"aspx": "Unknown",
	"avi":	"AVI Video",
	"bat":	"Batch File",
	"bin":	"Binary",
	"bmp":	"BMP Image",
	"c":	"C Source",
	"cfm":	"Unknown",
	"cgi":	"CGI Script",
	"cmd":	"Batch File",
	"com":	"Unknown",
	"cpp":	"C++ Source",
	"css":	"CSS File",
	"doc":	"Word Document",
	"exe":	"Win32 Executable",
	"gif":	"GIF Image",
	"fla":	"Unknown",
	"h":	"C Header",
	"htm":	"HTML File",
	"html": "HTML File",
	"jar":  "Java Package",
	"jpg":	"JPG Image",
	"jpeg":	"JPG Image",
	"js":	"Javascript",
	"lasso":"Unknown",
	"log":	"Log File",
	"m4p":	"MP4 Media",
	"mov":	"Quicktime",
	"mp3":	"MP3 Audio",
	"m4a":	"MP4 Audio",
	"mp4":	"MP4 Media",
	"mkv":	"MKV Media",
	"m4v":	"MP4 Video",
	"mpg":	"MPEG Video",
	"mpeg":	"MPEG Video",
	"ogg":	"OGG Audio",
	"pcx":	"PCX Image",
	"pdf":	"PDF Document",
	"php":	"PHP Script",
	"png":	"PNG Image",
	"ppt":	"Powerpoint",
	"psd":	"Photoshop",
	"pl":	"Perl Script",
	"py":	"Python Script",
	"rb":	"Ruby Script",
	"rbx":  "Unknown",
	"rhtml":"Unknown",
	"rpm":	"Redhat Package",
	"ruby": "Ruby Script",
	"sh":	"Shell Script",
	"sql":	"SQL File",
	"swf":	"Flash",
	"tif":	"TIFF Image",
	"tiff": "TIFF Image",
	"txt":	"TXT Document",
	"vb":	"Visual Basic",
	"wav":	"WAV Audio",
	"wmv":	"Windows Media",
	"xls":	"Excel Spreadsheet",
	"xml":	"XML File",
	"zip":	"ZIP Archive",
	"tar":	"Tar Archive",
	"bz2":	"BZIP2 Archive",
	"gz":	"GZIP Archive"
}

function prettysize(bytes) {
	if (bytes == 0) {
		$('#filesize').text('Zero' );
	}
	
	else if (bytes >= 1000000000000) {
		//tb
		var terabytes =  bytes / 1000000000000;
		return terabytes.toFixed(1) + ' TB';
	}
	else if (bytes >= 1000000000) {
		//gb
		var gigabytes = bytes / 1000000000;
		return gigabytes.toFixed(1) + ' GB';
	}
	else if (bytes >= 1000000) {
		//mb
		var megabytes = bytes / 1000000;
		return megabytes.toFixed(1) + ' MB';
	}
	else if (bytes >= 1000) {
		//kb
		var kilobytes = bytes / 1000;
		return  kilobytes.toFixed(1) + ' KB';
		
	}
	else {
		return bytes.toFixed(1)  + ' B';
	}	
}


function plugui_init() {

	//
	
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


