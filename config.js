window.ATLAS_API_ROOT = window.ATLAS_API_ROOT || (
	['localhost', '127.0.0.1'].includes(window.location.hostname)
		? 'http://localhost:3000'
		: 'https://atlas-tu-enciclopedia-de-animalitos.onrender.com'
);