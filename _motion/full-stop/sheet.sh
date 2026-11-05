#!/usr/bin/env bash
# Tile ./stills into review sheets: 3 columns, 4 rows, in time order.
cd "$(dirname "$0")"; rm -f stills/sheet-*.jpg
files=($(ls stills/t*.jpg | sed "s/^stills.t//" | sort -n | sed "s/^/stills\/t/"))
while [ $i -lt ${#files[@]} ]; do
  rows=(); for r in 0 1 2 3; do row=("${files[@]:$((i+r*3)):3}"); [ ${#row[@]} -gt 0 ] && { magick "${row[@]}" -resize 640x -bordercolor '#333' -border 3 +append /tmp/fs_row$r.jpg; rows+=(/tmp/fs_row$r.jpg); }; done
  magick "${rows[@]}" -append stills/sheet-$n.jpg; i=$((i+12)); n=$((n+1))
done; ls stills/sheet-*
