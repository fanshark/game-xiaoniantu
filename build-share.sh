#!/bin/bash
# Build single-file shareable HTML
OUTPUT="game-xiaoniantu-share.html"

# Read index.html and inline all CSS/JS
cat > "$OUTPUT" << 'HEADER'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>小黏土走走走 - RPG冒险</title>
    <style>
HEADER

cat css/style.css >> "$OUTPUT"

cat >> "$OUTPUT" << 'MID1'
    </style>
</head>
MID1

# Extract body from index.html (from <body> to </body>)
sed -n '/<body>/,/<\/body>/p' index.html | grep -v '<script src=' >> "$OUTPUT"

# Add all JS inline
echo '<script>' >> "$OUTPUT"
for f in js/assets.js js/audio.js js/world.js js/player.js js/npc.js js/combat.js js/shop.js js/ui.js js/animation.js js/main.js; do
    echo "// === $(basename $f) ===" >> "$OUTPUT"
    cat "$f" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
done
echo '</script>' >> "$OUTPUT"
echo '</body></html>' >> "$OUTPUT"

echo "Built $OUTPUT ($(wc -c < "$OUTPUT") bytes)"
