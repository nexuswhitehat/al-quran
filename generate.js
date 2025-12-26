const fs = require("fs");
const path = require("path");
const axios = require("axios");

const NEPALI_FILE = path.join(__dirname, "hindi.json");
const OUTPUT_DIR = path.join(__dirname, "output_hindi");
const BASE_URL =
    "https://cdn.jsdelivr.net/npm/quran-cloud@1.0.0/dist/chapters/en";

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

// load nepali ayahs
const nepali = JSON.parse(fs.readFileSync(NEPALI_FILE, "utf8"));

// remove leading Nepali numerals like "१) "
function cleanNepali(text) {
    return text.replace(/^[०-९]+\)\s*/, "").trim();
}

async function processChapter(chapter) {
    const url = `${BASE_URL}/${chapter}.json`;
    const res = await axios.get(url);
    const chapterData = res.data;

    chapterData.verses = chapterData.verses.map((verse) => {
        const key = `${chapter}:${verse.id}`;
        const nep = nepali[key];

        if (nep && nep.t) {
            return {
                ...verse,
                translation: cleanNepali(nep.t),
            };
        }

        // if nepali missing, keep original translation
        return verse;
    });

    const outFile = path.join(OUTPUT_DIR, `${chapter}.json`);
    fs.writeFileSync(outFile, JSON.stringify(chapterData, null, 2), "utf8");

    console.log(`✔ Chapter ${chapter} done`);
}

async function run() {
    for (let i = 1; i <= 114; i++) {
        try {
            await processChapter(i);
        } catch (err) {
            console.error(`✖ Failed chapter ${i}`, err.message);
        }
    }
    console.log("✅ All 114 chapters processed");
}

run();
