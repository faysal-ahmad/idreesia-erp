# Overview
This is a custom built ERP to automate and digitize the processes for `Idreesia`, a non-profit organization, to fulfill the requirements and process flows of the organization.

## Technologies
The front-end is built using React. Back-end is built on Meteor and MongoDB. GraphQL is used for communicating between the layers. The UI is built using the antd library.

The front-end react code is currently a mixture of code using both HOC and hooks. Initially, all components were using HOC for data loading using GraphQL. After the introduction of React Hooks, it is being gradually ported over to use hooks. 

## Project Details
[Projects and Source Code Structure](./docs/code-structure)

[Bundle Size and other optimiztions](./docs/optimizations.md)

[Building & Deployment](./docs/building-and-deployment.md)

## Module Functionality Details

[Admin Module](./docs/hr-module.md)

[Accounts Module](./docs/accounts-module.md)

[HR Module](./docs/hr-module.md)

[Inventory Module](./docs/inventory-module.md)

[Security Module](./docs/security-module.md)

## Feature Implementation Details

[Searching & Pagination](./docs/searching-and-pagination.md)

## External Integrations

[Google Oauth](./docs/google-oauth.md)

[Sendgrid](./docs/sendgrid.md)

[Google Sheets](./docs/google-sheets.md)
