#!/bin/bash

# Loop through folders -20 to -36, skipping -35
for i in {20..34} 36; do
  folder="08-19-2024-$i"
  
  if [ -d "$folder" ]; then
    echo "Processing folder: $folder"
    
    # Go into the folder and rename .tmp files to .jpg
    for file in "$folder"/*.tmp; do
      if [ -f "$file" ]; then
        mv "$file" "${file%.tmp}.jpg"
        echo "Renamed $file to ${file%.tmp}.jpg"
      fi
    done
  else
    echo "Folder $folder does not exist, skipping."
  fi
done

