/**
 * @class Storage
 * Gère le stockage des données dans localStorage et sessionStorage ainsi que l'affichage de la
 * réservation en cours si il y en a une
 * @constructor : Initialise les différentes propriétés, vérifie si le navigateur est compatible
 * @function setScreen : Enregistre le dernier écran sur lequel l'utilisateur était dans sessionStorage (mobile)
 * @function setName : Enregistre le nom et prénom de l'utilisateur dans localStorage
 * @function setReservation : Enregistre une nouvelle réservation
 * @function affichage : Affiche la réservation en cours et centre la carte dessus
 * 
 * @property {String} nom : Le nom de l'utilisateur (par défaut '')
 * @property {String} prenom : Le prénom de l'utilisateur (par défaut '')
 * @property {Object} reservation : Un objet réservation contenant la station réservée, le timestamp d'expiration et un boolean d'activité
 * @property {String} screen : Le dernier écran de l'utilisateur (par défaut '#slider')
 * @property {Boolean} sessionStorage : true si le navigateur est compatible avec sessionStorage
 * @property {Boolean} localStorage : true si le navigateur est compatible avec localStorage
 */
class Storage {
	/**
	 * @constructor
	 * Initialise les différentes propritétés, vérifie si le navigateur est compatible avec local et sessionStorage,
	 * récupère les valeurs dans local et sessionStorage si elles existent et affiche la réservation en cours si il
	 * y en a une
	 */
	constructor() {
		this.nom = '';
		this.prenom = '';
		this.reservation = {station:{},expires:0,active:false};
		this.screen = '#slider';
		this.sessionStorage = false;
		this.localStorage = false;
		if(typeof localStorage != 'undefined') {
			this.localStorage = true;
			if('nom' in localStorage) this.nom = localStorage.getItem('nom');
			if('prenom' in localStorage) this.prenom = localStorage.getItem('prenom');
		} 
		if (typeof sessionStorage != 'undefined') {
			this.sessionStorage = true;
			if('station' in sessionStorage) this.reservation.station = JSON.parse(sessionStorage.getItem('station'));
			if('expires' in sessionStorage) this.reservation.expires = sessionStorage.getItem('expires');
			if('screen' in sessionStorage) this.screen = sessionStorage.getItem('screen');
		}
		// Si la réservation n'a pas expiré, elle est active et on l'affiche
		if(this.reservation.expires >= (Date.now() + 1000)) {
			this.reservation.active = true;
			this.affichage();
		}
	}
	/**
	 * @function setScreen
	 * Enregistre l'écran actuel dans sessionStorage
	 * @param {String} screen : L'écran affiché
	 */
	setScreen(screen) {
		this.screen = screen;
		if(this.sessionStorage) sessionStorage.setItem('screen',screen);
		
	}
	/**
	 * @function setName
	 * Enregistre le nom et prénom de l'utilisateur dans le localStorage
	 * @param {String} nom : Nom de l'utilisateur
	 * @param {String} prenom : Prénom de l'utilisateur
	 */
	setName(nom, prenom) {
		this.nom = nom;
		this.prenom = prenom;
		if(this.localStorage) {
			localStorage.setItem('nom', nom);
			localStorage.setItem('prenom', prenom);
		}
	}
	/**
	 * @function setReservation
	 * Enregistre une nouvelle réservation, et l'affiche
	 * @param {Object} station : L'objet station lié à la réservation
	 * @param {Number} timeout : Le timeout de la réservation en secondes (par défaut 1200)
	 */
	setReservation(station, timeout = 1200) {
		this.reservation.station = station;
		this.reservation.expires = Date.now() + (timeout*1000);
		if(this.sessionStorage) {
			sessionStorage.setItem('station', JSON.stringify(this.reservation.station));
			sessionStorage.setItem('expires', this.reservation.expires);
		}
		this.reservation.active = true;
		this.affichage();
	}
	/**
	 * @function affichage
	 * Affiche la réservation en mémoire
	 */
	affichage() {
		let timeRemaining = this.reservation.expires - Date.now();
		// On crée un bouton pour pouvoir annuler la réservation
		let button = $(document.createElement('button'))
			.addClass('fas fa-times cancel')
			.text(' Annuler')
			.on('click', (e) => {
			if(confirm("Êtes-vous sûr de vouloir annuler la réservation ?")) this.reservation.expires = Date.now();
		});
		// Si la réservation est encore active pour plus d'une seconde
		if(timeRemaining >= 1000) {
			// On affiche la réservation avec le temps restant
			$('#info').html($(document.createElement('p'))
				.addClass('innerInfo fas fa-info-circle')
				.html(` Réservation par ${this.prenom} ${this.nom} pour la station ${this.reservation.station.name}, expire dans ${makeTime(timeRemaining)}. `)
				.append(button)
				);
			// On change l'icone de la station pour laquelle la réservation est active
			if(myMap.stationMarkers[this.reservation.station.number]) {
				myMap.stationMarkers[this.reservation.station.number].setIcon(L.ExtraMarkers.icon({
					icon: 'fa-bicycle',
					markerColor: 'green',
					shape: 'square',
					prefix: 'fas'
				}));
			}
			// On programme une nouvelle execution de la fonction dans une seconde
			setTimeout(() => this.affichage(), 1000);
		}
		// La réservation est périmée
		else {
			// On fait disparaitre la réservation à l'écran
			$('#info').html('');
			// On remet l'icone par défaut pour la station ou la réservation a expiré
			if(myMap.stationMarkers[this.reservation.station.number]) {
				myMap.stationMarkers[this.reservation.station.number].setIcon(L.Icon.Default.prototype);
			}
			// On remet les valeurs par défaut pour la réservation
			this.reservation.station = {};
			this.reservation.expires = Date.now();
			this.reservation.active = false;
		}
	}

}