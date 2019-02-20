/**
 * @function ajaxGet
 * @author Cours Openclassrooms
 * Récupère le contenu d'un url par la méthode GET et passe le résultat à la fonction fournie en paramètre
 * @param {string} url : L'url de la page à interroger
 * @param {function} callback : La fonction à appeler lorsqu'on a le contenu de la page
 */
function ajaxGet(url, callback) {
    let req = new XMLHttpRequest();
    req.open("GET", url);
    req.addEventListener("load", () => {
        if (req.status >= 200 && req.status < 400) {
            // Appelle la fonction callback en lui passant la réponse de la requête
            callback(req.responseText);
        } else {
            console.error(req.status + " " + req.statusText + " " + url);
        }
    });
    req.addEventListener("error", () => {
        console.error("Erreur réseau avec l'URL " + url);
    });
    req.send(null);
}
/**
 * @function scrolling
 * Change la div navigation en fonction de la position dans la page
 */
function scrolling() {
    let scrollTop = $(window).scrollTop() + ($(window).height() / 2);
    if(scrollTop > $("#reservation").offset().top) {
        $("#navigation").html('<a class="fas fa-chevron-up">Revenir au tutoriel</a>').on('click',() => {
            $.scrollify.move("#1");
        });
    }
    else {
        $("#navigation").html('<a class="fas fa-chevron-down">Aller à la réservation</a>').on('click',() => {
            $.scrollify.move("#2");
        });
    }
}
/**
 * @function navigationToggle
 * Change ce qui s'affiche à l'écran pour la version mobile en fonction de l'écran choisi
 * @param {string} screen : quel est l'écran choisi
 */
function navigationToggle(screen) {
    if(screen == "#slider") {
        $('#slider').show();
        $('#reservation').hide();
        $("#navigation")
            .html('<a class="fas fa-chevron-down">Aller à la réservation</a>')
            .on('click', () => {
            storage.setScreen("#reservation");
            navigationToggle("#reservation");
            enableFullScreen();
        });
        
    } else {
        $('#slider').hide();
        $('#reservation').show();
        $("#navigation")
            .html('<a class="fas fa-chevron-up">Revenir au tutoriel</a>')
            .on('click', () => {
            storage.setScreen("#slider");
            navigationToggle("#slider");
            disableFullScreen();
        });
        
    }
}
/**
 * @function makeTime
 * Transforme un timestamp en chaine de caractères lisible par un humain
 * @param {number} timestamp : un timestamp en ms
 * @returns {string} : une chaine de caractère du type "XXhXXminXXs"
 */
function makeTime(timestamp) {
    timestamp = Math.round(timestamp/1000);
    let secondes = timestamp % 60;
    timestamp = Math.floor(timestamp/60);
    let minutes = timestamp % 60;
    let hours = Math.floor(timestamp/60);
    let time = '';
    if(hours > 0) time += hours+"h";
    if(minutes > 0) time += minutes+"min";
    time += secondes+"s";
    return time;
}
/**
 * @function enableFullScreen
 * Active le mode plein écran du navigateur
 */
function enableFullScreen() {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
}
/**
 * @function disableFullScreen
 * Désactive le mode plein écran du navigateur
 */
function disableFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
}
/**
 * @function toggleFullScreen
 * Active ou désactive le mode plein écran du navigateur
 */
function toggleFullScreen() {
  if (!document.fullscreenElement &&    
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  
    enableFullScreen();
  } else {
    disableFullScreen();
  }
}