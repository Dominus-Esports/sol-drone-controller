(function(){
	const R = 6378137; // meters
	function degToRad(d){ return d * Math.PI / 180; }
	function radToDeg(r){ return r * 180 / Math.PI; }

	function lonLatToMeters(lon, lat){
		const x = R * degToRad(lon);
		const y = R * Math.log(Math.tan(Math.PI/4 + degToRad(lat)/2));
		return { x, y };
	}
	function metersToLonLat(x, y){
		const lon = radToDeg(x / R);
		const lat = radToDeg(2 * Math.atan(Math.exp(y / R)) - Math.PI/2);
		return { lon, lat };
	}
	function metersDelta(fromLon, fromLat, toLon, toLat){
		const a = lonLatToMeters(fromLon, fromLat);
		const b = lonLatToMeters(toLon, toLat);
		return { dx: b.x - a.x, dy: b.y - a.y };
	}

	window.SOL_GeoProjector = { lonLatToMeters, metersToLonLat, metersDelta };
})();
