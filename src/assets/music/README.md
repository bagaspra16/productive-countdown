# Music Player Files

This directory contains music files that will automatically play in the application's music player.

## Important: Sound Not Working?

If the music is not playing correctly:

1. Make sure your MP3 files are placed directly in this directory (`src/assets/music/`)
2. Check that file paths are correct (the player is looking for files at `/assets/music/*.mp3`)
3. Check browser console for any errors
4. Ensure your browser has permission to play audio (some browsers require user interaction first)

## Adding Your Own Music

To add your own music files:

1. Place MP3 files in this directory (`src/assets/music/`)
2. Refresh the application to detect new music files
3. The music player will automatically detect and display your files
4. The filenames will be converted to display titles (e.g., "calm_piano.mp3" will show as "Calm Piano")
5. The player supports auto-looping and will continue playing through your entire music collection

## File Naming Guidelines

- Use descriptive filenames (they will be shown in the player)
- Separate words with underscores (_) or hyphens (-) 
- Example good filenames:
  - `relaxing_ambient.mp3`
  - `focus-study.mp3`
  - `calm_piano_music.mp3`

## Volume Control

The music player includes several volume control features:

- A volume slider to set exact volume level
- Volume up/down buttons to adjust in 10% increments
- Volume percentage display when adjusting
- Volume settings are saved between sessions
- Attempts to synchronize with your device's system volume when possible

## Troubleshooting

If no music appears in the player:
- Ensure you have at least one MP3 file in this directory
- Check if the MP3 files are properly formatted
- Try a different browser to see if it's a browser-specific issue
- Check your browser's developer console for any loading errors

## Notes

- Only MP3 files are supported
- Keep file sizes reasonable for good performance (ideally under 10MB per file)
- Music starts paused by default - press the play button to begin
- Files are played in the order they appear in the directory
- Make sure you have the appropriate rights to use any music files you add 