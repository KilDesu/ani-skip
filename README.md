# Ani-Skip for IINA

Automatically skip anime openings (OP) and endings (ED) in [IINA](https://iina.io/), the modern media player for macOS (often considered a drop-in equivalent of MPV).

This plugin fetches skip timestamps from [AniSkip](https://aniskip.com/) based on the filename, which typically works well with files downloaded using tools like [ani-cli](https://github.com/pystardust/ani-cli).

## Installation

1. **Download ani-cli**
   This plugin is meant to be used with [ani-cli](https://github.com/pystardust/ani-cli) to make skipping OP and ED possible on macOS (as they use [synacktraa/ani-skip](https://github.com/synacktraa/ani-skip) which only supports MPV).

   To download ani-cli, refer to [their docs on the installation](https://github.com/pystardust/ani-cli?tab=readme-ov-file#tier-1-support-linux-mac-android).

2. **Enable IINA Plugin System:**
   Now that IINA is installed on your mac, and if you haven't already enabled plugins, you can do it by opening Terminal and running the following command:

   ```bash
   defaults write com.colliderli.iina iinaEnablePluginSystem true
   ```

   If it was open during the process, IINA will need to be restarted for the changes to be applied.

3. **Download the Plugin:**
   Download the latest `ani-skip.iinaplgz` file from the [Releases page](https://github.com/KilDesu/iina-ani-skip/releases).

4. **Install the Plugin:**

   - Double-click the downloaded `ani-skip.iinaplgz` file.
   - Alternatively, open IINA, go to `Settings` > `Plugins`, and drag the `ani-skip.iinaplgz` file into the plugins list.
   - Restart IINA after installation.

   You will see a warning about the plugin being able to make network requests. This is necessary for the plugin to fetch the anime's MyAnimeList (MAL) ID and the OP/ED timestamps from AniSkip.

## Usage

Once installed, the plugin works automatically. When you start playing an anime episode using ani-cli, the plugin will:

1.  attempt to parse the anime name and episode number from the media title (e.g., "One Piece Episode 1").
2.  search MyAnimeList (MAL) to find the corresponding MAL ID.
3.  query the AniSkip API for OP and ED timestamps for that specific anime episode.
4.  automatically seek past the OP or ED when playback reaches those time ranges (if timestamps are found).
5.  A notification "Skipped OP" or "Skipped ED" will appear briefly on screen.

**Note:** The accuracy depends on the media title matching a recognizable format (like `Anime Title Episode X`), which should not pose any problem if you use ani-cli, and the availability of data on MAL and AniSkip.
