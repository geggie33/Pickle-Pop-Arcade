# Pickle Pop — playable prototype

An offline-first, top-down arcade pickleball prototype designed for touch screens.

## Play locally

Open `index.html` in Chrome or Edge. No server, login, database, or internet connection is required.

Controls:

- Phone/tablet: drag to move the orange paddle; tap **TAP TO SERVE**.
- PC: drag with the mouse, or use Left/Right (A/D); Space serves.
- Use the **Serve: Normal** button to cycle through Slow, Normal, and Fast serves.
- Use **Random serves** to make each serve independently choose Slow, Normal, or Fast. Club adds random speed to half of returns; Pro randomizes every serve and return.

## Prototype scope

- Guided first match
- Beginner AI tuning values
- Serving-side scoring; first to 11, win by 2
- Alternating right/left service court based on the server's score
- Diagonal serve target beyond the non-volley line
- Sidelines are out; there are no Pong-style wall rebounds
- Responsive portrait layout
- Court automatically scales to keep the complete playing surface visible on laptops and phones
- Offline browser play, ready to package in a mobile shell
- Three selectable serve speeds and a longer setup pause before the rival serves
- Always-visible serve-speed control and a face picker with six personalities for each player
- Beginner offers optional random serves; Club randomizes half of returns; Pro randomizes every serve and return
- Opening match selector for How to Play, Beginner, Club Player, and Pro
- A permanent MENU button stops any match or lesson and returns to level selection
- Full-color emoji personalities sized to fit completely inside each player's non-volley zone
- Pickle Pop Home Screen icon and standalone iPhone display support
- Each level has its own progressively faster Slow, Normal, and Fast shot range; randomized shots stay within the selected level

## Next development steps

1. Play-test rally feel and Beginner difficulty with an experienced pickleball player.
2. Add the two-bounce rule, kitchen volley faults, and clearer bounce visualization.
3. Add Club, Pro, and Champion opponent behaviors.
4. Add the two-match trial and permanent in-app purchase using Apple/Google billing.
5. Package Android first; export the iOS project for the Mac collaborator.

This prototype intentionally uses simple generated court graphics so gameplay can be tuned before artwork is commissioned.


## v2.7 Fair Serve Fix
- When the rival serves, the player paddle is snapped to the receiving service box at serve launch.
- Prevents occasional wrong-side starts caused by movement during the rival pre-serve delay.
- Challenge/reward progress and existing gameplay settings are otherwise unchanged.


## v2.8 Fair Beginner Returns
- Beginner rival return angles are capped to prevent unreachable sideline shots.
- Club retains wider angles; Pro retains full dangerous angles.
- Challenge Guide and My Rewards remain unchanged.
