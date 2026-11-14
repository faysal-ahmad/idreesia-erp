# Mobile signing setup (one-time)

The release workflow (`.github/workflows/release.yml`) builds a signed Android
`.apk` and a signed iOS `.ipa` when a PR is merged into `master`. It can only do
that once the signing credentials below are stored as GitHub secrets. This
document covers creating them. For what the workflow does afterwards, see
[mobile-release-builds.md](mobile-release-builds.md).

You need:

- A Mac (for the Apple certificate; the Android steps work anywhere with Java).
- The Apple Developer account login (paid program).
- Admin access to this GitHub repository (to add secrets).

App identity (from `idreesia-mobile/mobile-config.js`): **Eastern Breeze ERP**,
bundle ID / application ID **`com.easternbreeze.erp`**.

> Never commit keystores, certificates, profiles or passwords. Keep the
> originals in the team password manager. Only the base64 copies go into GitHub
> secrets.

---

## Part 1: Android

### 1.1 Create the keystore

Run once, anywhere with Java installed:

```bash
keytool -genkeypair -v \
  -keystore eastern-breeze-release.keystore \
  -alias eastern-breeze \
  -keyalg RSA -keysize 2048 -validity 10000
```

It asks for a keystore password, then name/organisation details, then a key
password (pressing Enter reuses the keystore password). Write down:

- the keystore password,
- the alias (`eastern-breeze` above),
- the key password.

**Back up the keystore file and passwords in the password manager.** If they are
lost, you cannot publish updates to the same app on Google Play.

### 1.2 Encode and store it

```bash
base64 -i eastern-breeze-release.keystore | pbcopy
```

Add these GitHub secrets (Settings → Secrets and variables → Actions → New
repository secret):

| Secret                      | Value                                     |
| --------------------------- | ----------------------------------------- |
| `ANDROID_KEYSTORE_BASE64`   | The clipboard contents from the command   |
| `ANDROID_KEYSTORE_PASSWORD` | The keystore password                     |
| `ANDROID_KEY_ALIAS`         | The alias (`eastern-breeze`)              |
| `ANDROID_KEY_PASSWORD`      | The key password                          |

Then delete the local keystore copy outside the password manager.

---

## Part 2: iOS

All Apple portal steps are at <https://developer.apple.com/account>, section
**Certificates, Identifiers & Profiles**. Sign in with the Apple Developer
account.

### 2.1 Find the Team ID

Account → **Membership details** → **Team ID** (10 characters, e.g.
`ABCDE12345`). This is the `IOS_TEAM_ID` secret.

### 2.2 Register the App ID

1. Identifiers → **+** → **App IDs** → Continue → **App** → Continue.
2. Description: `Eastern Breeze ERP`.
3. Bundle ID: choose **Explicit** and enter `com.easternbreeze.erp`.
4. Capabilities: leave the defaults. If push notifications are added to the
   app later, enable them here and regenerate the profile (step 2.5).
5. Continue → Register.

### 2.3 Create the Apple Distribution certificate

1. On the Mac, open **Keychain Access** → menu **Keychain Access →
   Certificate Assistant → Request a Certificate From a Certificate
   Authority…**.
2. Enter your email and a common name (e.g. `Eastern Breeze Distribution`).
   Choose **Saved to disk** → Continue. This creates a `.certSigningRequest`
   file and a private key in your login keychain.
3. In the portal: Certificates → **+** → **Apple Distribution** → Continue.
4. Upload the `.certSigningRequest` file → Continue → **Download** the
   `distribution.cer` file.
5. Double-click the `.cer` to install it into the login keychain.

An account has a limited number of distribution certificates. If the limit is
reached, reuse an existing one (you then need its private key from whoever made
it) or revoke one that is no longer used.

### 2.4 Export the certificate as `.p12`

1. Keychain Access → **login** keychain → **My Certificates**.
2. Find **Apple Distribution: <name> (<Team ID>)**. Expand it: a private key
   must be nested under it. If there is none, the certificate was not made on
   this Mac; redo step 2.3 here.
3. Right-click the certificate → **Export…** → format **Personal Information
   Exchange (.p12)** → save as `distribution.p12`.
4. Choose an export password. This is the `IOS_CERTIFICATE_PASSWORD` secret.
5. Encode it:

   ```bash
   base64 -i distribution.p12 | pbcopy
   ```

Add the secrets `IOS_CERTIFICATE_P12_BASE64` (clipboard contents) and
`IOS_CERTIFICATE_PASSWORD` (export password). Store the `.p12` and its password
in the password manager.

### 2.5 Create the App Store provisioning profile

1. Profiles → **+** → **Distribution** → **App Store Connect** → Continue.
2. App ID: select `com.easternbreeze.erp` → Continue.
3. Certificate: select the Apple Distribution certificate from step 2.3 →
   Continue.
4. Name: `Eastern Breeze ERP App Store` (the workflow reads the name from the
   file, so any name works) → Generate → **Download**.
5. Encode it:

   ```bash
   base64 -i "Eastern_Breeze_ERP_App_Store.mobileprovision" | pbcopy
   ```

Add it as the secret `IOS_PROVISIONING_PROFILE_BASE64`.

### 2.6 Add the Team ID

Add the secret `IOS_TEAM_ID` with the value from step 2.1.

### 2.7 Create the app in App Store Connect (needed before the first upload)

The build does not need this, but you cannot upload the `.ipa` without it.

1. <https://appstoreconnect.apple.com> → **Apps** → **+** → **New App**.
2. Platform **iOS**, name **Eastern Breeze ERP**, a primary language, bundle ID
   `com.easternbreeze.erp`, and any SKU (e.g. `eastern-breeze-erp`).

---

## Part 3: Checklist of GitHub secrets

All eight are required:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `IOS_CERTIFICATE_P12_BASE64`
- `IOS_CERTIFICATE_PASSWORD`
- `IOS_PROVISIONING_PROFILE_BASE64`
- `IOS_TEAM_ID`

Production URLs are not secrets. They are in the `env:` block at the top of
`release.yml`.

---

## Part 4: Running it

1. Merge a PR from `develop` into `master`.
2. Watch **Release Application** in the Actions tab. The jobs `mobile-android`
   and `mobile-ios` run after `release`; `github-release` runs last.
3. Download the files from the run's **Artifacts** section or from the GitHub
   Release for the `v<version>` tag.

### Uploading to the stores (manual)

- **Android**: the workflow builds a signed `.aab` and a signed `.apk`. Upload
  the `.aab` in Google Play Console → your app → Release (Play requires bundles
  for new apps). Use the `.apk` to install directly on a phone for testing.
- **iOS**: upload the `.ipa` with the **Transporter** app (Mac App Store), using
  the Apple Developer login. It then appears in App Store Connect → TestFlight.

### Verify the first build on a device before submitting

Install the first build on a phone. Confirm that the app opens, signs in and
loads data. The update server URL (`MOBILE_SERVER_URL`) is the least certain
setting, so check the app starts even if that server is not reachable.

---

## Part 5: Troubleshooting

| Symptom                                              | Likely cause                                                                                              |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| iOS: `No signing certificate "Apple Distribution"`   | The `.p12` has no private key, or the wrong certificate type was exported (redo 2.3–2.4).                 |
| iOS: `Provisioning profile doesn't include signing certificate` | The profile was created with a different certificate than the `.p12`. Recreate it (2.5).       |
| iOS: `doesn't match bundle identifier`               | App ID differs from `com.easternbreeze.erp`.                                                              |
| iOS export: profile not found                        | The profile is not an App Store type, or the team ID secret is wrong.                                     |
| Android: `keystore was tampered with` / bad password | `ANDROID_KEYSTORE_PASSWORD` is wrong.                                                                     |
| Android: `Cannot recover key`                        | `ANDROID_KEY_PASSWORD` or `ANDROID_KEY_ALIAS` is wrong.                                                   |
| Upload rejected: build number already used           | Build numbers come from the run number and only go up; a manual rebuild with a lower number was uploaded. |

## Part 6: Renewals

- The **Apple Distribution certificate** and the **provisioning profile** expire
  after about a year. Before they do, repeat 2.3–2.5 (the profile must be
  regenerated whenever the certificate changes) and update
  `IOS_CERTIFICATE_P12_BASE64`, `IOS_CERTIFICATE_PASSWORD` and
  `IOS_PROVISIONING_PROFILE_BASE64`. The iOS job fails once either expires.
- The **Android keystore** is valid for the 10,000 days set at creation. Keep
  it forever.
- The **Apple Developer Program** membership renews yearly; if it lapses,
  builds cannot be signed or published.
