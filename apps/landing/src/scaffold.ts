const userModel = {
  socketId: "String",
  username: "String",
};
const fileModel = {
  _id: "Mongoose.Types.ObjectId",
  filename: "String",
  size: "String",
  mimetype: "String",
  parentId: "Mongoose.Types.ObjectId",
  expires: "String",
  deleteAfterDownload: "Boolean",
  location: "String",
  s3Key: "String",
};
const historyModel = {
  action: "String",
  author: "String",
  timestamp: "Number",
};

const spaceModel = {
  code: "String",
  files: [fileModel],
  expires: "String",
  history: [historyModel],
  users: [userModel],
};

const response500 = { status: 500, description: "Internal server error." };

export const apis = [
  {
    method: "GET",
    summary: "Retrieve the space for a given code.",
    endpoint: "/api/v4/space/{code}",
    request: {
      pathParameters: [
        {
          name: "code",
          description: "Code of the space to retrieve.",
          required: true,
        },
      ],
      queryParameters: [],
      body: null,
    },
    responses: [
      {
        status: 200,
        description: "Space was found.",
        body: {
          space: spaceModel,
        },
      },
      {
        status: 400,
        description: "Invalid request. No code supplied.",
        body: {
          message: "Invalid request.",
        },
      },
      {
        status: 404,
        description: "No space was found for the supplied code.",
        body: {
          message: "Space does not exist.",
        },
      },
      response500,
    ],
  },
  {
    method: "POST",
    summary: "Create a new space.",
    endpoint: "/api/v4/space",
    request: {
      pathParameters: [],
      queryParameters: [],
      body: null,
    },
    responses: [
      {
        status: 200,
        description: "Successfully created a new space.",
        body: {
          space: spaceModel,
        },
      },
      response500,
    ],
  },
  {
    method: "DELETE",
    summary:
      "Deletes a space. Subscribed clients will receive a 'SPACE_DELETED' event.",
    endpoint: "/api/v4/space/{code}",
    request: {
      pathParameters: [
        { name: "code", description: "Code of the space to delete." },
      ],
      queryParameters: [],
      body: null,
    },
    responses: [
      {
        status: 200,
        description: "Successfully delete the space and all of its files.",
      },
      { status: 404, description: "Space to be delete does not exist." },
      response500,
    ],
  },

  {
    method: "DELETE",
    summary:
      "Removes a file from a space. Subscribed clients will receive a 'FILES_UPDATED' event.",
    endpoint: "/api/v4/space/{code}/files/{key}",
    request: {
      pathParameters: [
        {
          name: "code",
          description: "Code of the space to remove files from.",
        },
        {
          name: "key",
          description:
            "Key of the file to be deleted and removed from the space.",
        },
      ],
      queryParameters: [],
      body: null,
    },
    responses: [
      {
        status: 200,
        description: "Successfuly deleted and removed files from the space.",
      },
      { status: 404, description: "Space does not exist." },
      response500,
    ],
  },
  {
    method: "DELETE",
    summary:
      "Removes files from a space. Subscribed clients will receive a 'FILES_UPDATED' event.",
    endpoint: "/api/v4/space/{code}/files",
    request: {
      pathParameters: [
        {
          name: "code",
          description: "Code of the space to remove files from.",
        },
      ],
      queryParameters: [
        {
          name: "toRemove",
          description:
            "Array of file keys to be deleted and removed from the space.",
        },
      ],
      body: null,
    },
    responses: [
      {
        status: 200,
        description: "Successfuly deleted and removed files from the space.",
      },
      { status: 404, description: "Space does not exist." },
      response500,
    ],
  },
  {
    method: "PATCH",
    summary:
      "Associates an uploaded file with the space. This endpoint is called after the client has successfully uploaded the file to S3. Subscribed clients will receive a 'FILES_UPDATED' event.",
    endpoint: "/api/v4/space/{code}/file",
    request: {
      pathParameters: [
        { name: "code", description: "Code of the space to upload files to." },
      ],
      queryParameters: [],
      body: {
        key: "String",
        size: "String",
        name: "String",
        type: "String",
        ext: "String",
      },
    },
    responses: [
      { status: 200, description: "Successfuly uploaded files to the space." },
      { status: 404, description: "Space does not exist." },
      { status: 422, description: "Invalid request. Missing code." },
      response500,
    ],
  },
  {
    method: "GET",
    summary: "Retrieve the list of files uploaded to a space.",
    endpoint: "/api/v4/space/{code}/files",
    request: {
      pathParameters: [
        { name: "code", description: "Code of the space to fetch files for." },
      ],
      queryParameters: [],
      body: null,
    },
    responses: [
      {
        status: 200,
        description: "Successfully retrieved list of files for the space.",
        body: { files: [{ ...fileModel, signedUrl: "String" }] },
      },
      response500,
    ],
  },
  {
    method: "GET",
    summary: "ZIP and download files.",
    endpoint: "/api/v4/space/{code}/files/zip",
    request: {
      pathParameters: [
        {
          name: "code",
          description: "Code of the space that the files are uploaded to.",
        },
      ],
      queryParameters: [
        {
          name: "keys",
          description: "Array of file keys to be zipped and downloaded.",
        },
      ],
      body: null,
    },
    responses: [
      {
        status: 200,
        description: "Successful operation. Streaming zipped content.",
      },
      response500,
    ],
  },
  {
    method: "DELETE",
    summary:
      "Deletes a zipped foler from the server. This API should be invoked after a successful download of zipped files.",
    endpoint: "/api/v4/space/{code}/files/zip",
    request: {
      pathParameters: [],
      queryParameters: [
        { name: "folder", description: "Name of the zipped folder." },
      ],
      body: null,
    },
    responses: [
      { status: 200, description: "Successfully removed folder from server" },
    ],
  },
  {
    method: "PATCH",
    summary: "Update the history for a space.",
    endpoint: "/api/v4/space/{code}/history",
    request: {
      pathParameters: [
        {
          name: "code",
          description: "Code of the space to retrieve the history for.",
        },
      ],
      queryParameters: [],
      body: { action: "String", payload: "String" },
    },
    responses: [
      {
        status: 200,
        description: "Successfully updated space history.",
        body: {
          history: [historyModel],
        },
      },
      response500,
    ],
  },
  {
    method: "GET",
    summary: "Retrieve the history for a space.",
    endpoint: "/api/v4/space/{code}/history",
    request: {
      pathParameters: [
        {
          name: "code",
          description: "Code of the space to retrieve the history for.",
        },
      ],
      queryParameters: [],
      body: null,
    },
    responses: [
      {
        status: 200,
        description: "Successfully retrieved space history.",
        body: {
          history: [historyModel],
        },
      },
      response500,
    ],
  },
  {
    method: "GET",
    summary: "Retrieve a list of users connected to a given space.",
    endpoint: "/api/v4/space/{code}/users",
    request: {
      pathParameters: [
        {
          name: "code",
          description: "Code of the space to retrieve users for.",
        },
      ],
      queryParameters: [],
      body: null,
    },
    responses: [
      {
        status: 200,
        description: "Successfully retrieved users.",
        body: {
          users: [userModel],
        },
      },
      response500,
    ],
  },
];

export const faqs = [
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
];

export default {
  faqs,
  apis,
};
