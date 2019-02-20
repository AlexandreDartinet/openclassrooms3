/**
 * @class Canvas
 * Classe permettant de gérer la signature sur un canvas
 * @constructor : initialise l'objet
 * @function init : Prépare le canvas pour la signature
 * @function draw : Dessine sur le canvas en fonction de la position du curseur
 * @function clear : efface le contenu du canvas
 * @function event : gère les différentes actions de l'utilisateur sur le canvas
 * @function findXY : Trouver la position de la souris/doigt sur le canvas
 * 
 * @property {String} canvasId : Identifiant du canvas
 * @property {Object} canvas : objet canvas dans la page
 * @property {Number} width : Largeur du canvas en px
 * @property {Number} height : Hauteur du canvas en px
 * @property {Object} context : Contexte du canvas
 * @property {Boolean} drawing : true si l'utilisateur est en train de signer
 * @property {Boolean} signed : true si l'utilisateur a signé
 * @property {Number} prevX : Position horizontale précédente du curseur
 * @property {Number} prevY : Position verticale précédente du curseur
 * @property {Number} curX : Position horizontale actuelle du curseur
 * @property {Number} curY : Position verticale actuelle du curseur
 */
class Canvas {
	/**
	 * @constructor
	 * Initialise l'objet Canvas
	 */
	constructor() {
		this.canvasId = "";
		this.canvas;
		this.width = 0;
		this.height = 0;
		this.context;
		this.drawing = false;
		this.signed = false;
		this.prevX = 0;
		this.curX = 0;
		this.prevY = 0;
		this.curY = 0;
	}
	/**
	 * @function init
	 * Prépare le canvas à la signature
	 * @param {String} canvasId : l'identifiant du canvas dans la page
	 */
	init(canvasId) {
		this.canvasId = canvasId;
		this.canvas = document.getElementById(this.canvasId);
		// On récupère la taille de l'élément sur la page tel qu'il s'affiche
		this.width = $(this.canvas).width();
		this.height = $(this.canvas).height();
		// On renseigne sa hauteur et largeur visible au canvas, pour qu'il n'y aie pas de soucis d'échelle
		$(this.canvas).attr("width",this.width);
		$(this.canvas).attr("height",this.height);
		this.context = this.canvas.getContext("2d");
		this.drawing = false;
		this.signed = false;
		// On ajoute la gestion des évennements souris ou touch
		$(this.canvas).on('mousemove', (e) => this.event('move', e));
		$(this.canvas).on('mousedown', (e) => this.event('down', e));
		$(this.canvas).on('mouseup', (e) => this.event('up', e));
		$(this.canvas).on('mouseout', (e) => this.event('out', e));
		$(this.canvas).on('touchmove', (e) => this.event('move', e, true));
		$(this.canvas).on('touchstart', (e) => this.event('down', e, true));
		$(this.canvas).on('touchend', (e) => this.event('up', e, true));
		$(this.canvas).on('touchleave', (e) => this.event('out', e, true));

	}
	/**
	 * @function draw
	 * Dessine une ligne entre la position précédente et la position actuelle du curseur
	 */
	draw() {
		this.context.beginPath();
        this.context.moveTo(this.prevX, this.prevY);
        this.context.lineTo(this.curX, this.curY);
        this.context.strokeStyle = "black";
        this.context.lineWidth = 2;
        this.context.stroke();
        this.context.closePath();
	}
	/**
	 * @function clear
	 * Efface le canvas et passe signed à false
	 */
	clear() {
		this.context.clearRect(0, 0, this.width, this.height);
		this.signed = false;
	}
	/**
	 * @function event
	 * Gère les différentes interractions de l'utilisateur avec le canvas
	 * @param {string} type : type d'évennement (down/up/move/out)
	 * @param {Event} e : L'évennement qui a appelé la fonction
	 * @param {Boolean} mobile : Si l'évennement est mobile (touch) par défaut false 
	 */
	event(type, e, mobile = false) {
		e.preventDefault();
		// Début de l'écriture, on initialise la position du curseur et drawing à true
		if(type == "down") {
			this.findXY(e, mobile);
            this.prevX = this.curX;
            this.prevY = this.curY;
            this.drawing = true;
		}
		// Fin de l'écriture, on est sorti du cadre ou arrêté de cliquer/appuyer, drawing à False
		if(type == "up" || type == "out") {
			this.drawing = false;
		}
		// Le curseur se déplace, si on est en train d'écrire, on met à jour la position du curseur,
		// on appelle draw et signed à true
		if(type == "move") {
			if(this.drawing) {
				this.prevX = this.curX;
				this.prevY = this.curY;
				this.findXY(e, mobile);
				this.signed = true;
				this.draw();
			}
		}
	}
	/**
	 * @function findXY
	 * Ecrit dans curX et curY la position du curseur relative au canvas
	 * @param {Event} e : l'évennement
	 * @param {Boolean} mobile : Si on est sur un mobile (touch)
	 */
	findXY(e, mobile) {
		// On récupère la position dans le document du canvas
		let offset = $(this.canvas).offset();
		// On soustrait la hauteur du contenu qui n'est pas affiché à l'écran pour avoir
		// un offset par rapport à la fenêtre, pas par rapport au document
		offset.top -= $(window).scrollTop();
		// Si l'évennement est mobile, on récupère la position du touch
		if(mobile) {
			let em = e.originalEvent;
			this.curX = em.targetTouches[0].pageX - offset.left;
			this.curY = em.targetTouches[0].pageY - offset.top;
		}
		// Si l'évennement n'est pas mobile, on récupère la position de la souris
		else {
			this.curX = e.clientX - offset.left;
			this.curY = e.clientY - offset.top;
		}
	}
}