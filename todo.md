## Things todo 
- [x] Initial Response should stream tool calls, messages, and statuses updates in one message. Other agent responses will reference the data in the initial response OR call the tools if requested.
    - [x] Separate Tools 
    - [x] Opus to show statuses on tool calls and have a structured response.
    - [x] Opus to write a basic Presentation View after ranking.
- [x] Base Output View (use a table for now)
- [ ] MAKE A Tool to render candidates (so agent doesn't reference someone not knowing he/she wasn't shown bef)
- [ ] Get Profile by ID
- [ ] Show Detailed Profile, in `/profile` view, includes resume
- [ ] Ranking Algorithm, Design a an algo to weight different things while ranking (needs recruiter input, then add it to sys prompt)
- [ ] Complete Response View
- [ ] Support `numOfTalent` (maybe in extract_query with a default)

## Imporovements 
- [ ] Increase Prompt input body size
- [ ] Handle Agent Empty States, returns or (I don't know)
