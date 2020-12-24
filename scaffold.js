const Variants = {
	BODY: "BODY",
	BULLET: "BULLET",
	IMG: "IMG",
	LINE_BREAK: "LINE_BREAK",
	HEADER: "HEADER",
};
module.exports = {
	faqs: [
		{
			q: "Why should I use floatingfile?",
			a: "You should use floatingfile if you need a fast way to transfer files between two devices!",
		},
		{
			q: "Is it secure?",
			a:
				"When you upload a file to floatingfile, your file immediately gets uploaded to Amazon's cloud (floatingfile uses AWS S3). While the URL of your file is hashed, it still exists and is accessible on the public web. Furthermore, please remember that anyone with the space's 6-digit code can view and download all files associated with that space! With these in mind, I would strongly recommend against using floatingfile to transfer sensitive documents such as bank statements, personal identification and passport information to name a few. To minimize the risk of files being compromised, ensure that you manually remove the file or destroy the space to reduce the time which your files are on the public web.",
		},
		{
			q: "What is the max file size?",
			a: "Individual files cannot exceed 300 MB. There is no limit to the number of files within a space.",
		},
		{
			q: "How long do spaces and files last?",
			a:
				"Spaces are automatically deleted after three hours and files are automatically removed from a space after one hour.",
		},
		{
			q: "How was my username generated?",
			a:
				"Your username is a randomly generated color-animal pair. The username is saved to your browser storage and is refreshed after a few hours of inactivity. The username is just a mechanism to identify differnet users in a space.",
		},
		{
			q: "Why did you build floatingfile?",
			a:
				"I (Gareth) built floatingfile to improve my workflow of moving files from university workstations to my personal computer. Common solutions such as Gmail, Google Drive and OneDrive all required that I sign in on the university computer which added extra minutes to the process (even moreso because I use a password manager and don't know these passwords from memory). Dedicated file transfer solutions like Wetransfer and FireFox send on the other hand didn't allow me to edit the files I am sending. As well, there were occasions in which I needed to send files both ways.",
		},
		{
			q: "What was used to build floatingfile?",
			a:
				"The web application was built using the MERN (Mongo, Express, React, and Node) stack. The web application is hosted on Digital Ocean and uses Amazon S3 as the storage solution.",
		},
		{
			q: "Who built floatingfile?",
			a:
				"floatingfile is collaboration between Gareth Lau (https://garethlau.me) and Alan Yan (https://alanyan.ca)! The landing page, web application, and backend services were built and are managed by Gareth. The iOS application was built entirely by Alan Yan. ",
		},
		{ q: "Is there an Android app?", a: "No." },
	],
	changelog: [
		{
			date: "August 8, 2020",
			version: "v3.1.14",
			content: [
				{ text: "Small fixes and quality of life improvements.", variant: Variants.HEADER },
				{
					text: "Fixed a bug where the space would not close for the user that initiated the action",
					variant: Variants.BULLET,
				},
				{
					text: "Changed 'Delete' to 'Remove' for consistency",
					variant: Variants.BULLET,
				},
				{
					text: "Disabled the ability to select files on mobile",
					variant: Variants.BULLET,
				},
				{
					text: "Generated codes now use capitalized letters",
					variant: Variants.BULLET,
				},
				{
					text: "Fixed a bug that broke ZIP functionality",
					variant: Variants.BULLET,
				},
				{
					text: "Darkened warning color to improve text visibility",
					variant: Variants.BULLET,
				},
				{
					text: "Updated icons used in the history tab",
					variant: Variants.BULLET,
				},
				{
					text:
						"Added alerts when a user attempts to upload a file that exceeds the individual max file size (see https://floatingfile.space/faq?active=2)",
					variant: Variants.BULLET,
				},
				{
					text: "Code of the space is shown in the title of the browser tab",
					variant: Variants.BULLET,
				},
				{
					text: "The displayed file size is now more accurate",
					variant: Variants.BULLET,
				},
			],
		},
		{
			date: "July 25, 2020",
			version: "v3.1.2",
			content: [
				{
					text: "We've changed the way file downloads are handled for mobile.",
					variant: Variants.HEADER,
				},
				{
					text:
						"All browsers now open the requested file in a new tab. To visually reflect this change, using the mobile version of floatingfile will show different buttons indicating the functionality (download or open). This means we are no longer tracking file downloads for mobile users; however we believe this change is neccessary for consistency and usability.",
					variant: Variants.BODY,
				},
				{
					text: "Previous on the left, new on the right:",
					variant: Variants.BODY,
				},
				{
					src: "/images/mobile-icon-update",
					variant: Variants.IMG,
				},
			],
		},
		{
			date: "July 15, 2020",
			version: "v3.0.12",
			content: [
				{
					text: "We've heard your feedback and have increased the lifetime of spaces and files.",
					variant: Variants.HEADER,
				},
				{ text: "Files expire after 60 minutes (previously 30 minutes)", variant: Variants.BULLET },
				{ text: "Spaces expire after 3 hours (previously 1 hour)", variant: Variants.BULLET },
			],
		},
		{
			date: "July 1, 2020",
			version: "v3.0.0",
			content: [
				{ text: "Version 3 is here! 🎉", variant: Variants.HEADER },
				{ src: "/images/space-ui", variant: Variants.IMG },
				{
					text:
						"We're rolling out a complete UI refresh for the desktop application along with small adjustments to improve the overall experience.",
					variant: Variants.BODY,
				},
				{
					text: "History persists to the space, not to the current session (persists between page refreshes)",
					variant: Variants.BULLET,
				},
				{ text: "A random color-animal nickname is generated and saved for your browser", variant: Variants.BULLET },
				{ text: "Removed limit on the number of users in a space", variant: Variants.BULLET },
				{ text: "Now able to download, zip, and delete selected files", variant: Variants.BULLET },
				{
					text:
						"We've also temporarily removed the ability to adjust space settings while we reconsider which settings are useful for the average user.",
					variant: Variants.BODY,
				},
				{ variant: Variants.LINE_BREAK },
				{ text: "Other updates", variant: Variants.HEADER },
				{ text: "New changelog page", variant: Variants.BULLET },
				{ text: "Updated privacy policy and terms of service", variant: Variants.BULLET },
			],
		},
		{
			date: "April 19, 2020",
			version: "v2.1.6",
			content: [
				{ text: "New option to change to list view", variant: Variants.BULLET },
				{ text: "Default space duration has been set to 60 minutes", variant: Variants.BULLET },
				{ variant: Variants.LINE_BREAK },
				{
					text:
						"We're also super excited to be releasing floatingfile for iOS devices. For more informaton, visit the floatingfile landing page.",
					variant: Variants.BODY,
				},
			],
		},
	],
};
