module.exports = function() {
	var ahora = new Date();

	var hours   = ahora.getHours()<10?'0'   + ahora.getHours()   : ahora.getHours();
	var minutes = ahora.getMinutes()<10?'0' + ahora.getMinutes() : ahora.getMinutes();
	var seconds = ahora.getSeconds()<10?'0' + ahora.getSeconds() : ahora.getSeconds();

	return hours+':'+minutes+':'+seconds;
}
