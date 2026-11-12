# Rentbrella AR

The page the station QR code opens. It asks for the camera, lets you pick a model, shows a 3D preview, and hands off to the phone's built-in AR viewer:

- iPhone and iPad: Quick Look, using the `.usdz` file.
- Android: WebXR in Chrome, falling back to Scene Viewer, using the `.glb` file.

Models are placed on the floor at real size.

## Run locally

```bash
npm install
npm run dev        # http://127.0.0.1:8100
```

### On a phone

Camera and AR need HTTPS, so start the dev server on your network with a self-signed certificate:

```bash
npm run dev:phone  # https://<your-LAN-IP>:8100
```

Open the Network URL on the phone, which must be on the same Wi-Fi, and accept the certificate warning.

- iPhone Quick Look works this way.
- Android Chrome uses WebXR this way. Scene Viewer fetches the model from Google's side, so it only works from the deployed HTTPS site.

## Models

`src/models.ts` lists every model. The files live in `public/models/` and `public/posters/`.

```bash
npm run models     # re-export station.glb + station.usdz from ../RentBrella
npm run poster     # render public/posters/<id>.webp from each GLB
```

`npm run poster` uses Playwright's Chromium. Set `CHROMIUM_PATH` if you want to use a Chromium that's already installed.

To add a model from a USDZ file:

1. Run `npm run add-model -- path/to/model.usdz <id>`.
   - Copies the USDZ for iPhone as is.
   - Converts it with Blender into an Android-safe GLB: merged, welded, lightly simplified (about 1 mm), with no glTF extensions Scene Viewer would reject.
   - Prints the size to put in `MODELS`.
2. Add an entry to `MODELS` in `src/models.ts`.
3. Run `npm run poster`.

Scene Viewer limits: no mesh compression, under 10 MB recommended (15 MB max), under 100k triangles recommended.

## QR code

```bash
npm run qr -- https://your-deployment.vercel.app            # opens the picker
npm run qr -- https://your-deployment.vercel.app station    # opens the station directly
```

This writes SVG and PNG files to `qr/`.

## Deploy

Deploy the folder to Vercel. `vercel.json` sets the content types Quick Look needs (`model/vnd.usdz+zip`, `model/gltf-binary`) and the cache headers.

The station boards in the 3D model encode `https://rentbrella-ar.vercel.app`. If you deploy somewhere else, change `AR_SITE_URL` in `../RentBrella/src/config/brand.ts`, then run `npm run models`.
