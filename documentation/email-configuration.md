# Configure email functionality

The service can send a list of matching suppliers to an email address provided by the user.

## Requirements

The service uses GOVUK Notify to send emails, so you will need a Notify account if you do not already have one.

Configure the account settings as required per the [Notify documentation](https://www.notifications.service.gov.uk/using-notify/get-started).

## Creating a template

The content of the email is defined in a template in Notify.

Select "Templates" in the left hand menu of the Notify console and either create a new template or edit an existing one. The name of the template can be any name of your choosing.

The `Subject` field should contain only the following:

```
((subject))
```

The  `Message` field should be populated with the desired content of the email.

Example:

```
# Your results for assured suppliers of digital social care records

Attached is a list of assured suppliers of digital social care records matched to your search criteria

If your requirements change you can [start a new search for digital social care record suppliers](((url))). You can also [visit the Digital Social Care website](https://www.digitalsocialcare.co.uk/) for more information on technology and data protection in social care.


Download your results at ((link))
```

The content can be any content of your choosing, and can be formatted with [a limited set of Markdown options](https://www.notifications.service.gov.uk/using-notify/guidance/edit-and-format-messages).

The placeholders `((url))` and `((link))` will be populated with the URL of the live service and a link to download the list of suppliers respectively.

You will need to make a note of the template ID property from Notify to configure the service.

## Generate an API key

You will also need to create an API key to allow the service to connect to Notify and send email.

Select "API integration" from the Notify dashboard menu and then "API keys". You can then create a new API key for the service. Note that API keys can only be read at the time they are created so make a note of the API key here.

## Configure the service to send emails

To send email from the service you will need to set the following environment variables to be available at runtime:

* `SERVICE_START` - the URL of the start page of the service in the appropriate environment
* `NOTIFY_TEMPLATE` - the id template of the email template created earlier
* `NOTIFY_KEY` - the API key created earlier
