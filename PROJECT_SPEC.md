# Pickle Pop — product specification v0.1

## Product promise

A quick, satisfying pickleball game that takes seconds to understand and rewards genuine court sense. No advertisements and no subscription.

## Commercial model

- Match 1: guided learning match, free.
- Match 2: complete Beginner match to 11, free.
- After Match 2: $2.99 one-time purchase for unlimited play and all difficulty levels.
- Purchases handled by Apple App Store and Google Play.
- No user account, server, Supabase, Vercel, or Stripe.

## Difficulty ladder

| Level | Behavior |
| --- | --- |
| Learn | Returns playable balls and pauses for coaching. |
| Beginner | Slower coverage, generous errors, predictable placement. |
| Club Player | Better court coverage and aims toward open space. |
| Pro | Uses sharper angles, power, and fewer unforced errors. |
| Champion | Changes patterns, anticipates tendencies, and punishes predictability. |

Higher levels must change tactics, not merely increase ball speed.

## Platform plan

- One offline game codebase.
- Android release first.
- iOS build and submission completed with the user's Mac collaborator.
- PC version remains possible later.

## Current milestone

Produce one playable top-down match and tune the feel before adding art, store accounts, or paid promotion.

## Rules corrections from player review

- Serve diagonally from the right/even or left/odd service court.
- Serve must clear the non-volley line; the line itself is out on a serve.
- Ball crossing a sideline or baseline is out and never rebounds from a wall.
- Server stands at the baseline on the correct service side; receiver waits at the opposite baseline in the diagonal court.
- Learning-level paddle angle uses a broad sweet spot so directional control is gradual rather than twitchy.
- On a side-out, the ball visibly transfers to the new server at the opposite baseline; the serving paddle is highlighted before play resumes.
- Serves target the center of the legal diagonal service box.
- The receiver starts centered at the baseline, and the learning-match first return is guided safely toward midcourt.
- Center 56% of the paddle is a near-straight sweet spot; angle builds gradually outside it.
- A receiving-side rally win displays SIDE OUT, changes serve, and awards no point.
- Next rules milestone: visible bounce, two-bounce rule, and kitchen volley faults.
- Opponent serves from the correct baseline side to the center of the opposite diagonal service box.
- Out balls are charged to the last hitter; the other player wins the rally and gains service on a side-out.
- Serves launch from the exact middle of the serving paddle with no spin.
- Receiver begins in the center of the diagonal service court being targeted.
- The center 80% of the paddle gives gentle directional control; the outer 10% on each end creates sharper action angles, increased by 5% after playtesting.
- Serve speed cycles among Slow, Normal, and Fast.
- The rival waits 2.3 seconds in ready position before serving.
- The serve-speed control stays in the header so short browser windows cannot hide it.
- A face-picker offers six emoji personalities independently for the player and rival. Each large face is centered in its player's kitchen.
- Serve speeds are Slow 8.6, Normal 10.2, and Fast 12.0; the former Fast speed is now Normal.
- Beginner has optional random serves. Club has optional random serves and random speed on 50% of returns. Pro always randomizes every serve and return. Direction remains under normal paddle-contact control, and random curves remain disabled.
- The opening screen offers How to Play, Beginner, Club Player, and Pro; the selected mode changes rival speed, reaction, accuracy, and return pace.
- Player emojis use a full-color 82-pixel face centered and completely contained in each side's non-volley zone.
- Level speed bands: How to Play 7.4/8.6/9.8; Beginner 8.6/10.2/12.0; Club 9.8/11.8/13.8; Pro 11.0/13.0/15.2. Pro is roughly 10% faster than its prior tuning.
- A permanent, high-contrast MENU button pauses any match or tutorial and returns to the level selector.
- iPhone Home Screen installs use a custom Pickle Pop icon and standalone display mode.


## v2.7 Fair Serve Fix
- When the rival serves, the player paddle is snapped to the receiving service box at serve launch.
- Prevents occasional wrong-side starts caused by movement during the rival pre-serve delay.
- Challenge/reward progress and existing gameplay settings are otherwise unchanged.


## v2.8 Fair Beginner Returns
- Beginner rival return angles are capped to prevent unreachable sideline shots.
- Club retains wider angles; Pro retains full dangerous angles.
- Challenge Guide and My Rewards remain unchanged.
