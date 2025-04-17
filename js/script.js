const toggleSectionContent = (content) => {
	const isExpanded = content.classList.contains("active");
	if (isExpanded) {
		// collapse: set current height, then transition to 0
		content.style.height = content.scrollHeight + "px";
		requestAnimationFrame(() => {
			content.style.transition = "height 0.6s ease";
			content.style.height = "0px";
		});
		content.classList.remove("active");
	} else {
		// expand: set height to scrollHeight
		content.style.height = "0px";
		content.classList.add("active");
		requestAnimationFrame(() => {
			content.style.transition = "height 0.6s ease";
			content.style.height = content.scrollHeight + "px";
		});
	}
	// cleanup after animation
	content.addEventListener(
		"transitionend",
		() => {
			if (content.classList.contains("active")) {
				content.style.height = "auto"; // allow natural resizing
			} else {
				content.style.removeProperty("height"); // reset when collapsed
			}
		},
		{ once: true }
	);
}

document.addEventListener("DOMContentLoaded", ()=>{
	const audio = document.getElementById("bg-audio");
	const greeting = document.querySelectorAll('.greeting');
	const sections = document.querySelectorAll('.section');
	// main trigger
	const activatePage = ()=>{
		if (document.body.dataset.activated === "true") return;
	
		document.body.dataset.activated = "true";
		document.body.style.opacity = 1;
	
		const audio = document.getElementById("bg-audio");
		audio.muted = false;
		audio.volume = 0.5;
		audio.play().catch(err => console.warn("Audio autoplay failed:", err));
	
		// greeting lines
		setTimeout(() => {
			greeting[0].style.opacity = 1;
			greeting[0].style.transform = "translateY(0)";
		}, 600);
		setTimeout(() => {
			greeting[1].style.opacity = 1;
			greeting[1].style.transform = "translateY(0)";
		}, 2200);
	
		// section headers
		setTimeout(() => {
			sections.forEach((section, index) => {
				setTimeout(() => {
					section.style.opacity = 1;
					section.style.transform = "translateY(0)";
				}, index * 200);
			});
		}, 4000);
	};	
	// trigger when tab becomes active
	if (document.visibilityState === "visible") {
		activatePage();
	} else {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				activatePage();
			}
		});
	}
	document.querySelectorAll('[data-toggle-target]').forEach(header => {
		header.addEventListener('click', () => {
			const targetSelector = header.getAttribute('data-toggle-target');
			const content = header.nextElementSibling;
			if (content && content.matches(targetSelector)) {
				document.querySelectorAll(targetSelector + '.active').forEach(open => {
					if (open !== content) {
						toggleSectionContent(open);
					}
				});				
				toggleSectionContent(content);
			}
		});
	});

	// theme toggling
	const themeToggle = document.getElementById('theme-toggle');
	if (localStorage.getItem('theme') === 'dark') {
		document.body.classList.add('dark-mode');
		themeToggle.innerHTML = `<span class="material-icons-round">dark_mode</span>`;
	} else {
		themeToggle.innerHTML = `<span class="material-icons-round">light_mode</span>`;
	}
	themeToggle.addEventListener('click', () => {
		document.body.classList.toggle('dark-mode');
		const isDark = document.body.classList.contains('dark-mode');
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
		themeToggle.innerHTML = isDark ? `<span class="material-icons-round">dark_mode</span>` : `<span class="material-icons-round">light_mode</span>`;
	});
	// scroll to top button
	const scrollBtn = document.getElementById("scroll-top-btn");window.addEventListener("scroll", () => {
		if (window.scrollY > 100) {
			scrollBtn.classList.add("show");
		} else {
			scrollBtn.classList.remove("show");
	}
});

scrollBtn.addEventListener("click", () => {
	window.scrollTo({ top: 0, behavior: "smooth" });
});

const container = document.getElementById("miniplayer-container");
const toggleBtn = document.getElementById("miniplayer-toggle");
const icon = toggleBtn.querySelector("span");
if (container.classList.contains("hidden")) {
	icon.textContent = "expand_less";
} else {
	icon.textContent = "expand_more";
}
toggleBtn.addEventListener("click", () => {
	const isHidden = container.classList.toggle("hidden");
	toggleBtn.classList.toggle("above-footer", isHidden);
	toggleBtn.classList.toggle("above-player", !isHidden);
	icon.textContent = isHidden ? "expand_less" : "expand_more";
	});
	document.addEventListener("click", activatePage, { once: true });
	document.addEventListener("keydown", activatePage, { once: true });
});

// accelerate animations on spacebar press
document.addEventListener("keydown", function(event) {
	if (event.key === " " && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
		event.preventDefault();
		// body fade in
		document.body.style.transition = "opacity 0.6s ease";
		document.body.style.opacity = 1;
		// greeting lines
		const greeting = document.querySelectorAll('.greeting');
		greeting.forEach((line, i) => {
		setTimeout(() => {
			line.style.opacity = 1;
			line.style.transform = "translateX(0)";
		}, i * 40);  // shorter delay between lines
		});
		// section headers
		const sections = document.querySelectorAll('.section');
		sections.forEach((section, i) => {
			section.style.transition = "opacity 1s ease, transform 1s ease";
			setTimeout(() => {
				section.style.opacity = 1;
				section.style.transform = "translateY(0)";
			}, i * 150);  // shorter delay between sections
		});
	}
});

// command palette
document.addEventListener("DOMContentLoaded", () => {
    const palette = document.getElementById("command-palette");
    const input = document.getElementById("command-input");
    const list = document.getElementById("command-list");

    const commands = [
      { name: "open resume", action: () => document.querySelector('.resume-header').scrollIntoView({ behavior: 'smooth' }) },
      { name: "view about section", action: () => document.getElementById('about-section').scrollIntoView({ behavior: 'smooth' }) },
      { name: "view projects", action: () => document.getElementById('projects-section').scrollIntoView({ behavior: 'smooth' }) },
      { name: "toggle theme", action: () => document.getElementById('theme-toggle').click() },
      { name: "play audio", action: () => document.getElementById('bg-audio').play() },
      { name: "pause audio", action: () => document.getElementById('bg-audio').pause() }
    ];

    const fuse = new Fuse(commands, { keys: ['name'], threshold: 0.4 });

    function showPalette() {
      palette.classList.remove("hidden");
      input.value = "";
      updateList(commands);
      input.focus();
    }

    function hidePalette() {
      palette.classList.add("hidden");
    }

    function updateList(filtered) {
      list.innerHTML = "";
      filtered.forEach((cmd, i) => {
        const li = document.createElement("li");
        li.textContent = cmd.name;
        li.addEventListener("click", () => {
          cmd.action();
          hidePalette();
        });
        list.appendChild(li);
      });
    }

    input.addEventListener("input", () => {
      const results = input.value.trim() ? fuse.search(input.value).map(r => r.item) : commands;
      updateList(results);
    });

    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        showPalette();
      } else if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        showPalette();
      } else if (e.key === "Escape") {
        hidePalette();
      }
    });
  });

let tracks = [];
let currentTrackIndex = 0;

const audio = document.getElementById("bg-audio");
const playbackBtn = document.getElementById("playback-toggle");
const playbackIcon = document.getElementById("playback-icon");
const muteBtn = document.getElementById("mute-toggle");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const trackTitle = document.getElementById("track-title");
const trackArtist = document.getElementById("track-artist");
const trackAlbum = document.getElementById("track-album");
const trackYear = document.getElementById("track-year");

function loadTrack(index) {
	if (!tracks.length) return;
	currentTrackIndex = index;
	const track = tracks[index];
	audio.src = track.src;
	updatePlayButton();
	trackTitle.textContent = track.title;
	trackArtist.textContent = track.artist;
	trackAlbum.textContent = track.album;
	trackYear.textContent = track.year;
	const thumbnail = document.getElementById("track-thumbnail");
	if (track.thumbnail) {
	  thumbnail.src = track.thumbnail;
	  thumbnail.style.display = "block";
	} else {
	  thumbnail.style.display = "none";
	};
}

function fetchTracks() {
  fetch("./assets/audio/tracks.json")
    .then(res => res.json())
    .then(data => {
      tracks = data;
      loadTrack(0);
    })
    .catch(err => console.error("Error loading tracks:", err));
}

playbackBtn.onclick = () => {
	if (audio.paused) {
		audio.play().catch(err => console.error("Playback failed:", err));
	} else {
		audio.pause();
	}
};

function updatePlayButton() {
	playbackIcon.textContent = audio.paused ? "play_arrow" : "pause";
}

muteBtn.onclick = () => {
  audio.muted = !audio.muted;
  muteBtn.innerHTML = audio.muted ? `<span class="material-icons-round">volume_off</span>` : `<span class="material-icons-round">volume_up</span>`;
};

prevBtn.onclick = () => {
	const newIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
	loadTrack(newIndex);
	audio.play().catch(err => console.error("Playback failed on prev:", err));
};
  
nextBtn.onclick = () => {
	const newIndex = (currentTrackIndex + 1) % tracks.length;
	loadTrack(newIndex);
	audio.play().catch(err => console.error("Playback failed on next:", err));
};  
  

audio.addEventListener("play", updatePlayButton);
audio.addEventListener("pause", updatePlayButton);
audio.addEventListener("ended", () => {
  const nextIndex = (currentTrackIndex + 1) % tracks.length;
  loadTrack(nextIndex);
});

// Start it all
document.addEventListener("DOMContentLoaded", () => {
  updatePlayButton();
  fetchTracks();
  initCarousel();
  
});

function initCarousel() {
	const imageDir = './assets/photos/';
	const imagePaths = [
		'ai-art-1.png', 
		'ai-art-2.png',
		'ai-art-3.png'
	].map(name => imageDir + name);
	createCarousel(imagePaths);
}

function createCarousel(imagePaths) {
	const track = document.querySelector('.carousel-track');
	const leftArrow = document.querySelector('.carousel-arrow.left');
	const rightArrow = document.querySelector('.carousel-arrow.right');

	if (!track || !leftArrow || !rightArrow) return;
	track.innerHTML = '';

	if (!imagePaths.length) return;

	// Add images
	imagePaths.forEach(src => {
		const img = document.createElement('img');
		img.src = src;
		img.alt = '';
		img.classList.add('carousel-image');
		track.appendChild(img);
	});

	// Ensure proper layout
	track.style.display = 'flex';
	track.style.transition = 'transform 0.6s ease';

	const images = track.querySelectorAll('.carousel-image');
	images.forEach(img => {
		img.style.flex = '0 0 100%';
	});

	let currentIndex = 0;

	function updateSlide() {
		track.style.transform = `translateX(-${currentIndex * 100}%)`;
	}

	leftArrow.onclick = () => {
		currentIndex = (currentIndex - 1 + imagePaths.length) % imagePaths.length;
		updateSlide();
	};

	rightArrow.onclick = () => {
		currentIndex = (currentIndex + 1) % imagePaths.length;
		updateSlide();
	};

	updateSlide();
}




// skip animations (debugging)
/* document.addEventListener("DOMContentLoaded", () => {
	// mark page as activated
	document.body.dataset.activated = "true";
	document.body.style.opacity = 1;
	// reveal greeting lines
	document.querySelectorAll('.greeting').forEach(line => {
	  line.style.opacity = 1;
	  line.style.transform = "translateY(0)";
	});
	// reveal all sections
	document.querySelectorAll('.section').forEach(section => {
	  section.style.opacity = 1;
	  section.style.transform = "translateY(0)";
	});
  }); */
  