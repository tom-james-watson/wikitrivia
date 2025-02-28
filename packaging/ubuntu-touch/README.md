# Ubuntu Touch build

[![OpenStore](https://open-store.io/badges/en_US.png)](https://open-store.io/app/disco2very.flaburgan)

[Ubuntu Touch](https://www.ubuntu-touch.io/) is a GNU/Linux operating system for mobile phone and desktop pc running the Lomiri interface (shell) based on Qt.

**You don't need to build disCO2very yourself to run it on your phone**, it is available on the [official OpenStore](https://open-store.io/app/disco2very.flaburgan), or you can also download the `.click` file as an artifact of the CI here on github.

## Build

disCO2very is built for this platform using the official [clickable](https://clickable-ut.dev) tool.

If you want to build and run disCO2very on your Ubuntu Touch phone, start by installing clickable, plug your UT phone to your computer, go in the settings to enable developer mode and then simply naviguate to this folder (`/packaging/ubuntu-touch`) and run `clickable`.

### Technical details

The application path is referenced in the `disco2very.desktop` file, to `www/index.html`. Technically, the `www` folder is actually just a symlink to the `/out` folder, where NextJS drops the app files it builds when `npm run build` is executed.