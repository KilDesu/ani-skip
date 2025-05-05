export {};

interface AnimeMalData {
  categories: {
    type: string;
    items: {
      id: number;
    }[];
  }[];
}

interface SkipTimesResult {
  skip_type: string;
  interval: Timestamp;
}

interface SkipTimesData {
  found: boolean;
  results: SkipTimesResult[];
}

interface Timestamp {
  start_time: number;
  end_time: number;
}

interface Timestamps {
  op?: Timestamp;
  ed?: Timestamp;
}

interface AnimeInfo {
  name: string;
  episode: number;
}

const { console, mpv, event, http, core } = iina;

let RETRY_COUNT = 5;

let timestamps: Timestamps | undefined;
let isWorking = false;

const eventId = event.on("mpv.time-pos.changed", () => {
  if (isWorking) {
    return;
  }

  if (!timestamps) {
    if (RETRY_COUNT-- === 0) {
      event.off("mpv.time-pos.changed", eventId);
      return;
    }

    const animeInfo = getAnimeInfo();

    if (!animeInfo) {
      console.error("No anime info found.");
      return;
    }

    getAnimeTimestamps(animeInfo).then((skipTimes) => {
      if (!skipTimes) {
        notify("No skip times found.");
        event.off("mpv.time-pos.changed", eventId);
        return;
      }

      console.log("Skip times found:", skipTimes);
      timestamps = skipTimes;
      isWorking = false;
    });

    return;
  }

  const timePos = mpv.getNumber("time-pos");

  trySkip("op", timePos);
  trySkip("ed", timePos);
});

function trySkip(type: "op" | "ed", timePos: number) {
  if (!timestamps) {
    return;
  }

  if (
    timestamps[type] &&
    timePos > timestamps[type].start_time &&
    timePos < timestamps[type].end_time
  ) {
    core.seekTo(timestamps[type].end_time);
    notify(`Skipped ${type.toUpperCase()}`);
  }
}

async function getAnimeTimestamps(
  animeInfo: AnimeInfo
): Promise<Timestamps | undefined> {
  isWorking = true;
  const malId = await getMalId(animeInfo.name);

  const skipRes = await http.get(
    `https://api.aniskip.com/v1/skip-times/${malId}/${animeInfo.episode}?types=op&types=ed`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; Win64; rv:109.0) Gecko/20100101 Firefox/109.0",
        "Content-Type": "application/json",
      },
      params: {},
      data: {},
    }
  );

  const data = skipRes.data as SkipTimesData;

  if (!data || !data.found) {
    return;
  }

  const { results } = data;

  const opRes = results.find((result) => result.skip_type === "op");
  const edRes = results.find((result) => result.skip_type === "ed");

  if (!opRes) {
    console.warn("No OP skip times found.");
  }

  if (!edRes) {
    console.warn("No ED skip times found.");
  }

  if (!opRes && !edRes) {
    return;
  }

  return {
    op: opRes?.interval,
    ed: edRes?.interval,
  };
}

async function getMalId(animeName: string) {
  const malRes = await http.get(
    `https://myanimelist.net/search/prefix.json?type=anime&keyword=${animeName}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; Win64; rv:109.0) Gecko/20100101 Firefox/109.0",
        "Content-Type": "application/json",
      },
      params: {},
      data: {},
    }
  );

  const data = malRes.data as AnimeMalData;

  const animeCategory = data.categories.find(
    (category) => category.type === "anime"
  );

  if (!animeCategory) {
    console.error(
      `Nothing found ${animeName} in the anime category on MyAnimeList.`
    );
    return;
  }

  const animeMalData = animeCategory.items[0];

  if (!animeMalData) {
    console.error("No anime found on MyAnimeList.");
    return;
  }

  return animeMalData.id;
}

function getAnimeInfo() {
  const animeNameWithEpisode = mpv.getString("media-title");

  if (!animeNameWithEpisode) {
    console.warn("No media title found.");
    return;
  }

  const [animeName, episodeNumber] = animeNameWithEpisode.split(" Episode ");

  if (!animeName) {
    console.error("No anime name found in media title.");
    return;
  }

  if (!episodeNumber) {
    console.error("No episode number found in media title.");
    return;
  }

  return {
    name: animeName,
    episode: parseInt(episodeNumber, 10),
  };
}

function notify(message: string) {
  console.log(message);
  setTimeout(() => {
    core.osd(message);
  }, 500);
}
