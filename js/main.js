/*
 * /!\ Créer un fichier config.js contenant siteUrl (string contenant l'url du site), apiOSM (clé de l'api openstreetmaps) et apiJCD (clé de l'api JCDecaux)
 */

// URL du json du slider à afficher comme tutoriel
const sliderUrl = siteUrl + (($(window).width() > 1024) ? "json/slider.json" : "json/slider-mobile.json"); //Choix du json en fonction de la taille de l'écran (version desktop/mobile)
// Initialisation de la carte
const myMap = new Map(45.75,4.85,12,'carte','details',apiOSM,apiJCD);
// Initialisation du stockage des données
const storage = new Storage();
let slider;

ajaxGet(sliderUrl, (response) => {
	// Initialisation du slider tutoriel avec les données récupérées dans le json
	slider = new Slider(JSON.parse(response).slides,$('#slider'), 5000);
});
window.onload = (e) => {
	// Navigation dans le slider avec les touches gauche et droite du clavier 
	window.addEventListener("keydown", (e) => {
		if (e.keyCode === 37) slider.prev();
		else if (e.keyCode === 39) slider.next();
	});
	// On rend les boutons du slider interactifs
	$("#slider .prev").on("click", (e) => slider.prev());
	$("#slider .next").on("click", (e) => slider.next());
	$("#slider .pause").on("click", (e) => {
		let pause = $(e.target);
		if (pause.hasClass("fa-pause")) {
			pause.removeClass("fa-pause");
			pause.addClass("fa-play");
			slider.pause();
		}
		else {
			pause.removeClass("fa-play");
			pause.addClass("fa-pause");
			slider.play();
		}
	});
	
	// On affiche la carte
	myMap.draw();
	// On affiche les stations sur la carte
	myMap.getStations();
	// On affiche le site en version mobile ou desktop
	if($(window).width() > 1024) { // Desktop
		// Changement automatique de la div navigation en cas de scroll
		scrolling();
		$(window).scroll(scrolling);
		// On initialise scrollify
		$(function() {
		  $.scrollify({
		  	section: "section",
		    scrollSpeed: 100,
		    scrollbars: false,
		    touchScroll:false,
		    updateHash:false,
		    setHeights:false
		  });
		});
	} else { // Mobile
		// On affiche le dernier écran sur lequel l'utilisateur était (le tutoriel par défaut)
		navigationToggle(storage.screen);
		// On repasse la fenêtre en plein écran à chaque clic (ne peut se faire qu'avec intervention de l'utilisateur) sur la page réservation
		$("#reservation").on('click', () => enableFullScreen());
	}
};

