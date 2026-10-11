/* démarrage */
show(0,true);
selectPlace("terre",true);
(function(){const t=location.hash.slice(1);if(t)openToken(t,true);else go("chronologie",true)})();
