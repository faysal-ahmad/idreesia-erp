# Projects and Source Code Structure
## Idressia-Common
This is written as a Meteor Package that contains common code used by other projects. This includes, but is not limited to:-

- Meteor Collections and their Schema
- Common Business Logic
- GraphQL API

## Idreesia-Web
This is the front-end for the Web Application. It uses the `antd` library to build the UI. Most of the code uses HOCs in it's implementation. However gradually this is being converted to use React Hooks instead. 
Currently there are five modules built in the web application.

- Admin
- Accounts
- HR
- Inventory
- Security

The main web application contains a shell which provides the main navigation features for the application. It uses React Suspense and dynamic imports to lazy load the modules when the user clicks on a link for the module.

## Idreesia-Jobs
This is a job server that runs background, scheduled/on-demand jobs. This includes background data crunching and scheduled emailing of reports.

## Idreesia-Mobile
This is currently a work in progress. It is being built as an installable PWA that will have offline data capabilities.
