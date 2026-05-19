import fs from "fs";
const p = "src/components/sections/StrategicProfile.tsx";
const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
const fixes = {
  726: "          </motion.div>".replace("motion.", ""),
  727: "        </motion.div>".replace("motion.", ""),
  746: "              </motion.div>".replace("motion.", ""),
  754: "        </motion.div>".replace("motion.", ""),
  755: "      </motion.div>".replace("motion.", ""),
};
for (const [i, v] of Object.entries(fixes)) {
  lines[Number(i)] = v;
}
fs.writeFileSync(p, lines.join("\n"));
console.log("fixed", fixes);
