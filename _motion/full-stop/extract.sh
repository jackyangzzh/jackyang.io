#!/usr/bin/env bash
# FULL STOP — cut the source footage into 30 fps JPEG sequences.
#
# Sources (media/src, fetched with yt-dlp from the videos the site links to):
#   facilitator.mp4   Microsoft Teams — "Facilitator in Teams meetings" (PMoGOWOBicY)
#   facilitator2.mp4  Microsoft Teams — "Turn meetings into action with Facilitator" (khP2mbhJf1g)
#   mesh.mp4          Microsoft Mesh (fSKBHOWOcSM)
#   avatars-teams.mp4 Avatars for Microsoft Teams (Pk5BVxlKL5w)
#   ignite.mp4        Microsoft Ignite keynote, 44:50–46:20 (FZhbJZEgKQ4)
#   holos.mp4         Holos pitch, Techstars (s3_ax616TCo) — slide area only
#   fakehaul.mp4      FakeHaul demo, vertical (eoxMVuF7UfM)
#
#   ./extract.sh            # all clips
set -euo pipefail
cd "$(dirname "$0")"
FF=${FFMPEG_PATH:-/Users/jackyang/.hermes/tools/ffmpeg-9.0.1-darwin-arm64/ffmpeg}
OUT=media/frames
HOLOS="crop=1152:640:576:200,"

# name            source         start  dur  pre-filter
CLIPS=(
  "fac-gallery    facilitator2   8.6    3.0  -"
  "fac-ask        facilitator2   24.4   2.6  -"
  "fac-notes      facilitator2   69.4   2.6  -"
  "fac-recap      facilitator    29.6   3.0  -"
  "mesh-space     mesh           21.4   3.2  -"
  "mesh-garden    mesh           44.8   2.6  -"
  "mesh-whale     mesh           51.0   3.0  -"
  "mesh-vr        mesh           57.4   2.2  -"
  "av-editor      avatars-teams  8.0    2.6  -"
  "av-call        avatars-teams  14.0   2.2  -"
  "av-grid        avatars-teams  21.0   2.8  -"
  "ign-outfit     ignite         19.6   3.2  -"
  "ign-stylist    ignite         23.6   2.4  -"
  "hol-repair     holos          62.0   3.0  $HOLOS"
  "hol-hands      holos          113.4  3.0  $HOLOS"
  "hol-pilot      holos          15.0   3.0  $HOLOS"
  "hol-750        holos          162.0  3.0  $HOLOS"
  "fh-deals       fakehaul       4.4    3.0  -"
  "fh-checkout    fakehaul       9.4    2.6  -"
  "fh-zero        fakehaul       12.3   2.0  -"
  "fh-receipt     fakehaul       18.7   2.0  -"
)

for row in "${CLIPS[@]}"; do
  read -r name src start dur pre <<<"$row"
  [[ "$pre" == "-" ]] && pre=""
  mkdir -p "$OUT/$name"
  rm -f "$OUT/$name"/*.jpg
  # Vertical FakeHaul stays at its native 608×1080; everything else 1280 wide.
  if [[ "$src" == "fakehaul" ]]; then scale="scale=608:-2"; else scale="scale=1280:-2"; fi
  "$FF" -hide_banner -loglevel error -y -ss "$start" -t "$dur" -i "media/src/$src.mp4" \
    -vf "${pre}fps=30,${scale}:flags=lanczos" -q:v 3 "$OUT/$name/%04d.jpg"
  n=$(ls "$OUT/$name" | wc -l | tr -d ' ')
  echo "$name $n"
done

# Manifest the film reads: frame count and size per clip.
node -e '
const fs=require("fs"),p=require("path"),d="media/frames",m={};
for(const n of fs.readdirSync(d).sort()){const f=fs.readdirSync(p.join(d,n)).filter(x=>x.endsWith(".jpg"));if(!f.length)continue;
const b=fs.readFileSync(p.join(d,n,f[0]));let i=2;while(i<b.length){if(b[i]!==0xFF){i++;continue}const mk=b[i+1];
if(mk>=0xC0&&mk<=0xC3){m[n]={n:f.length,h:b.readUInt16BE(i+5),w:b.readUInt16BE(i+7)};break}i+=2+b.readUInt16BE(i+2)}}
fs.writeFileSync("media/clips.json",JSON.stringify(m,null,1));console.log(Object.keys(m).length+" clips -> media/clips.json")'
