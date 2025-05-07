// === activation and reveal ===
function activatePage() {
	if (document.body.dataset.activated === "true") return;

	document.body.dataset.activated = "true";
	document.body.style.opacity = 1;

	const audio = document.getElementById("bg-audio");
	audio.muted = false;
	audio.volume = 0.5;
	audio.play().catch(err => console.warn("Audio autoplay failed:", err));

	const greeting = document.querySelectorAll('.greeting');
	setTimeout(() => {
		greeting[0].style.opacity = 1;
		greeting[0].style.transform = "translateY(0)";
	}, 600);
	setTimeout(() => {
		greeting[1].style.opacity = 1;
		greeting[1].style.transform = "translateY(0)";
	}, 2200);

	const sections = document.querySelectorAll('.section');
	setTimeout(() => {
		sections.forEach((section, index) => {
			setTimeout(() => {
				section.style.opacity = 1;
				section.style.transform = "translateY(0)";
			}, index * 200);
		});
	}, 4000);
}

// === theme toggling ===
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('span');
if (localStorage.getItem('theme') === 'dark') {
	document.body.classList.add('dark-mode');
	themeIcon.textContent = "dark_mode";
} else {
	themeIcon.textContent = "light_mode";
}
themeToggle.addEventListener('click', () => {
	document.body.classList.toggle('dark-mode');
	const isDark = document.body.classList.contains('dark-mode');
	localStorage.setItem('theme', isDark ? 'dark' : 'light');
	themeIcon.textContent = isDark ? "dark_mode" : "light_mode";
});

document.addEventListener("keydown", function(event) {
	if (event.key === " " && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
		event.preventDefault();
		document.body.style.transition = "opacity 0.6s ease";
		document.body.style.opacity = 1;

		const greeting = document.querySelectorAll('.greeting');
		greeting.forEach((line, i) => {
			setTimeout(() => {
				line.style.opacity = 1;
				line.style.transform = "translateX(0)";
			}, i * 40);
		});

		const sections = document.querySelectorAll('.section');
		sections.forEach((section, i) => {
			section.style.transition = "opacity 1s ease, transform 1s ease";
			setTimeout(() => {
				section.style.opacity = 1;
				section.style.transform = "translateY(0)";
			}, i * 150);
		});
	}
});

// === section toggling ===
function toggleSectionContent(content) {
	const isExpanded = content.classList.contains("active");

	if (isExpanded) {
		content.style.height = content.scrollHeight + "px";
		requestAnimationFrame(() => {
			content.style.transition = "height 0.6s ease";
			content.style.height = "0px";
		});
		content.classList.remove("active");
	} else {
		content.style.height = "0px";
		content.classList.add("active");
		requestAnimationFrame(() => {
			content.style.transition = "height 0.6s ease";
			content.style.height = content.scrollHeight + "px";
		});
	}

	content.addEventListener("transitionend", () => {
		if (content.classList.contains("active")) {
			content.style.height = "auto";
		} else {
			content.style.removeProperty("height");
		}
	}, { once: true });
}

// === music player ===
let tracks = [];
let currentTrackIndex = 0;

const audio = document.getElementById("bg-audio");
const playbackBtn = document.getElementById("playback-toggle");
const playbackIcon = document.getElementById("playback-icon");
const muteBtn = document.getElementById("mute-toggle");
const muteIcon = muteBtn.querySelector("span");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const trackTitle = document.getElementById("track-title");
const trackArtist = document.getElementById("track-artist");
const trackAlbum = document.getElementById("track-album");
const trackYear = document.getElementById("track-year");
const progressBar = document.getElementById("progress-bar");
const progressFill = document.getElementById("progress-fill");


function updatePlayButton() {
	playbackIcon.textContent = audio.paused ? "play_arrow" : "pause";
}

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
	}
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

muteBtn.onclick = () => {
	audio.muted = !audio.muted;
	muteIcon.textContent = audio.muted
		? "volume_off"
		: "volume_up";
};

// === progress bar ===
audio.addEventListener("timeupdate", () => {
	if (audio.duration) {
		const progressPercent = (audio.currentTime / audio.duration) * 100;
		progressFill.style.width = `${progressPercent}%`;
	}
});

progressBar.addEventListener("click", (e) => {
	const rect = progressBar.getBoundingClientRect();
	const clickX = e.clientX - rect.left;
	const newTime = (clickX / rect.width) * audio.duration;
	audio.currentTime = newTime;
});

// === miniplayer controls ===
prevBtn.onclick = () => {
	const newIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
	loadTrack(newIndex);
	audio.play().catch(err => console.error("Playback failed on skip_prev: ", err));
};

nextBtn.onclick = () => {
	const newIndex = (currentTrackIndex + 1) % tracks.length;
	loadTrack(newIndex);
	audio.play().catch(err => console.error("Playback failed on skip_next: ", err));
};

audio.addEventListener("play", updatePlayButton);
audio.addEventListener("pause", updatePlayButton);
audio.addEventListener("ended", () => {
	const nextIndex = (currentTrackIndex + 1) % tracks.length;
	loadTrack(nextIndex);
});

// === image carousel ===
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

	imagePaths.forEach(src => {
		const img = document.createElement('img');
		img.src = src;
		img.alt = '';
		img.classList.add('carousel-image');
		img.onerror = () => {
			console.warn(`Image failed to load: ${src}`);
			img.remove();
		};
		track.appendChild(img);
	});
		
	track.style.display = 'flex';
	track.style.transition = 'transform 0.6s ease';
	const images = track.querySelectorAll('.carousel-image');
	images.forEach(img => img.style.flex = '0 0 100%');

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

// === command palette ===
function initCommandPalette() {
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
		filtered.forEach(cmd => {
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
}

function initScrollButton() {
	const scrollBtn = document.getElementById("scroll-top-btn");
	window.addEventListener("scroll", () => {
		if (window.scrollY > 100) {
			scrollBtn.classList.add("show");
		} else {
			scrollBtn.classList.remove("show");
		}
	});
	scrollBtn.addEventListener("click", () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	});
}

function initMiniplayerToggle() {
	const miniplayer = document.getElementById("miniplayer");
	const toggleBtn = document.getElementById("miniplayer-toggle");
	const icon = toggleBtn.querySelector("span");

	const isHidden = miniplayer.classList.contains("hidden");
	icon.textContent = isHidden ? "expand_less" : "expand_more";

	toggleBtn.addEventListener("click", () => {
		const nowHidden = miniplayer.classList.toggle("hidden");
		icon.textContent = nowHidden ? "expand_less" : "expand_more";
	});
}

function setupSectionToggles() {
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
}

document.addEventListener("DOMContentLoaded", () => {
	if (document.visibilityState === "visible") {
		activatePage();
	} else {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				activatePage();
			}
		});
	}
	document.addEventListener("click", activatePage, { once: true });
	document.addEventListener("keydown", activatePage, { once: true });
	updatePlayButton();
	fetchTracks();
	initCommandPalette();
	initMiniplayerToggle();
	initScrollButton();
	setupSectionToggles();
	initCarousel()
	
});

// === dev mode ===
/* (function devModeBypass() {
	// activate page
	document.body.style.opacity = 1;
	document.body.dataset.activated = "true";
	// reveal greeting and sections
	document.querySelectorAll('.greeting, .section').forEach(el => {
		el.style.opacity = 1;
		el.style.transform = 'translateY(0)';
	});
	// expand content blocks
	document.querySelectorAll('.section-content, .resume-content, .project-content, .edu-content, .certs-content, .exp-content, .skills-content').forEach(el => {
		el.classList.add('active');
		el.style.height = 'auto';
	});
	// override toggling
	window.toggleSectionContent = function (content) {
		if (!content.classList.contains("active")) {
			content.classList.add("active");
			content.style.height = 'auto';
		}
	};
})(); */
