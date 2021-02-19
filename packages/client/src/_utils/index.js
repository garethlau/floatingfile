export function getMobileOperatingSystem() {
	let userAgent = navigator.userAgent || navigator.vendor || window.opera;
	if (/windows phone/i.test(userAgent)) return "Windows Phone";
	if (/android/i.test(userAgent)) return "Android";
	if (/ipad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "iOS";
	return "Unknown";
}

export function saveBlob(data, filename) {
	return new Promise((resolve, reject) => {
		// Create blob data to download
		let blobData = [data];
		let blob = new Blob(blobData, { type: data.type });
		// Adjust the download mmethod based on operating system
		let os = getMobileOperatingSystem();
		if (os === "iOS") {
			let reader = new FileReader();
			reader.onload = (e) => {
				window.location.href = reader.result;
			};

			reader.addEventListener("loadend", () => {
				resolve(filename);
			});

			reader.addEventListener("error", () => {
				reject(`Error reading file ${filename}`);
			});

			reader.readAsDataURL(blob);
		} else {
			try {
				let blobURL = window.URL.createObjectURL(blob);
				let tempLink = document.createElement("a");
				tempLink.style.display = "none";
				tempLink.href = blobURL;
				tempLink.setAttribute("download", filename);
				if (typeof tempLink.download === "undefined") {
					tempLink.setAttribute("target", "_blank");
				}

				document.body.appendChild(tempLink);
				tempLink.click();
				document.body.removeChild(tempLink);
				window.URL.revokeObjectURL(blobURL);
				resolve(filename);
			} catch (err) {
				reject(`Error reading file ${filename}`);
			}
		}
	});
}

export function formatFileSize(size) {
	if (isNaN(size)) return "";
	if (size >= Math.pow(1024, 3)) {
		return `${(size / Math.pow(1024, 3)).toFixed(1)} GB`;
	} else if (size >= Math.pow(1024, 2)) {
		return `${(size / Math.pow(1024, 2)).toFixed(1)} MB`;
	} else {
		return `${(size / Math.pow(1024, 1)).toFixed(1)} KB`;
	}
}
