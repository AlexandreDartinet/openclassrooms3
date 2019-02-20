/**
 * @class Slider
 * Gère l'affichage d'un slider
 * @constructor : initialise le slider avec l'objet passé en paramètre
 * @function prev : Passe à la slide précédente et réinitialise le timer
 * @function next : Passe à la slide précédente et réinitialise le timer
 * @function show : Affiche une slide définie
 * @function play : Lance le changement de slide automatique
 * @function pause : Arrête le changement de slide automatique
 * @function reset : Réinitialise le timer 
 * @function isPaused : false si le changement de slide automatique est activé
 * 
 * @property {Object} slides : L'objet contenant les url des images et le texte des slides
 * @property {jQuery} slider : L'élément de la page contenant le slider
 * @property {Number} counter : Le numéro de la slide affichée actuellement
 * @property {Boolean} paused : Est-ce que le changement automatique est en pause
 * @property {Number} timeout : Le temps en ms entre deux slides en mode automatique
 * @property {Timer} timer : Le timer pour le changement automatique
 * @property {jQuery} innerSlider : Le conteneur du texte des slides
 * @property {jQuery} title : Le conteneur du titre
 * @property {jQuery} description : Le conteneur de la description
 */
class Slider {
	/**
	 * @constructor
	 * @param {Object} content : Objet contenant toutes les slides, l'url de leurs images et leur description
	 * @param {jQuery} slider : Element de la page contenant le slider
	 * @param {Number} timeout : Le temps entre deux slides en mode automatique en ms (par défaut 5000)
	 * @param {Boolean} autoPlay : Si le mode automatique doit être lancé à l'initialisation (par défaut true)
	 */
	constructor(content,slider,timeout = 5000, autoPlay = true) {
		this.slides = content;
		this.slider = slider;
		this.counter = 0;
		this.timeout = timeout;
		// On lance le changement automatique
		if(autoPlay) {
			this.paused = false;
			this.timer = window.setInterval(() => this.next(),this.timeout);
		}
		else {
			this.paused = true;
			this.timer;
		}
		// On ajoute les éléments nécessaires à l'affichage des slides
		this.innerSlider = $(document.createElement("div"));
		this.title = $(document.createElement("h2"));
		this.description = $(document.createElement("p"));
		this.innerSlider.addClass("innerSlider");
		this.innerSlider.append(this.title);
		this.innerSlider.append(this.description);
		this.slider.append(this.innerSlider);
		// On affiche la première slide
		this.show(this.counter);
	}
	/**
	 * @function prev
	 * Passe à la slide précédente
	 */
	prev() {
		// On boucle à la fin des slides si on est sur la première slide
		if(this.counter <= 0) this.counter = this.slides.length -1;
		else this.counter--;
		// On affiche la slide demandé
		this.show(this.counter);
		// Si on est en lecture automatique, on remet le timer à zéro
		if (!this.paused) this.reset();
	}
	/**
	 * @function next
	 * Passe à la slide suivante
	 */
	next() {
		// On retourne au début des slides si on est sur la dernière slide
		if (this.counter >= this.slides.length -1) this.counter = 0;
		else this.counter++;
		// On affiche la slide demandée
		this.show(this.counter);
		// Si on est en lecture automatique, on remet le timer à zéro
		if (!this.paused) this.reset();
	}
	/**
	 * @function show
	 * Affiche la slide d'index i
	 * @param {Number} i : index de la slide à afficher
	 */
	show(i) {
		this.title.text(this.slides[i].name);
		this.description.text(this.slides[i].content);
		this.slider.css("background","url('"+this.slides[i].img+"')");
	}
	/**
	 * @function play
	 * Lance la lecture automatique des slides
	 */
	play() {
		this.timer = window.setInterval(() => this.next(),this.timeout);
		this.paused = false;
	}
	/**
	 * @function pause
	 * Arrête la lecture automatique des slides
	 */
	pause() {
		window.clearInterval(this.timer);
		this.paused = true;
	}
	/**
	 * @function reset
	 * Réinitialise le timer pour la lecture automatique
	 */
	reset() {
		this.pause();
		this.play();
	}
	/**
	 * @function isPaused
	 * Renvoie la valeur de paused
	 * @returns {Boolean} : paused
	 */
	isPaused() {
		return this.paused;
	}

}