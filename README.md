# Digital Social Care Buyer Guide

## Configuration

To run the service you will need the following environment variables defined as a minimum:

* `SPREADSHEET_ID` - the id of the google sheet containing the questions and supplier configuration
* `CLIENT_EMAIL` - the email address of a GCP service account
* `PRIVATE_KEY` - the private key of a GCP service account

For local development, these should be defined in `.env.local`.

Details of how to set up a GCP service account can be found at [](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication?id=service-account).

Note that the email address for the service account needs to be added as a "Viewer" for the spreadsheet using the "Share" dialogue.

## Environments

* dev: https://decision-tree-dev.london.cloudapps.digital/
* staging: https://decision-tree-staging.london.cloudapps.digital/
* prod: https://decision-tree.london.cloudapps.digital/ 


## Deployments

* All pushes to `main` are deployed to dev (if they pass tests)
* To deploy to staging create a pre-release in github
* To deploy to prod edit the pre-release to be a full release - this also requires a manual approval
* All configuration is stored as environment secrets in github
