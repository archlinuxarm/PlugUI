// global stuff

function get_page(title) {
	$.ajax({
		type: "GET",
		url: "/" + encodeURIComponent(title),
		dataType : 'html',
		success: function(html){
			var page = html;
			$('#page_body').empty();
			$('#page_body').html(page);
		}
	});
	return false;
}

function update_stats() {
	$.ajax({
		type: "GET",
		url: "/statusapi",
		dataType : 'json',
		success: function(json){
			var result = json;
			if (result.success == true) {
				$('#load').text(result.loadavg);
				$('#entropy').text(result.entropy);
				$('#uptime').text(result.uptime);
				$('#memtotal').text('memory_total');
				$('#memfree').text(result.memory_free);
				$('#percentfree').text(result.memory_percent);
			}
			else {
				
			}  
		}
	});
}
var stat_repeat = setInterval(update_stats, 10000);

function go_home() {
	get_page("index");
}

function reboot() {
	$('#button').hide();
	$('#text').html('Please wait, your device is rebooting. You will be redirected to the home page in 60 seconds.');
	$.ajax({
        type: "POST",
		data: { command: runcommand, cmd: "reboot" },
        url: '/systemapi',
        cache: false,
	});
	setTimeout("go_home()",60000);
}

function run_command() {  	
	$('#error').empty();
	$('#terminal').empty();
	var runcommand = $('#commandbox').attr('value');
	if (runcommand == "") {  
		$('#error').text(' Command box cannot be empty');
		$("input#commandbox").focus();  
		return false;  
	} 
	$('#runloader').show();
	$.ajax({
		type: "POST",
		url: "/systemapi",
		data: { command: runcommand, cmd: "execute" },
		dataType : 'json',
		statusCode: {
			500: function() {
				$('#terminal').text("Server Error");
			}	
		},
		success: function(json){
			var result = json;
			if (result.success == true) {
				$('#runloader').hide();
				$.each(result.output, function(i,line){
					$('#terminal').append(line + "<br/>");
				}); 
			}
			else {
				$('#runloader').hide();
				$('#terminal').text("Command failed"); 
			}  
		}
	});
}

//file page stuff

function getTree(directory) {
	showloader();
	$.ajax({
		   type: 'POST',
		   cache: false,
		   url : '/fileapi',
		   data: { apicmd: "directory_list", path: directory },
		   dataType : 'json',
		   success: function (json) { 
				$('#spinner').hide();
				var returnlist = json;
				if (returnlist) {
					$('#filelist').empty();
					if (returnlist.success == false) {
						if (returnlist.validpath == false) {
							$('#filelist').html("Invalid path"); 
						}
						else {
							$('#filelist').html("Unknown failure requesting path " + returnlist.requestpath); 
						}
						return;
					}
					currentpath = returnlist.requestpath;
					$('#currentpath').html(currentpath);
					var filelist = document.getElementById('filelist');
					var parentdirline = document.createElement("div");
					parentdirline.setAttribute('class', 'line');
		   
					var icon = document.createElement("div");
					icon.setAttribute('id', 'icon');
					icon.setAttribute('class', 'parentdir');
					parentdirline.appendChild(icon);
					
					var name = document.createElement("div");
					name.setAttribute('id', 'name');
					var parentlink = document.createElement("a");
					parentlink.setAttribute('href','#');
					parentlink.onclick = function(){ selectParent();return false };
					var parenttext = document.createTextNode("Parent Directory");
					parentlink.appendChild(parenttext);
					name.appendChild(parentlink);
					parentdirline.appendChild(name);
					
					filelist.appendChild(parentdirline);
					
					var clear = document.createElement("div");
					clear.setAttribute('id', 'clear');
					filelist.appendChild(clear);

					$.each(returnlist.files, function(i,item){

						//new file line	
						var fileline = document.createElement("div");
						fileline.setAttribute('class', 'line');
						fileline.setAttribute('id', 'line');
						fileline.onclick = function(){ selectLine(item); $('.line').removeClass('highlightRow'); $(this).addClass('highlightRow'); };
						
						//create an icon for the file listing and add it to the line
						var icon;
						if (item.iconCls == 'file-mp3' || item.iconCls == 'file-m4a' || item.iconCls == 'file-oga') {
						   icon = document.createElement("a");
						   icon.setAttribute('href','#');
						   icon.onclick = function(){ playMedia(item);return false };
						}
						else {
						   icon = document.createElement("div");
						}
						   
						icon.setAttribute('id', 'icon');
						icon.setAttribute('class', item.iconCls);
						fileline.appendChild(icon);

						//create an element to hold the name of the file and add it to the line
						var name = document.createElement("div");
						name.setAttribute('id', 'name');
						var namelink = document.createElement("a");
						namelink.setAttribute('href','#');
						namelink.onclick = function(){ selectLink(item);return false };
						var text = document.createTextNode(item.text);
						namelink.appendChild(text);
						name.appendChild(namelink);
						fileline.appendChild(name);
						
						
						//create an element to show the type of file, add it to the line
						var type = document.createElement("div");
						type.setAttribute('id', 'type');
						if (item.folder == true) {
							var text = document.createTextNode("Folder");
						}
						else {
							var text = document.createTextNode("File");
						}
						
						type.appendChild(text);
						fileline.appendChild(type);
						
						//create an element to show file size, add to line
						var size = document.createElement("div");
						size.setAttribute('id', 'size');
						var text = document.createTextNode(item.size);
						size.appendChild(text);
						fileline.appendChild(size);
						
						//create an element to show date, add it to the line
						var date = document.createElement("div");
						date.setAttribute('id', 'date');
						var text = document.createTextNode(item.date);
						date.appendChild(text);
						fileline.appendChild(date);
						
						//append our new line to the file list
						filelist.appendChild(fileline);
						
						//create a clearing element and add it to the file list to keep things from floating next to each other
						var clear = document.createElement("div");
						clear.setAttribute('id', 'clear');
						filelist.appendChild(clear);
						
					});
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
	form.setAttribute("action", "/fileapi");
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
	form.setAttribute("action", "/fileapi");
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
		$('#player').jPlayer("setMedia", { mp3: "/fileapi?apicmd=stream&path=" + directory + "/" + encodeURIComponent(path) }).jPlayer("play");
	}
	else if (filetype == 'm4a') {
		$('#player').jPlayer("setMedia", { m4a: "/fileapi?apicmd=stream&path=" + directory + "/" + encodeURIComponent(path) }).jPlayer("play");
	}
	else if (filetype == 'oga') {
		$('#player').jPlayer("setMedia", { oga: "/fileapi?apicmd=stream&path=" + directory + "/" + encodeURIComponent(path) }).jPlayer("play");
	}
	$('#current-track').text(item.text);
}
	

function selectLine(item) {
	$('#filename').text(item.text);
	$('#filetype').text(item.iconCls);
	$('#filesize').text(item.size);
	$('#filedate').text(item.date);
	$('#downloadlink').empty();
	$('#sharelink').empty();
	$('#viewlink').empty();
	if (item.folder == true) {
	
	}
	else {
		//create download link element and point it at the correct js function
		var downloadlink = document.getElementById("downloadlink");
		var link = document.createElement("button");
		link.onclick = function(){ downloadFile(item);return false };
		var text = document.createTextNode("Download file");
		link.appendChild(text);
		downloadlink.appendChild(link);
		
		//create share link element, yadda blah blah pants
		var sharelink = document.getElementById("sharelink");
		var link = document.createElement("button");
		link.onclick = function(){ shareFile(item);return false };
		var text = document.createTextNode("Share file");
		link.appendChild(text);
		sharelink.appendChild(link);
		
		//create view link element, scooby doo 
		var viewlink = document.getElementById("viewlink");
		var link = document.createElement("button");
		link.onclick = function(){ viewFile(item);return false };
		var text = document.createTextNode("View file");
		link.appendChild(text);
		viewlink.appendChild(link);
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
	
function showloader() {
	$('#loader').show();
}
	
function hideloader() {
	setTimeout( function(){ $('#loader').hide() }, 500);
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
        url : '/pacmanapi',
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
					var packageline = document.createElement("p");
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
		url : '/pacmanapi',
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

function showCheck() {
	$('#upgradebuttons').hide();
	$('#checkbuttons').show();
}

function showUpgrade() {
	$('#upgradebuttons').show();
	$('#checkbuttons').hide();
}

function runMaintenance() {
$('#button').hide();
$('#loading').show();
$('#maintenancestatus').html('Running...');
$.ajax({
        type: 'POST',
        cache: false,
        url : '/maintenanceapi',
        dataType : 'json',
        success: function (json) { 
		
			var returnvalues = json;
			if (returnvalues.success) {
				$('#loading').hide();
				$('#button').show();
				$('#maintenancestatus').html(returnvalues.last_maintenance); 
            }
            else {
				$('#loading').hide();
				$('#button').show();
                $('#maintenancestatus').html("Maintenance failed"); 
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
		
		//create an element to hold the devicesize
		var devicesize = document.createElement("div");
		devicesize.setAttribute('class', 'devicesize');
		var text = document.createTextNode(device.prettydevicesize);
		devicesize.appendChild(text);
		storageline.appendChild(devicesize);
		
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


//app stuff
function showstart() {
	$('#startlink').show();
	$('#stoplink').hide();
}
function showstop() {
	$('#startlink').hide();
	$('#stoplink').show();
}

function hidelinks() {
	$('#startlink').hide();
	$('#stoplink').hide();
}

function showloader() {
	clearRunning();
	$('#loader').show();
}

function hideloader() {
	$('#loader').hide();
	$('#runstatus').show();
}

function isRunning() {
	$('#runstatus').html('Running');
}

function notRunning() {
	$('#runstatus').html('Not running');
}

function clearRunning() {
	$('#runstatus').html('Please Wait...');
}

function errorRunning() {
	$('#runstatus').html('Error!');
}

function start_app(appname) {
	hidelinks();
	showloader();
	$.ajax({
        type: 'POST',
        cache: false,
        url : '/appapi',
		data: { apicmd: "start_app" },
        dataType : 'json',
        success: function (json) { 
            setTimeout(check_running(appname), 3000);
        }
	});
}

function stop_app(appname) {
	hidelinks();
	showloader();
	$.ajax({
        type: 'POST',
        cache: false,
        url : '/appapi',
		data: { apicmd: "stop_app" },
        dataType : 'json',
        success: function (json) { 
            setTimeout(check_running(appname), 3000);
        }
	});
}

function check_running(appname) {
showloader();
hidelinks();
$.ajax({
        type: 'POST',
        cache: false,
        url : '/appapi',
		data: { apicmd: "check_running" },
        dataType : 'json',
        success: function (json) { 
            if (json.success == "False") {
				notRunning();
                showstart();
				hideloader();
            }
            else if (json.success == "True") {
				isRunning();
                showstop();
				hideloader();
            }
			else {
				showstart();
				errorRunning();
				hideloader();
			}
        }
});
}

function install_app(appname) {
$('#button').hide();
$('#installstatus').html('Installing ' + appname);
$('#loader').show();
$.ajax({
        type: 'POST',
        cache: false,
        url : '/pacmanapi',
        dataType : 'json',
		data: { apicmd: "install", app_name: appname },
        success: function (json) { 
			var returnlist = json;
			if (returnlist) {
				$('#loader').hide();
				$('#installstatus').html('');
				var content;
				$.each(returnlist, function(i,line){
					content += '<b>' + line + '</b><br/>';
					$(content).appendTo("#installstatus");
					content = '';
				});
				$('#alldone').show();
            }
            else {
				$('#loader').hide();
                $('#installstatus').html("Failed communication with plug"); 
            }
			
		}
});

}

