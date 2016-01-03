	if (window.location.pathname.split("/").length > 3) {
		alert('Wrong directory.  You must be on the page which lists the episode links.')
	}

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
		ep_titles.push(this.title.split("Watch cartoon")[1].split(title + " Episode ")[1].split(" online in high quality")[0])
	})


	count = eps.length;

	function buildXMLthing() {
		// Build XML
		eps.each(function(i) {
			$(xml).find('trackList').append( $($('<track />', xml).append( $('<location />)', xml).text(links[i]), $('<title />', xml).text(ep_titles[i]) )) )
		})
		$('playlist', $(xml)).append( $('<title />', xml).text(title) )

		var serializer = new XMLSerializer(); 
		var xml_string = serializer.serializeToString(xml);

		// Download Playlist
		//window.prompt("Copy to clipboard: Ctrl+C, Enter", xml_string);
		download(jQuery.camelCase(title) + ".xspf", xml_string)
	}

	var links = []
	$.when(
		$.getScript( "/Scripts/asp.js")
	).done(function() {
		eps.each(function() {
			$.get( this.href, function( data ) {
				links.push(
					asp.wrap($('#selectQuality', $(data)).val())
					)
			}).fail(function(){
				links.push(
					'Failed Get'
				)
			}).always(function() {
				count--
				if (count == 0) { buildXMLthing() }
			})
		})
	})
		