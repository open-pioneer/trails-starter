# How to deploy an app

Building apps and sites with this framework always produces a set of static files, which can be easily deployed on any http server or CDN (content delivery network).

## Building the project

First, build the project by invoking the `build` script from your `package.json`:

```bash
$ pnpm run build
```

On success, Vite will have written your compiled project into `dist/www`, which might look like this:

```text
dist
└── www
    ├── assets
    │   └── 09f766b9e467.js
    └── index.html
```

The `www` directory is designed to be deployed as a single unit.
You should always deploy all files inside `www`, as they may be required at runtime by your application(s).
If you want to reduce the number of files, you should customize your `vite.config.ts`.
For example, the configuration of the `pioneer` plugin can be adapted to include only a selected set of apps or sites in the build.

## Deployment of a static site

Vite has [extensive documentation](https://vitejs.dev/guide/static-deploy.html) for multiple deployment options.

As an example, we will build a simple docker image based on the popular [Caddy](https://caddyserver.com/) server.

First, create the `Dockerfile`:

```dockerfile
# Dockerfile
FROM caddy:2.6-alpine
COPY dist/www /srv
```

To speed up the build, we exclude everything except for `dist` from the docker context:

```text
# .dockerignore
*
!dist
```

Build the image:

```bash
$ docker build -t example-site .
# Sending build context to Docker daemon  476.2kB
# Step 1/2 : FROM caddy:2.6-alpine
#  ---> d8464e23f16f
# Step 2/2 : COPY dist/www /srv
#  ---> Using cache
#  ---> 35cda8904927
# Successfully built 35cda8904927
# Successfully tagged example-site:latest
```

Start a container:

```
$ docker run -it --rm -p 5555:80 example-site caddy file-server
```

Open you browser at <http://localhost:5555> to see the result.

Please refer to Caddy's [Documentation](https://caddyserver.com/docs/) for more details.

## Deployment of a web component

If you wish to provide one or more apps as web components to your users, customize your `vite.config.ts` to include the apps (`apps` section of the `pioneer` plugin).

For this tutorial, we build the `empty` app:

```ts
// vite.config.ts
// ...
pioneer({
    rootSite: false,
    sites: [],
    apps: ["empty"]
});
// ...
```

Build your project:

```bash
$ pnpm run build
```

Your `dist` directory will now look like the example below.
There might be additional files that must also be deployed, but the `empty.js` file is guaranteed to be there:

```text
dist/
└── www
    └── empty.js
```

Next, deploy your `www` directory to a web server (see above).

To embed your app in a host site, simply load the `empty.js` as a module:

```html
<!-- Some host html site -->
<!DOCTYPE html>
<html>
    <!-- ... -->
    <body>
        <!-- Will be made available by the script below -->
        <empty-app></empty-app>

        <!-- Replace PUBLIC_URL with the hostname and path of the script -->
        <script type="module" src="https://PUBLIC_URL/empty.js"></script>
    </body>
</html>
```
