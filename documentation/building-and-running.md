# Build and run the service

## Overview

The service consists of a Node.js application built with the Next.js framework.

The configuration for the questions and supplier mappings is loaded from a Google Sheets spreadsheet.

## Requirements

* `node` - version 16 or higher 
* `npm` - version 8 or higher

## Setting up Google Sheets

### Create the spreadsheet

First create a new document in Google Sheets using [the example template provided](../example.xlsx). Alternatively you can make a copy of an existing configuration spreadsheet.

Make a note of the document id from the URL.

### Create a Google Cloud project and access credentials

If you do not already have a project and authentication credentials you can create them by following the documentation at [https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication)

You can use either an API key or service account to load the spreadsheet data. If using an API key then your spreadsheet will need to be public accessible. If using a service account then you will need to either grant access to the spreadsheet to the email address associated with the account, or also make the spreadsheet publicly accessible.

### Set environment variables

The following environment variables will need to be set at build time of the service:

* `SPREADSHEET_ID` - the document id of the spreadsheet created above

And either:

* `API_KEY` - Google Sheets API key if using API key authentication

or:

* `CLIENT_EMAIL` - the email of the service account used for authentication
* `PRIVATE_KEY` - the private key associated with the service account

Learn more about [how to configure the service in Google Sheets]('./service-configuration').

## Build the service

With the above environment variables set, run the following commands in the root directory of the project.

First, install the required dependencies:

```
npm ci --production
```

Then compile the pages for the application:

```
npm run build
```

## Run the service

To start the server run the following command in the root directory of the project:

```
npm start
```

The service will listen on port 3000 by default, which is configurable through the `PORT` environment variable.

## Local development

When running the service locally environment variables can be configured in a file named `.env.local` in the root of the project.

You can run `npm run dev` to automatically recompile and rebuild live as you make changes.

## Next steps

* [Configure the service in Google Sheets](./service-configuration.md)
* [Configure email functionality](./email-configuration.md)
