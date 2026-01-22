#!/bin/bash
# create-netlify-build.sh
# Prepares the "public" folder for Netlify deployment

# 1. Clean/Create Destination
rm -rf public
mkdir -p public

echo "Copying Assets..."
cp -r ASSETS public/

# 2. Copy CSS
echo "Copying CSS..."
cp *.css public/ 2>/dev/null || true

# 3. Copy JS (Filtering out Backend/Desktop/Dev files)
echo "Copying JS..."
for file in *.js; do
    if [[ "$file" != "electron-main.js" && "$file" != "electron-preload.js" && "$file" != "server.js" && "$file" != "integration-tests.js" && "$file" != "icon.py" && "$file" != test* ]]; then
        cp "$file" public/
    else
        echo "Skipping $file"
    fi
done

# 4. Copy Misc Root Files
echo "Copying Misc Files..."
cp favicon.ico public/ 2>/dev/null || true
cp manifest.json public/ 2>/dev/null || true

# 5. Setup Entry Points (Renaming for Web)
echo "Configuring Entry Points..."

# web-intro.html becomes index.html (The Portal)
sed 's/href="index\.html/href="game.html/g; s/href='\''index\.html/href='\''game.html/g; s/window\.location\.href = `index\.html/window.location.href = `game.html/g; s/window\.location\.href = '\''index\.html/window.location.href = '\''game.html/g' web-intro.html > public/index.html

# index.html becomes game.html (The Game)
cp index.html public/game.html

# Create a _redirects file for Netlify
echo "/* /index.html 200" > public/_redirects

echo "BUILD COMPLETE."
echo "Deploy the 'public' folder to Netlify."