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

function prettytime(seconds) {
	var numdays = Math.floor(seconds / (60 * 60 * 24));
	var numhours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
	if (numhours < 10) {
		numhours = "0" + numhours;
	}

	var numminutes = Math.floor(((seconds % (60 * 60 * 24)) % (60 * 60)) / 60);
	if (numminutes < 10) {
		numminutes = "0" + numminutes;
	}

	var numseconds = ((seconds % (60 * 60 * 24)) % (60 * 60)) % 60;
	numseconds = numseconds.toFixed(0);
	if (numseconds < 10) {
		numseconds = "0" + numseconds;
	}


	return numdays + " days " + numhours + ":" + numminutes + ":" + numseconds;
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






