# Idreesia Mobile

Meteor mobile client for Idreesia ERP.

The app authenticates against the existing Idreesia web backend. Configure the
backend with `public.backendUrl` in Meteor settings or pass the matching
`--mobile-server` value when running a device build.

## Development

Start the web backend first:

```bash
cd ../idreesia-web
yarn start
```

Then start the mobile app:

```bash
cd ../idreesia-mobile
yarn start
```

The sample settings point to `http://localhost:3000`.

## Device Builds

```bash
yarn start:android
yarn start:ios
```

Update the backend URL in `settings.sample.json` or the script `--mobile-server`
value before targeting a non-local backend.
