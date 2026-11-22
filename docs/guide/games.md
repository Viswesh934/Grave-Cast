# 👻 Games

Gravecast hides two small games on the website. They're never in Lantern.

## How to find them

Start a scan on the home page, and the diary opens to keep you company. Answer one of its riddles right, and a ghost appears in the top bar beside the Scribble pen. A wrong answer shows nothing. Once you've found it, the ghost stays on that browser. Click it to pick a game.

## Ghost run

The dino game, the other way round. A ghost drifts left through a graveyard at night. Tombstones come at it from the left, and coins hang low (stay down to take them) or high (jump for them). The world speeds up as you go, and a run ends at the first tombstone you hit.

| Key | Does |
| --- | --- |
| Space, Up arrow, W or tap | Jump |
| P | Pause |
| Esc | Close |

Your score is the distance travelled plus 10 for each coin. The run pauses by itself if you switch tabs, and your best score is kept in your browser.

## Backwards

A typing test with a twist: type each line with its words in reverse order. Every word keeps its own spelling and capitals, and only the order turns around.

> **The raven watches the old gate quietly**
> you type: *quietly gate old the watches raven The*

A round lasts 30 seconds from your first key. It scores your words per minute and how many keys you got right, and keeps your best speed. A wrong letter turns red and gets a wavy underline, and pasting is switched off.

The lines are made up on the spot from small themed word lists, enough for about 250,000 different lines, with a few of the diary's short riddles mixed in. Nothing is written by AI.

## Built in Groove UI

Both games are Groove UI components, `GhostRun` and `Backwards`, with their rules kept apart from the drawing so they can be tested on their own. They share one game window (`GameDialog`), which moves the focus in and back out, keeps Tab inside the game, and always closes on Esc. Their buttons are named for screen readers, sound only plays once it's switched on, and with reduced motion the ghost stops bobbing and trailing wisps.
