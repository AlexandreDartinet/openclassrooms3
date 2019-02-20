/**
 * @class Map
 * Gère l'affichage de la carte, des marqueurs et la réservation
 * @constructor : initialise l'objet
 * @function draw : dessine la carte
 * @function getStations : récupère les stations depuis l'API de JCDecaux
 * @function drawStations : Affiche les marqueurs des stations sur la carte
 * @function addReservation : peuple le formulaire de réservation et gère le retour du formulaire
 * 
 * @property {L.map} map : objet map de Leaflet
 * @property {String} apiOSM : Clé de l'API openstreetmap
 * @property {String} apiJCD : Clé de l'API JCDecaux
 * @property {jQuery} mapEl : Element contenant la carte
 * @property {jQuery} formEl : Element contenant le formulaire de réservation
 * @property {Object} stationMarkers : Liste de tous les objets marqueurs de station sur la carte
 * @property {Canvas} canvas : L'objet Canvas pour la signature du formulaire
 */

class Map {
	/**
	 * @constructor
	 * Initialise l'objet Map
	 * @param {Number} long : La longitude sur laquelle se centrer par défaut
	 * @param {Number} lat : La latitude sur laquelle se centrer par défaut
	 * @param {Number} ech : L'échelle par défaut de la carte
	 * @param {String} mapId : L'identifiant du conteneur de la carte
	 * @param {String} formId : L'identifiant du conteneur du formulaire
	 * @param {String} apiOSM : Clé de l'api openstreetmap
	 * @param {String} apiJCD : Clé de l'api JCDecaux
	 */
	constructor(long,lat,ech,mapId,formId,apiOSM,apiJCD) {
		this.map = L.map(mapId).setView([long, lat], ech);
		this.apiOSM = apiOSM;
		this.apiJCD = apiJCD;
		this.mapEl = $(`#${mapId}`);
		this.formEl = $(`#${formId}`);
		this.stationMarkers = {};
		this.canvas = new Canvas();
	}
	/**
	 * @function draw
	 * Dessine la carte en récupérant les graphiques via l'API openstreetmap
	 */
	draw() {
		// On ajoute le graphique de la carte à partir de l'API openstreetmap
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		    maxZoom: 18,
		    id: 'mapbox.streets',
		    accessToken: this.apiOSM
		}).addTo(this.map);
		// On récupère la position de l'utilisateur et on ajoute un marqueur sur la carte
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(p => {
				let marker = L.marker(
					[p.coords.latitude,p.coords.longitude], 
					{icon: L.ExtraMarkers.icon({
    					icon: 'fa-walking',
					    markerColor: 'red',
					    shape: 'square',
					    prefix: 'fas'
  						})}
					);
				marker.bindPopup('Vous êtes ici !');
				marker.on('mouseover', e => marker.openPopup());
				marker.on('mouseout', e => marker.closePopup());
				marker.addTo(this.map);
				// Si l'utilisateur est à Lyon, on centre la carte sur lui
				if ((p.coords.latitude <= 45.797415) && (p.coords.latitude >= 45.724172) && (p.coords.longitude <= 4.920569) && (p.coords.longitude >= 4.78821)) this.map.setView([p.coords.latitude,p.coords.longitude],15);
			});
		}
		
	}
	/**
	 * @function getStations
	 * Récupère la liste des stations depuis l'API JCDecaux et appelle drawStations
	 */
	getStations() {
		ajaxGet(`https://api.jcdecaux.com/vls/v1/stations?contract=Lyon&apiKey=${this.apiJCD}`,r => this.drawStations(JSON.parse(r)));
	}
	/**
	 * @function drawStations
	 * Affiche les stations sur la carte
	 * @param {Array} stations : La liste des stations retournée par l'API JCDecaux
	 */
	drawStations(stations) {
		// On crée l'objet pour le groupement de marqueurs
		let markersCluster = new L.MarkerClusterGroup();
		// On traite chaque station de la liste individuellement
		stations.forEach(station => {
			if(station.status == "OPEN") { // On vérifie que la station est ouverte
				let marker = L.marker(station.position);
				let time = makeTime(Date.now() - station.last_update);
				// On gère le texte qui s'affichera au passage de la souris
				marker.bindPopup(`
					${station.name.split('-')[1]}<br/>
					${station.address}<br/>
					<i class="fas fa-bicycle"></i>:${station.available_bikes}/${station.bike_stands}<br>
					Mise à jour il y a ${time}`);
				// Si la station n'a aucun vélo, on change son marqueur
				if(station.available_bikes == 0) { 
					marker.setIcon(L.ExtraMarkers.icon({
						icon: 'fa-times',
						markerColor: 'red',
						shape: 'circle',
						prefix: 'fas'
					}));
				}
				// On ajoute la logique pour afficher le popup au passage de la souris au lieu du clic
				marker.on('mouseover', e => marker.openPopup());
				marker.on('mouseout', e => marker.closePopup());
				// On ajoute la logique pour ouvrir le formulaire de réservation lorsqu'on clique sur la station
				marker.on('click', e => this.addReservation(station));
				// On ajoute l'objet marqueur à la liste pour pouvoir le modifier plus tard
				this.stationMarkers[station.number] = marker;
				// On ajoute le marqueur au MarkerClusterGroup
				markersCluster.addLayer(marker);
			}
		});
		// On ajoute les marqueurs sur la carte
		this.map.addLayer(markersCluster);
		// Si une réservation est active, on centre la vue sur la station ou la réservation a été faite
		if (storage.reservation.active) {
			this.map.setView(storage.reservation.station.position,15);
		}
	}
	/**
	 * @function addReservation
	 * Affiche le formulaire de réservation pour la station choisie
	 * @param {Object} station : Un objet station de l'API JCDecaux
	 */
	addReservation(station) {
		let time = makeTime(Date.now() - station.last_update);
		// On ajoute les classes css à la div carte et formulaire pour qu'elles s'affichent correctement
		this.mapEl.addClass('reservation');
		this.formEl.attr('class','reservation');
		// On ajoute cette classe à la div de navigation pour la faire disparaitre sur la version mobile
		$('#navigation').addClass('reservation');
		// On masque le bouton pour commencer le processus de réservation s'il n'y a pas de vélo disponible
		if(station.available_bikes == 0) {
			this.formEl.addClass('noReservation');
			$('.buttonRow').hide();
		}
		// Le bouton pour afficher le reste du formulaire et démarrer le processus de réservation
		let button = $(document.createElement('button'))
			.text("Réserver")
			.addClass("formButton");
		// Le bouton pour fermer le formulaire de réservation
		let buttonClose = $(document.createElement('button'))
			.addClass('close fas fa-times')
			.on('click', (e) => {
				e.preventDefault();
				this.mapEl.removeClass('reservation');
				this.formEl.html('').removeClass('reservation');
				$('#navigation').removeClass('reservation');
				$('#info').removeClass('reservation');
			});
		// On crée le formulaire de réservation
		let table = $(document.createElement('form'))
		.append($(document.createElement('table'))
			.addClass('reservation')
			.append($(document.createElement('tbody'))
				.append($(document.createElement('tr'))
					.append($(document.createElement('td'))
						.text('Station :')
						)
					.append($(document.createElement('td'))
						.text(station.name.split('-')[1])
						.append(buttonClose)
						)
					)
				.append($(document.createElement('tr'))
					.append($(document.createElement('td'))
						.text('Adresse :')
						)
					.append($(document.createElement('td'))
						.text(station.address)
						)
					)
				.append($(document.createElement('tr'))
					.append($(document.createElement('td'))
						.html('<i class="fas fa-bicycle"></i>Vélos :')
						)
					.append($(document.createElement('td'))
						.text(`${station.available_bikes}/${station.bike_stands}`)
						)
					)
				.append($(document.createElement('tr'))
					.append($(document.createElement('td'))
						.text('Mis à jour :')
						)
					.append($(document.createElement('td'))
						.text(`Il y a ${time}`)
						)
					)
				.append($(document.createElement('tr'))
					.addClass('buttonRow')
					.append($(document.createElement('td'))
						.attr('colspan','2')
						.append(button)
						)
					)
				)
			);
		// On affiche le reste du formulaire lors du clic sur le bouton de réservation
		button.on('click', (e) => {
			e.preventDefault();
			this.formEl.addClass('openReservation');
			$('#info').addClass('reservation');
			$('.buttonRow').remove();
			$('table.reservation tbody')
				.append($(document.createElement('tr'))
					.append($(document.createElement('th'))
						.attr('colspan','2')
						.text('Votre réservation')
						)
					)
				.append($(document.createElement('tr'))
					.append($(document.createElement('td'))
						.text('Nom :')
						)
					.append($(document.createElement('td'))
						.append($(document.createElement('input'))
							.attr('type','text')
							.attr('name','nom')
							.attr('required',true)
							.attr('value',storage.nom)
							)
						)
					)
				.append($(document.createElement('tr'))
					.append($(document.createElement('td'))
						.text('Prénom :')
						)
					.append($(document.createElement('td'))
						.append($(document.createElement('input'))
							.attr('type','text')
							.attr('name','prenom')
							.attr('required',true)
							.attr('value',storage.prenom)
							)
						)
					)
				.append($(document.createElement('tr'))
					.append($(document.createElement('td'))
						.attr('colspan','2')
						.text('Signature :')
						)
					)
				.append($(document.createElement('tr'))
					.height('150px')
					.append($(document.createElement('td'))
						.addClass('canvas')
						.attr('colspan','2')
						.height('150px')
						.append($(document.createElement('canvas'))
							.attr('id','signature')
							.attr('css','margin:0;padding:0;')
							)
						)
					)
				.append($(document.createElement('tr'))
					.append($(document.createElement('td'))
						.attr('colspan','2')
						.append($(document.createElement('input'))
							.attr('type','submit')
							.attr('value','Valider')
							.addClass('formButton')
							)
						.append($(document.createElement('input'))
							.attr('type','reset')
							.attr('value','Effacer')
							.addClass('formButton')
							.on('click', (e) => this.canvas.clear())
							)
						)
					);
			// On initialise l'objet Canvas pour la signature en lui donnant l'id du canvas
			this.canvas.init("signature");
		});
		// On gère la validation du formulaire
		this.formEl.html(table);
		$('form').on('submit', (e) => {
			e.preventDefault();
			// Si le canvas n'a pas été signé
			if(!this.canvas.signed) {
				alert("Vous devez signer pour pouvoir réserver.");
				return;
			}
			// On alerte l'utilisateur si une réservation est déjà présente et on annule l'ancienne réservation s'il le souhaite
			if(storage.reservation.active) {
				if(!confirm("Faire une nouvelle réservation annulera la précédente, êtes-vous sûr de vouloir poursuivre ?")) return;
				else this.stationMarkers[storage.reservation.station.number].setIcon(L.Icon.Default.prototype);
			}
			// On enregistre la réservation grâce à l'objet Storage
			storage.setName($('input[name=nom]').val(),$('input[name=prenom]').val());
			storage.setReservation(station);
			// On rétablit l'affichage de base
			this.mapEl.removeClass('reservation');
			this.formEl.html('').attr('class','');
			$('#navigation').removeClass('reservation');
			$('#info').removeClass('reservation');
			// On centre la vue sur la station réservée
			this.map.setView(station.position,15);
		});
		
	}
}
