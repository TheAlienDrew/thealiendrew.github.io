var headingAnchors = function(self_link_text) {
	self_link_text = self_link_text || '#';
	var headings = document.querySelectorAll('h1');

	for (var i = 0; i < headings.length; i++) {
		var e = headings[i];
		if (!e.id) {
			var tc = e.textContent;
			tc = tc.replace(/[^a-z0-9-]/gi, '-')
				.replace(/-{2,}/gi, '-')
				.replace(/-+$/gi, '')
				.toLowerCase();

			e.id = tc;
		}

		var a = document.createElement('a');
		a.href = '#' + e.id;
		a.target = "_self";
		a.textContent = self_link_text;

		e.appendChild(a);
	}

	// Scroll to the given hash
	var h = location.hash;
	location.hash = '';
	location.hash = h;
};
