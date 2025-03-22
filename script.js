document.addEventListener("DOMContentLoaded", function() {
	// fade in body after 500ms
	setTimeout(() => {
		document.body.style.opacity = 1;
	}, 500);

	// "hey, friend."
	const greetingLines = document.querySelectorAll('.greeting .line');
	setTimeout(() => {
		greetingLines[0].style.opacity = 1;
		greetingLines[0].style.transform = "translateY(0)";
	}, 500);

	setTimeout(() => {
		greetingLines[1].style.opacity = 1;
		greetingLines[1].style.transform = "translateY(0)";
	}, 2500);

	// Show sections after the greeting (delay of 2 seconds after greeting)
	setTimeout(() => {
		document.querySelectorAll('.section').forEach((section, index) => {
			setTimeout(() => {
			section.style.opacity = 1;
			section.style.transform = "translateY(0)";
			}, index * 200);
		});
	}, 5000);

	// section toggling
	const sectionHeaders = document.querySelectorAll('.section-header');
	sectionHeaders.forEach(header => {
		header.addEventListener('click', function() {
			// hide other sections
			document.querySelectorAll('.section-content.active').forEach(content => {
				if (content !== header.nextElementSibling) {
					content.classList.remove('active');
				}
			});
			// Toggle the active class for the clicked section
			const content = header.nextElementSibling;
			content.classList.toggle('active');
  		});
	});
});

// accelerate animations on spacebar press
document.addEventListener("keydown", function(event) {
	if (event.key === " ") {
	  // body fade in
	  document.body.style.transition = "opacity 0.5s ease";
	  document.body.style.opacity = 1;
	  // greeting lines
	  const greetingLines = document.querySelectorAll('.greeting .line');
	  greetingLines.forEach((line, i) => {
		setTimeout(() => {
		  line.style.opacity = 1;
		  line.style.transform = "translateX(0)";
		}, i * 50);  // shorter delay between each line
	  });
	  
	  // section headers
	  const sections = document.querySelectorAll('.section');
	  sections.forEach((section, i) => {
		section.style.transition = "opacity 1s ease, transform 1s ease";
		setTimeout(() => {
		  section.style.opacity = 1;
		  section.style.transform = "translateY(0)";
		}, i * 200);  // shorter delay between each section
	  });
	}
  });
  

