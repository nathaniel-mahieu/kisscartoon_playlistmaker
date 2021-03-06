	if (window.location.pathname.split("/").length > 3) {
		alert('Wrong directory.  You must be on the page which lists the episode links.')
	}

	var prompt_start = prompt("Which episode will the playlist start with?  Enter a positive integer.  Episodes indexed from 1. 9 episodes will be downloaded.", 1) - 1;
	
	if (!window.console) console = {};
	console.log = console.log || function(){};
	console.warn = console.warn || function(){};
	console.error = console.error || function(){};
	console.info = console.info || function(){};
	
	console.info("KPM: Starting Playlist Maker")
	console.info("KPM: This takes about one minute.  If links stop downloading something went wrong.")
	
	function download(filename, text) {
	  var element = document.createElement('a');
	  element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(text));
	  element.setAttribute('download', filename);

	  element.style.display = 'none';
	  document.body.appendChild(element);

	  element.click();

	  document.body.removeChild(element);
	}

	// Get Episode Page Links
	eps = $('a[title]')
		.filter(function() {
			return this.title.match(/^Watch cartoon */);
		})
		
	jQuery.fn.reverse = [].reverse;	
	eps = eps.reverse()

	title = $('title').text().split("\n")[1]

	core = `<?xml version="1.0" encoding="UTF-8"?>
	<playlist xmlns="http://xspf.org/ns/0/" xmlns:vlc="http://www.videolan.org/vlc/playlist/ns/0/" version="1">
		<trackList />
	</playlist>`
	xml = $.parseXML(core)


	var ep_titles = []
	eps.each(function() {
		ep_titles.push(this.title.split("Watch cartoon")[1].split(title + " ")[1].split(" online in high quality")[0])
	})

	var prompt_end = prompt_start + 8;
	if (prompt_end > eps.length) { prompt_end = eps.length }
	
	eps = eps.slice(prompt_start, prompt_end)
	count = eps.length;

	ep_titles = ep_titles.slice(prompt_start, prompt_end)
	
	function buildXMLthing() {
		// Build XML
		eps.each(function(i) {
			$(xml).find('trackList').append( $($('<track />', xml).append( $('<location />)', xml).text(links[i]), $('<title />', xml).text(ep_titles[i]), $('<album />').text(title) )) )
		})
		$('playlist', $(xml)).append( $('<title />', xml).text(title) )

		var serializer = new XMLSerializer(); 
		var xml_string = serializer.serializeToString(xml);

		// Download Playlist
		//window.prompt("Copy to clipboard: Ctrl+C, Enter", xml_string);
		download(jQuery.camelCase(title) + ".xspf", xml_string)
		
		console.info("KPM: Complete.")
	}

	var links = []
	$.when(
		$.getScript( "/Scripts/asp.js")
	).done(function() {
		console.info("KPM: Starting link retrieval.")
		
		eps.each(function() {
			$.get( this.href, function( data ) {
				console.info("KPM: Link collected. " + count + " left.")
				links.push(
					asp.wrap($('#selectQuality', $(data)).val())
					)
			}).fail(function(){
				links.push(
					'Failed Get'
				)
			}).always(function() {
				count--
				if (count == 0) { console.info("KPM: Links sucessfully retrieved."); buildXMLthing() }
			})
		})
	})
		