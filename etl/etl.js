const fs = require("fs");
const YAML = require("js-yaml");
const LUA = require("lua-json");
const fetch = require("node-fetch");
const zlib = require("zlib");
const sharp = require("sharp");

const equipsYamlStr = fs.readFileSync("../../rathena/db/re/item_db_equip.yml").toString("utf-8");
const equipsJson = YAML.load(equipsYamlStr).Body;

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
    .toFile("../res/images/equips.png");

    const css = [`
        div.equip-icon {
            background-image: url('equips.png');
            background-repeat: no-repeat;            
            image-rendering: pixelated;
            width: ${size}px;
            height: ${size}px;
        }
    `];

    css.push(...map.map((s, i) => {
        return `div.equip-icon[data-id="${icons[i].split(".")[0]}"] { background-position: -${s.left}px -${s.top}px; }`;
    }));

    fs.writeFileSync("../res/images/equips.css", css.join("\r\n"));

}

async function parseEquipDatabase() {

    const itemsLua = fs.readFileSync("raw/lua/latam/pt/iteminfo_new.lua").toString("utf-8");

    const luaJson = LUA.parse(itemsLua);

    return equipsJson.reduce((dic, e) => {

        dic[e.Id] = {
            id: e.Id,
            name: luaJson[e.Id]?.identifiedDisplayName,
            description: luaJson[e.Id]?.identifiedDescriptionName.join("\r\n")
        };

        return dic;

    }, {});

}

(async () => {

    //await downloadEquipIcons();
    //await cleanInvalidEquipIcons();
    //await generateEquipIconSheet();

    const equips = await parseEquipDatabase();

    const database = {
        equips: equips
    };

    const compressedDatabase = zlib.gzipSync(JSON.stringify(database));
    fs.writeFileSync("../bin/database-latam-pt-json.gzip", compressedDatabase);

})();