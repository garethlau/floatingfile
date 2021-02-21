module.exports = {
  faqs: [
    {
      q: "Why should I use floatingfile?",
      a:
        "You should use floatingfile if you need a fast way to transfer files between two devices!",
    },
    {
      q: "Is it secure?",
      a:
        "When you upload a file to floatingfile, your file immediately gets uploaded to Amazon's cloud (floatingfile uses AWS S3). While the URL of your file is hashed, it still exists and is accessible on the public web. Furthermore, please remember that anyone with the space's 6-digit code can view and download all files associated with that space! With these in mind, I would strongly recommend against using floatingfile to transfer sensitive documents such as bank statements, personal identification and passport information to name a few. To minimize the risk of files being compromised, ensure that you manually remove the file or destroy the space to reduce the time which your files are on the public web.",
    },
    {
      q: "What are the storage constraints?",
      a:
        "The total file sizes within an individual space cannot exceed 1 GB. As such, each individual file cannot exceed 1 GB.",
    },
    {
      q: "How long do spaces and files last?",
      a:
        "Spaces and files are automatically deleted after 24 hours. If you do not need the files, I recommend manually closing the space to remove all your data earlier.",
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
};
