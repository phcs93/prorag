const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const YAML = require("js-yaml");
const LUA = require("lua-json");
const fetch = require("node-fetch");
const zlib = require("zlib");
const sharp = require("sharp");

const grfPath = "C:/Gravity/Ragnarok/data.grf";

const lubPaths = {
    itemInfo: "C:/Gravity/Ragnarok/System/iteminfo_new.lub",
    skillInfo: "grf/data/luafiles514/lua files/skillinfoz/skilldescript.lub",
    skillid: "grf/data/luafiles514/lua files/skillinfoz/skillid.lub"
};

async function extractGRF() {

    // grf editor path
    const grfclPath = path.resolve(__dirname, '../bin/grfcl.exe');

    // extract main grf    
    const extractPath = path.resolve(__dirname, '../etl/grf');
    const cmd = `start "" "${grfclPath}" -open ${grfPath} -extractGrf ${extractPath}`;
    console.log("extracting grf...", cmd);
    cp.execSync(cmd, {cwd: "C:/GIT/prorag/bin" });    

    // decompile lub files to lua
    fs.mkdirSync("raw/lua", {recursive: true});    
    for (const lubFile of Object.keys(lubPaths)) {
        const lubPath = path.resolve(__dirname, lubPaths[lubFile]);
        const luaPath = path.resolve(__dirname, `raw/lua/${lubFile}.lua`);
        const cmd = `start "" "${grfclPath}" -lubDecompile "${lubPath}" "${luaPath}"`;
        console.log("decompiling lub...", cmd);
        cp.execSync(cmd, {cwd: "C:/GIT/prorag/bin" });
    }

}

async function generateDatebase() {

    // clone rathena git repository
    if (!fs.existsSync("git")) fs.mkdirSync("git");
    if (!fs.existsSync("git/rathena")) cp.execSync("git clone https://github.com/rathena/rathena.git", { stdio: [0, 1, 2], cwd: "git" });

    // prepare localized item names and descriptions
    const itemInfo = LUA.parse(`return ${fs.readFileSync("raw/lua/iteminfo.lua").toString("utf-8").slice(6)}`);

    // generate database object
    const database = {

        // parse equipment from rathena while getting localized names and decriptions
        equipment: YAML.load(fs.readFileSync("git/rathena/db/re/item_db_equip.yml").toString("utf-8")).Body.reduce((dic, e) => {
            if (itemInfo[e.Id]) {
                dic[e.Id] = {
                    id: e.Id,
                    name: itemInfo[e.Id].identifiedDisplayName,
                    description: itemInfo[e.Id].identifiedDescriptionName.join("\r\n"),
                    type: e.Type,
                    jobs: e.Jobs,
                    locations: e.Locations,
                    level: e.EquipLevelMin || 0,
                    slots: e.Slots || 0
                };
            }
            return dic;
        }, {}),

        skills: {}

    };

    // provisório
    fs.writeFileSync("../res/databases/database-latam-pt.json", JSON.stringify(database, null, "\t"));

    const compressedDatabase = zlib.gzipSync(JSON.stringify(database));
    fs.writeFileSync("../res/databases/database-latam-pt-json.gzip", compressedDatabase);

}

async function generateClassSheet() {

    const dir = "raw/classes"
    const sprites = fs.readdirSync(dir);
    const length = sprites.length;
    const sqrt = Math.ceil(Math.sqrt(length));
    const sizex = 52 + 22;
    const sizey = 83 + 22; // aumentar pra ter espaço pra cabeça

    const map = await Promise.all(sprites.map(async (image, index) => {
        const x = parseInt(index % sqrt);
        const y = parseInt(index / sqrt);
        return {
            input: await sharp(`${dir}/${image}`).extract({ left: 49 - 11, top: 0, width: sizex, height: sizey }).toBuffer(),
            left: x * sizex,
            top: y * sizey,
            width: sizex,
            height: sizey
        };
    }));

    await sharp({
        create: {
            width: sqrt * sizex,
            height: sqrt * sizey,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    })
        .composite(map)
        .toFile("../res/images/sheets/classes-sprites.png");

    const css = [`
        div.class-sprite {
            background-image: url("classes-sprites.png");
            background-repeat: no-repeat;            
            image-rendering: pixelated;
            width: calc(var(--control-size) * 5 * ${sizex} / ${sizey});
            height: calc(var(--control-size) * 5);
            background-size: calc(var(--control-size) * 5 * ${sizex} / ${sizey} * ${sqrt}) calc(var(--control-size) * 5 * ${sqrt});
        }
    `];

    css.push(...map.map((_, i) => {
        const x = i % sqrt;
        const y = Math.floor(i / sqrt);
        return `div.class-sprite[data-id="${sprites[i].split(".")[0]}"] { background-position: calc(-${x} * calc(var(--control-size)*5*${sizex} / ${sizey})) calc(-${y} * calc(var(--control-size)*5)); }`;
    }));

    fs.writeFileSync("../res/images/sheets/classes-sprites.css", css.join("\r\n"));

}

async function downloadEquipIcons() {

    const baseUrl = "https://www.divine-pride.net/img/items/item/latam";

    for (const equip of equipsJson) {

        const url = `${baseUrl}/${equip.Id}`;
        const png = `raw/icons/equips/${equip.Id}.png`;

        if (!fs.existsSync("raw/icons/equips")) {
            fs.mkdirSync("raw/icons/equips", {
                recursive: true
            });
        }

        try {

            const response = await fetch(url);

            if (!response.ok) {
                console.warn(`✗ ${url} retornou ${response.status}`);
                return;
            }

            const buffer = await response.buffer();
            fs.writeFileSync(png, buffer);
            console.log(`✓ baixado: ${url}`);

        } catch (err) {
            console.error(`✗ erro ao baixar ID ${url}: ${err.message}`);
        }

    }

}

async function cleanInvalidEquipIcons() {

    const dir = "raw/icons/equips"
    const icons = fs.readdirSync(dir);
    const emptyIcons = icons.filter(i => fs.statSync(`${dir}/${i}`).size === 0);
    console.log(`[${emptyIcons.length}/${icons.length}] empty equip icons!`);
    for (const icon of emptyIcons) {
        fs.rmSync(`${dir}/${icon}`, {
            force: true
        });
    }

}

async function generateEquipIconSheet() {

    const dir = "raw/icons/equips"
    const icons = fs.readdirSync(dir);
    const length = icons.length;
    const sqrt = Math.ceil(Math.sqrt(length));
    const size = 24;

    const map = await Promise.all(icons.map(async (image, index) => {
        const x = parseInt(index % sqrt);
        const y = parseInt(index / sqrt);
        return {
            input: await sharp(`${dir}/${image}`).resize(size).toBuffer(),
            left: x * size,
            top: y * size,
            width: size,
            height: size
        };
    }));

    await sharp({
        create: {
            width: sqrt * size,
            height: sqrt * size,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    })
        .composite(map)
        .toFile("../res/images/sheets/equipment-icons.png");

    const css = [`
        div.equip-icon {
            background-image: url("equipment-icons.png");
            background-repeat: no-repeat;            
            image-rendering: pixelated;
            width: var(--control-size); 
            height: var(--control-size);
            background-size: calc(${sqrt} * var(--control-size));
        }
    `];

    css.push(...map.map((_, i) => {
        const x = i % sqrt;
        const y = Math.floor(i / sqrt);
        return `div.equip-icon[data-id="${icons[i].split(".")[0]}"] { background-position: calc(-${x} * var(--control-size)) calc(-${y} * var(--control-size)); }`;
    }));

    fs.writeFileSync("../res/images/sheets/equipment-icons.css", css.join("\r\n"));

}

(async () => {
    //await extractGRF();
    await generateDatebase();
    //await generateClassSheet();
    //await downloadEquipIcons();
    //await cleanInvalidEquipIcons();
    //await generateEquipIconSheet();
})();