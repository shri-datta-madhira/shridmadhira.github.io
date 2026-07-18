# shridmadhira.github.io

Personal portfolio — a fullscreen "deck" site where each section slides up over
the previous one, with a fixed left rail for jumping between sections.
No frameworks, no build step: plain HTML, modular CSS, and ES modules.

## Structure

```
index.html              Markup for all seven sections + experience modals
css/
  base.css              Design tokens, reset, aurora background, reveal animations
  layout.css            Left rail, deck engine styles, mobile top bar + drawer
  components.css        Buttons, chips, glass cards, modal, form fields
  sections/*.css        One stylesheet per section
js/
  main.js               Entry point (wires everything up)
  deck.js               Section-deck engine: wheel / touch / keyboard, rail sync,
                        mobile fallback to normal scrolling
  animations.js         Typewriter, count-up numbers, spotlight hover, durations
  skills.js             Skill category tabs + chip cloud + marquee
  modals.js             Experience detail modals
  hobbies.js            Hobby selector, drawing carousel, travel slideshow
  sports.js             Live FC Barcelona + Ferrari F1 data (Jolpica fallback)
  contact.js            EmailJS contact form
  theme.js              Light / dark toggle
```

## Local development

```
python3 -m http.server 8934
```

then open http://localhost:8934 (ES modules require http, not file://).
