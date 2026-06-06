# Maker Calendar Uk

A calendar of maker events based in the uk.

Please raise an issue or a pull request to add new events to this calendar.

Assembled using [Calendar Page](https://github.com/emilyselwood/calendar_page)

## To add an entry

### If you don't feel comfortable editing a csv file

* click on the [issues](https://github.com/emilyselwood/makers_calendar_uk/issues) link at the top of the page.
* Click the blue [new issue](https://github.com/emilyselwood/makers_calendar_uk/issues/new) button on the top right of the page
* Give the issue a name like "Add Event Alice's awesome lathe and table saw weekend" (with your events name)
* In the issue text make sure you include the following information
  * Name
  * Description
  * Start date and time (in the uk timezone at the time of the event, UTC or BST as appropriate)
  * End date and time
  * A url to find more information, or to sign up
  * Latitude and longitude coordinates if the event has a location
* Press the create button at the bottom, under the text area.
* Wait for me to notice the issue and transfer the events details to the `events.csv` file
* You should get a notification from github when the issue is closed because its been added.

### If you feel comfortable editing a csv file

* Open up the [events.csv](https://github.com/emilyselwood/makers_calendar_uk/edit/main/events.csv) file for editing
* Add a new row for your event
* Fill in the fields matching the header at the top of the file.
  * Name
  * Start date
  * Start time (in the uk timezone at the time of the event, UTC or BST as appropriate)
  * End date (can be a different day to the start date, the event will be shown on every day between the two)
  * End time
  * Description
  * Url
  * Latitude
  * Longitude
* Create a pr for the change, give it a useful title.
* Wait for it to be approved and merged.
* You should get a notification for it being merged, depending on your settings.
