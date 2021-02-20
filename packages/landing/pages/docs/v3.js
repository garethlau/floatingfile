import React from "react";
import { NextSeo } from "next-seo";
import styles from "../../styles/Developers.module.css";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

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

const apis = [
  {
    method: "GET",
    summary: "Retrieve the space for a given code.",
    endpoint: "/api/v3/space/{code}",
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
    endpoint: "/api/v3/space",
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
      "Deletes a space. This endpoint emits a socket event to notify clients that the space has been destroyed.",
    endpoint: "/api/v3/space/{code}",
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
      "Removes files from a space. This endpoint emits two socket events; one event notifying clients to refresh the history and another notifying clients to refresh the files.",
    endpoint: "/api/v3/space/{code}/files",
    request: {
      pathParameters: [
        {
          name: "code",
          description: "Code of the space to remove files from.",
        },
      ],
      queryParameters: [
        {
          name: "files",
          description:
            "Array of file IDs to be deleted and removed from the space.",
        },
      ],
      body: null,
    },
    responses: [
      {
        status: 200,
        description: "Successfuly deleted and removed files from the space.",
      },
      { status: 422, description: "Invalid request. Missing code." },
      response500,
    ],
  },
  {
    method: "POST",
    summary:
      "Upload a file to a space. This endpoint emits socket events notifying clients to refresh the history and files list.",
    endpoint: "/api/v3/space/{code}/files",
    request: {
      pathParameters: [
        { name: "code", description: "Code of the space to upload files to." },
      ],
      queryParameters: [],
      body: {
        files: ["File"],
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
    endpoint: "/api/v3/space/{code}/files",
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
        body: { files: [fileModel] },
      },
      response500,
    ],
  },
  {
    method: "GET",
    summary: "ZIP and download files.",
    endpoint: "/api/v3/space/{code}/files/zip",
    request: {
      pathParameters: [
        {
          name: "code",
          description: "Code of the space that the files are uploaded to.",
        },
      ],
      queryParameters: [
        {
          name: "files",
          description: "List of file IDs to be zipped and downloaded.",
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
    endpoint: "/api/v3/space/{code}/files/zip",
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
    method: "GET",
    summary:
      "Download a file. This endpoints emit a socket signaling that the history for the space has been updated and must be refreshed.",
    endpoint: "/api/v3/space/{code}/files/{fileId}",
    request: {
      pathParameters: [
        {
          name: "code",
          description: "Code of the space to which the files belong.",
        },
        { name: "fileId", description: "ID of the file to be downloaded." },
      ],
      queryParameters: [],
      body: null,
    },
    responses: [
      {
        status: 200,
        description: "Operation successful. File stream started.",
      },
      { status: 400, description: "Invalid request. Missing file ID." },
      {
        status: 404,
        description: "File not found.",
        message: "File not found.",
      },
      {
        status: 404,
        description: "Space not found.",
        message: "Space not found.",
      },
      response500,
    ],
  },
  {
    method: "GET",
    summary: "Retrieve the history for a space.",
    endpoint: "/api/v3/space/{code}/history",
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
    endpoint: "/api/v3/space/{code}/users",
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
  {
    method: "GET",
    summary: "Generate a random color-animal pair nickname.",
    endpoint: "/api/v3/nickname",
    request: {
      pathParameters: [],
      queryParameters: [],
      body: null,
    },
    responses: [
      {
        status: 200,
        description: "Successfully generated nickname.",
        body: {
          username: "String",
        },
      },
    ],
  },
];

export default function DevelopersPage() {
  return (
    <>
      <NextSeo
        title={"floatingfile | Developers"}
        description={"Learn about floatingfile's APIs."}
        openGraph={{
          url: "https://www.floatingfile.space",
          title: "floatingfile | Developers",
          description: "Learn about floatingfile's APIs.",
        }}
      />
      <NavBar />
      <main className={styles.root}>
        <div className={styles.title}>
          <h1>floatingfile APIs</h1>
        </div>
        <div style={{ maxWidth: "700px", margin: "auto" }}>
          <p>
            Please keep in mind that all APIs documented here require an API key
            passed with each request in the header. If you are interested in
            using these APIs, please contact Gareth.
          </p>
        </div>
        <div className={styles.table}>
          <p>Version:</p>
          <p>3</p>
          <p>Base URL:</p>
          <p>https://developer.floatingfile.space</p>
          <p>Last Updated:</p>
          <p>July 14, 2020</p>
          <p>Status:</p>
          <p>Stable</p>
        </div>
        <div>
          {apis.map((api, index) => {
            return (
              <div className={styles.endpointContainer}>
                <div style={{ marginTop: "30px" }}>
                  <div className={styles.columnBlock}>
                    <h2 style={{ fontWeight: "bold", margin: 0 }}>
                      {api.method}
                    </h2>
                    <h2 style={{ margin: 0 }}>{api.endpoint}</h2>
                  </div>
                </div>
                <p style={{ margin: "10px 0" }}>{api.summary}</p>

                {!(
                  api.request.pathParameters.length === 0 &&
                  api.request.queryParameters.length === 0 &&
                  api.request.body === null
                ) && <h3 style={{ margin: 0 }}>Request</h3>}
                {api.request.pathParameters.length > 0 && (
                  <p style={{ margin: 0, textDecoration: "underline" }}>
                    Path Parameters
                  </p>
                )}
                <div className={styles.columnBlock}>
                  {api.request.pathParameters.map((x) => {
                    return (
                      <>
                        <p style={{ margin: "5px 0" }}>{x.name}</p>
                        <p style={{ margin: "5px 0" }}>{x.description}</p>
                      </>
                    );
                  })}
                </div>
                {api.request.queryParameters.length > 0 && (
                  <p style={{ margin: 0, textDecoration: "underline" }}>
                    Query Parameters
                  </p>
                )}
                <div className={styles.columnBlock}>
                  {api.request.queryParameters.map((x) => {
                    return (
                      <>
                        <p style={{ margin: "5px 0" }}>{x.name}</p>
                        <p style={{ margin: "5px 0" }}>{x.description}</p>
                      </>
                    );
                  })}
                </div>
                {api.request.body && (
                  <>
                    <p style={{ margin: 0, textDecoration: "underline" }}>
                      Body
                    </p>
                    <pre className={styles.codeblock}>
                      {JSON.stringify(api.request.body, null, 2)}
                    </pre>
                  </>
                )}

                <h3 style={{ margin: 0 }}>Responses</h3>
                <div>
                  {api.responses.map((response) => {
                    return (
                      <div className={styles.columnBlock}>
                        <p style={{ margin: "5px 0" }}>{response.status}</p>
                        <p style={{ margin: "5px 0" }}>
                          {response.description}
                        </p>
                        {response.body && (
                          <>
                            <div></div>
                            <pre className={styles.codeblock}>
                              {JSON.stringify(response.body, null, 4)}
                            </pre>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
